import { useState } from 'react';
import { 
  Container, Grid, Paper, Text, Title, Group, Badge, Button, 
  Card, Progress, Stack, Avatar, Divider, List, ThemeIcon
} from '@mantine/core';
import { 
  IconClock, IconDeviceDesktop, IconMapPin, IconUser, 
  IconDoorExit, IconClockPlay, IconBookmark, IconCheck, 
  IconMessageCircle, IconHeadphones
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useRoomsStore } from '../../stores/roomsStore';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { selectedRoom, selectedComputer } = useRoomsStore();
  const [sessionStartTime] = useState(new Date());
  const navigate = useNavigate();
  
  // Mock current class
  const currentClass = {
    title: "Advanced Music Theory",
    teacher: "Dr. Elizabeth Blackwell",
    startTime: new Date(),
    endTime: new Date(Date.now() + 90 * 60 * 1000), // 1.5 hours from now
  };

  // Mock assignments
  const assignments = [
    { id: 1, title: "Music Composition Exercise", dueDate: "Today", completed: true },
    { id: 2, title: "Harmony Analysis", dueDate: "Tomorrow", completed: false },
    { id: 3, title: "Sound Engineering Project", dueDate: "Next Week", completed: false },
  ];

  // Calculate session duration
  const sessionDuration = Math.floor((Date.now() - sessionStartTime.getTime()) / 60000); // in minutes
  
  // Calculate class time remaining
  const totalClassMinutes = (currentClass.endTime.getTime() - currentClass.startTime.getTime()) / 60000;
  const elapsedMinutes = (Date.now() - currentClass.startTime.getTime()) / 60000;
  const percentComplete = Math.min(Math.round((elapsedMinutes / totalClassMinutes) * 100), 100);
  const minutesRemaining = Math.max(0, Math.round(totalClassMinutes - elapsedMinutes));

  // Handle logout (end computer usage)
  const handleLogout = () => {
    // API call to end computer usage would go here
    
    // Redirect to login using React Router navigate
    navigate('/student/select-room');
  };

  // If no room or computer was selected, show a message
  if (!selectedRoom || !selectedComputer) {
    return (
      <Container size="sm" py="xl">
        <Paper p="xl" shadow="md" withBorder>
          <Title order={3} ta="center">No Computer Selected</Title>
          <Text ta="center" mt="md">
            You haven't selected a computer. Please go back to the room selection page.
          </Text>
          <Group align="center" mt="xl">
            <Button onClick={() => navigate('/student/select-room')} color="green">
              Select a Room
            </Button>
          </Group>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Paper shadow="sm" p="lg" withBorder mb="lg">
        <Group align="apart">
          <Group>
            <Avatar color="green" radius="xl" size="lg">
              {user?.name?.charAt(0) || 'S'}
            </Avatar>
            <div>
              <Text size="lg" fw={600}>{user?.name}</Text>
              <Text size="xs" color="dimmed">{user?.email}</Text>
            </div>
          </Group>
          
          <Group>
            <div>
              <Group gap="xs">
                <IconMapPin size={16} color="gray" />
                <Text size="sm">{selectedRoom.name}</Text>
              </Group>
              <Group gap="xs">
                <IconDeviceDesktop size={16} color="gray" />
                <Text size="sm">{selectedComputer.name}</Text>
              </Group>
            </div>
            
            <Button leftSection={<IconDoorExit size={16} />} color="red" onClick={handleLogout}>
              End Session
            </Button>
          </Group>
        </Group>
      </Paper>

      <Grid>
        {/* Current Session Card */}
        <Grid.Col span={8}>
          <Paper p="md" shadow="xs" withBorder>
            <Group align="apart" mb="lg">
              <Title order={4}>Current Session</Title>
              <Group gap="xs">
                <IconClock size={16} />
                <Text size="sm">Active for {sessionDuration} minutes</Text>
              </Group>
            </Group>
            
            <Grid>
              <Grid.Col span={6}>
                <Card withBorder p="md">
                  <Card.Section p="md" withBorder>
                    <Group align="apart">
                      <Title order={5}>{currentClass.title}</Title>
                      <Badge color="green">In Progress</Badge>
                    </Group>
                  </Card.Section>
                  
                  <Group mt="md" mb="xs">
                    <IconUser size={16} />
                    <Text size="sm">{currentClass.teacher}</Text>
                  </Group>
                  
                  <Group gap="xs" mb="md">
                    <IconClockPlay size={16} />
                    <Text size="sm">
                      {minutesRemaining} minutes remaining
                    </Text>
                  </Group>
                  
                  <Text size="sm" color="dimmed" mb="xs">Class Progress</Text>
                  <Progress value={percentComplete} size="sm" mb="md" />
                  
                  <Button variant="light" fullWidth>View Class Materials</Button>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Card withBorder p="md" h="100%">
                  <Title order={5} mb="md">Assignment Progress</Title>
                  
                  <List spacing="xs">
                    {assignments.map((assignment) => (
                      <List.Item 
                        key={assignment.id}
                        icon={
                          <ThemeIcon color={assignment.completed ? 'green' : 'gray'} size={24} radius="xl">
                            <IconCheck size={16} />
                          </ThemeIcon>
                        }
                      >
                        <Group align="apart">
                          <Text size="sm">{assignment.title}</Text>
                          <Badge size="sm" color={
                            assignment.dueDate === 'Today' ? 'red' : 
                            assignment.dueDate === 'Tomorrow' ? 'orange' : 'blue'
                          }>
                            {assignment.dueDate}
                          </Badge>
                        </Group>
                      </List.Item>
                    ))}
                  </List>
                  
                  <Button variant="subtle" fullWidth mt="md">View All Assignments</Button>
                </Card>
              </Grid.Col>
            </Grid>
          </Paper>
        </Grid.Col>

        {/* Quick Actions Card */}
        <Grid.Col span={4}>
          <Paper p="md" shadow="xs" withBorder h="100%">
            <Title order={4} mb="lg">Quick Actions</Title>
            
            <Stack align="md">
              <Button leftSection={<IconBookmark size={16} />} fullWidth variant="light">
                Access Resources
              </Button>
              <Button leftSection={<IconHeadphones size={16} />} fullWidth variant="light">
                Open Digital Audio Workstation
              </Button>
              <Button leftSection={<IconMessageCircle size={16} />} fullWidth variant="light">
                Message Teacher
              </Button>
              
              <Divider my="sm" />
              
              <Card withBorder p="sm">
                <Text size="sm" fw={500} mb="xs">Session Time Limit</Text>
                <Text size="xs" color="dimmed" mb="xs">Your session will automatically end at:</Text>
                <Text fw={600}>
                  {new Date(sessionStartTime.getTime() + 3 * 60 * 60 * 1000) // 3 hours
                    .toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </Card>
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Recent Activities & Resources */}
        <Grid.Col span={12}>
          <Paper p="md" shadow="xs" withBorder>
            <Title order={4} mb="md">Available Resources</Title>
            <Grid>
              {['Music Composition Software', 'Audio Editing Tools', 'Musical Score Library', 'Practice Recordings'].map((resource, i) => (
                <Grid.Col span={3} key={i}>
                  <Card withBorder p="md">
                    <Text fw={500} mb="xs">{resource}</Text>
                    <Button variant="subtle" fullWidth size="xs">Open</Button>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}