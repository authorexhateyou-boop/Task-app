import { CheckCircle, ExternalLink, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

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

  useEffect(() => {
    localStorage.setItem('completed_tasks', JSON.stringify(completedTaskIds));
  }, [completedTaskIds]);

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
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
    
    // Optimistic UI update
    setCompletedTaskIds(prev => [...prev, taskId]);
    
    try {
      // 1. Increment task completion count
      await updateDoc(doc(db, 'tasks', taskId), {
        completionCount: increment(1)
      });
      
      // 2. Increment creator score (reward for posting)
      await updateDoc(doc(db, 'users', creatorId), {
        taskScore: increment(1)
      });
      
      // 3. Increment current user score & completion stat (reward for doing)
      if (userData?.uid) {
        await updateDoc(doc(db, 'users', userData.uid), {
          taskScore: increment(5),
          tasksCompleted: increment(1)
        });
      }
    } catch (e) {
      console.error("Mark complete failed:", e);
      // Rollback on error
      setCompletedTaskIds(prev => prev.filter(id => id !== taskId));
      alert('Error updating score. Please try again.');
    }
  };

  const deleteTask = async (taskId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete your task from the daily circle?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      // Local state will auto-update via onSnapshot
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Failed to delete task. Make sure you are the creator.");
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return !completedTaskIds.includes(task.id);
  });

  return (
    <div>
      <h1 className="page-title">Today's Tasks</h1>
      <p className="page-subtitle">Complete your daily cycle to earn score.</p>

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
            <div style={{ fontSize: '16px', color: 'var(--neutral-600)', marginBottom: '8px' }}>
              {filter === 'pending' ? "You've completed all active tasks! 🎉" : "No tasks in the circle yet."}
            </div>
            <p style={{ fontSize: '14px', color: 'var(--neutral-500)' }}>
              Wait for more creators to join or check back later.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {userData?.uid === task.creatorId ? (
                    <>
                      <div className="badge badge-gray" style={{ padding: '6px 12px', textAlign: 'center' }}>Your Task</div>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '8px 12px', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  ) : completedTaskIds.includes(task.id) ? (
                    <>
                      <div className="badge badge-green" style={{ padding: '6px 12px', textAlign: 'center' }}>Done</div>
                      <button 
                         className="btn-ghost" 
                         style={{ fontSize: '12px', color: 'var(--neutral-500)' }}
                         onClick={() => setCompletedTaskIds(prev => prev.filter(id => id !== task.id))}
                      >
                        Undo?
                      </button>
                    </>
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
