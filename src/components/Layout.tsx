import { Outlet, NavLink, Link, Navigate, useLocation } from 'react-router-dom';
import { Home, PlusSquare, User, Trophy, ShieldCheck, BookOpen, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

// Platform brand SVG icons
function SocialIcon({ platform, size = 18 }: { platform: string; size?: number }) {
  switch (platform) {
    case 'threads':
      return (
        <svg width={size} height={size} viewBox="0 0 192 192" fill="currentColor">
          <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.368c-14.972 0-27.457 6.365-35.142 17.933l13.61 9.328c5.741-8.696 14.767-10.555 21.532-10.555h.253c8.326.054 14.605 2.472 18.662 7.19 2.95 3.468 4.926 8.299 5.906 14.434a73.169 73.169 0 0 0-23.785-.963c-23.253 2.515-38.233 15.981-37.32 36.21.467 10.276 5.577 19.103 14.397 24.907 7.451 4.951 17.051 7.388 27.04 6.926 13.171-.613 23.52-5.72 30.762-15.186 5.545-7.28 9.053-16.712 10.618-28.564 6.369 3.843 11.08 8.9 13.699 14.945 4.522 10.493 4.785 27.718-9.442 41.914-12.508 12.478-27.555 17.882-50.286 18.043-25.22-.176-44.332-8.279-56.807-24.083-11.814-15.005-17.93-36.762-18.184-64.691.254-27.929 6.37-49.686 18.184-64.691 12.475-15.804 31.587-23.907 56.807-24.083 25.4.179 44.967 8.321 57.144 24.196 5.985 7.762 10.485 17.618 13.3 29.037l15.94-4.241c-3.428-13.316-8.866-24.932-16.257-34.534C154.44 12.215 130.04 1.987 96.254 1.75h-.509c-33.677.24-58.706 10.502-74.384 30.495C7.56 50.536.25 76.116 0 108.005v.5c.25 31.888 7.56 57.469 21.36 75.765 15.678 19.993 40.707 30.255 74.384 30.495h.509c30.226-.213 51.408-8.141 68.828-25.503 22.947-22.888 22.133-51.575 14.612-69.195-5.458-12.634-15.946-22.914-37.156-31.079z"/>
          <path d="M99.654 133.748c-11.126.52-22.794-4.37-23.467-16.42-.509-9.15 6.467-19.348 27.556-20.576a120.46 120.46 0 0 1 20.194.998c-2.296 28.527-13.559 35.425-24.283 36z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      );
    case 'twitter':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'twitch':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
        </svg>
      );
    default: return null;
  }
}

const PLATFORM_COLORS: Record<string, string> = {
  threads: '#000', tiktok: '#010101', instagram: '#E1306C',
  youtube: '#FF0000', twitter: '#000', twitch: '#6441A5',
};

export default function Layout() {
  const { currentUser, userData, isAdmin } = useAuth();
  const location = useLocation();
  const [showSetup, setShowSetup] = useState(false);
  const [username, setUsername] = useState('');
  const [niche, setNiche] = useState('General');
  const [saving, setSaving] = useState(false);

  // All 6 social handle fields
  const [handles, setHandles] = useState({
    threads: '', tiktok: '', instagram: '', youtube: '', twitter: '', twitch: '',
  });

  useEffect(() => {
    if (userData) {
      const hasAnyHandle = !!(
        userData.threadsHandle || userData.tiktokHandle || userData.instagramHandle ||
        userData.youtubeHandle || userData.twitterHandle || userData.twitchHandle
      );
      setUsername(userData.username || '');
      setNiche(userData.niche || 'General');
      setHandles({
        threads: userData.threadsHandle || '',
        tiktok: userData.tiktokHandle || '',
        instagram: userData.instagramHandle || '',
        youtube: userData.youtubeHandle || '',
        twitter: userData.twitterHandle || '',
        twitch: userData.twitchHandle || '',
      });
      setShowSetup(!hasAnyHandle);
    }
  }, [userData]);

  const hasAtLeastOneHandle = Object.values(handles).some(h => h.trim() !== '');

  const saveInitialSetup = async () => {
    if (!userData || !username.trim() || !hasAtLeastOneHandle) return;
    setSaving(true);
    const clean = (h: string) => h.trim().replace(/^@/, '');
    try {
      await updateDoc(doc(db, 'users', userData.uid), {
        username: username.trim(),
        niche,
        threadsHandle: handles.threads ? `@${clean(handles.threads)}` : '',
        tiktokHandle: handles.tiktok ? `@${clean(handles.tiktok)}` : '',
        instagramHandle: handles.instagram ? `@${clean(handles.instagram)}` : '',
        youtubeHandle: handles.youtube ? `@${clean(handles.youtube)}` : '',
        twitterHandle: handles.twitter ? `@${clean(handles.twitter)}` : '',
        twitchHandle: handles.twitch ? `@${clean(handles.twitch)}` : '',
      });
      setShowSetup(false);
    } catch (e) {
      console.error(e);
      alert('Failed to save — please try again.');
    } finally {
      setSaving(false);
    }
  };

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
          <NavLink to="/" className="sidebar-nav-item"><Home size={20} /> Home</NavLink>
          <NavLink to="/post" className="sidebar-nav-item"><PlusSquare size={20} /> Post Task</NavLink>
          <NavLink to="/leaderboard" className="sidebar-nav-item"><Trophy size={20} /> Leaders</NavLink>
          <NavLink to="/rules" className="sidebar-nav-item"><BookOpen size={20} /> Circle Rules</NavLink>
          {isAdmin && (
            <NavLink to="/admin" className="sidebar-nav-item"><ShieldCheck size={20} /> Admin</NavLink>
          )}
          <NavLink to="/profile" className="sidebar-nav-item"><User size={20} /> My Profile</NavLink>
        </nav>

        {currentUser && userData ? (
          <Link to="/profile" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--neutral-100)', textDecoration: 'none' }}>
            <div className="avatar avatar-sm" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
              {userData.username?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--neutral-900)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{userData.username}</div>
              <div style={{ fontSize: '12px', color: 'var(--neutral-600)' }}>
                {userData.threadsHandle || userData.tiktokHandle || userData.instagramHandle || '—'}
              </div>
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
          <NavLink to="/" className="nav-item"><Home size={22} />Home</NavLink>
          <NavLink to="/post" className="nav-item"><PlusSquare size={22} />Post</NavLink>
          <NavLink to="/leaderboard" className="nav-item"><Trophy size={22} />Leaders</NavLink>
          <NavLink to="/rules" className="nav-item"><BookOpen size={22} />Rules</NavLink>
          <NavLink to="/profile" className="nav-item"><User size={22} />Profile</NavLink>
        </nav>
      </div>

      {/* ── First-time Setup Modal ── */}
      {showSetup && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '20px', width: '100%',
            maxWidth: '440px', padding: '32px 28px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '4px', textAlign: 'center' }}>Welcome!</h2>
            <p style={{ fontSize: '14px', color: 'var(--neutral-600)', textAlign: 'center', marginBottom: '28px' }}>
              Set up your profile to join the circle. Add at least one social account.
            </p>

            {/* Display Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '13px', color: 'var(--neutral-800)' }}>
                Display Name *
              </label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Your name"
                className="input-field"
                style={{ width: '100%' }}
              />
            </div>

            {/* Social handles — all 6 */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '13px', color: 'var(--neutral-800)' }}>
                Social Accounts <span style={{ fontWeight: 400, color: 'var(--neutral-500)' }}>(add at least one)</span>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {([
                  { id: 'threads', label: 'Threads' },
                  { id: 'tiktok', label: 'TikTok' },
                  { id: 'instagram', label: 'Instagram' },
                  { id: 'youtube', label: 'YouTube' },
                  { id: 'twitter', label: 'Twitter / X' },
                  { id: 'twitch', label: 'Twitch' },
                ] as { id: keyof typeof handles; label: string }[]).map(({ id, label }) => (
                  <div
                    key={id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      border: '1.5px solid var(--neutral-200)', borderRadius: '12px',
                      padding: '10px 14px', backgroundColor: '#FAFAFA',
                    }}
                  >
                    <div style={{ color: PLATFORM_COLORS[id], flexShrink: 0 }}>
                      <SocialIcon platform={id} size={20} />
                    </div>
                    <input
                      value={handles[id]}
                      onChange={e => setHandles(prev => ({ ...prev, [id]: e.target.value }))}
                      placeholder={`${label} username`}
                      style={{
                        border: 'none', background: 'transparent', outline: 'none',
                        fontSize: '14px', flex: 1, fontFamily: 'inherit',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Niche */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '13px', color: 'var(--neutral-800)' }}>
                Your Niche
              </label>
              <select
                value={niche}
                onChange={e => setNiche(e.target.value)}
                className="input-field"
                style={{ width: '100%' }}
              >
                {['General', 'Tech', 'Lifestyle', 'Gaming', 'Education', 'Business', 'Art'].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <button
              onClick={saveInitialSetup}
              disabled={saving || !username.trim() || !hasAtLeastOneHandle}
              className="btn-primary"
              style={{ width: '100%', height: '50px', fontSize: '16px', borderRadius: '14px' }}
            >
              {saving ? 'Saving…' : 'Join the Circle →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
