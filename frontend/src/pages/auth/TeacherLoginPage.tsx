import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Paper, Title, TextInput, PasswordInput, 
  Button, Text, Group, Image, Box, Alert
} from '@mantine/core';
import { IconUser, IconLock, IconAlertCircle } from '@tabler/icons-react';
import { login } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { useRoomsStore } from '../../stores/roomsStore';
import { Role } from '../../types';
import logoImage from '../../assets/logo.png';

export default function TeacherLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login: loginAction } = useAuthStore();
  const { selectedRoom } = useRoomsStore();
  const navigate = useNavigate();

  // If no room is selected, redirect back to room selection
  if (!selectedRoom) {
    navigate('/teacher/room-selection');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      setError(null);
      const response = await login({ email, password });
      
      if (response.success) {
        const { accessToken, user } = response.data;
        
        // Verify the user is a teacher
        if (user.role !== Role.TEACHER) {
          setError('Access denied. Teacher credentials required.');
          return;
        }
        
        loginAction(accessToken, user);
        // Pass selected room info to the dashboard
        navigate('/teacher/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Group align="center" mb="md">
        <Image src={logoImage} width={120} alt="Logo" />
      </Group>
      
      <Title ta="center" fw={900}>
        Teacher Login
      </Title>
      <Text color="dimmed" size="sm" ta="center" mt={5}>
        Enter your credentials to access the teacher dashboard
      </Text>

      <Alert icon={<IconAlertCircle size={16} />} color="blue" mt="md">
        <Text size="sm">
          Logging in to manage room: <strong>{selectedRoom.name}</strong>
        </Text>
      </Alert>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && (
          <Text color="red" size="sm" mb="md">
            {error}
          </Text>
        )}

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="teacher@school.edu"
            leftSection={<IconUser size={16} />}
            required
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            leftSection={<IconLock size={16} />}
            required
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
          <Button fullWidth mt="xl" type="submit" loading={loading} color="blue">
            Sign in
          </Button>
        </form>
      </Paper>
      
      <Box mt="md">
        <Text ta="center" size="sm">
          Not a teacher?{' '}
          <Text component="a" href="/role-selection" size="sm" fw={500}>
            Go back to role selection
          </Text>
        </Text>
      </Box>
    </Container>
  );
}