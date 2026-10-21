import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { Clock, CheckCircle, XCircle, AlertCircle, LogIn, LogOut } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['Present', 'Absent', 'Late', 'Half Day'];

export default function MarkAttendance() {
  const { employees, attendance, markAttendance, today, currentEmployee, setCurrentEmployee } = useApp();
  const { toast } = useToast();

  const [selectedEmpId, setSelectedEmpId] = useState(currentEmployee.id);
  const [status, setStatus]   = useState('Present');
  const [checkIn, setCheckIn] = useState(format(new Date(), 'HH:mm'));
  const [checkOut, setCheckOut] = useState('');
  const [notes, setNotes]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  const existing = attendance.find(
    a => a.employeeId === selectedEmpId && a.date === today,
  );

  const selectedEmp = employees.find(e => e.id === selectedEmpId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    markAttendance({
      employeeId: selectedEmpId,
      date: today,
      status,
      checkIn: status === 'Absent' ? null : checkIn || null,
      checkOut: status === 'Absent' ? null : checkOut || null,
      notes,
    });
    setCurrentEmployee(employees.find(e => e.id === selectedEmpId));
    setSubmitted(true);
    toast?.(`Attendance marked as ${status} for ${selectedEmp?.name}`, 'success');
    setTimeout(() => setSubmitted(false), 3000);
  };

  const statusIcon = (s) => {
    if (s === 'Present') return <CheckCircle size={16} color="var(--success)" />;
    if (s === 'Absent')  return <XCircle size={16}     color="var(--danger)"  />;
    if (s === 'Late')    return <Clock size={16}        color="var(--warning)" />;
    return <AlertCircle size={16} color="var(--info)" />;
  };

  return (
    <>
      <Header title="Mark Attendance" subtitle="Record daily attendance for employees" />
      <div className="page-body">
        <div style={{ maxWidth: 600, margin: '0 auto' }}>

          {/* Already recorded banner */}
          {existing && (
            <div className={`alert ${existing.status === 'Present' ? 'success' : existing.status === 'Absent' ? 'danger' : 'warning'}`}>
              {statusIcon(existing.status)}
              <div>
                <strong>Attendance already recorded</strong> for {selectedEmp?.name} today
                &nbsp;(Status: {existing.status}{existing.checkIn ? `, Check-in: ${existing.checkIn}` : ''})
                . You can update it below.
              </div>
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Employee */}
              <div className="form-group">
                <label className="form-label">Select Employee *</label>
                <select
                  className="form-control"
                  value={selectedEmpId}
                  onChange={e => setSelectedEmpId(Number(e.target.value))}
                  required
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date (read-only) */}
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-control" value={today} readOnly style={{ background: 'var(--bg)', cursor: 'default' }} />
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label">Attendance Status *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  {STATUS_OPTIONS.map(s => (
                    <label
                      key={s}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 6px', border: `2px solid ${status === s ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        background: status === s ? 'var(--primary-light)' : 'var(--surface)',
                        color: status === s ? 'var(--primary)' : 'var(--text-secondary)',
                        transition: 'var(--transition)',
                      }}
                    >
                      <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} style={{ display: 'none' }} />
                      {statusIcon(s)}
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              {/* Check-in / check-out */}
              {status !== 'Absent' && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Check-in Time</label>
                    <input
                      type="time" className="form-control"
                      value={checkIn} onChange={e => setCheckIn(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Check-out Time</label>
                    <input
                      type="time" className="form-control"
                      value={checkOut} onChange={e => setCheckOut(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any additional remarks..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setStatus('Present'); setCheckIn(format(new Date(),'HH:mm')); setCheckOut(''); setNotes(''); }}>
                  Reset
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle size={16} />
                  {existing ? 'Update Attendance' : 'Mark Attendance'}
                </button>
              </div>
            </form>
          </div>

          {/* Success message */}
          {submitted && (
            <div className="alert success" style={{ marginTop: 16 }}>
              <CheckCircle size={16} />
              Attendance successfully recorded!
            </div>
          )}

          {/* Quick summary */}
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header"><div className="card-title">Today's Summary</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {['Present','Absent','Late'].map(s => {
                const count = attendance.filter(a => a.date === today && a.status === s).length;
                return (
                  <div key={s} style={{ textAlign: 'center', padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: 24, fontWeight: 800 }}>{count}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{s}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
