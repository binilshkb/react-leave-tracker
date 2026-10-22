import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Clock, FileText, ClipboardList, LogOut, User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const EMP_NAV = [
  { to: '/my-dashboard',  icon: LayoutDashboard, label: 'My Dashboard'  },
  { to: '/my-attendance', icon: Clock,           label: 'My Attendance' },
  { to: '/my-leaves',     icon: FileText,        label: 'My Leaves'     },
];

export default function EmployeeSidebar() {
  const { authUser, logout } = useApp();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">📋</div>
        <div>
          <h1>LeaveTracker</h1>
          <span>Employee Portal</span>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">My Menu</div>
        {EMP_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* User + logout */}
      <div className="sidebar-employee">
        <div className="avatar sm">{authUser?.avatar}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {authUser?.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{authUser?.position}</div>
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
