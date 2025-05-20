import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import TeacherLayout from './components/layout/TeacherLayout';
import StudentLayout from './components/layout/StudentLayout';

// Pages
import Welcome from './pages/Welcome';
import RoleSelection from './pages/RoleSelection';
import ErrorPage from './pages/ErrorPage';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRooms from './pages/admin/AdminRooms';
import AdminComputers from './pages/admin/AdminComputers';
import AdminUsers from './pages/admin/AdminUsers';
import ComputerDetail from './components/computers/ComputerDetail';
import AdminSchedules from './pages/admin/AdminSchedules';

// Teacher pages
import TeacherRoomSelection from './pages/teacher/RoomSelection';
import TeacherLogin from './pages/teacher/TeacherLogin';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherComputers from './pages/teacher/TeacherComputers';

// Student pages
import StudentRoomSelection from './pages/student/RoomSelection';
import ComputerSelection from './pages/student/ComputerSelection';
import StudentLogin from './pages/student/StudentLogin';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAssignments from './pages/student/StudentAssignments';

// Route definitions
const publicRoutes = [
  { path: "/", element: <Welcome /> },
  { path: "/role-selection", element: <RoleSelection /> },
  { path: "/error", element: <ErrorPage /> },
];

const adminPublicRoutes = [
  { path: "/admin/login", element: <AdminLogin /> }
];

const adminProtectedRoutes = [
  { path: "dashboard", element: <AdminDashboard /> },
  { path: "rooms", element: <AdminRooms /> },
  { path: "computers", element: <AdminComputers /> },
  { path: "computers/:computerId", element: <ComputerDetail /> },
  { path: "users", element: <AdminUsers /> },
  { path: "schedules", element: <AdminSchedules /> }
];

const teacherPublicRoutes = [
  { path: "/teacher/room-selection", element: <TeacherRoomSelection /> },
  { path: "/teacher/login/:roomId", element: <TeacherLogin /> }
];

const teacherProtectedRoutes = [
  { path: "dashboard/:roomId", element: <TeacherDashboard /> },
  { path: "students/:roomId", element: <TeacherStudents /> },
  { path: "computers/:roomId", element: <TeacherComputers /> }
];

const studentPublicRoutes = [
  { path: "/student/room-selection", element: <StudentRoomSelection /> },
  { path: "/student/computer-selection/:roomId", element: <ComputerSelection /> },
  { path: "/student/login/:roomId/:computerId", element: <StudentLogin /> }
];

const studentProtectedRoutes = [
  { path: "dashboard/:roomId/:computerId", element: <StudentDashboard /> },
  { path: "assignments/:roomId/:computerId", element: <StudentAssignments /> },
];

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Admin public routes */}
        {adminPublicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Nested admin routes using AdminLayout */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {adminProtectedRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
        
        {/* Teacher public routes */}
        {teacherPublicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Nested teacher routes using TeacherLayout */}
        <Route 
          path="/teacher" 
          element={
            <ProtectedRoute requiredRole="TEACHER">
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          {teacherProtectedRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
        
        {/* Student public routes */}
        {studentPublicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Nested student routes using StudentLayout */}
        <Route 
          path="/student" 
          element={
              <StudentLayout />
          }
        >
          {studentProtectedRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/error" replace />} />
      </Routes>
    </Router>
  );
}