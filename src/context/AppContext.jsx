import { createContext, useContext, useState, useCallback } from 'react';
import { format, subDays } from 'date-fns';

const AppContext = createContext(null);

// ── Static HR admin account ────────────────────────────────────────────────
export const HR_ADMIN = { id: 0, name: 'HR Admin', position: 'HR Manager', department: 'HR', avatar: 'HR' };

const EMPLOYEES = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering', position: 'Senior Dev',     avatar: 'AJ' },
  { id: 2, name: 'Bob Smith',     department: 'Design',      position: 'UI Designer',    avatar: 'BS' },
  { id: 3, name: 'Carol White',   department: 'HR',          position: 'HR Manager',     avatar: 'CW' },
  { id: 4, name: 'David Brown',   department: 'Marketing',   position: 'Marketing Lead', avatar: 'DB' },
  { id: 5, name: 'Eva Green',     department: 'Engineering', position: 'Backend Dev',    avatar: 'EG' },
];

const today = format(new Date(), 'yyyy-MM-dd');

// ── Helper: generate realistic attendance for the past N weekdays ──────────
function buildHistory() {
  const records = [];
  let id = 1;

  // Per-employee patterns  [status, checkIn, checkOut]
  const patterns = {
    1: [ // Alice – mostly present, one absent
      ['Present','09:00','18:00'], ['Present','08:55','18:05'], ['Late','10:15','19:00'],
      ['Present','09:02','18:00'], ['Present','09:00','17:55'], ['Absent', null, null],
      ['Present','08:50','18:00'], ['Present','09:05','18:10'], ['Present','09:00','18:00'],
      ['Late','10:30','19:10'], ['Present','09:00','18:00'], ['Present','08:58','17:58'],
      ['Present','09:00','18:00'], ['Half Day','09:00','13:00'], ['Present','09:00','18:00'],
    ],
    2: [ // Bob – punctual, one late
      ['Present','09:10','18:10'], ['Present','09:20','18:20'], ['Present','09:05','18:00'],
      ['Late','10:00','19:00'], ['Present','09:15','18:15'], ['Present','09:10','18:05'],
      ['Absent', null, null], ['Present','09:10','18:10'], ['Present','09:00','18:00'],
      ['Present','09:12','18:08'], ['Present','09:05','18:00'], ['Late','10:20','19:10'],
      ['Present','09:10','18:00'], ['Present','09:00','17:55'], ['Present','09:08','18:08'],
    ],
    3: [ // Carol – very regular
      ['Present','08:45','17:45'], ['Present','08:50','17:50'], ['Present','08:48','17:48'],
      ['Present','08:45','17:45'], ['Present','08:50','18:00'], ['Absent', null, null],
      ['Present','08:45','17:45'], ['Present','08:50','17:55'], ['Present','08:48','17:50'],
      ['Late','10:00','18:30'], ['Present','08:45','17:45'], ['Present','08:50','17:50'],
      ['Present','08:48','17:48'], ['Present','08:45','17:45'], ['Half Day','08:45','13:00'],
    ],
    4: [ // David – often late
      ['Late','10:30','19:30'], ['Present','09:30','18:30'], ['Late','10:45','19:45'],
      ['Present','09:20','18:20'], ['Absent', null, null], ['Late','10:15','19:15'],
      ['Present','09:30','18:30'], ['Late','10:30','19:30'], ['Present','09:25','18:25'],
      ['Late','10:00','19:00'], ['Present','09:30','18:30'], ['Absent', null, null],
      ['Late','10:20','19:20'], ['Present','09:30','18:30'], ['Late','10:30','19:30'],
    ],
    5: [ // Eva – early bird, very present
      ['Present','08:30','17:30'], ['Present','08:35','17:35'], ['Present','08:30','17:30'],
      ['Present','08:40','17:40'], ['Present','08:30','17:30'], ['Present','08:35','17:35'],
      ['Absent', null, null], ['Present','08:30','17:30'], ['Present','08:32','17:32'],
      ['Present','08:30','17:30'], ['Late','09:45','18:45'], ['Present','08:30','17:30'],
      ['Present','08:35','17:35'], ['Present','08:30','17:30'], ['Present','08:30','17:30'],
    ],
  };

  // Skip weekends when assigning pattern entries
  EMPLOYEES.forEach(emp => {
    const pat = patterns[emp.id];
    let patIdx = 0;
    // Go back up to 30 calendar days, collect up to 15 weekday records (excluding today)
    for (let daysBack = 30; daysBack >= 1 && patIdx < pat.length; daysBack--) {
      const d = subDays(new Date(), daysBack);
      const dow = d.getDay(); // 0=Sun 6=Sat
      if (dow === 0 || dow === 6) continue; // skip weekends
      const [status, checkIn, checkOut] = pat[patIdx++];
      records.push({
        id: id++,
        employeeId: emp.id,
        date: format(d, 'yyyy-MM-dd'),
        status,
        checkIn,
        checkOut,
      });
    }
  });

  // Today's records
  const todayRows = [
    { employeeId: 1, status: 'Present', checkIn: '09:00', checkOut: '18:00' },
    { employeeId: 2, status: 'Present', checkIn: '09:15', checkOut: '18:10' },
    { employeeId: 3, status: 'Absent',  checkIn: null,    checkOut: null    },
    { employeeId: 4, status: 'Late',    checkIn: '10:30', checkOut: '19:00' },
    { employeeId: 5, status: 'Present', checkIn: '08:55', checkOut: '17:55' },
  ];
  todayRows.forEach(r => records.push({ id: id++, date: today, ...r }));

  return records;
}

const INITIAL_ATTENDANCE = buildHistory();

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

  // ── Auth / role state ──────────────────────────────────────────────────────
  // role: 'guest' | 'hr' | 'employee'
  const [role,      setRole]      = useState('guest');
  const [authUser,  setAuthUser]  = useState(null);   // logged-in employee object

  const login = useCallback((selectedRole, employee = null) => {
    setRole(selectedRole);
    if (selectedRole === 'hr') {
      setAuthUser(HR_ADMIN);
      setCurrentEmployee(HR_ADMIN);
    } else {
      setAuthUser(employee);
      setCurrentEmployee(employee);
    }
  }, []);

  const logout = useCallback(() => {
    setRole('guest');
    setAuthUser(null);
  }, []);

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
      // auth
      role, authUser, login, logout,
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
