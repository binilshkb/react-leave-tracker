import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import { useToast } from '../../components/Toast';
import { CheckCircle, XCircle, Clock, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['Present', 'Absent', 'Late', 'Half Day'];

export default function MyAttendance() {
  const { authUser, attendance, markAttendance, today } = useApp();
  const { toast } = useToast();
  const empId = authUser?.id;

  const [status,   setStatus]   = useState('Present');
  const [checkIn,  setCheckIn]  = useState(format(new Date(), 'HH:mm'));
  const [checkOut, setCheckOut] = useState('');
  const [notes,    setNotes]    = useState('');
  const [done,     setDone]     = useState(false);

  const myRecords  = attendance
    .filter(a => a.employeeId === empId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const todayRecord = myRecords.find(a => a.date === today);

  const totalPresent  = myRecords.filter(a => a.status === 'Present').length;
  const totalAbsent   = myRecords.filter(a => a.status === 'Absent').length;
  const totalLate     = myRecords.filter(a => a.status === 'Late').length;
  const totalDays     = myRecords.length;
  const attendanceRate = totalDays ? Math.round(((totalPresent + totalLate) / totalDays) * 100) : 0;

  const statusIcon = s => {
    if (s === 'Present')  return <CheckCircle size={15} color="var(--success)" />;
    if (s === 'Absent')   return <XCircle     size={15} color="var(--danger)"  />;
    if (s === 'Late')     return <Clock       size={15} color="var(--warning)" />;
    return <AlertCircle size={15} color="var(--info)" />;
  };

  const handleSubmit = e => {
    e.preventDefault();
    markAttendance({
      employeeId: empId,
      date: today,
      status,
      checkIn:  status === 'Absent' ? null : checkIn  || null,
      checkOut: status === 'Absent' ? null : checkOut || null,
      notes,
    });
    setDone(true);
    toast?.(`Attendance marked as ${status}`, 'success');
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <>
      <Header title="My Attendance" subtitle="Mark today's attendance and view your full history" />
      <div className="page-body">

        {/* ── Top stat strip ── */}
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: 'Total Days',       value: totalDays,        cls: 'primary', icon: <Calendar   size={20} /> },
            { label: 'Days Present',     value: totalPresent,     cls: 'success', icon: <CheckCircle size={20} /> },
            { label: 'Days Absent',      value: totalAbsent,      cls: 'danger',  icon: <XCircle     size={20} /> },
            { label: 'Late Arrivals',    value: totalLate,        cls: 'warning', icon: <Clock       size={20} /> },
            { label: 'Attendance Rate',  value: `${attendanceRate}%`, cls: 'info', icon: <TrendingUp size={20} /> },
          ].map(({ label, value, cls, icon }) => (
            <div key={label} className="stat-card">
              <div className={`stat-icon ${cls}`}>{icon}</div>
              <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main two-column layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'stretch' }}>

          {/* Left — mark form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {todayRecord && (
              <div className={`alert ${todayRecord.status === 'Present' ? 'success' : todayRecord.status === 'Absent' ? 'danger' : 'warning'}`}>
                {statusIcon(todayRecord.status)}
                Already marked as <strong>{todayRecord.status}</strong>.
                {todayRecord.checkIn && <> Check-in: <strong>{todayRecord.checkIn}</strong></>} · You can update below.
              </div>
            )}
            {done && <div className="alert success"><CheckCircle size={15} /> Saved successfully!</div>}

            <div className="card" style={{ flex: 1 }}>
              <div className="card-header">
                <div>
                  <div className="card-title">{todayRecord ? 'Update Attendance' : 'Mark Attendance'}</div>
                  <div className="card-subtitle">{format(new Date(), 'EEEE, MMMM d, yyyy')}</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Status toggle */}
                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {STATUS_OPTIONS.map(s => (
                      <label key={s} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '11px 14px',
                        border: `2px solid ${status === s ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        background: status === s ? 'var(--primary-light)' : 'var(--surface-2)',
                        color: status === s ? 'var(--primary)' : 'var(--text-secondary)',
                        fontSize: 13, fontWeight: 600, transition: 'var(--transition)',
                      }}>
                        <input type="radio" name="status" value={s} checked={status === s}
                          onChange={() => setStatus(s)} style={{ display: 'none' }} />
                        {statusIcon(s)} {s}
                      </label>
                    ))}
                  </div>
                </div>

                {status !== 'Absent' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Check-in</label>
                      <input type="time" className="form-control" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Check-out</label>
                      <input type="time" className="form-control" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Notes (optional)</label>
                  <textarea className="form-control" rows={3} value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any remarks…" style={{ resize: 'vertical' }} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <CheckCircle size={15} />
                  {todayRecord ? 'Update Attendance' : 'Submit Attendance'}
                </button>
              </form>
            </div>
          </div>

          {/* Right — full history table */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div className="card-title">Attendance History</div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{myRecords.length} records</span>
            </div>
            <div className="table-wrap" style={{ flex: 1 }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Date</th><th>Day</th><th>Status</th>
                    <th>Check-in</th><th>Check-out</th><th>Duration</th><th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {myRecords.length > 0 ? (
                    <>
                      {myRecords.map((rec, i) => {
                        let dur = '—';
                        if (rec.checkIn && rec.checkOut) {
                          const [h1, m1] = rec.checkIn.split(':').map(Number);
                          const [h2, m2] = rec.checkOut.split(':').map(Number);
                          const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
                          if (mins > 0) dur = `${Math.floor(mins / 60)}h ${mins % 60}m`;
                        }
                        const dayName = format(new Date(rec.date), 'EEE');
                        return (
                          <tr key={rec.id}>
                            <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                            <td style={{ fontWeight: 500 }}>{rec.date}</td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{dayName}</td>
                            <td><span className={`badge-pill ${rec.status.toLowerCase()}`}>{rec.status}</span></td>
                            <td>{rec.checkIn ?? '—'}</td>
                            <td>{rec.checkOut ?? '—'}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{dur}</td>
                            <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {rec.notes || '—'}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Pad to minimum 5 visible rows */}
                      {Array.from({ length: Math.max(0, 5 - myRecords.length) }).map((_, i) => (
                        <tr key={`empty-${i}`}>
                          <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{myRecords.length + i + 1}</td>
                          <td style={{ color: 'var(--border)' }}>––</td>
                          <td style={{ color: 'var(--border)' }}>–</td>
                          <td style={{ color: 'var(--border)' }}>–</td>
                          <td style={{ color: 'var(--border)' }}>–</td>
                          <td style={{ color: 'var(--border)' }}>–</td>
                          <td style={{ color: 'var(--border)' }}>–</td>
                          <td style={{ color: 'var(--border)' }}>–</td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <>
                      <tr><td colSpan={8}>
                        <div className="empty-state" style={{ padding: '28px 24px' }}>
                          <Calendar size={36} />
                          <p>No attendance records found.</p>
                        </div>
                      </td></tr>
                      {/* 4 phantom rows so the empty state card still fills height */}
                      {Array.from({ length: 4 }).map((_, i) => (
                        <tr key={`ph-${i}`}>
                          <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                          <td style={{ color: 'var(--border)' }}>––</td>
                          <td style={{ color: 'var(--border)' }}>–</td>
                          <td style={{ color: 'var(--border)' }}>–</td>
                          <td style={{ color: 'var(--border)' }}>–</td>
                          <td style={{ color: 'var(--border)' }}>–</td>
                          <td style={{ color: 'var(--border)' }}>–</td>
                          <td style={{ color: 'var(--border)' }}>–</td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
