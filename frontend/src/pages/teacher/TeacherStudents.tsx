import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Search, 
  UserX, 
  MessageSquare, 
  UserCog,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getRoomById } from '@/api/rooms';
import { apiRequest, setAuthHeader } from '@/api/base';
import { useAuthStore } from '@/stores/authStore';
import { Role, User } from '@/types';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  department: string;
  isActive: boolean;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StudentResponse {
  data: Student[];
  meta: PaginationMeta;
}

export default function TeacherStudents() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, token } = useAuthStore();
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roomName, setRoomName] = useState('');
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  useEffect(() => {
    if (roomId && token) {
      setAuthHeader(token);
      
      getRoomById(parseInt(roomId))
        .then(response => {
            setRoomName(response.data.name);
        })
        .catch(error => {
          console.error('Failed to fetch room:', error);
        });
    }
  }, [roomId, token]);

  useEffect(() => {
    fetchStudents();
  }, [user?.id, meta.page, searchTerm, token]);

  const fetchStudents = async () => {
    if (!user?.id || !token) return;
    
    try {
      setLoading(true);
      setAuthHeader(token);
      
      const teacherId = user.id;
      const response = await apiRequest<StudentResponse>('GET', 
        `/users/teachers/${teacherId}/students?page=${meta.page}&limit=${meta.limit}${searchTerm ? `&search=${searchTerm}` : ''}`
      );

      if (response) {
        // Xử lý đúng cấu trúc response
        const studentsData = Array.isArray(response.data) ? response.data : [];
        const metadata = (response as any).meta || { total: 0, page: 1, limit: 10, totalPages: 0 };
        
        // Thêm 'role' khi mapping
        const mappedUsers = studentsData.map(student => ({
          id: student.id,
          name: student.name,
          email: student.email,
          role: 'STUDENT' as Role,
          updatedAt: student.createdAt, 
          department: student.department,
          isActive: student.isActive,
          phone: student.phone,
          createdAt: student.createdAt
        }));
        
        setStudents(mappedUsers);
        setMeta(metadata);
      } else {
        toast('Failed to fetch students');
      }
    } catch (error: any) {
      toast(error.message || 'An error occurred while fetching students');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= meta.totalPages) {
      setMeta(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMeta(prev => ({ ...prev, page: 1 }));
    fetchStudents();
  };

  const sendMessage = (studentId: number) => {
    toast(`Sending message to student ID: ${studentId}`);
  };

  const logoutStudent = (studentId: number) => {
    toast(`Logging out student ID: ${studentId}`);
  };

  const viewActivity = (studentId: number) => {
    toast(`Viewing activity for student ID: ${studentId}`);
  };

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Students in Room</h1>
          <p className="text-muted-foreground">{roomName || `Room #${roomId}`}</p>
        </div>
        <form onSubmit={handleSearch} className="relative flex w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-8 mr-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" size="sm">Search</Button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="overflow-hidden border rounded-md">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell>
                          <Badge className={student.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {student.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => sendMessage(student.id)}
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Send Message</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => logoutStudent(student.id)}
                                  >
                                    <UserX className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Log Out Student</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => viewActivity(student.id)}
                                  >
                                    <UserCog className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Activity</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-end py-4 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page === meta.totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}