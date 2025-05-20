import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { setAuthHeader, apiRequest } from '@/api/base';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Calendar, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  BadgeCheck,
  X,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { formatDateTime } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Types
interface Room {
  id: number;
  name: string;
  location: string | null;
  capacity: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Schedule {
  id: number;
  roomId: number;
  title: string;
  startTime: string;
  endTime: string;
  repeat: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  status: 'PENDING' | 'APPROVED' | 'CANCELLED';
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  room: Room;
  user: User;
  notes?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form schema
const scheduleFormSchema = z.object({
  roomId: z.coerce.number().min(1, { message: 'Please select a room' }),
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  startDate: z.date({ required_error: 'Start date is required' }),
  startTime: z.string({ required_error: 'Start time is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  endTime: z.string({ required_error: 'End time is required' }),
  repeat: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY']),
  notes: z.string().optional(),
});

export default function AdminSchedules() {
  const { token } = useAuthStore();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Forms
  const createForm = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      roomId: 0,
      title: '',
      startDate: new Date(),
      startTime: '09:00',
      endDate: new Date(),
      endTime: '10:00',
      repeat: 'ONCE',
      notes: '',
    },
  });

  const editForm = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      roomId: 0,
      title: '',
      startDate: new Date(),
      startTime: '09:00',
      endDate: new Date(),
      endTime: '10:00',
      repeat: 'ONCE',
      notes: '',
    },
  });

  // Fetch schedules and rooms on component mount
  useEffect(() => {
    if (token) {
      fetchSchedules();
      fetchRooms();
    }
  }, [token, meta.page, searchTerm, filterStatus]);

  // Functions to fetch data
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setAuthHeader(token);
      
      let url = `/schedules?page=${meta.page}&limit=${meta.limit}`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (filterStatus && filterStatus !== 'ALL') url += `&status=${filterStatus}`;
      
      interface SchedulesResponse {
        success: boolean;
        message: string;
        data: Schedule[];
        meta: PaginationMeta;
      }
      
      const response = await apiRequest<SchedulesResponse>('GET', url);
      
      if (response) {
        const schedulesData = response as unknown as SchedulesResponse;
        if (schedulesData.success) {
          setSchedules(schedulesData.data);
          setMeta(schedulesData.meta);
        } else {
          toast(schedulesData.message || 'Failed to fetch schedules');
        }
      }
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      toast(error.message || 'An error occurred while fetching schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setAuthHeader(token);
      
      interface RoomsResponse {
        success: boolean;
        message: string;
        data: Room[];
      }
      
      const response = await apiRequest<RoomsResponse>('GET', '/rooms/dashboard-view?limit=100');
      
      if (response) {
        const roomsData = response as unknown as RoomsResponse;
        
        if (roomsData.success && roomsData.data) {
          const validRooms = Array.isArray(roomsData.data) 
            ? roomsData.data.filter(room => room && room.id && room.id > 0) 
            : [];
            
          setRooms(validRooms);
          console.log('Fetched rooms:', validRooms);
        }
      }
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      console.log('Error details:', error.response || error.message);
    }
  };

  const fetchScheduleById = async (id: number) => {
    try {
      setAuthHeader(token);
      
      interface ScheduleResponse {
        success: boolean;
        message: string;
        data: Schedule;
      }
      
      const response = await apiRequest<ScheduleResponse>('GET', `/schedules/${id}`);
      
      if (response) {
        const scheduleData = response as unknown as ScheduleResponse;
        if (scheduleData.success && scheduleData.data) {
          console.log('Fetched schedule:', scheduleData.data);
          return scheduleData.data;
        }
      }
      return null;
    } catch (error: any) {
      console.error('Error fetching schedule details:', error);
      toast(error.message || 'An error occurred while fetching schedule details');
      return null;
    }
  };

  // CRUD operations
  const createSchedule = async (data: z.infer<typeof scheduleFormSchema>) => {
    try {
      setAuthHeader(token);
      
      const startDateTime = new Date(data.startDate);
      const startTimeParts = data.startTime.split(':');
      startDateTime.setHours(parseInt(startTimeParts[0]), parseInt(startTimeParts[1]));
      
      const endDateTime = new Date(data.endDate);
      const endTimeParts = data.endTime.split(':');
      endDateTime.setHours(parseInt(endTimeParts[0]), parseInt(endTimeParts[1]));
      
      const scheduleData = {
        roomId: data.roomId,
        title: data.title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        repeat: data.repeat,
        notes: data.notes,
      };
      
      interface ScheduleCreateResponse {
        success: boolean;
        message: string;
        data: {
          id: number;
          roomId: number;
          title: string;
          startTime: string;
          endTime: string;
          repeat: string;
          status: string;
          createdBy: number;
          createdAt: string;
          updatedAt: string;
        };
      }
      
      const response = await apiRequest<ScheduleCreateResponse>('POST', '/schedules', { data: scheduleData });
      
      const responseData = response as unknown as ScheduleCreateResponse;
      
      if (responseData && responseData.success && responseData.data.id) {
        toast('Schedule created successfully');
        setIsCreateDialogOpen(false);
        createForm.reset();
        fetchSchedules();
      } else {
        toast(responseData?.message || 'Failed to create schedule');
      }
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      toast(error.message || 'An error occurred while creating schedule');
    }
  };

  const updateSchedule = async (data: z.infer<typeof scheduleFormSchema>) => {
    if (!editingSchedule) return;
    
    try {
      setAuthHeader(token);
      
      const startDateTime = new Date(data.startDate);
      const startTimeParts = data.startTime.split(':');
      startDateTime.setHours(parseInt(startTimeParts[0]), parseInt(startTimeParts[1]));
      
      const endDateTime = new Date(data.endDate);
      const endTimeParts = data.endTime.split(':');
      endDateTime.setHours(parseInt(endTimeParts[0]), parseInt(endTimeParts[1]));
      
      const scheduleData = {
        roomId: data.roomId,
        title: data.title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        repeat: data.repeat,
        notes: data.notes || '',
      };
      
      console.log('Updating schedule with data:', scheduleData);
      
      const response = await apiRequest('PUT', `/schedules/${editingSchedule.id}`, { data: scheduleData });
      
      console.log('Update response:', response);
      
      if (response && response.success) {
        toast('Schedule updated successfully');
        setIsEditDialogOpen(false);
        setEditingSchedule(null);
        fetchSchedules();
      } else {
        toast(response?.message || 'Failed to update schedule');
      }
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while updating schedule';
      toast(errorMessage);
    }
  };

  const deleteSchedule = async () => {
    if (!deleteId) return;
    
    try {
      setAuthHeader(token);
      
      interface ScheduleDeleteResponse {
        success: boolean;
        message: string;
      }
      
      const response = await apiRequest<ScheduleDeleteResponse>('DELETE', `/schedules/${deleteId}`);
      
      const responseData = response as unknown as ScheduleDeleteResponse;
      
      if (responseData && responseData.success) {
        toast('Schedule cancelled successfully');
        setIsDeleteDialogOpen(false);
        setDeleteId(null);
        fetchSchedules();
      } else {
        toast(responseData?.message || 'Failed to cancel schedule');
      }
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      toast(error.message || 'An error occurred while cancelling schedule');
    }
  };

  const handleEditClick = async (scheduleId: number) => {
    try {
      const schedule = await fetchScheduleById(scheduleId);
      
      if (!schedule) {
        toast('Failed to fetch schedule details');
        return;
      }
      
      setEditingSchedule(schedule);
      
      const startDate = new Date(schedule.startTime);
      const startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
      
      const endDate = new Date(schedule.endTime);
      const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
      
      editForm.reset({
        roomId: schedule.roomId,
        title: schedule.title,
        startDate: startDate,
        startTime: startTime,
        endDate: endDate,
        endTime: endTime,
        repeat: schedule.repeat,
        notes: schedule.notes || '',
      });
      
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error('Error preparing schedule edit:', error);
      toast('An error occurred while preparing to edit schedule');
    }
  };

  const handlePageChange = (newPage: number) => {
    setMeta({ ...meta, page: newPage });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMeta({ ...meta, page: 1 });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <BadgeCheck size={14} /> Approved
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock size={14} /> Pending
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <X size={14} /> Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container py-8 mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Schedules Management</h1>
        
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus size={16} />
          Add Schedule
        </Button>
      </div>
      
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative w-full max-w-md">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={18} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search schedules..."
              className="pl-10"
            />
          </div>
        </form>
        
        <div className="flex items-center gap-2">
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-[180px]">
              <span className="flex items-center gap-2">
                <Filter size={16} />
                {filterStatus ? filterStatus : 'All Statuses'}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => fetchSchedules()}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Schedule List</CardTitle>
              <CardDescription>
                Manage all scheduled events for rooms
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Repeat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.length > 0 ? (
                    schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.title}</TableCell>
                        <TableCell>{schedule.room?.name || `Room ${schedule.roomId}`}</TableCell>
                        <TableCell>{formatDateTime(schedule.startTime)}</TableCell>
                        <TableCell>{formatDateTime(schedule.endTime)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {schedule.repeat}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{schedule.user?.name}</span>
                            <span className="text-xs text-gray-500">{schedule.user?.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleEditClick(schedule.id)}
                                className="flex items-center gap-2"
                              >
                                <Edit size={14} />
                                Edit Schedule
                              </DropdownMenuItem>
                              {schedule.status !== 'CANCELLED' && (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setDeleteId(schedule.id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="flex items-center gap-2 text-red-600"
                                >
                                  <Trash size={14} />
                                  Cancel Schedule
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No schedules found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {schedules.length} of {meta.total} schedules
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={meta.page <= 1}
                onClick={() => handlePageChange(meta.page - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => handlePageChange(meta.page + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </>
      )}
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar size={18} />
              Create New Schedule
            </DialogTitle>
            <DialogDescription>
              Add a new schedule to the system.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(createSchedule)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter schedule title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value > 0 ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms && rooms.length > 0 ? (
                          rooms.map((room) => (
                            <SelectItem 
                              key={room.id} 
                              value={room.id.toString()}
                            >
                              {room.name || `Room ${room.id}`} {room.capacity ? `(Capacity: ${room.capacity})` : ''}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-rooms">No rooms available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 font-normal text-left"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 font-normal text-left"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={createForm.control}
                name="repeat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repeat</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select repeat pattern" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ONCE">Once</SelectItem>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about the schedule" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Schedule</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit size={18} />
              Edit Schedule
            </DialogTitle>
            <DialogDescription>
              Update the selected schedule.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(updateSchedule)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter schedule title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            {room.name} (Capacity: {room.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 font-normal text-left"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 font-normal text-left"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="repeat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repeat</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select repeat pattern" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ONCE">Once</SelectItem>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about the schedule" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Schedule</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash size={18} />
              Cancel Schedule
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this schedule? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              No, Keep It
            </Button>
            <Button variant="destructive" onClick={deleteSchedule}>
              Yes, Cancel Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}