import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Title, Text, Grid, Card, Badge, Group, 
  Button, Skeleton, TextInput, Select
} from '@mantine/core';
import { IconSearch, IconBuilding, IconDeviceDesktop } from '@tabler/icons-react';
import { getRooms } from '../../api/rooms';
import { Room, RoomStatus } from '../../types';

export default function RoomSelectionPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await getRooms({ status: RoomStatus.AVAILABLE });
        if (response.success) {
          setRooms(response.data.items);
          
          // Extract unique locations for filter
          const uniqueLocations = Array.from(
            new Set(response.data.items
              .map(room => room.location)
              .filter(Boolean) as string[]
            )
          );
          setLocations(uniqueLocations);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleRoomSelect = (roomId: number) => {
    navigate(`/student/select-computer/${roomId}`);
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.location?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesLocation = 
      !locationFilter || room.location === locationFilter;
    
    return matchesSearch && matchesLocation;
  });

  const getRoomStatusColor = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return 'green';
      case RoomStatus.IN_USE:
        return 'blue';
      case RoomStatus.MAINTENANCE:
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} ta="center" mb="sm">Select a Practice Room</Title>
      <Text ta="center" color="dimmed" mb="xl">
        Choose a practice room to continue to computer selection
      </Text>

      <Group justify="space-between" mb="md">
        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filter by location"
          leftSection={<IconBuilding size={16} />}
          clearable
          data={locations.map(location => ({ value: location, label: location }))}
          value={locationFilter}
          onChange={setLocationFilter}
          style={{ width: 250 }}
        />
      </Group>

      {loading ? (
        <Grid>
          {[1, 2, 3, 4, 5, 6].map((_, i) => (
            <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
              <Skeleton height={160} radius="md" mb="md" />
            </Grid.Col>
          ))}
        </Grid>
      ) : filteredRooms.length === 0 ? (
        <Text ta="center" mt="xl">
          No available practice rooms found. Please try different search criteria.
        </Text>
      ) : (
        <Grid>
          {filteredRooms.map((room) => (
            <Grid.Col key={room.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>{room.name}</Text>
                  <Badge color={getRoomStatusColor(room.status)}>
                    {room.status.replace('_', ' ')}
                  </Badge>
                </Group>

                <Text size="sm" color="dimmed" mb="md">
                  <Group gap="xs">
                    <IconBuilding size={16} />
                    <span>{room.location || 'No location specified'}</span>
                  </Group>
                </Text>

                <Text size="sm" mb="md">
                  <Group gap="xs">
                    <IconDeviceDesktop size={16} />
                    <span>Capacity: {room.capacity} computers</span>
                  </Group>
                </Text>

                {room.description && (
                  <Text size="sm" color="dimmed" mb="md">
                    {room.description}
                  </Text>
                )}

                <Button 
                  variant="light" 
                  color="blue" 
                  fullWidth 
                  mt="md" 
                  radius="md"
                  onClick={() => handleRoomSelect(room.id)}
                  disabled={room.status !== RoomStatus.AVAILABLE}
                >
                  {room.status === RoomStatus.AVAILABLE 
                    ? 'Select Room' 
                    : room.status === RoomStatus.MAINTENANCE 
                      ? 'Under Maintenance' 
                      : 'Currently In Use'}
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      <Group justify="center" mt="xl">
        <Button variant="subtle" onClick={() => navigate('/role-selection')}>
          Back to Role Selection
        </Button>
      </Group>
    </Container>
  );
}