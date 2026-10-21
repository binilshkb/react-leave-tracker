import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { Search, Filter, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_FILTER = ['All', 'Present', 'Absent', 'Late', 'Half Day'];

export default function AttendanceList() {
  const { employees, attendance } = useApp();
  const [search, setSearch]     = useState('');
  const [statusF, setStatusF]   = useState('All');
  const [dateF, setDateF]       = useState('');
  const [empF, setEmpF]         = useState('All');

  const getEmp = id => employees.find(e => e.id === id);

  const filtered = useMemo(() => {
    return attendance
      .filter(rec => {
        const emp = getEmp(rec.employeeId);
        const matchSearch = !search || emp?.name.toLowerCase().includes(search.toLowerCase()) || emp?.department.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusF === 'All' || rec.status === statusF;
        const matchDate   = !dateF  || rec.date === dateF;
        const matchEmp    = empF === 'All' || rec.employeeId === Number(empF);
        return matchSearch && matchStatus && matchDate && matchEmp;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || a.employeeId - b.employeeId);
  }, [attendance, search, statusF, dateF, empF, employees]);

  const summary = useMemo(() => {
    const base = dateF ? attendance.filter(a => a.date === dateF) : attendance;
    return {
      present: base.filter(a => a.status === 'Present').length,
      absent:  base.filter(a => a.status === 'Absent').length,
      late:    base.filter(a => a.status === 'Late').length,
    };
  }, [attendance, dateF]);

  return (
    <>
      <Header title="Attendance List" subtitle="View and manage all attendance records" />
      <div className="page-body">

        {/* Summary mini cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Present', value: summary.present, cls: 'present' },
            { label: 'Absent',  value: summary.absent,  cls: 'absent'  },
            { label: 'Late',    value: summary.late,    cls: 'late'    },
            { label: 'Total',   value: attendance.length, cls: 'annual' },
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
                className="form-control"
                style={{ paddingLeft: 32 }}
                placeholder="Search employee or department…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="form-control" style={{ maxWidth: 160 }} value={statusF} onChange={e => setStatusF(e.target.value)}>
              {STATUS_FILTER.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="form-control" style={{ maxWidth: 180 }} value={empF} onChange={e => setEmpF(e.target.value)}>
              <option value="All">All Employees</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
            <input
              type="date" className="form-control" style={{ maxWidth: 160 }}
              value={dateF} onChange={e => setDateF(e.target.value)}
            />
            {dateF && (
              <button className="btn btn-outline btn-sm" onClick={() => setDateF('')}>Clear Date</button>
            )}
          </div>

          {/* Table */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((rec, i) => {
                  const emp = getEmp(rec.employeeId);
                  let duration = '—';
                  if (rec.checkIn && rec.checkOut) {
                    const [h1, m1] = rec.checkIn.split(':').map(Number);
                    const [h2, m2] = rec.checkOut.split(':').map(Number);
                    const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
                    if (mins > 0) duration = `${Math.floor(mins / 60)}h ${mins % 60}m`;
                  }
                  return (
                    <tr key={rec.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{i + 1}</td>
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
                      <td>{rec.date}</td>
                      <td><span className={`badge-pill ${rec.status.toLowerCase().replace(' ', '-')}`}>{rec.status}</span></td>
                      <td>{rec.checkIn ?? '—'}</td>
                      <td>{rec.checkOut ?? '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{duration}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state">
                        <Calendar size={40} />
                        <p>No attendance records found for the selected filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div style={{ padding: '12px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              Showing {filtered.length} of {attendance.length} records
            </div>
          )}
        </div>
      </div>
    </>
  );
}
