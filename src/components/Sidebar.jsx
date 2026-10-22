import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, ClipboardList, FileText,
  Users, Clock, LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/attendance', icon: Clock,           label: 'Mark Attendance' },
  { to: '/attendance-list', icon: Calendar,   label: 'Attendance List' },
  { to: '/apply-leave',icon: FileText,        label: 'Apply Leave' },
  { to: '/leave-list', icon: ClipboardList,   label: 'Leave List' },
  { to: '/employees',  icon: Users,           label: 'Employees' },
];

export default function Sidebar() {
  const { stats, authUser, logout } = useApp();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">📋</div>
        <div>
          <h1>LeaveTracker</h1>
          <span>HR Management</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Main Menu</div>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={18} />
            {label}
            {label === 'Leave List' && stats.pendingLeaves > 0 && (
              <span className="badge">{stats.pendingLeaves}</span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Current user + logout */}
      <div className="sidebar-employee">
        <div className="avatar sm">{authUser?.avatar ?? 'HR'}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {authUser?.name ?? 'HR Admin'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{authUser?.position ?? 'Administrator'}</div>
        </div>
        <button
          className="btn btn-ghost btn-icon"
          title="Sign out"
          onClick={logout}
          style={{ flexShrink: 0 }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

