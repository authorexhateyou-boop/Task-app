import { Outlet, NavLink, Link, Navigate, useLocation } from 'react-router-dom';
import { Home, PlusSquare, User, Trophy, ShieldCheck, BookOpen, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function Layout() {
  const { currentUser, userData, isAdmin } = useAuth();
  const location = useLocation();
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

  // Auth Guard for specific routes in Guest Mode
  const restrictedRoutes = ['/post', '/profile', '/admin'];
  if (!currentUser && restrictedRoutes.includes(location.pathname)) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" className="logo">TASK</Link>
          {!currentUser && <span className="badge badge-gray" style={{ fontSize: '10px' }}>Guest Mode</span>}
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className="sidebar-nav-item">
            <Home size={20} /> Home
          </NavLink>
          <NavLink to="/post" className="sidebar-nav-item">
            <PlusSquare size={20} /> Post Task
          </NavLink>
          <NavLink to="/leaderboard" className="sidebar-nav-item">
            <Trophy size={20} /> Leaders
          </NavLink>
          <NavLink to="/rules" className="sidebar-nav-item">
            <BookOpen size={20} /> Circle Rules
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className="sidebar-nav-item">
              <ShieldCheck size={20} /> Admin
            </NavLink>
          )}
          <NavLink to="/profile" className="sidebar-nav-item">
            <User size={20} /> My Profile
          </NavLink>
        </nav>
        
        {currentUser && userData ? (
          <Link to="/profile" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--neutral-100)', textDecoration: 'none' }}>
            <div className="avatar avatar-sm" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
              {userData.username?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--neutral-900)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{userData.username}</div>
              <div style={{ fontSize: '12px', color: 'var(--neutral-600)' }}>{userData.threadsHandle}</div>
            </div>
          </Link>
        ) : (
          <Link to="/login" className="btn-primary" style={{ marginTop: 'auto', gap: '8px' }}>
             <LogIn size={18} /> Sign In to Join
          </Link>
        )}
      </aside>

      <div className="main-wrapper">
        {/* Mobile Top Header */}
        <header className="header">
          <div className="container header-content">
            <Link to="/" className="logo">TASK</Link>
            {currentUser && userData ? (
              <Link to="/profile" className="avatar avatar-sm" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                {userData.username?.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <Link to="/login" className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                Sign In
              </Link>
            )}
          </div>
        </header>

        <main className="container animate-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
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
          <NavLink to="/rules" className="nav-item">
            <BookOpen size={22} />
            Rules
          </NavLink>
          <NavLink to="/profile" className="nav-item">
            <User size={22} />
            Profile
          </NavLink>
        </nav>
      </div>

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
