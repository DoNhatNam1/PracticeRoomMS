import { Outlet, useParams, useNavigate, Link } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import {
  Users,
  LogOut,
  Settings,
  BookOpen,
  LayoutDashboard,
  Monitor,
  DoorOpen,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getRoomById } from "@/api/rooms";
import { Room } from "@/types/room-service/rooms";
import { Badge } from "@/components/ui/badge";

export default function TeacherLayout() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (roomId) {
      getRoomById(parseInt(roomId))
        .then(response => {
          if (response.success) {
            setRoom(response.data);
          }
        })
        .catch(error => {
          console.error('Failed to fetch room:', error);
        });
    }
  }, [roomId]);

  const handleLogout = () => {
    logout();
    navigate('/role-selection');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'IN_USE': return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE': return 'bg-amber-100 text-amber-800';
      case 'CLOSED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm dark:bg-gray-800">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Teacher Portal</h2>
            <p className="text-sm text-muted-foreground">
              {user?.name || "Teacher"}
            </p>
            {room && (
              <div className="flex items-center gap-2 mt-2">
                <DoorOpen className="w-4 h-4" />
                <Badge className={getStatusColor(room.status)}>
                  Room: {room.name}
                </Badge>
              </div>
            )}
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Button
              variant="ghost"
              className="justify-start w-full"
              asChild
            >
              <Link to={`/teacher/dashboard/${roomId}`}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="justify-start w-full"
              asChild
            >
              <Link to={`/teacher/students/${roomId}`}>
                <Users className="w-4 h-4 mr-2" />
                Students
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="justify-start w-full"
              asChild
            >
              <Link to={`/teacher/computers/${roomId}`}>
                <Monitor className="w-4 h-4 mr-2" />
                Computers
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="justify-start w-full"
              asChild
            >
              <Link to={`/teacher/lessons/${roomId}`}>
                <BookOpen className="w-4 h-4 mr-2" />
                Lessons
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="justify-start w-full"
              asChild
            >
              <Link to={`/teacher/attendance/${roomId}`}>
                <ClipboardList className="w-4 h-4 mr-2" />
                Attendance
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="justify-start w-full"
              asChild
            >
              <Link to={`/teacher/settings/${roomId}`}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              className="justify-start w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  );
}