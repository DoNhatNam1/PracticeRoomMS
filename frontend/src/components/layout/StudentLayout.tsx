import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  Computer,
  FileText,
  Home,
  LogOut,
  Menu,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { tokenService } from '@/services/tokenService';

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId, computerId } = useParams<{ roomId: string; computerId: string }>();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || !tokenService.getAccessToken()) {
      navigate('/student/login');
    }
  }, [user, navigate]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    tokenService.clearTokens();
    logout();
    navigate('/role-selection');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <Home className="w-5 h-5 mr-3" />,
      path: `/student/dashboard/${roomId}/${computerId}`,
    },
    {
      title: 'Assignments',
      icon: <FileText className="w-5 h-5 mr-3" />,
      path: `/student/assignments/${roomId}/${computerId}`,
    },
    {
      title: 'Profile',
      icon: <User className="w-5 h-5 mr-3" />,
      path: `/student/profile/${roomId}/${computerId}`,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-border bg-card lg:block">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <Link 
              to={`/student/dashboard/${roomId}/${computerId}`} 
              className="flex items-center gap-2 font-semibold"
            >
              <Computer className="w-5 h-5" />
              <span>Practice Room</span>
            </Link>
          </div>
          
          <div className="flex-1 py-2 overflow-auto">
            <nav className="grid gap-1 px-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    location.pathname === item.path
                      ? "bg-accent text-accent-foreground"
                      : "transparent"
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{user?.name ? getInitials(user.name) : 'ST'}</AvatarFallback>
              </Avatar>
              <div className="grid gap-0.5 text-sm">
                <span className="font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">Student</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="justify-start w-full gap-2 mt-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Log out
            </Button>
          </div>
        </div>
      </aside>
      
      <div className="flex flex-col w-full lg:pl-56">
        <header className="sticky top-0 z-30 flex items-center gap-4 px-4 border-b h-14 border-border bg-background lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2 font-semibold">
                    <Computer className="w-5 h-5" />
                    <span>Practice Room</span>
                  </div>
                </div>
                
                <div className="flex-1 py-2 overflow-auto">
                  <nav className="grid gap-1 px-2">
                    {menuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          location.pathname === item.path
                            ? "bg-accent text-accent-foreground"
                            : "transparent"
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    ))}
                  </nav>
                </div>
                
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{user?.name ? getInitials(user.name) : 'ST'}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5 text-sm">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">Student</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="justify-start w-full gap-2 mt-2"
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex-1 min-w-0">
            <Link 
              to={`/student/dashboard/${roomId}/${computerId}`}
              className="flex items-center gap-2 font-semibold"
            >
              <Computer className="w-5 h-5" />
              <span className="truncate">Practice Room</span>
            </Link>
          </div>
          
          <Avatar className="h-9 w-9">
            <AvatarFallback>{user?.name ? getInitials(user.name) : 'ST'}</AvatarFallback>
          </Avatar>
        </header>
        
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}