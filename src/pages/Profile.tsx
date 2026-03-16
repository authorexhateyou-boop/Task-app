import { Settings, LogOut, FileText, CheckCircle, Camera, Save, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../lib/firebase';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function Profile() {
  const { userData, currentUser } = useAuth();
  const [username, setUsername] = useState('CreatorName');
  const [threadsHandle, setThreadsHandle] = useState('');
  const [niche, setNiche] = useState('General');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (userData) {
      setUsername(userData.username || '');
      setThreadsHandle(userData.threadsHandle || '');
      setNiche(userData.niche || 'General');
      setProfilePic(userData.profilePic || null);
    }
  }, [userData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setProfilePic(url);
    }
  };

  const saveProfile = async () => {
    if (!userData) return;
    setSaving(true);
    try {
      let downloadURL = profilePic;

      // If there's a new file to upload
      if (imageFile) {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const { storage } = await import('../lib/firebase');
        const storageRef = ref(storage, `profile_pics/${userData.uid}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        downloadURL = await getDownloadURL(snapshot.ref);
      }

      await updateDoc(doc(db, 'users', userData.uid), {
        username: username,
        threadsHandle: threadsHandle.startsWith('@') || !threadsHandle ? threadsHandle : `@${threadsHandle}`,
        niche: niche,
        profilePic: downloadURL
      });
      setEditMode(false);
      setImageFile(null);
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
        <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 16px' }}>
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="avatar avatar-lg" />
          ) : (
            <div className="avatar avatar-lg">{username ? username.charAt(0).toUpperCase() : '?'}</div>
          )}
          {editMode && (
            <label style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'white', border: '1px solid var(--neutral-200)', borderRadius: '50%', padding: '6px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
              <Camera size={16} color="var(--neutral-600)" />
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            </label>
          )}
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

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleSignout} className="btn-secondary" style={{ flex: 1, color: 'var(--neutral-800)' }}>
          <LogOut size={16} /> Sign out
        </button>
        <button onClick={handleDeleteAccount} className="btn-secondary" style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}>
          <Trash2 size={16} /> Delete Account
        </button>
      </div>
    </div>
  );
}
