import { Outlet, NavLink, Link, Navigate } from 'react-router-dom';
import { Home, PlusSquare, User, Trophy, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function Layout() {
  const { currentUser, userData, isAdmin } = useAuth();
  const [showSetup, setShowSetup] = useState(false);
  const [username, setUsername] = useState('');
  const [handle, setHandle] = useState('');
  const [niche, setNiche] = useState('Tech');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // If the user's document is loaded but missing the Threads handle, force setup
    if (userData && !userData.threadsHandle) {
      setUsername(userData.username || '');
      setShowSetup(true);
    } else {
      setShowSetup(false);
    }
  }, [userData]);

  const saveInitialSetup = async () => {
    if (!userData || !handle || !username) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', userData.uid), {
        username: username,
        threadsHandle: handle.startsWith('@') ? handle : `@${handle}`,
        niche: niche
      });
      setShowSetup(false);
    } catch (e) {
      console.error(e);
      alert('Failed to save setup data');
    } finally {
      setSaving(false);
    }
  };

  const getDesktopNavClass = ({ isActive }: { isActive: boolean }) => 
    `btn-ghost ${isActive ? 'active' : ''}`;

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <header className="header">
        <div className="container header-content">
          <Link to="/" className="logo">TASK</Link>
          <nav className="desktop-nav">
            <NavLink to="/" className={getDesktopNavClass} style={({isActive}) => isActive ? { color: 'var(--primary)', backgroundColor: 'var(--accent)' } : {}}>
              <Home size={18} /> Home
            </NavLink>
            <NavLink to="/post" className={getDesktopNavClass} style={({isActive}) => isActive ? { color: 'var(--primary)', backgroundColor: 'var(--accent)' } : {}}>
              <PlusSquare size={18} /> Post
            </NavLink>
            <NavLink to="/leaderboard" className={getDesktopNavClass} style={({isActive}) => isActive ? { color: 'var(--primary)', backgroundColor: 'var(--accent)' } : {}}>
              <Trophy size={18} /> Leaders
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={getDesktopNavClass} style={({isActive}) => isActive ? { color: 'var(--primary)', backgroundColor: 'var(--accent)' } : {}}>
                <ShieldCheck size={18} /> Admin
              </NavLink>
            )}
            <NavLink to="/profile" className={getDesktopNavClass} style={({isActive}) => isActive ? { color: 'var(--primary)', backgroundColor: 'var(--accent)' } : {}}>
              <User size={18} /> Profile
            </NavLink>
          </nav>
        </div>
      </header>

      <nav className="mobile-nav">
        <NavLink to="/" className="nav-item">
          <Home size={22} />
          Home
        </NavLink>
        <NavLink to="/post" className="nav-item">
          <PlusSquare size={22} />
          Post
        </NavLink>
        <NavLink to="/leaderboard" className="nav-item">
          <Trophy size={22} />
          Leaders
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className="nav-item">
            <ShieldCheck size={22} />
            Admin
          </NavLink>
        )}
        <NavLink to="/profile" className="nav-item">
          <User size={22} />
          Profile
        </NavLink>
      </nav>

      <main className="container animate-enter" style={{ padding: '24px 16px', minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </main>

      {showSetup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '24px', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: '400px', margin: '0 auto', width: '100%', padding: '32px 24px' }}>
            <h2 className="page-title" style={{ textAlign: 'center', marginBottom: '8px' }}>Welcome!</h2>
            <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '24px' }}>Let's set up your profile to join the circle.</p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--neutral-800)' }}>Display Name</label>
              <input 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="Jane Doe" 
                className="input-field" 
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--neutral-800)' }}>Threads Handle</label>
              <input 
                value={handle} 
                onChange={e => setHandle(e.target.value)} 
                placeholder="@yourhandle" 
                className="input-field" 
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--neutral-800)' }}>Your Niche</label>
              <select 
                value={niche} 
                onChange={e => setNiche(e.target.value)} 
                className="input-field" 
                style={{ width: '100%' }}
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

            <button 
              onClick={saveInitialSetup} 
              disabled={saving || !handle || !username} 
              className="btn-primary" 
              style={{ width: '100%' }}
            >
              {saving ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
