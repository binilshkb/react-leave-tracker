import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import { useToast } from '../../components/Toast';
import {
  FileText, CheckCircle, Calendar, Info, Clock, XCircle,
  AlertCircle, TrendingUp, Shield,
} from 'lucide-react';
import { differenceInBusinessDays, parseISO, format } from 'date-fns';

const LEAVE_TYPES = [
  'Annual Leave', 'Sick Leave', 'Casual Leave',
  'Maternity Leave', 'Paternity Leave', 'Unpaid Leave',
];
const LEAVE_BALANCE = {
  Annual:   { total: 20, used: 8  },
  Sick:     { total: 12, used: 3  },
  Casual:   { total: 6,  used: 2  },
};

const POLICY = [
  { icon: <Calendar size={15} />, text: 'Apply annual/casual leave at least 2 working days in advance.' },
  { icon: <Shield   size={15} />, text: 'Sick leave can be applied retrospectively with a medical certificate.' },
  { icon: <Clock    size={15} />, text: 'Maternity/paternity leave requires HR approval and documentation.' },
  { icon: <TrendingUp size={15}/>, text: 'Unused annual leave carries over to the next calendar year (max 10 days).' },
];

export default function MyLeaves() {
  const { authUser, leaves, applyLeave } = useApp();
  const { toast } = useToast();
  const empId = authUser?.id;

  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [reason,    setReason]    = useState('');
  const [contact,   setContact]   = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [tab,       setTab]       = useState('apply');

  const myLeaves = leaves
    .filter(l => l.employeeId === empId)
    .sort((a, b) => b.appliedOn?.localeCompare(a.appliedOn));

  const today = format(new Date(), 'yyyy-MM-dd');
  const days  = startDate && endDate
    ? Math.max(1, differenceInBusinessDays(parseISO(endDate), parseISO(startDate)) + 1)
    : 0;

  const handleSubmit = e => {
    e.preventDefault();
    if (endDate < startDate) { toast?.('End date must be after start date', 'danger'); return; }
    const leave = { employeeId: empId, type: leaveType, startDate, endDate, days, reason, emergencyContact: contact };
    applyLeave(leave);
    setSubmitted({ ...leave });
    toast?.('Leave application submitted!', 'success');
    setStartDate(''); setEndDate(''); setReason(''); setContact('');
    setTimeout(() => { setSubmitted(null); setTab('history'); }, 2500);
  };

  const statusIcon = s => {
    if (s === 'Approved') return <CheckCircle size={14} color="var(--success)" />;
    if (s === 'Rejected') return <XCircle     size={14} color="var(--danger)"  />;
    return <Clock size={14} color="var(--warning)" />;
  };

  return (
    <>
      <Header title="My Leaves" subtitle="Apply for leave and track your applications" />
      <div className="page-body">

        {/* ── Leave balance strip ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
          {Object.entries(LEAVE_BALANCE).map(([type, { total, used }]) => {
            const remaining = total - used;
            const pct = (used / total) * 100;
            return (
              <div key={type} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{type} Leave</div>
                    <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, marginTop: 4 }}>{remaining}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>of {total} days remaining</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge-pill ${pct > 80 ? 'absent' : pct > 50 ? 'late' : 'present'}`}>
                      {used} used
                    </span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{
                    width: `${pct}%`,
                    background: pct > 80 ? 'var(--danger)' : pct > 50 ? 'var(--warning)' : 'var(--primary)',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: 4, width: 'fit-content', border: '1px solid var(--border)' }}>
          {[['apply', 'Apply Leave'], ['history', 'My Applications']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '7px 22px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 13, transition: 'var(--transition)',
              background: tab === key ? 'var(--primary)' : 'transparent',
              color: tab === key ? '#fff' : 'var(--text-secondary)',
            }}>{label}</button>
          ))}
        </div>

        {/* ── Apply tab — two column layout ── */}
        {tab === 'apply' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>

            {/* Left — form */}
            <div>
              {submitted && (
                <div className="alert success" style={{ marginBottom: 14 }}>
                  <CheckCircle size={16} />
                  Application submitted! Switching to history…
                </div>
              )}

              <div className="card">
                <div className="card-header">
                  <div className="card-title">New Leave Application</div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(), 'MMM d, yyyy')}</span>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div className="form-group">
                    <label className="form-label">Leave Type *</label>
                    <select className="form-control" value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                      {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Start Date *</label>
                      <input type="date" className="form-control" required min={today} value={startDate}
                        onChange={e => { setStartDate(e.target.value); if (!endDate) setEndDate(e.target.value); }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End Date *</label>
                      <input type="date" className="form-control" required min={startDate || today} value={endDate}
                        onChange={e => setEndDate(e.target.value)} />
                    </div>
                  </div>

                  {days > 0 && (
                    <div className="alert info">
                      <Calendar size={15} />
                      <strong>{days} working day{days > 1 ? 's' : ''}</strong>&nbsp;requested
                      &nbsp;({format(parseISO(startDate), 'MMM d')} – {format(parseISO(endDate), 'MMM d, yyyy')})
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Reason *</label>
                    <textarea className="form-control" rows={4} required value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder="Please describe your reason…" style={{ resize: 'vertical' }} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Emergency Contact (optional)</label>
                    <input className="form-control" placeholder="Phone or email during leave…"
                      value={contact} onChange={e => setContact(e.target.value)} />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-outline"
                      onClick={() => { setStartDate(''); setEndDate(''); setReason(''); setContact(''); }}>
                      Clear
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={!startDate || !endDate || !reason.trim()}>
                      <FileText size={15} />
                      Submit Application
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right — sidebar info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Policy */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: 14 }}>
                  <div className="card-title">Leave Policy</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {POLICY.map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 1 }}>{p.icon}</span>
                      {p.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent applications */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: 12 }}>
                  <div className="card-title">Recent Applications</div>
                </div>
                {myLeaves.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {myLeaves.slice(0, 4).map(l => (
                      <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{l.type}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {l.startDate} · {l.days}d
                          </div>
                        </div>
                        <span className={`badge-pill ${l.status.toLowerCase()}`}>{l.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No applications yet</p>
                )}
              </div>

              {/* Info note */}
              <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(99,102,241,.2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: 1, color: 'var(--primary)' }} />
                Your application goes directly to your HR manager for review. You'll get a status update in <em>My Applications</em>.
              </div>
            </div>
          </div>
        )}

        {/* ── History tab ── */}
        {tab === 'history' && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">My Leave Applications</div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{myLeaves.length} total</span>
            </div>

            {/* Status summary */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              {[
                { label: 'Pending',  cls: 'pending',  count: myLeaves.filter(l => l.status === 'Pending').length  },
                { label: 'Approved', cls: 'approved', count: myLeaves.filter(l => l.status === 'Approved').length },
                { label: 'Rejected', cls: 'rejected', count: myLeaves.filter(l => l.status === 'Rejected').length },
              ].map(({ label, cls, count }) => (
                <div key={label} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 20px', minWidth: 110 }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{count}</div>
                  <span className={`badge-pill ${cls}`} style={{ marginTop: 6, display: 'inline-flex' }}>{label}</span>
                </div>
              ))}
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Type</th><th>From</th><th>To</th><th>Days</th>
                    <th>Reason</th><th>Applied On</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.length > 0 ? myLeaves.map(l => (
                    <tr key={l.id}>
                      <td><span className={`badge-pill ${l.type.split(' ')[0].toLowerCase()}`}>{l.type}</span></td>
                      <td>{l.startDate}</td>
                      <td>{l.endDate}</td>
                      <td style={{ fontWeight: 600 }}>{l.days}</td>
                      <td style={{ maxWidth: 220, fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.reason}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{l.appliedOn}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          {statusIcon(l.status)}
                          <span className={`badge-pill ${l.status.toLowerCase()}`}>{l.status}</span>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7}>
                      <div className="empty-state">
                        <FileText size={40} />
                        <p>No leave applications yet. Use <strong>Apply Leave</strong> tab to submit one.</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
