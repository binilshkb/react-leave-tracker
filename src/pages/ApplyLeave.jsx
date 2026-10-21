import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { FileText, CheckCircle, Calendar, Info } from 'lucide-react';
import { differenceInBusinessDays, parseISO, format } from 'date-fns';

const LEAVE_TYPES = ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'];

export default function ApplyLeave() {
  const { employees, applyLeave, currentEmployee } = useApp();
  const { toast } = useToast();

  const [empId,     setEmpId]     = useState(currentEmployee.id);
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [reason,    setReason]    = useState('');
  const [contact,   setContact]   = useState('');
  const [submitted, setSubmitted] = useState(null);

  const selectedEmp = employees.find(e => e.id === empId);

  const days = startDate && endDate
    ? Math.max(1, differenceInBusinessDays(parseISO(endDate), parseISO(startDate)) + 1)
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;
    if (endDate < startDate) {
      toast?.('End date must be after start date', 'danger');
      return;
    }
    const leave = {
      employeeId: empId,
      type: leaveType,
      startDate, endDate, days,
      reason,
      emergencyContact: contact,
    };
    applyLeave(leave);
    setSubmitted({ ...leave, empName: selectedEmp?.name });
    toast?.(`Leave application submitted for ${selectedEmp?.name}`, 'success');
    // reset
    setStartDate(''); setEndDate(''); setReason(''); setContact('');
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <>
      <Header title="Apply for Leave" subtitle="Submit a leave application for review" />
      <div className="page-body">
        <div style={{ maxWidth: 660, margin: '0 auto' }}>

          {submitted && (
            <div className="alert success">
              <CheckCircle size={16} />
              <div>
                <strong>Leave application submitted!</strong><br />
                {submitted.empName} — {submitted.type} from {submitted.startDate} to {submitted.endDate} ({submitted.days} day{submitted.days > 1 ? 's' : ''}).
                Status: <strong>Pending</strong> approval.
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Leave Application Form</div>
                <div className="card-subtitle">Fill in the details to request time off</div>
              </div>
              {selectedEmp && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="avatar">{selectedEmp.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedEmp.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{selectedEmp.position}</div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Employee */}
              <div className="form-group">
                <label className="form-label">Employee *</label>
                <select className="form-control" value={empId} onChange={e => setEmpId(Number(e.target.value))}>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} — {emp.department}</option>)}
                </select>
              </div>

              {/* Leave type */}
              <div className="form-group">
                <label className="form-label">Leave Type *</label>
                <select className="form-control" value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                  {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* Dates */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date" className="form-control" required
                    min={today} value={startDate}
                    onChange={e => { setStartDate(e.target.value); if (!endDate) setEndDate(e.target.value); }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date" className="form-control" required
                    min={startDate || today} value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Duration badge */}
              {days > 0 && (
                <div className="alert info">
                  <Calendar size={16} />
                  <strong>{days} working day{days > 1 ? 's' : ''}</strong>&nbsp;requested
                  ({format(parseISO(startDate), 'MMM d')} – {format(parseISO(endDate), 'MMM d, yyyy')})
                </div>
              )}

              {/* Reason */}
              <div className="form-group">
                <label className="form-label">Reason for Leave *</label>
                <textarea
                  className="form-control" rows={4} required
                  value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="Please provide the reason for your leave request…"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Emergency contact */}
              <div className="form-group">
                <label className="form-label">Emergency Contact (optional)</label>
                <input
                  className="form-control"
                  placeholder="Phone or email during leave…"
                  value={contact} onChange={e => setContact(e.target.value)}
                />
              </div>

              {/* Policy note */}
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                Leave applications must be submitted at least <strong>2 working days</strong> in advance for annual/casual leave.
                Sick leave may be applied retrospectively with a medical certificate.
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setStartDate(''); setEndDate(''); setReason(''); setContact(''); setSubmitted(null); }}>
                  Clear
                </button>
                <button type="submit" className="btn btn-primary" disabled={!startDate || !endDate || !reason.trim()}>
                  <FileText size={16} />
                  Submit Application
                </button>
              </div>
            </form>
          </div>

          {/* Leave balance */}
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header"><div className="card-title">Leave Balance</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { type: 'Annual', total: 20, used: 8  },
                { type: 'Sick',   total: 12, used: 3  },
                { type: 'Casual', total: 6,  used: 2  },
              ].map(({ type, total, used }) => (
                <div key={type} style={{ padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{type} Leave</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{total - used}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>of {total} remaining</div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${(used/total)*100}%`, background: 'var(--primary)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
