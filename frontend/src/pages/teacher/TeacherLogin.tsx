import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, DoorOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { login } from '../../api/auth';
import { getRoomById } from '../../api/rooms';
import { useAuthStore } from '../../stores/authStore';
import { tokenService } from '@/services/tokenService';
import { Room } from '../../types/room-service/rooms';

export default function TeacherLogin() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { login: loginStore } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormValues(prev => ({ ...prev, rememberMe: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formValues.email || !formValues.password) {
      toast("Please fill in all required fields");
      return;
    }
    
    try {
      setLoading(true);
      const response = await login(formValues);
      
      if (response.success) {
        console.log('Login response:', response.data); // Debugging
        
        // Verify that the user is a teacher
        if (response.data.user.role !== 'TEACHER') {
          toast("You must be a teacher to login here");
          return;
        }
        
        const { user, accessToken, refreshToken } = response.data;
        
        // Lưu tokens vào localStorage
        tokenService.setAccessToken(accessToken);
        tokenService.setRefreshToken(refreshToken);
        
        // Lưu data vào auth store
        loginStore(user, accessToken, refreshToken);
        
        // Lưu thông tin phòng để sử dụng sau này
        localStorage.setItem('lastTeacherRoomId', roomId || '');
        
        toast("Welcome to the teacher dashboard");
        
        // Navigate to teacher dashboard with room ID
        navigate(`/teacher/dashboard/${roomId}`);
      } else {
        toast(response.message || "Invalid credentials");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
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
    <div className="container max-w-md py-12 mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/teacher/room-selection')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Room Selection
      </Button>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-col items-center space-y-1">
            <div className="flex items-center justify-center w-12 h-12 mb-2 bg-green-100 rounded-full">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Teacher Login</CardTitle>
            
            {room && (
              <div className="flex items-center gap-2 mt-2">
                <DoorOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Room:</span>
                <Badge className={getStatusColor(room.status)}>
                  {room.name}
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formValues.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formValues.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rememberMe" 
                    checked={formValues.rememberMe}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}