import { PlusCircle } from 'lucide-react';

export default function PostTask() {
  return (
    <div>
      <h1 className="page-title">Post Daily Task</h1>
      <p className="page-subtitle">Submit your Threads profile for today's circle drop.</p>

      <div className="card">
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--neutral-800)' }}>
            Threads Handle
          </label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="@yourusername"
          />
        </div>
        <button className="btn-primary" style={{ width: '100%' }}>
          <PlusCircle size={18} /> Publish to Circle
        </button>
      </div>

      <div style={{ marginTop: '24px', backgroundColor: 'var(--accent)', color: 'var(--primary-hover)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
        <strong>Reminder:</strong> You can only post one task per day. Make sure you also complete tasks to maintain your score!
      </div>
    </div>
  );
}
