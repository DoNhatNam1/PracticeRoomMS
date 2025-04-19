import { useState, useEffect } from 'react';
import { 
  Container, Title, Group, TextInput, Button, Table, 
  ActionIcon, Badge, Text, Paper, Menu, Select, Loader,
  Tooltip, Box
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { 
  IconSearch, IconPlus, IconEdit, IconTrash, 
  IconDotsVertical, IconFilter
} from '@tabler/icons-react';
import { getSchedules, deleteSchedule } from '../../api/schedules';
import { getRooms } from '../../api/rooms';
import { getUsers } from '../../api/users';
import { ScheduleStatus, Room, User } from '../../types';
import { notifications } from '@mantine/notifications';
import { format } from 'date-fns';

export default function SchedulesManagementPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
    fetchUsers();
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await getSchedules({});
      if (response.success) {
        setSchedules(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch schedules',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await getRooms({});
      if (response.success) {
        setRooms(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers({});
      if (response.success) {
        setUsers(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        const response = await deleteSchedule(id);
        if (response.success) {
          setSchedules(schedules.filter(schedule => schedule.id !== id));
          notifications.show({
            title: 'Success',
            message: 'Schedule deleted successfully',
            color: 'green'
          });
        }
      } catch (error) {
        console.error('Error deleting schedule:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to delete schedule',
          color: 'red'
        });
      }
    }
  };

  const getRoomName = (roomId: number) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'Unknown room';
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown user';
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = 
      schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (schedule.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRoom = !roomFilter || schedule.roomId.toString() === roomFilter;
    const matchesStatus = !statusFilter || schedule.status === statusFilter;
    
    return matchesSearch && matchesRoom && matchesStatus;
  });

  const getStatusBadgeColor = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.PENDING: return 'yellow';
      case ScheduleStatus.APPROVED: return 'blue';
      case ScheduleStatus.COMPLETED: return 'green';
      case ScheduleStatus.REJECTED: return 'red';
      case ScheduleStatus.CANCELLED: return 'gray';
      default: return 'gray';
    }
  };

  return (
    <Container size="xl" p="md">
      <Title order={1} mb="md">Schedules Management</Title>
      
      <Paper p="md" withBorder mb="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <TextInput
              placeholder="Search schedules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
            />
            
            <Select
              placeholder="Filter by room"
              value={roomFilter}
              onChange={setRoomFilter}
              clearable
              data={rooms.map(room => ({ 
                value: room.id.toString(), 
                label: room.name
              }))}
              leftSection={<IconFilter size={16} />}
              maw={200}
            />
            
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              clearable
              data={[
                { value: ScheduleStatus.PENDING, label: 'Pending' },
                { value: ScheduleStatus.APPROVED, label: 'Approved' },
                { value: ScheduleStatus.COMPLETED, label: 'Completed' },
                { value: ScheduleStatus.REJECTED, label: 'Rejected' },
                { value: ScheduleStatus.CANCELLED, label: 'Cancelled' },
              ]}
              leftSection={<IconFilter size={16} />}
              maw={180}
            />
          </Group>
          
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={() => navigate('/admin/schedules/new')}
          >
            Add Schedule
          </Button>
        </Group>
        
        {loading ? (
          <Group justify="center" p="xl">
            <Loader size="md" />
          </Group>
        ) : (
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Room</Table.Th>
                <Table.Th>Date & Time</Table.Th>
                <Table.Th>Duration</Table.Th>
                <Table.Th>Created By</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th style={{ width: 80 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredSchedules.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                    No schedules found
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredSchedules.map((schedule) => (
                  <Table.Tr key={schedule.id}>
                    <Table.Td>
                      <Tooltip label={schedule.description || 'No description'}>
                        <Text fw={500}>{schedule.title}</Text>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td>{getRoomName(schedule.roomId)}</Table.Td>
                    <Table.Td>
                      <Box>
                        <Text size="sm">Start: {formatDateTime(schedule.startTime)}</Text>
                        <Text size="sm">End: {formatDateTime(schedule.endTime)}</Text>
                      </Box>
                    </Table.Td>
                    <Table.Td>{schedule.durationMinutes || 
                      Math.round((new Date(schedule.endTime).getTime() - new Date(schedule.startTime).getTime()) / 60000)
                    } mins</Table.Td>
                    <Table.Td>{getUserName(schedule.userId || schedule.createdBy)}</Table.Td>
                    <Table.Td>
                      <Badge color={getStatusBadgeColor(schedule.status)}>
                        {schedule.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Menu>
                        <Menu.Target>
                          <ActionIcon>
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item 
                            leftSection={<IconEdit size={16} />}
                            onClick={() => navigate(`/admin/schedules/edit/${schedule.id}`)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IconTrash size={16} />}
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            color="red"
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}