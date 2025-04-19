import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Welcome & Role Selection
import WelcomePage from './pages/WelcomePage';
import RoleSelectionPage from './pages/RoleSelectionPage';

// Auth Pages
import AdminLoginPage from './pages/auth/AdminLoginPage';
import TeacherLoginPage from './pages/auth/TeacherLoginPage';
import StudentLoginPage from './pages/auth/StudentLoginPage';

// Room/Computer Selection
import TeacherRoomSelectionPage from './pages/teacher/RoomSelectionPage';
import StudentRoomSelectionPage from './pages/student/RoomSelectionPage';
import ComputerSelectionPage from './pages/student/ComputerSelectionPage';

// Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';

// Admin Pages
import UsersManagementPage from './pages/admin/UsersManagementPage';
import UserFormPage from './pages/admin/UserFormPage';
import RoomsManagementPage from './pages/admin/RoomsManagementPage';
import RoomFormPage from './pages/admin/RoomFormPage';
import ComputersManagementPage from './pages/admin/ComputersManagementPage';
import ComputerFormPage from './pages/admin/ComputerFormPage';
import SchedulesManagementPage from './pages/admin/SchedulesManagementPage';
import ScheduleFormPage from './pages/admin/ScheduleFormPage';
import SystemLogsPage from './pages/admin/SystemLogsPage';

// Teacher Pages
// import MyStudentsPage from './pages/teacher/MyStudentsPage';
// import RoomSchedulesPage from './pages/teacher/RoomSchedulesPage';
// import CreateSchedulePage from './pages/teacher/CreateSchedulePage';
// import RoomStatusPage from './pages/teacher/RoomStatusPage';
// import ComputerMonitoringPage from './pages/teacher/ComputerMonitoringPage';

// Student Pages
// import MySchedulesPage from './pages/student/MySchedulesPage';
// import ComputerUsagePage from './pages/student/ComputerUsagePage';
// import ResourcesPage from './pages/student/ResourcesPage';

// Layout & Protection
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import TeacherLayout from './components/layout/TeacherLayout';
import StudentLayout from './components/layout/StudentLayout';

// Common Pages
// import ProfilePage from './pages/common/ProfilePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ErrorPage from './pages/ErrorPage';

// Other components, types, stores
import { Role } from './types';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Cập nhật MantineProvider cho phiên bản mới */}
      <MantineProvider>
        {/* Thay NotificationsProvider bằng Notifications */}
        <Notifications position="top-right" />
        <BrowserRouter>
          <Routes>
            {/* Public Routes - Workflow Entry Points */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/role-selection" element={<RoleSelectionPage />} />
            
            {/* Admin Authentication Flow */}
            <Route path="/admin-login" element={<AdminLoginPage />} />
            
            {/* Teacher Flow */}
            <Route path="/teacher/select-room" element={<TeacherRoomSelectionPage />} />
            <Route path="/teacher/login/:roomId" element={<TeacherLoginPage />} />
            
            {/* Student Flow */}
            <Route path="/student/select-room" element={<StudentRoomSelectionPage />} />
            <Route path="/student/select-computer/:roomId" element={<ComputerSelectionPage />} />
            <Route path="/student/login" element={<StudentLoginPage />} />
            
            {/* Error Pages */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Admin Protected Routes */}
            <Route path="/admin" element={
              <ProtectedRoute role={Role.ADMIN}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              {/* <Route path="profile" element={<ProfilePage />} /> */}
              
              {/* Users Management */}
              <Route path="users" element={<UsersManagementPage />} />
              <Route path="users/new" element={<UserFormPage />} />
              <Route path="users/edit/:id" element={<UserFormPage />} />
              
              {/* Rooms Management */}
              <Route path="rooms" element={<RoomsManagementPage />} />
              <Route path="rooms/new" element={<RoomFormPage />} />
              <Route path="rooms/edit/:id" element={<RoomFormPage />} />
              
              {/* Computers Management */}
              <Route path="computers" element={<ComputersManagementPage />} />
              <Route path="computers/new" element={<ComputerFormPage />} />
              <Route path="computers/edit/:id" element={<ComputerFormPage />} />
              
              {/* Schedules Management */}
              <Route path="schedules" element={<SchedulesManagementPage />} />
              <Route path="schedules/new" element={<ScheduleFormPage />} />
              <Route path="schedules/edit/:id" element={<ScheduleFormPage />} />
              
              {/* System Logs */}
              <Route path="logs" element={<SystemLogsPage />} />
            </Route>
            
            {/* Teacher Protected Routes */}
            <Route path="/teacher/:roomId" element={
              <ProtectedRoute role={Role.TEACHER}>
                <TeacherLayout />
              </ProtectedRoute>
            }>
              <Route index element={<TeacherDashboard />} />
              {/* <Route path="profile" element={<ProfilePage />} />
              <Route path="students" element={<MyStudentsPage />} />
              <Route path="schedules" element={<RoomSchedulesPage />} />
              <Route path="schedules/new" element={<CreateSchedulePage />} />
              <Route path="room-status" element={<RoomStatusPage />} />
              <Route path="computers" element={<ComputerMonitoringPage />} /> */}
            </Route>
            
            {/* Student Protected Routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute role={Role.STUDENT}>
                <StudentLayout />
              </ProtectedRoute>
            }>
              <Route index element={<StudentDashboard />} />
              {/* <Route path="profile" element={<ProfilePage />} />
              <Route path="schedules" element={<MySchedulesPage />} />
              <Route path="usage" element={<ComputerUsagePage />} />
              <Route path="resources" element={<ResourcesPage />} /> */}
            </Route>
            
            {/* Catch-all Error Route */}
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;