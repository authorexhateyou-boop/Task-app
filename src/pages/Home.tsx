import { CheckCircle, ExternalLink, Trash2, User as UserIcon, Heart, Trophy, LogIn, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, deleteDoc, limit } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

interface Task {
  id: string;
  creatorId: string;
  creatorName: string;
  threadsHandle: string;
  niche: string;
  completionCount: number;
  isActive: boolean;
  createdAt?: any;
}

export default function Home() {
  const { userData, currentUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('completed_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');
  const [nicheFilter, setNicheFilter] = useState<string>('All');

  const niches = ['All', 'Tech', 'Lifestyle', 'Gaming', 'Education', 'Business', 'Art', 'General'];

  useEffect(() => {
    localStorage.setItem('completed_tasks', JSON.stringify(completedTaskIds));
  }, [completedTaskIds]);

  useEffect(() => {
    // Scaling Solution: For 1000+ users, we should use pagination (startAfter)
    // or separate users into "Circles" (groups) by adding where('circleId', '==', userCircle)
    const q = query(
      collection(db, 'tasks'), 
      orderBy('createdAt', 'desc'),
      limit(50) 
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(fetchedTasks);
    });

    return () => unsubscribe();
  }, []);

  const markComplete = async (taskId: string, creatorId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (completedTaskIds.includes(taskId)) return;
    setCompletedTaskIds(prev => [...prev, taskId]);
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
      setCompletedTaskIds(prev => prev.filter(id => id !== taskId));
    }
  };

  const getFormatHandle = (handle: string) => {
    if (!handle) return '#';
    // Robust cleaning: handle full URLs, multiple @ symbols, and trailing spaces
    const parts = handle.trim().split('/');
    let clean = parts[parts.length - 1] || handle;
    clean = clean.replace(/@/g, '').split('?')[0]; // Remove @ and query params
    if (!clean) return '#';
    return `https://www.threads.net/@${clean}`;
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
    const isPending = filter === 'pending' ? !completedTaskIds.includes(task.id) : true;
    const matchesNiche = nicheFilter === 'All' ? true : task.niche === nicheFilter;
    return isPending && matchesNiche;
  });

  const getAvatarStyle = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6'];
    const index = (name?.length || 0) % colors.length;
    return {
      backgroundColor: colors[index],
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: '18px'
    };
  };

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="home-grid">
      <div className="feed-column">
        <h1 className="page-title">Daily Circle</h1>
        <p className="page-subtitle">Support others to grow your reputation.</p>

        {!currentUser && (
          <div className="card animate-enter" style={{ backgroundColor: 'var(--accent)', border: '1px solid var(--primary)', padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '200px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-hover)', marginBottom: '4px' }}>Welcome Passenger! ✈️</h3>
              <p style={{ fontSize: '14px', color: 'var(--neutral-800)' }}>You are in <strong>Guest Mode</strong>. Watch the circle growth, but sign in to participate.</p>
            </div>
            <Link to="/login" className="btn-primary" style={{ whiteSpace: 'nowrap', display: 'flex', gap: '8px' }}>
              <LogIn size={18} /> Join Now
            </Link>
          </div>
        )}

        {/* Container for feed with strict width control */}
        <div style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
          {/* Sticky Category Bar */}
          <div className="category-bar">
            {niches.map(n => (
              <button
                key={n}
                onClick={() => setNicheFilter(n)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  border: '1.5px solid',
                  borderColor: nicheFilter === n ? 'var(--primary)' : 'var(--neutral-200)',
                  backgroundColor: nicheFilter === n ? 'var(--primary)' : 'white',
                  color: nicheFilter === n ? 'white' : 'var(--neutral-600)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  flexShrink: 0,
                  boxShadow: nicheFilter === n ? '0 4px 12px rgba(22, 163, 74, 0.2)' : 'none'
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            <button 
              onClick={() => setFilter('pending')}
              className={`badge ${filter === 'pending' ? 'badge-green' : 'badge-gray'}`}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Pending ({tasks.filter(t => !completedTaskIds.includes(t.id)).length})
            </button>
            <button 
              onClick={() => setFilter('all')}
              className={`badge ${filter === 'all' ? 'badge-green' : 'badge-gray'}`}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              All ({tasks.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {filteredTasks.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: '15px', color: 'var(--neutral-600)' }}>
                  {tasks.length === 0 ? "No creators have posted yet." : "No tasks found in this niche."}
                </div>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="card animate-enter" style={{ padding: '16px', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div 
                        className="avatar avatar-md" 
                        style={{ ...getAvatarStyle(task.creatorName || 'U'), flexShrink: 0 }}
                      >
                        {task.creatorName ? task.creatorName.charAt(0).toUpperCase() : <UserIcon size={18} />}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.creatorName}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--neutral-600)', fontSize: '13px' }}>
                          <a 
                            href={getFormatHandle(task.threadsHandle)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {task.threadsHandle.startsWith('@') ? task.threadsHandle : `@${task.threadsHandle}`}
                          </a>
                          <span style={{ opacity: 0.5 }}>•</span>
                          <span style={{ fontWeight: 500 }}>{task.niche}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--neutral-100)', paddingTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--neutral-500)', fontSize: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} /> {task.completionCount || 0}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} /> {getTimeAgo(task.createdAt)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {userData?.uid === task.creatorId ? (
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '6px 12px', color: 'var(--danger)', borderColor: 'var(--danger-bg)', fontSize: '13px' }}
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : completedTaskIds.includes(task.id) ? (
                          <div className="badge badge-green" style={{ padding: '6px 16px', height: '32px' }}>Done</div>
                        ) : (
                          <>
                            <a 
                              href={getFormatHandle(task.threadsHandle)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '13px' }}
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button 
                              className={`btn-primary ${!currentUser ? 'disabled' : ''}`}
                              style={{ padding: '6px 16px', opacity: !currentUser ? 0.6 : 1, fontSize: '13px' }}
                              onClick={() => markComplete(task.id, task.creatorId)}
                            >
                              Done
                            </button>
                          </>
                        )}
                      </div>
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
            onClick={() => window.open('https://buy.stripe.com/bJe9AS7UF0yg3d6guz7kc01', '_blank')}
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
