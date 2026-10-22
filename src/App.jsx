import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import Sidebar         from './components/Sidebar';
import EmployeeSidebar from './components/EmployeeSidebar';
import ToastContainer  from './components/Toast';

// HR pages
import Dashboard      from './pages/Dashboard';
import MarkAttendance from './pages/MarkAttendance';
import AttendanceList from './pages/AttendanceList';
import ApplyLeave     from './pages/ApplyLeave';
import LeaveList      from './pages/LeaveList';
import Employees      from './pages/Employees';

// Employee pages
import MyDashboard  from './pages/employee/MyDashboard';
import MyAttendance from './pages/employee/MyAttendance';
import MyLeaves     from './pages/employee/MyLeaves';

// Login
import Login from './pages/Login';

function AppShell() {
  const { role } = useApp();

  if (role === 'guest') {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  if (role === 'hr') {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/"                element={<Dashboard />}      />
            <Route path="/attendance"      element={<MarkAttendance />} />
            <Route path="/attendance-list" element={<AttendanceList />} />
            <Route path="/apply-leave"     element={<ApplyLeave />}     />
            <Route path="/leave-list"      element={<LeaveList />}      />
            <Route path="/employees"       element={<Employees />}      />
            {/* Redirect any unknown path to dashboard */}
            <Route path="*"                element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  if (role === 'employee') {
    return (
      <div className="app-shell">
        <EmployeeSidebar />
        <main className="main-content">
          <Routes>
            <Route path="/my-dashboard"  element={<MyDashboard />}  />
            <Route path="/my-attendance" element={<MyAttendance />} />
            <Route path="/my-leaves"     element={<MyLeaves />}     />
            {/* Redirect any unknown path to personal dashboard */}
            <Route path="*"              element={<Navigate to="/my-dashboard" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  return null;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  );
}
