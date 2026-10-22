import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import {
  Users, CheckCircle, XCircle, Clock, FileText, TrendingUp, AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import { format, subDays } from 'date-fns';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#4f46e5'];

// ── Shared dark-mode tooltip style ─────────────────────────────────────────
const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,.5)',
    color: '#f1f5f9',
    fontSize: 13,
  },
  labelStyle:   { color: '#f1f5f9', fontWeight: 700, marginBottom: 4 },
  itemStyle:    { color: '#94a3b8' },
  cursor:       { fill: 'rgba(99,102,241,.08)' },
};

// Generate mock weekly data
const weeklyData = Array.from({ length: 7 }, (_, i) => {
  const d = subDays(new Date(), 6 - i);
  return {
    day: format(d, 'EEE'),
    present: Math.floor(Math.random() * 3) + 3,
    absent:  Math.floor(Math.random() * 2),
    late:    Math.floor(Math.random() * 2),
  };
});

const leaveTypeData = [
  { name: 'Annual',    value: 8  },
  { name: 'Sick',      value: 5  },
  { name: 'Casual',    value: 4  },
  { name: 'Maternity', value: 2  },
];

export default function Dashboard() {
  const { stats, employees, leaves, attendance, today } = useApp();

  const recentLeaves  = [...leaves].sort((a, b) => b.appliedOn?.localeCompare(a.appliedOn)).slice(0, 5);
  const todayRecords  = attendance.filter(a => a.date === today);

  const getEmp = id => employees.find(e => e.id === id);

  const attendancePieData = [
    { name: 'Present', value: stats.presentToday },
    { name: 'Absent',  value: stats.absentToday  },
    { name: 'Late',    value: stats.lateToday    },
  ].filter(d => d.value > 0);

  const attendanceRate = stats.total
    ? Math.round(((stats.presentToday + stats.lateToday) / stats.total) * 100)
    : 0;

  return (
    <>
      <Header title="Dashboard" subtitle="Welcome back! Here's what's happening today." />
      <div className="page-body">

        {/* ── Stat cards ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon primary"><Users size={20} /></div>
            <div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Employees</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><CheckCircle size={20} /></div>
            <div>
              <div className="stat-value">{stats.presentToday}</div>
              <div className="stat-label">Present Today</div>
              <div className={`stat-change ${attendanceRate >= 70 ? 'up' : 'down'}`}>
                {attendanceRate}% attendance rate
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon danger"><XCircle size={20} /></div>
            <div>
              <div className="stat-value">{stats.absentToday}</div>
              <div className="stat-label">Absent Today</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning"><Clock size={20} /></div>
            <div>
              <div className="stat-value">{stats.lateToday}</div>
              <div className="stat-label">Late Arrivals</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info"><FileText size={20} /></div>
            <div>
              <div className="stat-value">{stats.pendingLeaves}</div>
              <div className="stat-label">Pending Leaves</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><TrendingUp size={20} /></div>
            <div>
              <div className="stat-value">{stats.approvedLeaves}</div>
              <div className="stat-label">Approved Leaves</div>
            </div>
          </div>
        </div>

        {/* ── Charts row ── */}
        <div className="grid-2" style={{ marginBottom: 20 }}>
          {/* Weekly attendance bar chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Weekly Attendance</div>
                <div className="card-subtitle">Last 7 days overview</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend />
                <Bar dataKey="present" fill="#10b981" radius={[4,4,0,0]} name="Present" />
                <Bar dataKey="absent"  fill="#ef4444" radius={[4,4,0,0]} name="Absent" />
                <Bar dataKey="late"    fill="#f59e0b" radius={[4,4,0,0]} name="Late" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Today's attendance pie */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Today's Attendance</div>
                <div className="card-subtitle">{format(new Date(), 'MMMM d, yyyy')}</div>
              </div>
            </div>
            {attendancePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90}
                    paddingAngle={4} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {attendancePieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <AlertCircle size={40} />
                <p>No attendance data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className="grid-2">
          {/* Leave type distribution */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Leave Types Distribution</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {leaveTypeData.map((lt, i) => (
                <div key={lt.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{lt.name} Leave</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{lt.value} days</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${(lt.value / 19) * 100}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent leave activity */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Leave Applications</div>
            </div>
            <div className="activity-list">
              {recentLeaves.map(l => {
                const emp = getEmp(l.employeeId);
                const dotClass = l.status === 'Approved' ? 'success' : l.status === 'Rejected' ? 'danger' : 'warning';
                return (
                  <div key={l.id} className="activity-item">
                    <div className={`activity-dot ${dotClass}`} />
                    <div className="activity-content">
                      <p><strong>{emp?.name}</strong> applied for <strong>{l.type}</strong></p>
                      <span>{l.startDate} → {l.endDate} &bull; {l.days} day{l.days > 1 ? 's' : ''} &bull; {l.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Today's quick view ── */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div className="card-title">Today's Quick View</div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{format(new Date(), 'EEEE, MMMM d')}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                </tr>
              </thead>
              <tbody>
                {todayRecords.length > 0 ? todayRecords.map(rec => {
                  const emp = getEmp(rec.employeeId);
                  return (
                    <tr key={rec.id}>
                      <td>
                        <div className="td-name">
                          <div className="avatar sm">{emp?.avatar}</div>
                          {emp?.name}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{emp?.department}</td>
                      <td>
                        <span className={`badge-pill ${rec.status.toLowerCase()}`}>{rec.status}</span>
                      </td>
                      <td>{rec.checkIn ?? '—'}</td>
                      <td>{rec.checkOut ?? '—'}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state"><p>No attendance records for today.</p></div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
