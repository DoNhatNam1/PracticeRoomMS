import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Role } from '../../types';

// Định nghĩa props interface bên trong file để tránh phụ thuộc vào types.ts
interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: Role | Role[];
  redirectPath?: string;
}

export const ProtectedRoute = ({ 
  children, 
  role, 
  redirectPath = '/role-selection' 
}: ProtectedRouteProps) => {
  // Sử dụng isLoggedIn thay vì isAuthenticated để phù hợp với authStore
  const { isLoggedIn, user } = useAuthStore();
  const location = useLocation();
  
  // Nếu chưa đăng nhập, chuyển hướng đến trang login
  if (!isLoggedIn) {
    return (
      <Navigate 
        to={redirectPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }
  
  // Kiểm tra quyền truy cập
  if (role) {
    // Chuyển đổi role đơn thành mảng nếu cần
    const allowedRoles = Array.isArray(role) ? role : [role];
    
    // Kiểm tra user có vai trò phù hợp không
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // Nếu đã đăng nhập và có quyền truy cập, hiển thị children
  return <>{children}</>;
};