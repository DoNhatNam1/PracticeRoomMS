import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Monitor, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function RoleSelection() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // Chuyển hướng người dùng đã đăng nhập
  useEffect(() => {
    if (isAuthenticated && user) {
      // Dựa vào role để chuyển hướng đến dashboard tương ứng
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'TEACHER':
          // Nếu teacher cần roomId, có thể lưu trong localStorage hoặc state store
          const lastRoomId = localStorage.getItem('lastTeacherRoomId') || '1';
          navigate(`/teacher/dashboard/${lastRoomId}`);
          break;
        case 'STUDENT':
          // Tương tự với student nếu cần thông tin phòng và máy tính
          const lastStudentRoomId = localStorage.getItem('lastStudentRoomId') || '1';
          const lastComputerId = localStorage.getItem('lastStudentComputerId') || '1';
          navigate(`/student/dashboard/${lastStudentRoomId}/${lastComputerId}`);
          break;
        default:
          // Nếu không xác định được role, để người dùng ở trang chọn role
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleRoleSelect = (role: 'admin' | 'teacher' | 'student') => {
    switch (role) {
      case 'admin':
        navigate('/admin/login');
        break;
      case 'teacher':
        navigate('/teacher/room-selection');
        break;
      case 'student':
        navigate('/student/room-selection');
        break;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container py-12 mx-auto">
      <motion.h1 
        className="mb-10 text-3xl font-bold text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Select Your Role
      </motion.h1>
      
      <motion.div 
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Admin Role */}
        <motion.div variants={item}>
          <Card className="h-full transition-all border-2 hover:border-blue-500">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <ShieldCheck className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-center">Administrator</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Manage the entire system including rooms, computers, users, and schedules.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleRoleSelect('admin')} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Continue as Admin
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Teacher Role */}
        <motion.div variants={item}>
          <Card className="h-full transition-all border-2 hover:border-green-500">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Monitor className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-center">Teacher</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Monitor student activities, control computers, and manage practice sessions.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleRoleSelect('teacher')} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Continue as Teacher
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Student Role */}
        <motion.div variants={item}>
          <Card className="h-full transition-all border-2 hover:border-red-500">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <User className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-center">Student</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Access practice rooms, use assigned computers, and participate in lab sessions.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleRoleSelect('student')} 
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Continue as Student
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}