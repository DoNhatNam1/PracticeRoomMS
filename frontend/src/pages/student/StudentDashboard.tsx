import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, CalendarClock, FileText, Cpu } from 'lucide-react';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { apiRequest } from '@/api/base';
import { Room } from '@/types/room-service/rooms';
import { Computer as ComputerType } from '@/types/computer-service/computers';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDashboard() {
  const { roomId, computerId } = useParams<{ roomId: string; computerId: string }>();
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [computer, setComputer] = useState<ComputerType | null>(null);
  const [usage, setUsage] = useState<any | null>(null);
  const [usageStats, setUsageStats] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      
      try {
        setLoading(true);
        
        // Fetch room, computer, and usage data in parallel
        const [roomResponse, computerResponse, usageResponse, statsResponse] = await Promise.all([
          apiRequest<any>('GET', `/rooms/${roomId}`),
          apiRequest<any>('GET', `/computers/${computerId}`),
          apiRequest<any>('GET', `/computer-usages/current?computerId=${computerId}`),
          apiRequest<any>('GET', `/students/${user?.id}/stats`)
        ]);
        
        if (roomResponse?.success) {
          setRoom(roomResponse.data);
        }
        
        if (computerResponse?.success) {
          setComputer(computerResponse.data);
        }
        
        if (usageResponse?.success) {
          setUsage(usageResponse.data);
        }
        
        if (statsResponse?.success) {
          setUsageStats([
            { name: 'Compositions', value: statsResponse.data.compositionCount || 0 },
            { name: 'Assignments', value: statsResponse.data.assignmentCount || 0 },
            { name: 'Practice Hours', value: statsResponse.data.totalPracticeHours || 0 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [roomId, computerId, token, user?.id]);
  
  const getStatusColor = (status: string) => {
    const colors = {
      AVAILABLE: 'bg-green-100 text-green-800',
      IN_USE: 'bg-blue-100 text-blue-800',
      MAINTENANCE: 'bg-amber-100 text-amber-800',
      OFFLINE: 'bg-red-100 text-red-800',
      OPERATIONAL: 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  return (
    <div className="container p-6">
      <h1 className="mb-6 text-3xl font-bold">Student Dashboard</h1>
      
      <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Current Room Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Current Room</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-[160px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">{room?.name || 'N/A'}</div>
                {room && (
                  <div className="mt-1">
                    <Badge className={getStatusColor(room.status)}>
                      {room.status}
                    </Badge>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Current Computer Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Current Computer</CardTitle>
            <Cpu className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-[160px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">{computer?.name || 'N/A'}</div>
                {computer && (
                  <div className="mt-1">
                    <Badge className={getStatusColor(computer.status)}>
                      {computer.status}
                    </Badge>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Session Duration Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
            <CalendarClock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-[160px]" />
            ) : (
              <div className="text-2xl font-bold">
                {usage ? (
                  new Date(usage.endTime || new Date()).getTime() - 
                  new Date(usage.startTime).getTime() > 0 
                    ? `${Math.floor((new Date(usage.endTime || new Date()).getTime() - 
                        new Date(usage.startTime).getTime()) / (1000 * 60))} mins`
                    : '0 mins'
                ) : 'Not started'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {usage ? (
                `Started: ${format(new Date(usage.startTime), 'h:mm a')}`
              ) : 'No active session'}
            </p>
          </CardContent>
        </Card>
        
        {/* Assignment Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-[160px]" />
            ) : (
              <div className="text-2xl font-bold">
                {usageStats.find(stat => stat.name === 'Assignments')?.value || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Total assignments
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Practice Time Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Practice Time by Day</CardTitle>
            <CardDescription>
              Your practice hours over the last week
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <Skeleton className="h-[250px] w-[90%]" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                  { name: 'Mon', hours: 2.5 },
                  { name: 'Tue', hours: 1.8 },
                  { name: 'Wed', hours: 3.2 },
                  { name: 'Thu', hours: 0.5 },
                  { name: 'Fri', hours: 1.9 },
                  { name: 'Sat', hours: 0 },
                  { name: 'Sun', hours: 4.1 },
                  ] as { name: string; hours: number }[]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => [`${value} hrs`, 'Practice Time']} />
                  <Bar dataKey="hours" fill="#4f46e5" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        {/* Activity Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Activity Distribution</CardTitle>
            <CardDescription>
              Breakdown of your activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <Skeleton className="h-[250px] w-[90%] rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                  data={[
                    { name: 'Practice', value: 65 },
                    { name: 'Composition', value: 15 },
                    { name: 'Theory', value: 10 },
                    { name: 'Recording', value: 10 },
                  ] as { name: string; value: number }[]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                  {[
                    { name: 'Practice', value: 65 },
                    { name: 'Composition', value: 15 },
                    { name: 'Theory', value: 10 },
                    { name: 'Recording', value: 10 },
                  ].map((_entry: { name: string; value: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}