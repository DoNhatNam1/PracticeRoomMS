import { ReactNode, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const params = useParams();

  // Lưu thông tin về phòng và máy tính để dùng cho chuyển hướng sau này
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'TEACHER' && params.roomId) {
        localStorage.setItem('lastTeacherRoomId', params.roomId.toString());
      } else if (user.role === 'STUDENT') {
        if (params.roomId) localStorage.setItem('lastStudentRoomId', params.roomId.toString());
        if (params.computerId) localStorage.setItem('lastStudentComputerId', params.computerId.toString());
      }
    }
  }, [isAuthenticated, user, params]);

  if (!isAuthenticated) {
    // Chuyển hướng đến trang đăng nhập tương ứng
    switch(requiredRole) {
      case 'ADMIN':
        return <Navigate to="/admin/login" replace />;
      case 'TEACHER':
        return <Navigate to="/teacher/room-selection" replace />;
      case 'STUDENT':
        return <Navigate to="/student/room-selection" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Kiểm tra vai trò
  if (user?.role !== requiredRole) {
    return <Navigate to="/error" replace />;
  }

  return <>{children}</>;
}