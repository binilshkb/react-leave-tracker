import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, User, ChevronRight, Building2, Lock } from 'lucide-react';

export default function Login() {
  const { employees, login } = useApp();
  const [step,       setStep]       = useState('pick-role');   // 'pick-role' | 'employee-select'
  const [selectedEmp, setSelectedEmp] = useState(employees[0].id);

  const handleHR = () => login('hr');
  const handleEmployee = () => {
    const emp = employees.find(e => e.id === Number(selectedEmp));
    login('employee', emp);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, boxShadow: '0 8px 24px rgba(99,102,241,.4)',
          }}>📋</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>LeaveTracker</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
            HR &amp; Attendance Management System
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px 36px' }}>

          {/* Step 1 – Role selector */}
          {step === 'pick-role' && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Welcome back 👋</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
                Select your role to continue
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* HR card */}
                <button
                  onClick={handleHR}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '18px 20px',
                    cursor: 'pointer', transition: 'var(--transition)', textAlign: 'left',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: 'var(--primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ShieldCheck size={22} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>HR Manager</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
                      Full access · manage all employees, attendance &amp; leaves
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </button>

                {/* Employee card */}
                <button
                  onClick={() => setStep('employee-select')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '18px 20px',
                    cursor: 'pointer', transition: 'var(--transition)', textAlign: 'left',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--success)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(52,211,153,.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: 'var(--success-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <User size={22} color="var(--success)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Employee</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
                      Personal view · your attendance, leaves &amp; profile
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </button>
              </div>
            </>
          )}

          {/* Step 2 – Pick employee */}
          {step === 'employee-select' && (
            <>
              <button
                onClick={() => setStep('pick-role')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                ← Back
              </button>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Select your profile</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Choose your employee account to continue
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {employees.map(emp => (
                  <label
                    key={emp.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: selectedEmp === emp.id ? 'var(--primary-light)' : 'var(--surface-2)',
                      border: `2px solid ${selectedEmp === emp.id ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)', padding: '14px 16px',
                      cursor: 'pointer', transition: 'var(--transition)',
                    }}
                  >
                    <input
                      type="radio" name="emp" value={emp.id}
                      checked={selectedEmp === emp.id}
                      onChange={() => setSelectedEmp(emp.id)}
                      style={{ display: 'none' }}
                    />
                    <div className="avatar" style={{ flexShrink: 0 }}>{emp.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {emp.position} · {emp.department}
                      </div>
                    </div>
                    {selectedEmp === emp.id && (
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>

              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleEmployee}>
                <Lock size={15} />
                Sign in as {employees.find(e => e.id === selectedEmp)?.name.split(' ')[0]}
              </button>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
          LeaveTracker v1.0 · Demo environment
        </p>
      </div>
    </div>
  );
}
