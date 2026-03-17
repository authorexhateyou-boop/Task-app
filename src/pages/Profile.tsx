import { Settings, LogOut, FileText, CheckCircle, Save, Trash2, User as UserIcon, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../lib/firebase';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function Profile() {
  const { userData, currentUser } = useAuth();
  const [username, setUsername] = useState('');
  const [threadsHandle, setThreadsHandle] = useState('');
  const [niche, setNiche] = useState('General');
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (userData) {
      setUsername(userData.username || '');
      setThreadsHandle(userData.threadsHandle || '');
      setNiche(userData.niche || 'General');
    }
  }, [userData]);

  const saveProfile = async () => {
    if (!userData) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', userData.uid), {
        username: username,
        threadsHandle: threadsHandle.startsWith('@') || !threadsHandle ? threadsHandle : `@${threadsHandle}`,
        niche: niche
      });
      setEditMode(false);
      alert('Profile updated and saved!');
    } catch (e) {
      console.error(e);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignout = () => {
    signOut(auth);
  };

  const handleDeleteAccount = async () => {
    if (!currentUser || !userData) return;
    
    const confirmDelete = window.confirm("Are you sure you want to completely delete your TASK account? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      if (userData?.uid) await deleteDoc(doc(db, 'users', userData.uid));
      await deleteUser(currentUser);
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/requires-recent-login') {
        alert("For security reasons, please sign out, sign back in, and try deleting your account again.");
      } else {
        alert("Failed to delete account. See console for details.");
      }
    }
  };

  // Helper for colorful avatars without storage
  const getAvatarStyle = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6'];
    const index = (name?.length || 0) % colors.length;
    return {
      backgroundColor: colors[index],
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: '32px'
    };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>My Profile</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {editMode && (
            <button className="btn-ghost" onClick={saveProfile} disabled={saving} style={{ padding: '8px' }}>
              <Save size={20} color={saving ? 'gray' : 'var(--primary)'} />
            </button>
          )}
          <button className="btn-ghost" onClick={() => setEditMode(!editMode)} style={{ padding: '8px', color: editMode ? 'var(--primary)' : 'var(--neutral-800)' }}>
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '32px 24px', marginBottom: '24px' }}>
        <div 
          className="avatar avatar-lg" 
          style={{ 
            margin: '0 auto 16px', 
            ...getAvatarStyle(username || 'U') 
          }}
        >
          {username ? username.charAt(0).toUpperCase() : <UserIcon size={40} />}
        </div>
        
        {editMode ? (
          <>
            <input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="input-field" 
              style={{ width: '100%', textAlign: 'center', fontSize: '20px', fontWeight: 700, border: 'none', background: 'var(--neutral-100)', padding: '4px', marginBottom: '8px', borderRadius: '4px' }}
              placeholder="Display Name"
            />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <input 
                value={threadsHandle} 
                onChange={(e) => setThreadsHandle(e.target.value)} 
                className="input-field" 
                style={{ width: '120px', textAlign: 'center', fontSize: '14px', border: 'none', background: 'var(--neutral-100)', padding: '4px', color: 'var(--neutral-800)', borderRadius: '4px' }}
                placeholder="@threads"
              />
              <span style={{ color: 'var(--neutral-600)' }}>•</span>
              <select 
                value={niche} 
                onChange={(e) => setNiche(e.target.value)} 
                className="input-field" 
                style={{ width: '100px', textAlign: 'center', fontSize: '14px', border: 'none', background: 'var(--neutral-100)', padding: '4px', color: 'var(--neutral-800)', borderRadius: '4px' }}
              >
                <option value="Tech">Tech</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Gaming">Gaming</option>
                <option value="Education">Education</option>
                <option value="Business">Business</option>
                <option value="Art">Art</option>
                <option value="General">General</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0' }}>{username}</h2>
            <p style={{ color: 'var(--neutral-600)', marginBottom: '16px' }}>
              {threadsHandle || '@threads_handle'} • {niche || 'General'}
            </p>
          </>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <span className="badge badge-green">Circle Starter</span>
          <span className="badge badge-gray">Task Score: {userData?.taskScore || 0}</span>
        </div>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Stats</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: 'var(--primary)' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '18px' }}>{userData?.tasksPosted || 0}</div>
            <div style={{ fontSize: '12px', color: 'var(--neutral-600)' }}>Posted</div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: 'var(--primary)' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '18px' }}>{userData?.tasksCompleted || 0}</div>
            <div style={{ fontSize: '12px', color: 'var(--neutral-600)' }}>Completed</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={handleSignout} className="btn-secondary" style={{ flex: 1, color: 'var(--neutral-800)' }}>
          <LogOut size={16} /> Sign out
        </button>
        <button onClick={handleDeleteAccount} className="btn-secondary" style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}>
          <Trash2 size={16} /> Delete Account
        </button>
      </div>

      <div className="card" style={{ padding: '24px', border: '2px dashed var(--primary)', backgroundColor: 'var(--accent)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--primary-hover)' }}>Love TASK?</h3>
        <p style={{ fontSize: '13px', color: 'var(--neutral-800)', marginBottom: '16px' }}>Support the app to keep it alive!</p>
        
        <button 
          className="btn-primary" 
          style={{ width: '100%', borderRadius: 'var(--radius-full)', fontSize: '16px', padding: '12px' }}
          onClick={() => window.open('https://buy.stripe.com/bJe9AS7UF0yg3d6guz7kc01', '_blank')}
        >
          <Heart size={18} fill="white" /> Support $5
        </button>
      </div>
    </div>
  );
}
