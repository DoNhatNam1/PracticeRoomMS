import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DoorOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getRoomById } from '../../api/rooms';
import { useAuthStore } from '../../stores/authStore';
import { Room } from '../../types/room-service/rooms';
import { setAuthHeader } from '@/api/base';
import { toast } from 'sonner';

export default function TeacherDashboard() {
    const { roomId } = useParams<{ roomId: string }>();
    const { user, token } = useAuthStore();
    const [room, setRoom] = useState<Room | null>(null);
    
    useEffect(() => {
      if (roomId) {
        if (token) {
          setAuthHeader(token);
          
          getRoomById(parseInt(roomId))
            .then(response => {
                setRoom(response as any);
            })
            .catch(error => {
                toast(error.message || 'An error occurred while fetching room data');
            });
        } else {
          console.error('No authentication token available');
          // Có thể chuyển hướng người dùng đến trang đăng nhập hoặc hiển thị thông báo
        }
      }
    }, [roomId, token]); // Thêm token vào dependencies để useEffect chạy lại khi token thay đổi
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_USE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MAINTENANCE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CLOSED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <div className="container py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Teacher Dashboard</h1>
      
      <div className="flex items-center gap-3 mb-6">
        <DoorOpen className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">
          Room: {room?.name || 'Loading...'}
        </h2>
        {room && (
          <Badge className={getStatusColor(room.status)}>
            {room.status}
          </Badge>
        )}
      </div>
      
      <p className="mb-4 text-lg">Welcome, {user?.name}!</p>
      <p>This is the teacher dashboard where you can monitor student activities and control computers.</p>
    </div>
  );
}