import { CheckCircle, ExternalLink } from 'lucide-react';

export default function Home() {
  const dummyTasks = [
    { id: 1, creator: 'JohnDoe', handle: '@johndoes', niche: 'Tech', completed: false, count: 12 },
    { id: 2, creator: 'SarahSmith', handle: '@sarahstyle', niche: 'Lifestyle', completed: true, count: 45 },
  ];

  return (
    <div>
      <h1 className="page-title">Today's Tasks</h1>
      <p className="page-subtitle">Complete your daily cycle to earn score.</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button className="badge badge-green">Not Completed</button>
        <button className="badge badge-gray">All Tasks</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {dummyTasks.map((task) => (
          <div key={task.id} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '18px' }}>{task.creator}</h3>
                <p style={{ color: 'var(--neutral-600)', fontSize: '14px', marginBottom: '8px' }}>
                  {task.handle} • {task.niche}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--neutral-600)', fontSize: '12px' }}>
                  <CheckCircle size={14} /> {task.count} completions
                </div>
              </div>

              {task.completed ? (
                <div className="badge badge-green" style={{ padding: '6px 12px' }}>Done</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn-secondary" style={{ padding: '8px 12px' }}>
                    <ExternalLink size={14} /> Open Link
                  </button>
                  <button className="btn-primary" style={{ padding: '8px 12px' }}>
                    Mark Complete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
