import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { Clock, CheckCircle, XCircle, AlertCircle, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['Present', 'Absent', 'Late', 'Half Day'];

export default function MarkAttendance() {
  const { employees, attendance, markAttendance, today, currentEmployee, setCurrentEmployee } = useApp();
  const { toast } = useToast();

  const [selectedEmpId, setSelectedEmpId] = useState(currentEmployee.id);
  const [status,   setStatus]   = useState('Present');
  const [checkIn,  setCheckIn]  = useState(format(new Date(), 'HH:mm'));
  const [checkOut, setCheckOut] = useState('');
  const [notes,    setNotes]    = useState('');
  const [submitted, setSubmitted] = useState(false);

  const existing    = attendance.find(a => a.employeeId === selectedEmpId && a.date === today);
  const selectedEmp = employees.find(e => e.id === selectedEmpId);
  const todayAll    = attendance.filter(a => a.date === today);

  const statusIcon = s => {
    if (s === 'Present')  return <CheckCircle size={16} color="var(--success)" />;
    if (s === 'Absent')   return <XCircle     size={16} color="var(--danger)"  />;
    if (s === 'Late')     return <Clock       size={16} color="var(--warning)" />;
    return <AlertCircle size={16} color="var(--info)" />;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!selectedEmpId) return;
    markAttendance({
      employeeId: selectedEmpId,
      date: today,
      status,
      checkIn:  status === 'Absent' ? null : checkIn  || null,
      checkOut: status === 'Absent' ? null : checkOut || null,
      notes,
    });
    setCurrentEmployee(employees.find(e => e.id === selectedEmpId));
    setSubmitted(true);
    toast?.(`Attendance marked as ${status} for ${selectedEmp?.name}`, 'success');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <Header title="Mark Attendance" subtitle="Record daily attendance for any employee" />
      <div className="page-body">

        {/* ── Top stats ── */}
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: 'Total Employees', value: employees.length,                                          cls: 'primary', icon: <Users      size={20} /> },
            { label: 'Present Today',   value: todayAll.filter(a => a.status === 'Present').length,       cls: 'success', icon: <CheckCircle size={20} /> },
            { label: 'Absent Today',    value: todayAll.filter(a => a.status === 'Absent').length,        cls: 'danger',  icon: <XCircle     size={20} /> },
            { label: 'Late Today',      value: todayAll.filter(a => a.status === 'Late').length,          cls: 'warning', icon: <Clock       size={20} /> },
            { label: 'Marked Today',    value: todayAll.length,                                           cls: 'info',    icon: <TrendingUp  size={20} /> },
          ].map(({ label, value, cls, icon }) => (
            <div key={label} className="stat-card">
              <div className={`stat-icon ${cls}`}>{icon}</div>
              <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
            </div>
          ))}
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, alignItems: 'start' }}>

          {/* Left — form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {existing && (
              <div className={`alert ${existing.status === 'Present' ? 'success' : existing.status === 'Absent' ? 'danger' : 'warning'}`}>
                {statusIcon(existing.status)}
                <div>
                  <strong>Already recorded</strong> for {selectedEmp?.name}
                  &nbsp;— {existing.status}{existing.checkIn ? `, check-in: ${existing.checkIn}` : ''}. Update below.
                </div>
              </div>
            )}
            {submitted && (
              <div className="alert success">
                <CheckCircle size={16} /> Attendance recorded successfully!
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Attendance Form</div>
                  <div className="card-subtitle">{format(new Date(), 'EEEE, MMMM d, yyyy')}</div>
                </div>
                {selectedEmp && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="avatar">{selectedEmp.avatar}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedEmp.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{selectedEmp.department}</div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Select Employee *</label>
                  <select className="form-control" value={selectedEmpId}
                    onChange={e => setSelectedEmpId(Number(e.target.value))} required>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} — {emp.department}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-control" value={today} readOnly
                    style={{ background: 'var(--bg)', cursor: 'default' }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Attendance Status *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {STATUS_OPTIONS.map(s => (
                      <label key={s} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '11px 14px',
                        border: `2px solid ${status === s ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        background: status === s ? 'var(--primary-light)' : 'var(--surface-2)',
                        color: status === s ? 'var(--primary)' : 'var(--text-secondary)',
                        transition: 'var(--transition)',
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
                      <label className="form-label">Check-in Time</label>
                      <input type="time" className="form-control" value={checkIn}
                        onChange={e => setCheckIn(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Check-out Time</label>
                      <input type="time" className="form-control" value={checkOut}
                        onChange={e => setCheckOut(e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Notes (optional)</label>
                  <textarea className="form-control" rows={3} value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any additional remarks…" style={{ resize: 'vertical' }} />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-outline"
                    onClick={() => { setStatus('Present'); setCheckIn(format(new Date(), 'HH:mm')); setCheckOut(''); setNotes(''); }}>
                    Reset
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <CheckCircle size={16} />
                    {existing ? 'Update Attendance' : 'Mark Attendance'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right — today's full table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Today's Attendance</div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {format(new Date(), 'MMMM d, yyyy')}
              </span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th><th>Department</th><th>Status</th>
                    <th>Check-in</th><th>Check-out</th><th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAll.length > 0 ? todayAll.map(rec => {
                    const emp = employees.find(e => e.id === rec.employeeId);
                    let dur = '—';
                    if (rec.checkIn && rec.checkOut) {
                      const [h1, m1] = rec.checkIn.split(':').map(Number);
                      const [h2, m2] = rec.checkOut.split(':').map(Number);
                      const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
                      if (mins > 0) dur = `${Math.floor(mins / 60)}h ${mins % 60}m`;
                    }
                    return (
                      <tr key={rec.id}>
                        <td>
                          <div className="td-name">
                            <div className="avatar sm">{emp?.avatar}</div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{emp?.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp?.position}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{emp?.department}</td>
                        <td><span className={`badge-pill ${rec.status.toLowerCase()}`}>{rec.status}</span></td>
                        <td>{rec.checkIn ?? '—'}</td>
                        <td>{rec.checkOut ?? '—'}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{dur}</td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={6}>
                      <div className="empty-state">
                        <Clock size={40} />
                        <p>No attendance recorded today yet.</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Not yet marked */}
            {employees.filter(emp => !todayAll.find(a => a.employeeId === emp.id)).length > 0 && (
              <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--warning-light)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(251,191,36,.2)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--warning)', marginBottom: 8 }}>
                  ⚠ Not yet marked today
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {employees
                    .filter(emp => !todayAll.find(a => a.employeeId === emp.id))
                    .map(emp => (
                      <span key={emp.id} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'var(--surface-2)', border: '1px solid var(--border)',
                        borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 500,
                      }}>
                        <div className="avatar sm" style={{ width: 18, height: 18, fontSize: 8 }}>{emp.avatar}</div>
                        {emp.name}
                      </span>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
