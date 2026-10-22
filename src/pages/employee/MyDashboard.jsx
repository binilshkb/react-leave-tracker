import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import {
  CheckCircle, XCircle, Clock, FileText, TrendingUp, Calendar, AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts';
import { format, subDays } from 'date-fns';

const LEAVE_BALANCE = [
  { type: 'Annual',   total: 20, used: 8  },
  { type: 'Sick',     total: 12, used: 3  },
  { type: 'Casual',   total: 6,  used: 2  },
];
const BAR_COLORS = { Present: '#34d399', Absent: '#f87171', Late: '#fbbf24' };

export default function MyDashboard() {
  const { authUser, attendance, leaves, today } = useApp();
  const empId = authUser?.id;

  // ── Personal attendance records ─────────────────────────────────────────
  const myAttendance = attendance.filter(a => a.employeeId === empId);
  const myLeaves     = leaves.filter(l => l.employeeId === empId);

  const todayRecord  = myAttendance.find(a => a.date === today);

  const totalPresent = myAttendance.filter(a => a.status === 'Present').length;
  const totalAbsent  = myAttendance.filter(a => a.status === 'Absent').length;
  const totalLate    = myAttendance.filter(a => a.status === 'Late').length;
  const pendingLeaves  = myLeaves.filter(l => l.status === 'Pending').length;
  const approvedLeaves = myLeaves.filter(l => l.status === 'Approved').length;

  // ── Weekly personal chart ────────────────────────────────────────────────
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d   = subDays(new Date(), 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    const rec = myAttendance.find(a => a.date === key);
    return {
      day:     format(d, 'EEE'),
      Present: rec?.status === 'Present' ? 1 : 0,
      Absent:  rec?.status === 'Absent'  ? 1 : 0,
      Late:    rec?.status === 'Late'    ? 1 : 0,
    };
  });

  const statusCls = todayRecord
    ? todayRecord.status.toLowerCase()
    : 'pending';
  const statusLabel = todayRecord ? todayRecord.status : 'Not Marked';

  return (
    <>
      <Header
        title={`Hello, ${authUser?.name?.split(' ')[0]} 👋`}
        subtitle="Here's your personal overview for today"
      />
      <div className="page-body">

        {/* ── Today's status banner ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '18px 22px', marginBottom: 20,
          boxShadow: 'var(--shadow)',
        }}>
          <div className={`avatar lg`}>{authUser?.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Today · {format(new Date(), 'EEEE, MMMM d yyyy')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className={`badge-pill ${statusCls}`} style={{ fontSize: 13, padding: '5px 14px' }}>
                {statusLabel}
              </span>
              {todayRecord?.checkIn && (
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  ⏰ Check-in: <strong>{todayRecord.checkIn}</strong>
                </span>
              )}
              {todayRecord?.checkOut && (
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  🏁 Check-out: <strong>{todayRecord.checkOut}</strong>
                </span>
              )}
              {!todayRecord && (
                <span style={{ fontSize: 13, color: 'var(--warning)' }}>
                  ⚠ Attendance not marked for today
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{authUser?.department}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 2 }}>{authUser?.position}</div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon success"><CheckCircle size={20} /></div>
            <div>
              <div className="stat-value">{totalPresent}</div>
              <div className="stat-label">Days Present</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon danger"><XCircle size={20} /></div>
            <div>
              <div className="stat-value">{totalAbsent}</div>
              <div className="stat-label">Days Absent</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning"><Clock size={20} /></div>
            <div>
              <div className="stat-value">{totalLate}</div>
              <div className="stat-label">Late Arrivals</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info"><FileText size={20} /></div>
            <div>
              <div className="stat-value">{pendingLeaves}</div>
              <div className="stat-label">Pending Leaves</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><TrendingUp size={20} /></div>
            <div>
              <div className="stat-value">{approvedLeaves}</div>
              <div className="stat-label">Approved Leaves</div>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 20 }}>

          {/* ── Weekly attendance chart ── */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">My Attendance — Last 7 Days</div>
                <div className="card-subtitle">1 = marked, 0 = not marked</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} ticks={[0, 1]} />
                <Tooltip />
                <Legend />
                {['Present','Absent','Late'].map(k => (
                  <Bar key={k} dataKey={k} fill={BAR_COLORS[k]} radius={[4,4,0,0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Leave balance ── */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">My Leave Balance</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {LEAVE_BALANCE.map(({ type, total, used }) => (
                <div key={type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{type} Leave</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{total - used}</strong> / {total} remaining
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${(used / total) * 100}%`,
                        background: used / total > 0.8 ? 'var(--danger)' : used / total > 0.5 ? 'var(--warning)' : 'var(--primary)',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{used} used of {total} days</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent leaves ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">My Recent Leave Applications</div>
          </div>
          {myLeaves.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Applied On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...myLeaves].reverse().map(l => (
                    <tr key={l.id}>
                      <td><span className={`badge-pill ${l.type.split(' ')[0].toLowerCase()}`}>{l.type}</span></td>
                      <td>{l.startDate}</td>
                      <td>{l.endDate}</td>
                      <td style={{ fontWeight: 600 }}>{l.days}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{l.appliedOn}</td>
                      <td><span className={`badge-pill ${l.status.toLowerCase()}`}>{l.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <Calendar size={40} />
              <p>No leave applications yet.</p>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
