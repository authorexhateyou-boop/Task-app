import { PlusCircle, CheckCircle, Instagram, Twitter, Music2, AtSign, Youtube, Tv } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function PostTask() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasActiveTask, setHasActiveTask] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkActiveTasks = async () => {
      if (!userData) return;
      try {
        const q = query(collection(db, 'tasks'), where('creatorId', '==', userData.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setHasActiveTask(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setChecking(false);
      }
    };
    checkActiveTasks();
  }, [userData]);

  const handleSubmit = async () => {
    if (!userData || !userData.threadsHandle || hasActiveTask) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        creatorId: userData.uid,
        creatorName: userData.username,
        threadsHandle: userData.threadsHandle,
        instagramHandle: userData.instagramHandle || '',
        twitterHandle: userData.twitterHandle || '',
        tiktokHandle: userData.tiktokHandle || '',
        youtubeHandle: userData.youtubeHandle || '',
        twitchHandle: userData.twitchHandle || '',
        niche: userData.niche || 'General',
        createdAt: serverTimestamp(),
        completionCount: 0,
        isActive: true
      });
      // Increment tasksPosted stat
      await updateDoc(doc(db, 'users', userData.uid), {
        tasksPosted: increment(1)
      });
      setHasActiveTask(true);
      alert('Task posted successfully! Check the Home feed.');
    } catch (error) {
      console.error(error);
      alert('Failed to post task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-content">
      <h1 className="page-title">Post Daily Task</h1>
      <p className="page-subtitle">Submit your Threads profile for today's circle drop.</p>

      <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
        {checking ? (
          <div style={{ color: 'var(--neutral-600)' }}>Checking your circle status...</div>
        ) : !userData?.threadsHandle ? (
          <div>
            <div style={{ marginBottom: '16px', color: 'var(--danger)' }}>
              You need to set up your Threads Handle first!
            </div>
            <Link to="/profile" className="btn-secondary" style={{ display: 'inline-flex' }}>
              Go to Profile Settings
            </Link>
          </div>
        ) : hasActiveTask ? (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <CheckCircle size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--neutral-800)' }}>
                You're in the circle!
              </h2>
              <p style={{ color: 'var(--neutral-600)' }}>
                Your task is currently live. Complete other creator tasks to boost your score while you wait!
              </p>
            </div>
            <Link to="/" className="btn-primary" style={{ display: 'inline-flex' }}>
              Go to Home Feed
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: 'var(--neutral-600)', marginBottom: '12px' }}>You are posting as:</p>
              <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 12px 0', color: 'var(--neutral-900)' }}>
                {userData.username}
              </h2>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
                <span className="badge badge-gray" style={{ fontSize: '13px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AtSign size={14} /> {userData.threadsHandle}
                </span>
                {userData.instagramHandle && (
                  <span className="badge badge-gray" style={{ fontSize: '13px', padding: '8px 14px', color: '#E1306C', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Instagram size={14} /> {userData.instagramHandle}
                  </span>
                )}
                {userData.twitterHandle && (
                  <span className="badge badge-gray" style={{ fontSize: '13px', padding: '8px 14px', color: '#1DA1F2', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Twitter size={14} /> {userData.twitterHandle}
                  </span>
                )}
                {userData.tiktokHandle && (
                  <span className="badge badge-gray" style={{ fontSize: '13px', padding: '8px 14px', color: '#000000', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Music2 size={14} /> {userData.tiktokHandle}
                  </span>
                )}
                {userData.youtubeHandle && (
                  <span className="badge badge-gray" style={{ fontSize: '13px', padding: '8px 14px', color: '#FF0000', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Youtube size={14} /> {userData.youtubeHandle}
                  </span>
                )}
                {userData.twitchHandle && (
                  <span className="badge badge-gray" style={{ fontSize: '13px', padding: '8px 14px', color: '#6441A5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tv size={14} /> {userData.twitchHandle}
                  </span>
                )}
              </div>

              <div style={{ display: 'inline-block', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600 }}>
                Niche: {userData.niche || 'General'}
              </div>
            </div>
            
            <button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="btn-primary" 
              style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}
            >
              {loading ? 'Publishing...' : <><PlusCircle size={18} /> Publish to Circle</>}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px', backgroundColor: 'var(--accent)', color: 'var(--primary-hover)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
        <strong>Reminder:</strong> You can only post one task at a time. Make sure you also complete tasks to maintain your score!
      </div>
    </div>
  );
}
