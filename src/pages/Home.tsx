import { CheckCircle, ExternalLink, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, deleteDoc, limit } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface Task {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string | null;
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
    // Limit to 50 most recent tasks for performance scaling
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

  return (
    <div>
      <h1 className="page-title">Daily Circle</h1>
      <p className="page-subtitle">Support others to grow your reputation.</p>

      {/* Niche Filter Bar */}
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
        >
          Not Completed ({tasks.filter(t => !completedTaskIds.includes(t.id)).length})
        </button>
        <button 
          onClick={() => setFilter('all')}
          className={`badge ${filter === 'all' ? 'badge-green' : 'badge-gray'}`}
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
            <div key={task.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {task.creatorAvatar ? (
                    <img src={task.creatorAvatar} alt={task.creatorName} className="avatar avatar-md" />
                  ) : (
                    <div className="avatar avatar-md">{task.creatorName ? task.creatorName.charAt(0).toUpperCase() : '?'}</div>
                  )}
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
                    <div className="badge badge-green" style={{ padding: '6px 12px', textAlign: 'center' }}>Done</div>
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
  );
}
