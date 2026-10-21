import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/Toast';
import Dashboard      from './pages/Dashboard';
import MarkAttendance from './pages/MarkAttendance';
import AttendanceList from './pages/AttendanceList';
import ApplyLeave     from './pages/ApplyLeave';
import LeaveList      from './pages/LeaveList';
import Employees      from './pages/Employees';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
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
            </Routes>
          </main>
        </div>
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  );
}
