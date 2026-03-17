import { CheckCircle, ExternalLink, Trash2, User as UserIcon, Heart, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, deleteDoc, limit } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Task {
  id: string;
  creatorId: string;
  creatorName: string;
  threadsHandle: string;
  niche: string;
  completionCount: number;
  isActive: boolean;
}

export default function Home() {
  const { userData } = useAuth();
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

  return (
    <div className="home-grid">
      <div className="feed-column">
        <h1 className="page-title">Daily Circle</h1>
        <p className="page-subtitle">Support others to grow your reputation.</p>

        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          overflowX: 'auto', 
          paddingBottom: '12px', 
          marginBottom: '16px',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}>
          {niches.map(n => (
            <button
              key={n}
              onClick={() => setNicheFilter(n)}
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                border: '1px solid',
                borderColor: nicheFilter === n ? 'var(--primary)' : 'var(--neutral-200)',
                backgroundColor: nicheFilter === n ? 'var(--accent)' : 'white',
                color: nicheFilter === n ? 'var(--primary)' : 'var(--neutral-600)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {n}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button 
            onClick={() => setFilter('pending')}
            className={`badge ${filter === 'pending' ? 'badge-green' : 'badge-gray'}`}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
          >
            Not Completed ({tasks.filter(t => !completedTaskIds.includes(t.id)).length})
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={`badge ${filter === 'all' ? 'badge-green' : 'badge-gray'}`}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
          >
            All Tasks ({tasks.length})
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredTasks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: '15px', color: 'var(--neutral-600)' }}>
                {tasks.length === 0 ? "No creators have posted yet." : "No tasks found in this niche."}
              </div>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="card animate-enter" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div 
                      className="avatar avatar-md" 
                      style={getAvatarStyle(task.creatorName || 'U')}
                    >
                      {task.creatorName ? task.creatorName.charAt(0).toUpperCase() : <UserIcon size={18} />}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 600, fontSize: '18px' }}>{task.creatorName}</h3>
                      <p style={{ color: 'var(--neutral-600)', fontSize: '14px', marginBottom: '8px' }}>
                        <a 
                          href={`https://threads.net/${task.threadsHandle?.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
                        >
                          {task.threadsHandle}
                        </a> • {task.niche}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--neutral-600)', fontSize: '12px' }}>
                        <CheckCircle size={14} /> {task.completionCount || 0} completions
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {userData?.uid === task.creatorId ? (
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '8px 12px', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    ) : completedTaskIds.includes(task.id) ? (
                      <div className="badge badge-green" style={{ padding: '8px 16px', textAlign: 'center' }}>Done</div>
                    ) : (
                      <>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '8px 12px' }}
                          onClick={() => window.open(`https://threads.net/${task.threadsHandle?.replace('@', '')}`, '_blank')}
                        >
                          <ExternalLink size={14} /> Open Link
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '8px 12px' }}
                          onClick={() => markComplete(task.id, task.creatorId)}
                        >
                          Mark Complete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
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
