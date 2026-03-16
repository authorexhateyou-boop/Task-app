import { Outlet, NavLink, Link, Navigate } from 'react-router-dom';
import { Home, PlusSquare, User, Trophy, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { currentUser, isAdmin } = useAuth();

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
    </div>
  );
}
