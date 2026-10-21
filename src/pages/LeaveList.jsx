import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { useToast } from '../components/Toast';
import { Search, Check, X, ClipboardList, Eye } from 'lucide-react';

const STATUS_F = ['All', 'Pending', 'Approved', 'Rejected'];
const TYPE_F   = ['All', 'Annual Leave', 'Sick Leave', 'Casual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'];

function DetailModal({ leave, emp, onClose, onApprove, onReject }) {
  if (!leave) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="card-title">Leave Application Details</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div className="avatar lg">{emp?.avatar}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{emp?.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{emp?.position} &bull; {emp?.department}</div>
            </div>
            <span className={`badge-pill ${leave.status.toLowerCase()}`} style={{ marginLeft: 'auto' }}>{leave.status}</span>
          </div>
          {[
            ['Leave Type',   leave.type],
            ['Start Date',   leave.startDate],
            ['End Date',     leave.endDate],
            ['Duration',     `${leave.days} day${leave.days > 1 ? 's' : ''}`],
            ['Applied On',   leave.appliedOn],
            ['Reason',       leave.reason],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 12, fontSize: 14 }}>
              <span style={{ minWidth: 110, color: 'var(--text-secondary)', fontWeight: 500 }}>{k}</span>
              <span style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
        {leave.status === 'Pending' && (
          <div className="modal-footer">
            <button className="btn btn-danger btn-sm"  onClick={() => { onReject(leave.id);  onClose(); }}><X size={14} /> Reject</button>
            <button className="btn btn-success btn-sm" onClick={() => { onApprove(leave.id); onClose(); }}><Check size={14} /> Approve</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeaveList() {
  const { leaves, employees, updateLeaveStatus } = useApp();
  const { toast } = useToast();

  const [search,  setSearch]  = useState('');
  const [statusF, setStatusF] = useState('All');
  const [typeF,   setTypeF]   = useState('All');
  const [empF,    setEmpF]    = useState('All');
  const [detail,  setDetail]  = useState(null);

  const getEmp = id => employees.find(e => e.id === id);

  const filtered = useMemo(() => {
    return leaves
      .filter(l => {
        const emp = getEmp(l.employeeId);
        const matchSearch = !search || emp?.name.toLowerCase().includes(search.toLowerCase()) || l.type.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusF === 'All' || l.status === statusF;
        const matchType   = typeF   === 'All' || l.type === typeF;
        const matchEmp    = empF    === 'All' || l.employeeId === Number(empF);
        return matchSearch && matchStatus && matchType && matchEmp;
      })
      .sort((a, b) => b.appliedOn?.localeCompare(a.appliedOn));
  }, [leaves, search, statusF, typeF, empF, employees]);

  const handleApprove = (id) => {
    updateLeaveStatus(id, 'Approved');
    toast?.('Leave application approved', 'success');
  };
  const handleReject = (id) => {
    updateLeaveStatus(id, 'Rejected');
    toast?.('Leave application rejected', 'danger');
  };

  const counts = useMemo(() => ({
    pending:  leaves.filter(l => l.status === 'Pending').length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length,
  }), [leaves]);

  return (
    <>
      <Header title="Leave List" subtitle="Manage and review all leave applications" />
      <div className="page-body">

        {/* Summary */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total',    value: leaves.length,    cls: 'annual'   },
            { label: 'Pending',  value: counts.pending,   cls: 'pending'  },
            { label: 'Approved', value: counts.approved,  cls: 'approved' },
            { label: 'Rejected', value: counts.rejected,  cls: 'rejected' },
          ].map(({ label, value, cls }) => (
            <div key={label} style={{ flex: '1 1 120px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 18px', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
              <span className={`badge-pill ${cls}`} style={{ marginTop: 4 }}>{label}</span>
            </div>
          ))}
        </div>

        <div className="card">
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-control" style={{ paddingLeft: 32 }}
                placeholder="Search employee or leave type…"
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="form-control" style={{ maxWidth: 140 }} value={statusF} onChange={e => setStatusF(e.target.value)}>
              {STATUS_F.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="form-control" style={{ maxWidth: 180 }} value={typeF} onChange={e => setTypeF(e.target.value)}>
              {TYPE_F.map(t => <option key={t}>{t}</option>)}
            </select>
            <select className="form-control" style={{ maxWidth: 180 }} value={empF} onChange={e => setEmpF(e.target.value)}>
              <option value="All">All Employees</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((l, i) => {
                  const emp = getEmp(l.employeeId);
                  const typeKey = l.type.split(' ')[0].toLowerCase();
                  return (
                    <tr key={l.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{i + 1}</td>
                      <td>
                        <div className="td-name">
                          <div className="avatar sm">{emp?.avatar}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{emp?.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp?.department}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge-pill ${typeKey}`}>{l.type}</span></td>
                      <td>{l.startDate}</td>
                      <td>{l.endDate}</td>
                      <td style={{ fontWeight: 600 }}>{l.days}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{l.appliedOn}</td>
                      <td><span className={`badge-pill ${l.status.toLowerCase()}`}>{l.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm btn-icon" title="View details" onClick={() => setDetail(l)}>
                            <Eye size={14} />
                          </button>
                          {l.status === 'Pending' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handleApprove(l.id)} title="Approve">
                                <Check size={13} /> Approve
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleReject(l.id)} title="Reject">
                                <X size={13} /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">
                        <ClipboardList size={40} />
                        <p>No leave applications found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div style={{ padding: '12px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              Showing {filtered.length} of {leaves.length} applications
            </div>
          )}
        </div>

        {/* Detail modal */}
        <DetailModal
          leave={detail}
          emp={detail ? getEmp(detail.employeeId) : null}
          onClose={() => setDetail(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </>
  );
}
