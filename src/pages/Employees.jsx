import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { Mail, Briefcase, MapPin, Phone, Users } from 'lucide-react';

const DEPT_COLORS = {
  Engineering: 'primary',
  Design:      'info',
  HR:          'success',
  Marketing:   'warning',
};

export default function Employees() {
  const { employees, attendance, leaves, today } = useApp();

  const getStats = (empId) => {
    const empLeaves     = leaves.filter(l => l.employeeId === empId);
    const todayRecord   = attendance.find(a => a.employeeId === empId && a.date === today);
    const totalPresent  = attendance.filter(a => a.employeeId === empId && a.status === 'Present').length;
    return {
      todayStatus: todayRecord?.status ?? 'Not Marked',
      pendingLeaves: empLeaves.filter(l => l.status === 'Pending').length,
      approvedLeaves: empLeaves.filter(l => l.status === 'Approved').length,
      totalPresent,
    };
  };

  return (
    <>
      <Header title="Employees" subtitle="All registered employees and their overview" />
      <div className="page-body">
        <div className="page-header">
          <div>
            <h2>Team Directory</h2>
            <p>{employees.length} employees registered</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {employees.map(emp => {
            const stats   = getStats(emp.id);
            const deptCls = DEPT_COLORS[emp.department] ?? 'info';
            const statusCls = stats.todayStatus === 'Present' ? 'present' : stats.todayStatus === 'Absent' ? 'absent' : stats.todayStatus === 'Late' ? 'late' : 'pending';
            return (
              <div key={emp.id} className="card" style={{ transition: 'var(--transition)' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  <div className={`avatar lg ${deptCls}`}>{emp.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{emp.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{emp.position}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      <span className={`badge-pill ${deptCls === 'primary' ? 'annual' : deptCls}`}>{emp.department}</span>
                      <span className={`badge-pill ${statusCls}`}>Today: {stats.todayStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Mini stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {[
                    { label: 'Present',  value: stats.totalPresent   },
                    { label: 'Pending',  value: stats.pendingLeaves  },
                    { label: 'Approved', value: stats.approvedLeaves },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ textAlign: 'center', background: 'var(--bg)', borderRadius: 8, padding: '10px 4px' }}>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>{value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Mail size={13} />
                    {emp.name.toLowerCase().replace(' ', '.').replace(' ', '')}@company.com
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Briefcase size={13} />
                    {emp.department} Department
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <MapPin size={13} />
                    Remote / On-site
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
