import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Title, Text, Card, Button, Badge, 
  Group, Loader, Grid, Paper, useMantineTheme
} from '@mantine/core';
import { IconDeviceDesktop, IconArrowLeft } from '@tabler/icons-react';
import { useRoomsStore } from '../../stores/roomsStore';
import { getRoomComputers } from '../../api/rooms';
import { ComputerStatus } from '../../types';

export default function ComputerSelectionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useMantineTheme();
  const { selectedRoom, setSelectedComputer } = useRoomsStore();
  const [computers, setComputers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedRoom) {
      navigate('/student/select-room');
      return;
    }

    const fetchComputers = async () => {
      try {
        setLoading(true);
        const response = await getRoomComputers(selectedRoom.id);
        if (response.success) {
          setComputers(response.data.items);
        } else {
          setError('Failed to fetch computers');
        }
      } catch (err) {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchComputers();
  }, [selectedRoom, navigate]);

  const handleComputerSelect = (computer: any) => {
    setSelectedComputer(computer);
    navigate('/student/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ComputerStatus.OPERATIONAL: return theme.colors.green[6];
      case ComputerStatus.IN_USE: return theme.colors.red[6];
      case ComputerStatus.MAINTENANCE: return theme.colors.orange[6];
      default: return theme.colors.gray[6];
    }
  };

  return (
    <Container py="xl" size="xl">
      <Group mb="xl">
        <Button 
          variant="subtle" 
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/student/select-room')}
        >
          Back to Rooms
        </Button>
      </Group>

      <Title order={1} ta="center" mb="md">Select a Computer</Title>
      <Text ta="center" size="lg" mb="xl" color="dimmed">
        Room: {selectedRoom?.name}
      </Text>

      {loading ? (
        <Group align="center">
          <Loader size="lg" />
        </Group>
      ) : error ? (
        <Text color="red" ta="center">{error}</Text>
      ) : (
        <>
          <Paper shadow="xs" p="md" withBorder mb="xl">
            <Group align="apart">
              <Group>
                <Badge color="green">Available</Badge>
                <Badge color="red">In Use</Badge>
                <Badge color="orange">Maintenance</Badge>
              </Group>
              <Text size="sm">Total computers: {computers.length}</Text>
            </Group>
          </Paper>

          <Grid>
            {computers.map((computer) => (
              <Grid.Col key={computer.id} span={{ base: 3, sm: 3, md: 2 }}>
                <Card 
                  shadow="sm" 
                  p="md" 
                  radius="md" 
                  withBorder
                  style={{ 
                    opacity: computer.status !== ComputerStatus.OPERATIONAL ? 0.7 : 1,
                    cursor: computer.status === ComputerStatus.OPERATIONAL ? 'pointer' : 'not-allowed'
                  }}
                  onClick={() => {
                    if (computer.status === ComputerStatus.OPERATIONAL) {
                      handleComputerSelect(computer);
                    }
                  }}
                >
                  <Group align="center" mb="sm">
                    <IconDeviceDesktop 
                      size={48} 
                      color={getStatusColor(computer.status)} 
                    />
                  </Group>
                  <Text ta="center" fw={500}>{computer.name}</Text>
                  <Badge 
                    fullWidth 
                    color={computer.status === ComputerStatus.OPERATIONAL ? 'green' : 
                           computer.status === ComputerStatus.IN_USE ? 'red' : 'orange'}
                    mt="sm"
                  >
                    {computer.status}
                  </Badge>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
}