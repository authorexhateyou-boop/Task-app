import { Trophy, Activity, Medal } from 'lucide-react';

export default function Leaderboard() {
  const leaders = [
    { rank: 1, name: 'AliceDev', username: '@alicedev', score: 345, streak: 12 },
    { rank: 2, name: 'BobCreator', username: '@bobcreator', score: 320, streak: 8 },
    { rank: 3, name: 'CharlieX', username: '@charliex', score: 305, streak: 5 },
  ];

  return (
    <div>
      <h1 className="page-title">Top Members</h1>
      <p className="page-subtitle">Ranked by Task Score in your Circle.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {leaders.map(user => (
          <div key={user.rank} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: user.rank === 1 ? 'gold' : user.rank === 2 ? 'silver' : 'orange' }}>
                <Medal size={24} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="avatar avatar-md">{user.name.charAt(0)}</div>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: '16px' }}>{user.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neutral-600)', fontSize: '12px' }}>
                    <span style={{ fontWeight: 500 }}>{user.username}</span> • <Activity size={12} /> {user.streak}d streak
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '18px' }}>
                {user.score}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--neutral-600)' }}>
                pts
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
