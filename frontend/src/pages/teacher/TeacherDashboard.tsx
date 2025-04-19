import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useRoomsStore } from '../../stores/roomsStore';
import { getRoomComputers } from '../../api/rooms';
import { getStudentsByTeacher } from '../../api/users';
import { ComputerStatus } from '../../types';

// shadcn components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Lucide icons (replacing tabler icons)
import { 
  Users, MonitorPlay, DoorOpen, Lightbulb, 
  ClipboardCheck, CalendarDays, Clock, CheckCircle 
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const { selectedRoom } = useRoomsStore();
  const navigate = useNavigate();
  const [computers, setComputers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [activeComputers, setActiveComputers] = useState(0);
  const [_loading, setLoading] = useState(true);
  
  // Mock current class data
  const currentClass = {
    title: "Advanced Music Theory",
    startTime: new Date(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    progress: 35, // percent
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (selectedRoom) {
          // Fetch computers in the room
          const computersResponse = await getRoomComputers(selectedRoom.id);
          if (computersResponse.success) {
            setComputers(computersResponse.data.items);
            
            // Count active computers
            const active = computersResponse.data.items.filter((c: any) => 
              c.status === ComputerStatus.IN_USE
            ).length;
            setActiveComputers(active);
          }
        }
        
        if (user) {
          // Fetch students assigned to this teacher
          const studentsResponse = await getStudentsByTeacher(user.id);
          if (studentsResponse.success) {
            setStudents(studentsResponse.data.items);
          }
        }
        
      } catch (error) {
        console.error('Error fetching teacher dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedRoom, user]);

  // If no room was selected, show a message
  if (!selectedRoom) {
    return (
      <div className="container max-w-md py-8 mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-center">No Practice Room Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-slate-600 dark:text-slate-300">
              You haven't selected a practice room. Please go back to the room selection page.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/teacher/select-room')}>
              Select a Room
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const getComputerStatusColor = (status: string) => {
    switch (status) {
      case ComputerStatus.OPERATIONAL: return 'bg-green-500 hover:bg-green-600';
      case ComputerStatus.IN_USE: return 'bg-blue-500 hover:bg-blue-600'; 
      case ComputerStatus.MAINTENANCE: return 'bg-amber-500 hover:bg-amber-600';
      case ComputerStatus.OUT_OF_ORDER: return 'bg-red-500 hover:bg-red-600';
      case ComputerStatus.RESERVED: return 'bg-violet-500 hover:bg-violet-600';
      default: return 'bg-slate-500 hover:bg-slate-600';
    }
  };

  const getComputerStatusVariant = (status: string) => {
    switch (status) {
      case ComputerStatus.OPERATIONAL: return 'success';
      case ComputerStatus.IN_USE: return 'default'; 
      case ComputerStatus.MAINTENANCE: return 'warning';
      case ComputerStatus.OUT_OF_ORDER: return 'destructive';
      case ComputerStatus.RESERVED: return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container py-8 mx-auto max-w-7xl">
      <div className="flex flex-col items-start justify-between mb-8 space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-300">Welcome, {user?.name}</p>
          <Badge className="mt-2" variant="default">{selectedRoom.name}</Badge>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <CalendarDays className="w-4 h-4 mr-2" />
            Schedule
          </Button>
          <Button variant="outline" size="sm">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Take Attendance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Current Class Card */}
        <div className="lg:col-span-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
                <div>
                  <h3 className="text-xl font-semibold">{currentClass.title}</h3>
                  <div className="flex items-center mt-1 text-slate-600 dark:text-slate-300">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {currentClass.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                      {currentClass.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="font-medium" variant="default">In Progress</Badge>
                  <div className="mt-2 space-y-1">
                    <span className="block text-sm text-right">{currentClass.progress}% Complete</span>
                    <Progress value={currentClass.progress} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room Overview */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader>
              <CardTitle>Room Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-full dark:bg-blue-900">
                    <DoorOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Room Number</p>
                    <p className="font-semibold">{selectedRoom.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-full bg-violet-100 dark:bg-violet-900">
                    <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Capacity</p>
                    <p className="font-semibold">{selectedRoom.capacity} students</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
                    <MonitorPlay className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Computers</p>
                    <p className="font-semibold">{computers.length} total</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-full bg-amber-100 dark:bg-amber-900">
                    <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                    <Badge variant="outline">{selectedRoom.status}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Present */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Students Present</CardTitle>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {activeComputers} of {students.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Computer</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.slice(0, 4).map((student, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback>{student.name?.[0]?.toUpperCase() || 'S'}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{index < activeComputers ? `Computer ${index + 1}` : '-'}</TableCell>
                      <TableCell>
                        <Badge variant={index < activeComputers ? "default" : "outline"}>
                          {index < activeComputers ? 'Present' : 'Absent'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {students.length > 4 && (
                <p className="mt-4 text-sm text-center text-slate-500 dark:text-slate-400">
                  + {students.length - 4} more students
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Class Timeline */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Class Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                {/* Timeline Item 1 */}
                <div className="relative pb-8 pl-8 border-l border-slate-200 dark:border-slate-700">
                  <div className="absolute top-0 left-0 flex items-center justify-center w-6 h-6 -translate-x-1/2 bg-green-100 rounded-full dark:bg-green-900">
                    <DoorOpen className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-medium">Class Started</h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">10:00 AM</p>
                  <p className="mt-1 text-sm">Class started with 18 students</p>
                </div>

                {/* Timeline Item 2 - Active */}
                <div className="relative pb-8 pl-8 border-l border-slate-200 dark:border-slate-700">
                  <div className="absolute top-0 left-0 flex items-center justify-center w-6 h-6 -translate-x-1/2 bg-blue-100 rounded-full dark:bg-blue-900">
                    <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-medium">Current Activity</h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">10:35 AM</p>
                  <p className="mt-1 text-sm">Working on group assignment</p>
                </div>

                {/* Timeline Item 3 */}
                <div className="relative pb-8 pl-8 border-l border-slate-200 dark:border-slate-700">
                  <div className="absolute top-0 left-0 flex items-center justify-center w-6 h-6 -translate-x-1/2 rounded-full bg-slate-200 dark:bg-slate-700">
                    <MonitorPlay className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  </div>
                  <h4 className="font-medium text-slate-500 dark:text-slate-400">Equipment Check</h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">11:30 AM</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Check all equipment is functioning</p>
                </div>

                {/* Timeline Item 4 */}
                <div className="relative pl-8 border-l border-slate-200 dark:border-slate-700">
                  <div className="absolute top-0 left-0 flex items-center justify-center w-6 h-6 -translate-x-1/2 rounded-full bg-slate-200 dark:bg-slate-700">
                    <ClipboardCheck className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  </div>
                  <h4 className="font-medium text-slate-500 dark:text-slate-400">Class End</h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">12:00 PM</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Collect assignments and dismiss</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Computer Status */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Computer Status</CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Computer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Login Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {computers.slice(0, 5).map((computer, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{computer.name}</TableCell>
                      <TableCell>
                        <Badge variant={getComputerStatusVariant(computer.status) as any}>
                          {computer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {computer.status === 'IN_USE' ? students[index % students.length]?.name : '-'}
                      </TableCell>
                      <TableCell>
                        {computer.status === 'IN_USE' ? '10:05 AM' : '-'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}