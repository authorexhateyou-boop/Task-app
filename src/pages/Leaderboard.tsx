import { Activity, Medal, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface BaseUser {
  uid: string;
  username: string;
  threadsHandle?: string;
  taskScore: number;
  streak: number;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<BaseUser[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('taskScore', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const topUsers = snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      })) as BaseUser[];
      setLeaders(topUsers);
    });

    return () => unsubscribe();
  }, []);

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
      fontSize: '16px'
    };
  };

  const getFormatHandle = (handle: string) => {
    if (!handle) return '#';
    const clean = handle.trim().replace(/^@/, '');
    return `https://www.threads.net/@${clean}`;
  };

  return (
    <div className="centered-content">
      <h1 className="page-title">Top Members</h1>
      <p className="page-subtitle">Ranked by Task Score in your Circle.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {leaders.map((user, index) => {
          const rank = index + 1;
          return (
          <div key={user.uid} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'orange' : 'var(--neutral-600)' }}>
                {rank <= 3 ? <Medal size={24} /> : `#${rank}`}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  className="avatar avatar-md" 
                  style={getAvatarStyle(user.username || 'U')}
                >
                  {user.username ? user.username.charAt(0).toUpperCase() : <UserIcon size={16} />}
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: '16px' }}>{user.username}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neutral-600)', fontSize: '12px' }}>
                    <a 
                      href={getFormatHandle(user.threadsHandle || '')}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                    >
                      {user.threadsHandle || '@user'}
                    </a>
                    <span>•</span>
                    <Activity size={12} /> {user.streak || 0}d streak
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '18px' }}>
                {user.taskScore || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--neutral-600)' }}>
                pts
              </div>
            </div>
          </div>
        )})}
      </div>

      {!useAuth().currentUser && (
        <div className="card" style={{ marginTop: '24px', textAlign: 'center', backgroundColor: 'var(--neutral-100)', border: 'none' }}>
           <p style={{ fontSize: '14px', color: 'var(--neutral-600)', marginBottom: '16px' }}>Want to see your name on the board?</p>
           <Link to="/login" className="btn-primary" style={{ display: 'inline-flex' }}>Start Climbing Today</Link>
        </div>
      )}
    </div>
  );
}
