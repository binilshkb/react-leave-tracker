import { createContext, useContext, useState, useCallback } from 'react';
import { format } from 'date-fns';

const AppContext = createContext(null);

const EMPLOYEES = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering', position: 'Senior Dev', avatar: 'AJ' },
  { id: 2, name: 'Bob Smith',    department: 'Design',       position: 'UI Designer', avatar: 'BS' },
  { id: 3, name: 'Carol White',  department: 'HR',           position: 'HR Manager',  avatar: 'CW' },
  { id: 4, name: 'David Brown',  department: 'Marketing',    position: 'Marketing Lead', avatar: 'DB' },
  { id: 5, name: 'Eva Green',    department: 'Engineering',  position: 'Backend Dev', avatar: 'EG' },
];

const today = format(new Date(), 'yyyy-MM-dd');

const INITIAL_ATTENDANCE = [
  { id: 1, employeeId: 1, date: today, status: 'Present', checkIn: '09:00', checkOut: '18:00' },
  { id: 2, employeeId: 2, date: today, status: 'Present', checkIn: '09:15', checkOut: '18:10' },
  { id: 3, employeeId: 3, date: today, status: 'Absent',  checkIn: null,    checkOut: null    },
  { id: 4, employeeId: 4, date: today, status: 'Late',    checkIn: '10:30', checkOut: '19:00' },
  { id: 5, employeeId: 5, date: today, status: 'Present', checkIn: '08:55', checkOut: '17:55' },
];

const INITIAL_LEAVES = [
  {
    id: 1, employeeId: 1,
    type: 'Annual Leave', startDate: '2026-10-25', endDate: '2026-10-27',
    days: 3, reason: 'Family vacation', status: 'Approved',
    appliedOn: '2026-10-10',
  },
  {
    id: 2, employeeId: 2,
    type: 'Sick Leave', startDate: '2026-10-20', endDate: '2026-10-20',
    days: 1, reason: 'Not feeling well', status: 'Pending',
    appliedOn: '2026-10-19',
  },
  {
    id: 3, employeeId: 4,
    type: 'Casual Leave', startDate: '2026-10-22', endDate: '2026-10-23',
    days: 2, reason: 'Personal work', status: 'Rejected',
    appliedOn: '2026-10-15',
  },
  {
    id: 4, employeeId: 5,
    type: 'Annual Leave', startDate: '2026-11-01', endDate: '2026-11-05',
    days: 5, reason: 'Planned trip', status: 'Pending',
    appliedOn: '2026-10-18',
  },
  {
    id: 5, employeeId: 3,
    type: 'Maternity Leave', startDate: '2026-11-10', endDate: '2026-12-10',
    days: 30, reason: 'Maternity leave', status: 'Approved',
    appliedOn: '2026-10-05',
  },
];

export function AppProvider({ children }) {
  const [employees]   = useState(EMPLOYEES);
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [leaves,     setLeaves]     = useState(INITIAL_LEAVES);
  const [currentEmployee, setCurrentEmployee] = useState(EMPLOYEES[0]);

  // ── Attendance helpers ────────────────────────────────────────────────────
  const markAttendance = useCallback((record) => {
    setAttendance(prev => {
      const exists = prev.findIndex(
        a => a.employeeId === record.employeeId && a.date === record.date,
      );
      if (exists !== -1) {
        const updated = [...prev];
        updated[exists] = { ...updated[exists], ...record };
        return updated;
      }
      return [...prev, { id: Date.now(), ...record }];
    });
  }, []);

  // ── Leave helpers ─────────────────────────────────────────────────────────
  const applyLeave = useCallback((leaveData) => {
    setLeaves(prev => [
      ...prev,
      {
        id: Date.now(),
        status: 'Pending',
        appliedOn: format(new Date(), 'yyyy-MM-dd'),
        ...leaveData,
      },
    ]);
  }, []);

  const updateLeaveStatus = useCallback((id, status) => {
    setLeaves(prev =>
      prev.map(l => (l.id === id ? { ...l, status } : l)),
    );
  }, []);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const todayAttendance = attendance.filter(a => a.date === today);
  const presentToday    = todayAttendance.filter(a => a.status === 'Present').length;
  const absentToday     = todayAttendance.filter(a => a.status === 'Absent').length;
  const lateToday       = todayAttendance.filter(a => a.status === 'Late').length;
  const pendingLeaves   = leaves.filter(l => l.status === 'Pending').length;
  const approvedLeaves  = leaves.filter(l => l.status === 'Approved').length;

  return (
    <AppContext.Provider value={{
      employees, attendance, leaves,
      currentEmployee, setCurrentEmployee,
      markAttendance, applyLeave, updateLeaveStatus,
      stats: { presentToday, absentToday, lateToday, pendingLeaves, approvedLeaves, total: employees.length },
      today,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
