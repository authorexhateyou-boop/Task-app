import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function PostTask() {
  const { userData } = useAuth();
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle || !userData) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        creatorId: userData.uid,
        creatorName: userData.username,
        threadsHandle: handle.startsWith('@') ? handle : `@${handle}`,
        niche: userData.niche || 'General',
        createdAt: serverTimestamp(),
        completionCount: 0,
        isActive: true
      });
      setHandle('');
      alert('Task posted successfully!');
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

      <form onSubmit={handleSubmit} className="card">
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--neutral-800)' }}>
            Threads Handle
          </label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="@yourusername"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
          {loading ? 'Publishing...' : <><PlusCircle size={18} /> Publish to Circle</>}
        </button>
      </form>

      <div style={{ marginTop: '24px', backgroundColor: 'var(--accent)', color: 'var(--primary-hover)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
        <strong>Reminder:</strong> You can only post one task per day. Make sure you also complete tasks to maintain your score!
      </div>
    </div>
  );
}
