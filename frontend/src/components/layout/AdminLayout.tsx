import { Outlet } from 'react-router-dom';
import { AppShell, Text, Group, Avatar, ThemeIcon, UnstyledButton, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { 
  IconDashboard, IconUsers, IconDoor, IconDeviceDesktop, 
  IconCalendarEvent, IconFileAnalytics, IconUser, IconLogout
} from '@tabler/icons-react';
import { useAuthStore } from '../../stores/authStore';
import './AdminLayout.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const handleLogout = () => {
    logout();
    navigate('/role-selection');
  };
  
  const menuItems = [
    { icon: <IconDashboard size={20} />, label: 'Dashboard', path: '/admin' },
    { icon: <IconUsers size={20} />, label: 'Users', path: '/admin/users' },
    { icon: <IconDoor size={20} />, label: 'Rooms', path: '/admin/rooms' },
    { icon: <IconDeviceDesktop size={20} />, label: 'Computers', path: '/admin/computers' },
    { icon: <IconCalendarEvent size={20} />, label: 'Schedules', path: '/admin/schedules' },
    { icon: <IconFileAnalytics size={20} />, label: 'System Logs', path: '/admin/logs' },
    { icon: <IconUser size={20} />, label: 'Profile', path: '/admin/profile' },
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
          <Text fw={700} size="lg">Practice Room Management System</Text>
          
          <Group>
            <Text fw={500}>{user?.name || 'Admin User'}</Text>
            <Avatar color="blue" radius="xl">
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <Stack h="100%" justify="space-between">
          <Stack gap={0}>
            {menuItems.map((item, index) => (
              <UnstyledButton
                key={index}
                className="admin-menu-item"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  marginBottom: 5,
                }}
                onClick={() => navigate(item.path)}
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
          
          <UnstyledButton
            className="admin-logout-button"
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 12px',
              borderRadius: '4px',
            }}
            onClick={handleLogout}
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