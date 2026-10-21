import { Bell, Settings, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

export default function Header({ title, subtitle }) {
  const { stats } = useApp();

  return (
    <header className="header">
      <div className="header-title">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="header-actions">
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {format(new Date(), 'EEE, MMM d yyyy')}
        </span>
        <button className="btn btn-ghost btn-icon" title="Notifications" style={{ position: 'relative' }}>
          <Bell size={18} />
          {stats.pendingLeaves > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--danger)',
            }} />
          )}
        </button>
        <button className="btn btn-ghost btn-icon" title="Settings">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
