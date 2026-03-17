import { Shield, BookOpen, UserCheck, AlertCircle } from 'lucide-react';

export default function Rules() {
  const rules = [
    {
      title: 'Be Fair',
      description: 'Only mark tasks as complete if you actually followed the creator on Threads. We monitor engagement patterns.',
      icon: <UserCheck size={24} className="text-primary" />
    },
    {
      title: 'One Task Daily',
      description: 'You can only post one task per 24 hours. Quality over quantity.',
      icon: <BookOpen size={24} className="text-primary" />
    },
    {
      title: 'No Spam',
      description: 'Use a real Threads handle. Fake accounts or bot handles will be banned by admins immediately.',
      icon: <Shield size={24} className="text-primary" />
    },
    {
      title: 'Support Others',
      description: 'The circle works because we support each other. If you only post but never support, your score will drop.',
      icon: <AlertCircle size={24} className="text-primary" />
    }
  ];

  return (
    <div className="centered-content">
      <h1 className="page-title">Circle Rules</h1>
      <p className="page-subtitle">Follow these guidelines to keep the TASK community healthy.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {rules.map((rule, index) => (
          <div key={index} className="card" style={{ display: 'flex', gap: '20px', padding: '24px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              backgroundColor: 'var(--accent)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0,
              color: 'var(--primary)'
            }}>
              {rule.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{rule.title}</h3>
              <p style={{ color: 'var(--neutral-600)', fontSize: '14px', lineHeight: 1.5 }}>
                {rule.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '32px', backgroundColor: 'var(--neutral-900)', color: 'white' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Enforcement</h3>
        <p style={{ fontSize: '14px', color: 'var(--neutral-300)', lineHeight: '1.6' }}>
          Admins have the power to penalize scores, reset stats, or ban users who violate these rules. We use a combination of automated detection and manual review.
        </p>
      </div>
    </div>
  );
}
