import { Activity, Medal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface BaseUser {
  uid: string;
  username: string;
  threadsHandle?: string;
  taskScore: number;
  streak: number;
  profilePic?: string;
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

  return (
    <div>
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
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.username} className="avatar avatar-md" />
                ) : (
                  <div className="avatar avatar-md">{user.username ? user.username.charAt(0).toUpperCase() : '?'}</div>
                )}
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: '16px' }}>{user.username}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neutral-600)', fontSize: '12px' }}>
                    <span style={{ fontWeight: 500 }}>{user.threadsHandle || '@user'}</span> • <Activity size={12} /> {user.streak || 0}d streak
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
    </div>
  );
}
