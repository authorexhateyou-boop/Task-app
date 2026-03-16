import { PlusCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function PostTask() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userData || !userData.threadsHandle) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        creatorId: userData.uid,
        creatorName: userData.username,
        threadsHandle: userData.threadsHandle,
        niche: userData.niche || 'General',
        createdAt: serverTimestamp(),
        completionCount: 0,
        isActive: true
      });
      alert('Task posted successfully! Check the Home feed.');
    } catch (error) {
      console.error(error);
      alert('Failed to post task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Post Daily Task</h1>
      <p className="page-subtitle">Submit your Threads profile for today's circle drop.</p>

      <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
        {!userData?.threadsHandle ? (
          <div>
            <div style={{ marginBottom: '16px', color: 'var(--danger)' }}>
              You need to set up your Threads Handle first!
            </div>
            <Link to="/profile" className="btn-secondary" style={{ display: 'inline-flex' }}>
              Go to Profile Settings
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: 'var(--neutral-600)', marginBottom: '8px' }}>You are posting as:</p>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--primary)' }}>
                {userData.threadsHandle}
              </h2>
              <div style={{ display: 'inline-block', backgroundColor: 'var(--neutral-100)', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', color: 'var(--neutral-600)' }}>
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
        <strong>Reminder:</strong> You can only post one task per day. Make sure you also complete tasks to maintain your score!
      </div>
    </div>
  );
}
