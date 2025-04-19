import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { 
  AppShell, Text, Group, Avatar, ThemeIcon, UnstyledButton, 
  Stack, Divider
} from '@mantine/core';
import { 
  IconDashboard, IconUsers, IconCalendarEvent, IconDeviceDesktop, 
  IconDoor, IconUser, IconLogout
} from '@tabler/icons-react';
import { useAuthStore } from '../../stores/authStore';
import { useEffect, useState } from 'react';
import { getRooms } from '../../api/rooms';
import { Room } from '../../types';
import './TeacherLayout.css';

export default function TeacherLayout() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [room, setRoom] = useState<Room | null>(null);
  const handleLogout = () => {
    logout();
    navigate('/role-selection');
  };


  useEffect(() => {
    if (roomId) {
      getRooms({ limit: 100 })
        .then(response => {
          if (response.success) {
            const roomData = response.data.items.find(r => r.id === parseInt(roomId));
            if (roomData) {
              setRoom(roomData);
            }
          }
        })
        .catch(error => console.error('Failed to load room:', error));
    }
  }, [roomId]);

  const menuItems = [
    { icon: <IconDashboard size={20} />, label: 'Dashboard', path: `/teacher/${roomId}` },
    { icon: <IconUsers size={20} />, label: 'My Students', path: `/teacher/${roomId}/students` },
    { icon: <IconCalendarEvent size={20} />, label: 'Schedules', path: `/teacher/${roomId}/schedules` },
    { icon: <IconDeviceDesktop size={20} />, label: 'Computers', path: `/teacher/${roomId}/computers` },
    { icon: <IconDoor size={20} />, label: 'Room Status', path: `/teacher/${roomId}/room-status` },
    { icon: <IconUser size={20} />, label: 'Profile', path: `/teacher/${roomId}/profile` },
  ];
  
  return (
    <AppShell
      padding="md"
      navbar={{ 
        width: 250, 
        breakpoint: 'sm',
      }}
      header={{ 
        height: 60 
      }}
    >
      <AppShell.Header p="xs">
        <Group h="100%" px={20} justify="space-between">
          <Text fw={700} size="lg">Practice Room - Teacher Mode</Text>
          
          <Group>
            <Text fw={500}>{user?.name || 'Teacher'}</Text>
            <Avatar color="green" radius="xl">
              {user?.name?.charAt(0) || 'T'}
            </Avatar>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <Stack h="100%" justify="space-between">
          <Stack>
            {room && (
              <>
                <Group p="xs">
                  <ThemeIcon size={30} radius="xl" color="blue">
                    <IconDoor size={20} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed">Current Room</Text>
                    <Text fw={500}>{room.name}</Text>
                  </div>
                </Group>
                <Divider my="xs" />
              </>
            )}
            
            <Stack gap={0}>
              {menuItems.map((item, index) => (
                <UnstyledButton
                  key={index}
                  onClick={() => navigate(item.path)}
                  py="xs"
                  px="md"
                  className="menu-item"
                >
                  <Group>
                    <ThemeIcon size={30} variant="light">
                      {item.icon}
                    </ThemeIcon>
                    <Text size="sm">{item.label}</Text>
                  </Group>
                </UnstyledButton>
              ))}
            </Stack>
          </Stack>
          
          <UnstyledButton
            onClick={handleLogout}
            py="xs"
            px="md"
            className="logout-button"
          >
            <Group>
              <ThemeIcon size={30} variant="light" color="red">
                <IconLogout size={20} />
              </ThemeIcon>
              <Text size="sm" c="red">Logout</Text>
            </Group>
          </UnstyledButton>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}