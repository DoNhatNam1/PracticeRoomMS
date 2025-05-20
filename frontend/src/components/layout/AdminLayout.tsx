import { Link, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner"
import { useAuthStore } from "@/stores/authStore";
import {
  CalendarDays,
  LayoutDashboard,
  Users,
  LogOut,
  Settings,
  Laptop,
  DoorOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    // Redirect will happen via protected route
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm dark:bg-gray-800">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Admin Portal</h2>
            <p className="text-sm text-muted-foreground">
              {user?.name || "Administrator"}
            </p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Button
              variant="ghost"
              className="justify-start w-full"
              asChild
            >
              <Link to="/admin/dashboard">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="justify-start w-full"
              asChild
            >
              <Link to="/admin/rooms">
                <DoorOpen className="w-4 h-4 mr-2" />
                Rooms
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="justify-start w-full"
              asChild
            >
              <Link to="/admin/computers">
                <Laptop className="w-4 h-4 mr-2" />
                Computers
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="justify-start w-full"
              asChild
            >
              <Link to="/admin/users">
                <Users className="w-4 h-4 mr-2" />
                Users
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="justify-start w-full"
              asChild
            >
              <Link to="/admin/schedules">
                <CalendarDays className="w-4 h-4 mr-2" />
                Schedule
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="justify-start w-full"
              asChild
            >
              <Link to="/admin/settings">
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