import { Outlet, useParams, useNavigate } from "react-router-dom";
import {
  AppShell,
  Text,
  Group,
  Avatar,
  ThemeIcon,
  UnstyledButton,
  Badge,
  Stack,
} from "@mantine/core";
import {
  IconDashboard,
  IconCalendarEvent,
  IconDeviceDesktop,
  IconFiles,
  IconUser,
  IconLogout,
} from "@tabler/icons-react";
import "./TeacherLayout.css";
import { useAuthStore } from "../../stores/authStore";
import { useEffect, useState } from "react";
import { getRooms } from "../../api/rooms";
import { getComputers } from "../../api/computers";
import { Room, Computer } from "../../types";

export default function StudentLayout() {
  const { roomId, computerId } = useParams<{
    roomId: string;
    computerId: string;
  }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [room, setRoom] = useState<Room | null>(null);
  const [computer, setComputer] = useState<Computer | null>(null);

  useEffect(() => {
    if (roomId) {
      // Sử dụng getRooms với filter và lọc kết quả
      getRooms({ limit: 100 })
        .then((response) => {
          if (response.success) {
            const roomData = response.data.items.find(r => r.id === parseInt(roomId));
            if (roomData) {
              setRoom(roomData);
            }
          }
        })
        .catch((error) => console.error("Failed to load room:", error));
    }

    if (computerId) {
      // Sử dụng getComputers với filter và lọc kết quả
      getComputers({ limit: 100 })
        .then((response) => {
          if (response.success) {
            const computerData = response.data.items.find(c => c.id === parseInt(computerId));
            if (computerData) {
              setComputer(computerData);
            }
          }
        })
        .catch((error) => console.error("Failed to load computer:", error));
    }
  }, [roomId, computerId]);

  const handleLogout = () => {
    logout();
    navigate("/role-selection");
  };

  const menuItems = [
    {
      icon: <IconDashboard size={20} />,
      label: "Dashboard",
      path: `/student/${roomId}/${computerId}`,
    },
    {
      icon: <IconCalendarEvent size={20} />,
      label: "My Schedules",
      path: `/student/${roomId}/${computerId}/schedules`,
    },
    {
      icon: <IconDeviceDesktop size={20} />,
      label: "Computer Usage",
      path: `/student/${roomId}/${computerId}/usage`,
    },
    {
      icon: <IconFiles size={20} />,
      label: "Resources",
      path: `/student/${roomId}/${computerId}/resources`,
    },
    {
      icon: <IconUser size={20} />,
      label: "Profile",
      path: `/student/${roomId}/${computerId}/profile`,
    },
  ];

  return (
    <AppShell
      padding="md"
      navbar={{
        width: 250,
        breakpoint: "sm",
      }}
      header={{
        height: 60,
      }}
    >
      <AppShell.Header p="xs">
        <Group h="100%" px={20} justify="space-between">
          <Text fw={700} size="lg">
            Practice Room - Student Mode
          </Text>

          <Group>
            <Text fw={500}>{user?.name || "Student"}</Text>
            <Avatar color="orange" radius="xl">
              {user?.name?.charAt(0) || "S"}
            </Avatar>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        {room && computer && (
          <Stack p="xs" mb="md" gap={5}>
            <Group justify="space-between" style={{ width: "100%" }}>
              <Text size="xs" c="dimmed">
                Room
              </Text>
              <Badge color="blue">{room.name}</Badge>
            </Group>
            <Group justify="space-between" style={{ width: "100%" }}>
              <Text size="xs" c="dimmed">
                Computer
              </Text>
              <Badge color="green">{computer.name}</Badge>
            </Group>
          </Stack>
        )}

        {menuItems.map((item, index) => (
          <UnstyledButton
            key={index}
            className="menu-item"
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
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

        <UnstyledButton
          className="logout-button"
          style={{
            display: "block",
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            marginTop: "auto",
          }}
          onClick={handleLogout}
        >
          <Group>
            <ThemeIcon size={30} variant="light" color="red">
              <IconLogout size={20} />
            </ThemeIcon>
            <Text size="sm" c="red">
              Logout
            </Text>
          </Group>
        </UnstyledButton>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
