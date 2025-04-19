import { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Text, Title, Group, 
  RingProgress, Tabs, Card, ActionIcon, Table, Badge
} from '@mantine/core';
import { 
  IconUser, IconDoor, IconDeviceDesktop, IconCalendarEvent, 
  IconRefresh, IconArrowUpRight, IconAlertCircle
} from '@tabler/icons-react';
import { getUsers } from '../../api/users';
import { getRooms } from '../../api/rooms';
import { getSystemLogs } from '../../api/logs';
import { useAuthStore } from '../../stores/authStore';
import { RoomStatus, LogLevel, LogType } from '../../types';

// Define activity type for dashboard using our actual log structure
interface Activity {
  id: number;
  timestamp: string;       // Sử dụng timestamp thay vì createdAt
  level: LogLevel;         // Thêm level từ LogLevel enum
  type: LogType;           // Sử dụng type từ LogType enum
  message: string;         // Thêm message field
  details?: string;        // Optional details
  user?: {                 // Map từ user thay vì actor
    id: number;
    name: string;
    role: string;
  };
  userId?: number;         // Thêm userId
}

export default function AdminDashboard() {
  const [usersCount, setUsersCount] = useState(0);
  const [roomsCount, setRoomsCount] = useState(0);
  const [inUseRooms, setInUseRooms] = useState(0);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users count
      const usersResponse = await getUsers({ limit: 1 });
      if (usersResponse.success) {
        setUsersCount(usersResponse.data.meta.totalItems);
      }
      
      // Fetch rooms count and usage
      const roomsResponse = await getRooms({ limit: 100 });
      if (roomsResponse.success) {
        setRoomsCount(roomsResponse.data.items.length);
        
        // Count in-use rooms
        const inUse = roomsResponse.data.items.filter(r => r.status === RoomStatus.IN_USE).length;
        setInUseRooms(inUse);
      }
      
      // Fetch recent activity from logs
      try {
        const logsResponse = await getSystemLogs({ 
          limit: 5, 
          page: 1,
          // Sử dụng các filter phù hợp với API logs mới
          level: LogLevel.INFO // Chỉ lấy các logs Info cho dashboard
        });
        
        if (logsResponse.success && logsResponse.data.items.length > 0) {
          // Map log items to activity format với cấu trúc mới
          setRecentActivity(logsResponse.data.items);
        } else {
          // Fallback to mock data if no logs, sử dụng cấu trúc Activity mới
          setRecentActivity([
            { 
              id: 1, 
              timestamp: new Date().toISOString(),
              level: LogLevel.INFO,
              type: LogType.ROOM,
              message: 'Room usage started for Room 101',
              user: { id: 1, name: 'John Doe', role: 'Student' }
            },
            { 
              id: 2, 
              timestamp: new Date().toISOString(),
              level: LogLevel.INFO,
              type: LogType.AUTH,
              message: 'User login successful',
              user: { id: 2, name: 'Alice Smith', role: 'Teacher' }
            },
            { 
              id: 3, 
              timestamp: new Date().toISOString(),
              level: LogLevel.INFO,
              type: LogType.COMPUTER,
              message: 'Computer status changed to maintenance',
              user: { id: 3, name: 'Tech Support', role: 'Admin' },
              details: 'Computer ID: 5, Room: 203'
            },
            { 
              id: 4, 
              timestamp: new Date().toISOString(),
              level: LogLevel.INFO,
              type: LogType.SCHEDULE,
              message: 'New schedule created for Music Room',
              user: { id: 4, name: 'Prof. Johnson', role: 'Teacher' }
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching activity logs:', error);
        // Fallback to mock data
        setRecentActivity([
          { 
            id: 1, 
            timestamp: new Date().toISOString(),
            level: LogLevel.INFO,
            type: LogType.ROOM,
            message: 'Room usage started for Room 101',
            user: { id: 1, name: 'John Doe', role: 'Student' }
          },
          // ... thêm mock data khác
        ]);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const getActivityIcon = (logType: LogType) => {
    switch (logType) {
      case LogType.ROOM:
        return <IconDoor size={16} />;
      case LogType.USER:
        return <IconUser size={16} />;
      case LogType.COMPUTER:
        return <IconDeviceDesktop size={16} />;
      case LogType.SCHEDULE:
        return <IconCalendarEvent size={16} />;
      case LogType.SYSTEM:
        return <IconAlertCircle size={16} />;
      case LogType.AUTH:
        return <IconUser size={16} />;
      default:
        return <IconArrowUpRight size={16} />;
    }
  };

  const getActivityLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return 'red';
      case LogLevel.WARNING:
        return 'orange';
      case LogLevel.INFO:
        return 'blue';
      case LogLevel.DEBUG:
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatActivityMessage = (message: string): string => {
    // Capitalize first letter only for readability
    return message.charAt(0).toUpperCase() + message.slice(1);
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2} mb="xs">Admin Dashboard</Title>
          <Text c="dimmed">Welcome back, {user?.name}</Text>
        </div>
        <ActionIcon 
          size="lg" 
          color="blue" 
          variant="light"
          onClick={handleRefresh}
          loading={loading}
        >
          <IconRefresh size={20} />
        </ActionIcon>
      </Group>

      <Grid gutter="md">
        {/* Stats Cards */}
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper shadow="xs" p="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed">Total Users</Text>
                <Text fw={700} size="xl">{usersCount}</Text>
              </div>
              <IconUser size={32} color="blue" />
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper shadow="xs" p="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed">Practice Rooms</Text>
                <Text fw={700} size="xl">{roomsCount}</Text>
              </div>
              <IconDoor size={32} color="violet" />
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper shadow="xs" p="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed">Room Usage</Text>
                <Text fw={700} size="xl">{roomsCount ? Math.round((inUseRooms / roomsCount) * 100) : 0}%</Text>
              </div>
              <RingProgress
                size={46}
                thickness={4}
                sections={[{ value: roomsCount ? (inUseRooms / roomsCount) * 100 : 0, color: 'green' }]}
              />
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper shadow="xs" p="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed">Active Sessions</Text>
                <Text fw={700} size="xl">{inUseRooms * 2}</Text> {/* Approximate number */}
              </div>
              <IconDeviceDesktop size={32} color="orange" />
            </Group>
          </Paper>
        </Grid.Col>

        {/* Recent Activity */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card shadow="xs" withBorder>
            <Card.Section p="md">
              <Title order={3}>Recent Activity</Title>
            </Card.Section>
            
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Message</Table.Th>
                  <Table.Th>Time</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recentActivity.map((activity, index) => (
                  <Table.Tr key={activity.id || index}>
                    <Table.Td>
                      <Group gap={4}>
                        {getActivityIcon(activity.type)}
                        <Badge color={getActivityLevelColor(activity.level)} size="xs">
                          {activity.type}
                        </Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>{activity.user?.name || 'System'}</Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={1}>
                        {formatActivityMessage(activity.message)}
                      </Text>
                    </Table.Td>
                    <Table.Td>{new Date(activity.timestamp).toLocaleTimeString()}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>

        {/* Alerts and Notifications */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card shadow="xs" withBorder>
            <Card.Section p="md">
              <Title order={3}>Alerts</Title>
            </Card.Section>
            
            <div style={{ padding: '0 1rem', paddingBottom: '1rem' }}>
              <Paper p="sm" withBorder mb="sm">
                <Group>
                  <Badge color="orange">Maintenance</Badge>
                  <Text size="sm">Room 203 needs technical support</Text>
                </Group>
              </Paper>
              
              <Paper p="sm" withBorder mb="sm">
                <Group>
                  <Badge color="red">Urgent</Badge>
                  <Text size="sm">Computer Lab 101 reporting network issues</Text>
                </Group>
              </Paper>
              
              <Paper p="sm" withBorder mb="sm">
                <Group>
                  <Badge color="blue">Info</Badge>
                  <Text size="sm">3 new user registration requests</Text>
                </Group>
              </Paper>
            </div>
          </Card>
        </Grid.Col>

        {/* Tabbed section for more detailed data */}
        <Grid.Col span={12}>
          <Paper shadow="xs" p="md" withBorder>
            <Tabs defaultValue="room-usage">
              <Tabs.List>
                <Tabs.Tab value="room-usage" leftSection={<IconDoor size={14} />}>Room Usage</Tabs.Tab>
                <Tabs.Tab value="schedules" leftSection={<IconCalendarEvent size={14} />}>Upcoming Schedules</Tabs.Tab>
                <Tabs.Tab value="maintenance" leftSection={<IconAlertCircle size={14} />}>Maintenance</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="room-usage" pt="xs">
                <Text>Room usage statistics and details would appear here</Text>
              </Tabs.Panel>

              <Tabs.Panel value="schedules" pt="xs">
                <Text>Upcoming class schedules and bookings would appear here</Text>
              </Tabs.Panel>

              <Tabs.Panel value="maintenance" pt="xs">
                <Text>Maintenance schedules and requests would appear here</Text>
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}