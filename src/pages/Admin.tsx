import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import type { UserData } from '../contexts/AuthContext';
import { Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Admin() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  
  useEffect(() => {
    if (!isAdmin) return;
    
    const q = query(collection(db, 'users'), orderBy('taskScore', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      })) as UserData[];
      setUsers(fetchedUsers);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const deleteUserRecord = async (uid: string) => {
    const confirm = window.confirm('Are you sure you want to delete this user record from the database? Assuming they already deleted their Auth, or you are cleaning up.');
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'users', uid));
      alert('User record deleted from database');
    } catch (e) {
      console.error(e);
      alert('Failed to delete user');
    }
  };

  const removeScore = async (uid: string, currentScore: number) => {
    const confirm = window.confirm('Are you sure you want to deduct 50 points as a penalty?');
    if (!confirm) return;

    try {
      await updateDoc(doc(db, 'users', uid), {
        taskScore: Math.max(0, currentScore - 50)
      });
    } catch (e) {
      console.error(e);
      alert('Failed to deduct score');
    }
  };

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <ShieldCheck size={28} color="var(--primary)" />
        <h1 className="page-title" style={{ margin: 0 }}>Admin Panel</h1>
      </div>
      <p className="page-subtitle">Monitor circle members and enforce rules.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {users.map((user) => (
          <div key={user.uid} className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="avatar avatar-md">{user.username ? user.username.charAt(0).toUpperCase() : '?'}</div>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: '16px' }}>{user.username} {user.isAdmin && <span className="badge badge-green" style={{ marginLeft: '8px' }}>Admin</span>}</h3>
                  <div style={{ color: 'var(--neutral-600)', fontSize: '13px', marginTop: '4px' }}>
                    {user.email} • {user.threadsHandle || 'No handle'}
                  </div>
                  <div style={{ marginTop: '4px', fontWeight: 600, color: 'var(--primary)', fontSize: '14px' }}>
                    Score: {user.taskScore || 0}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '6px 12px', color: 'orange', borderColor: 'orange' }}
                  onClick={() => removeScore(user.uid, user.taskScore || 0)}
                >
                  <AlertTriangle size={14} /> Penalize -50
                </button>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '6px 12px', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
                  onClick={() => deleteUserRecord(user.uid)}
                >
                  <Trash2 size={14} /> Remove DB Record
                </button>
              </div>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--neutral-600)' }}>
            Loading users...
          </div>
        )}
      </div>
    </div>
  );
}
