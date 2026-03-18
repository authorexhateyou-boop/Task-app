import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import type { UserData } from '../contexts/AuthContext';
import { Trash2, ShieldCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Admin() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'tasks'>('users');
  
  useEffect(() => {
    if (!isAdmin) return;
    
    const qu = query(collection(db, 'users'), orderBy('taskScore', 'desc'));
    const unsubUsers = onSnapshot(qu, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id })) as UserData[]);
    });

    const qt = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubTasks = onSnapshot(qt, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => { unsubUsers(); unsubTasks(); };
  }, [isAdmin]);

  const removeUser = async (uid: string) => {
    if (!window.confirm('Delete this user?')) return;
    try { await deleteDoc(doc(db, 'users', uid)); } catch (e) { alert('Failed'); }
  };

  const removeTask = async (tid: string) => {
     if (!window.confirm('Delete this task?')) return;
     try { await deleteDoc(doc(db, 'tasks', tid)); } catch (e) { alert('Failed'); }
  };

  if (!isAdmin) return <Navigate to="/" />;

  return (
    <div className="centered-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <ShieldCheck size={28} color="var(--primary)" />
        <h1 className="page-title" style={{ margin: 0 }}>Admin Panel</h1>
      </div>
      
      <div className="filter-bar" style={{ marginBottom: '20px' }}>
        <button className={activeTab === 'users' ? 'badge badge-green' : 'badge badge-gray'} onClick={() => setActiveTab('users')}>Users</button>
        <button className={activeTab === 'tasks' ? 'badge badge-green' : 'badge badge-gray'} onClick={() => setActiveTab('tasks')}>Tasks</button>
      </div>

      {activeTab === 'users' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {users.map(u => (
            <div key={u.uid} className="card" style={{ padding: '16px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><strong>{u.username}</strong> ({u.email})</div>
                  <button onClick={() => removeUser(u.uid)} style={{ color: 'var(--danger)' }}><Trash2 size={16}/></button>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tasks.map(t => (
            <div key={t.id} className="card" style={{ padding: '16px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{t.creatorName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--neutral-600)' }}>{t.platform}: {t.primaryHandle}</div>
                  </div>
                  <button onClick={() => removeTask(t.id)} className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}>
                     <Trash2 size={16}/> Remove Post
                  </button>
               </div>
            </div>
          ))}
          {tasks.length === 0 && <div className="card" style={{ textAlign: 'center' }}>No active tasks.</div>}
        </div>
      )}
    </div>
  );
}
