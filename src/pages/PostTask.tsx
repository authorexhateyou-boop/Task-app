import { PlusCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import {
  collection, addDoc, serverTimestamp,
  query, where, getDocs, updateDoc, doc, increment,
} from 'firebase/firestore';
import { Link } from 'react-router-dom';

function SocialIcon({ platform, size = 22 }: { platform: string; size?: number }) {
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

const COLORS: Record<string, string> = {
  threads: '#000', tiktok: '#010101', instagram: '#E1306C',
  youtube: '#FF0000', twitter: '#000', twitch: '#6441A5',
};
const LABELS: Record<string, string> = {
  threads: 'Threads', tiktok: 'TikTok', instagram: 'Instagram',
  youtube: 'YouTube', twitter: 'Twitter / X', twitch: 'Twitch',
};

export default function PostTask() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasActiveTask, setHasActiveTask] = useState(false);
  const [checking, setChecking] = useState(true);
  const [selected, setSelected] = useState<string>('');

  const connectedPlatforms = ['threads', 'tiktok', 'instagram', 'youtube', 'twitter', 'twitch']
    .map(id => ({ id, handle: ((userData as any)?.[`${id}Handle`] || '') as string }))
    .filter(p => p.handle.trim() !== '');

  useEffect(() => {
    if (connectedPlatforms.length > 0 && !selected) {
      setSelected(connectedPlatforms[0].id);
    }
  }, [userData]);

  useEffect(() => {
    const check = async () => {
      if (!userData) return;
      try {
        const q = query(collection(db, 'tasks'), where('creatorId', '==', userData.uid));
        const snap = await getDocs(q);
        if (!snap.empty) setHasActiveTask(true);
      } catch (e) {
        console.error(e);
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [userData]);

  const handlePublish = async () => {
    if (!userData || !selected || hasActiveTask || loading) return;
    const handle = (userData as any)[`${selected}Handle`] || '';
    if (!handle) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        creatorId: userData.uid,
        creatorName: userData.username,
        platform: selected,
        primaryHandle: handle,
        niche: userData.niche || 'General',
        createdAt: serverTimestamp(),
        completionCount: 0,
        isActive: true,
      });
      await updateDoc(doc(db, 'users', userData.uid), { tasksPosted: increment(1) });
      setHasActiveTask(true);
    } catch (e) {
      console.error(e);
      alert('Failed to post task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-content">
      <h1 className="page-title">Post Daily Task</h1>
      <p className="page-subtitle">Pick one account to promote in today's circle.</p>

      {/* Status states — each in their own standalone card */}
      {checking ? (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--neutral-500)' }}>Checking status…</p>
        </div>

      ) : hasActiveTask ? (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <CheckCircle size={56} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>You're in the circle!</h2>
          <p style={{ color: 'var(--neutral-600)', marginBottom: '24px' }}>
            Your task is live. Complete others to boost your score!
          </p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-flex' }}>Go to Feed</Link>
        </div>

      ) : connectedPlatforms.length === 0 ? (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <AlertCircle size={44} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--danger)' }}>
            No social handles added
          </h2>
          <p style={{ color: 'var(--neutral-600)', marginBottom: '24px', fontSize: '14px' }}>
            Add your social media usernames in Profile first.
          </p>
          <Link to="/profile" className="btn-primary" style={{ display: 'inline-flex' }}>
            Go to Profile →
          </Link>
        </div>

      ) : (
        <>
          {/* Section label */}
          <p style={{
            fontSize: '12px', fontWeight: 700, color: 'var(--neutral-600)',
            textTransform: 'uppercase', letterSpacing: '1px',
            marginBottom: '10px', paddingLeft: '4px',
          }}>
            Select one to post today
          </p>

          {/*
           * Each platform is a standalone <button> — NOT nested inside any .card.
           * This means .card:active NEVER fires. Each button handles its own click.
           */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {connectedPlatforms.map(({ id, handle }) => {
              const isActive = selected === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelected(id)}
                  className={`platform-option${isActive ? ' selected' : ''}`}
                >
                  {/* Platform icon in a coloured circle */}
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '13px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isActive ? 'white' : 'var(--neutral-100)',
                    color: isActive ? COLORS[id] : 'var(--neutral-400)',
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease',
                  }}>
                    <SocialIcon platform={id} size={24} />
                  </div>

                  {/* Platform name + handle text */}
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{
                      fontSize: '11px', fontWeight: 700,
                      color: isActive ? 'var(--primary)' : 'var(--neutral-500)',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                      {LABELS[id]}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--neutral-900)', marginTop: '2px' }}>
                      {handle}
                    </div>
                  </div>

                  {/* Radio circle indicator */}
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                    border: isActive ? '7px solid var(--primary)' : '2px solid var(--neutral-300)',
                    backgroundColor: 'white',
                    transition: 'all 0.15s ease',
                  }} />
                </button>
              );
            })}
          </div>

          {/* Add handle hint */}
          <p style={{ fontSize: '13px', color: 'var(--neutral-400)', marginBottom: '20px', paddingLeft: '4px' }}>
            Want a different platform?{' '}
            <Link to="/profile" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Add it in Profile →
            </Link>
          </p>

          {/* Publish button — its own standalone element */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={loading || !selected}
            className="btn-primary"
            style={{
              width: '100%', fontSize: '17px', height: '56px',
              borderRadius: '16px', boxShadow: '0 8px 24px rgba(66,185,131,0.25)',
            }}
          >
            {loading ? 'Publishing…' : <><PlusCircle size={22} /> Publish to Circle</>}
          </button>

          <div style={{
            marginTop: '20px',
            backgroundColor: 'var(--accent)', color: 'var(--primary-hover)',
            padding: '14px 16px', borderRadius: '12px', fontSize: '13px',
          }}>
            <strong>Reminder:</strong> One active task at a time. Complete others to maintain your score!
          </div>
        </>
      )}
    </div>
  );
}
