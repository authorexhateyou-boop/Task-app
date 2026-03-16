import { Settings, LogOut, FileText, CheckCircle, Camera } from 'lucide-react';
import { useState } from 'react';

export default function Profile() {
  const [username, setUsername] = useState('CreatorName');
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setProfilePic(url);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>My Profile</h1>
        <button className="btn-ghost" style={{ padding: '8px' }}>
          <Settings size={20} />
        </button>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '32px 24px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 16px' }}>
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="avatar avatar-lg" />
          ) : (
            <div className="avatar avatar-lg">{username ? username.charAt(0).toUpperCase() : '?'}</div>
          )}
          <label style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'white', border: '1px solid var(--neutral-200)', borderRadius: '50%', padding: '6px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
            <Camera size={16} color="var(--neutral-600)" />
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
          </label>
        </div>
        
        <input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          className="input-field" 
          style={{ width: '100%', textAlign: 'center', fontSize: '20px', fontWeight: 700, border: 'none', background: 'transparent', padding: 0, marginBottom: '4px' }}
        />
        <p style={{ color: 'var(--neutral-600)', marginBottom: '16px' }}>@threads_handle • Lifestyle</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <span className="badge badge-green">Circle 1 Starter</span>
          <span className="badge badge-gray">Task Score: 125</span>
        </div>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Stats</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: 'var(--primary)' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '18px' }}>12</div>
            <div style={{ fontSize: '12px', color: 'var(--neutral-600)' }}>Posted</div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: 'var(--primary)' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '18px' }}>48</div>
            <div style={{ fontSize: '12px', color: 'var(--neutral-600)' }}>Completed</div>
          </div>
        </div>
      </div>

      <button className="btn-secondary" style={{ width: '100%', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}>
        <LogOut size={16} /> Sign out
      </button>
    </div>
  );
}
