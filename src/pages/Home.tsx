import { CheckCircle, Trash2, User as UserIcon, Heart, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, deleteDoc, limit } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

interface Task {
  id: string;
  creatorId: string;
  creatorName: string;
  platform: string;
  primaryHandle: string;
  niche: string;
  completionCount: number;
  isActive: boolean;
  createdAt?: any;
}

export default function Home() {
  const { userData, currentUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');
  const [nicheFilter, setNicheFilter] = useState('All');

  const niches = ['All', 'Tech', 'Lifestyle', 'Gaming', 'Education', 'Business', 'Art', 'General'];

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(taskList);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubUser: () => void = () => {};
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      unsubUser = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCompletedTaskIds(data.completedTasks || []);
        }
      });
    }
    return () => unsubUser();
  }, [currentUser]);

  const SocialIcon = ({ platform, size = 18 }: { platform: string, size?: number }) => {
    switch (platform) {
      case 'threads':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 11.5c0 2.5-1.5 4.5-4 4.5s-4-2-4-4.5S5.5 7 8 7s4 2 4 4.5Z" />
            <path d="M12 11.5V6" />
            <path d="M12 11.5c0-1.5 1-2.5 2.5-2.5S17 10 17 11.5c0 4-3.5 7.5-8.5 7.5S2 15.5 2 11.5s5-8.5 10-8.5S22 7.5 22 11.5c0 3-2 5.5-4.5 5.5s-2.5-1.5-2.5-3" />
          </svg>
        );
      case 'tiktok':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
          </svg>
        );
      case 'instagram':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        );
      case 'twitter':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
            <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
          </svg>
        );
      case 'youtube':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2h15a2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2Z" />
            <path d="m10 15 5-3-5-3z" />
          </svg>
        );
      case 'twitch':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
          </svg>
        );
      default:
        return <UserIcon size={size} />;
    }
  };

  const markComplete = async (taskId: string, creatorId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (completedTaskIds.includes(taskId)) return;
    
    try {
      await updateDoc(doc(db, 'tasks', taskId), { completionCount: increment(1) });
      await updateDoc(doc(db, 'users', creatorId), { taskScore: increment(1) });
      if (userData?.uid) {
        await updateDoc(doc(db, 'users', userData.uid), {
          taskScore: increment(5),
          tasksCompleted: increment(1)
        });
      }
    } catch (e) {
      console.error("Mark complete failed:", e);
    }
  };

  const getSocialUrl = (platform: string, handle: string) => {
    if (!handle) return '#';
    const clean = handle.trim().replace(/^@/, '');
    switch(platform) {
      case 'threads': return `https://www.threads.net/@${clean}`;
      case 'instagram': return `https://www.instagram.com/${clean}`;
      case 'twitter': return `https://twitter.com/${clean}`;
      case 'tiktok': return `https://www.tiktok.com/@${clean}`;
      case 'youtube': return `https://www.youtube.com/@${clean}`;
      case 'twitch': return `https://www.twitch.tv/${clean}`;
      default: return '#';
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm("Delete your task from the circle?")) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (e) {
      alert("Failed to delete.");
    }
  };

  const filteredTasks = tasks.filter(task => {
    // Hide test data from the circle
    const name = task.creatorName?.toLowerCase() || '';
    const isTest = name.includes('test') || name.includes('admin') || name.includes('tester');
    if (isTest) return false;

    const isPending = filter === 'pending' ? !completedTaskIds.includes(task.id) : true;
    const matchesNiche = nicheFilter === 'All' ? true : task.niche === nicheFilter;
    return isPending && matchesNiche;
  });

  const getAvatarStyle = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6'];
    const index = (name?.length || 0) % colors.length;
    return {
      backgroundColor: colors[index],
      color: 'white'
    };
  };

  return (
    <div className="home-grid">
      <div className="feed-column">
        <h1 className="page-title">Daily Circle</h1>
        <p className="page-subtitle">Support others to grow your reputation.</p>

        {!currentUser && (
          <div className="card animate-enter" style={{ backgroundColor: '#F0FDF4', borderColor: 'var(--primary)', marginBottom: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-hover)', marginBottom: '4px' }}>Welcome Passenger! ✈️</h3>
            <p style={{ fontSize: '14px', color: 'var(--neutral-600)', marginBottom: '16px' }}>Participants earn points and grow their reputation. Sign in to start your journey.</p>
            <Link to="/login" className="btn-primary" style={{ width: '100%', borderRadius: 'var(--radius-md)' }}>
              Join the Circle
            </Link>
          </div>
        )}

        <div style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
          <div className="category-bar">
            {niches.map(n => (
              <button
                key={n}
                onClick={() => setNicheFilter(n)}
                className={nicheFilter === n ? 'active' : ''}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="filter-bar">
            <button 
              onClick={() => setFilter('pending')}
              className={`badge ${filter === 'pending' ? 'badge-green' : 'badge-gray'}`}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, border: 'none' }}
            >
              Pending ({tasks.filter(t => !completedTaskIds.includes(t.id)).length})
            </button>
            <button 
              onClick={() => setFilter('all')}
              className={`badge ${filter === 'all' ? 'badge-green' : 'badge-gray'}`}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, border: 'none' }}
            >
              All ({tasks.length})
            </button>
          </div>

          <div className="task-grid" style={{ marginTop: '12px' }}>
            {filteredTasks.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: '15px', color: 'var(--neutral-600)' }}>
                  {tasks.length === 0 ? "No creators have posted yet." : "No tasks found in this niche."}
                </div>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="card animate-enter">
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div 
                      className="avatar avatar-md" 
                      style={{ ...getAvatarStyle(task.creatorName || 'U') }}
                    >
                      {task.creatorName ? task.creatorName.charAt(0).toUpperCase() : <UserIcon size={18} />}
                    </div>

                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <h3 style={{ fontWeight: 800, fontSize: '16px', margin: 0, color: 'var(--neutral-900)' }}>
                          {task.creatorName}
                        </h3>
                        <span className="badge badge-gray" style={{ fontSize: '10px' }}>{task.niche}</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <a 
                            href={getSocialUrl(task.platform || 'threads', task.primaryHandle)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              backgroundColor: 'var(--neutral-900)', 
                              color: 'white', 
                              padding: '10px 18px', 
                              borderRadius: 'var(--radius-md)',
                              textDecoration: 'none', 
                              fontWeight: 700, 
                              fontSize: '15px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '10px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          >
                            <SocialIcon platform={task.platform || 'threads'} size={20} />
                            {task.primaryHandle}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                       <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '12px', color: 'var(--neutral-500)', display: 'block' }}>Success</span>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                            <CheckCircle size={14} /> {task.completionCount || 0}
                          </span>
                        </div>

                        {userData?.uid === task.creatorId ? (
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '10px', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : completedTaskIds.includes(task.id) ? (
                          <div className="badge badge-green" style={{ height: '44px', padding: '0 24px', fontSize: '15px', fontWeight: 700 }}>Done</div>
                        ) : (
                          <button 
                            className={`btn-primary ${!currentUser ? 'disabled' : ''}`}
                            style={{ padding: '12px 24px', opacity: !currentUser ? 0.6 : 1, fontSize: '15px', fontWeight: 700 }}
                            onClick={() => markComplete(task.id, task.creatorId)}
                          >
                            Complete
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <aside className="side-rail">
        {userData && (
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} color="var(--primary)" /> Your Performance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ backgroundColor: 'var(--neutral-100)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--neutral-600)', marginBottom: '4px' }}>Points</div>
                <div style={{ fontWeight: 800, fontSize: '20px', color: 'var(--primary)' }}>{userData.taskScore || 0}</div>
              </div>
              <div style={{ backgroundColor: 'var(--neutral-100)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--neutral-600)', marginBottom: '4px' }}>Streak</div>
                <div style={{ fontWeight: 800, fontSize: '20px', color: '#F59E0B' }}>{userData.streak || 0}d</div>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--neutral-600)' }}>Tasks Posted</span>
                  <span style={{ fontWeight: 600 }}>{userData.tasksPosted || 0}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--neutral-600)' }}>Supporters Gained</span>
                  <span style={{ fontWeight: 600 }}>{Math.floor((userData.taskScore || 0) / 10)}</span>
               </div>
            </div>
            <Link to="/profile" className="btn-secondary" style={{ width: '100%', marginTop: '16px', fontSize: '13px' }}>
               View Full Profile
            </Link>
          </div>
        )}

        <div className="card" style={{ padding: '24px', backgroundColor: 'var(--accent)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px', color: 'var(--primary-hover)' }}>Elevate TASK</h3>
          <p style={{ fontSize: '13px', color: 'var(--neutral-800)', marginBottom: '16px', lineHeight: 1.4 }}>Help us bring more creators into the circle and keep the platform free for everyone.</p>
          <button 
            className="btn-primary" 
            style={{ width: '100%', borderRadius: 'var(--radius-full)', fontWeight: 700 }}
            onClick={() => window.open('https://buy.stripe.com', '_blank')}
          >
            <Heart size={16} fill="white" /> Support Circle $5
          </button>
        </div>

        <div style={{ padding: '0 8px', fontSize: '12px', color: 'var(--neutral-600)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
           <a href="#">About</a>
           <a href="#">Privacy</a>
           <a href="#">Terms</a>
           <span>© 2026 TASK</span>
        </div>
      </aside>
    </div>
  );
}
