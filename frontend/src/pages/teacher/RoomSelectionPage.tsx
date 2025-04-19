import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Text, SimpleGrid, Card, Button, Badge, Group, Loader, Select } from '@mantine/core';
import { IconDoorEnter } from '@tabler/icons-react';
import { useRoomsStore } from '../../stores/roomsStore';
import { getRooms } from '../../api/rooms';
import { RoomStatus } from '../../types';

export default function RoomSelectionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buildingFilter, setBuildingFilter] = useState<string | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);  // Sử dụng local state thay vì store
  const { setSelectedRoom } = useRoomsStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        // Public API - no auth required for room listing
        const response = await getRooms({ status: RoomStatus.AVAILABLE });
        if (response.success) {
          setRooms(response.data.items);
        } else {
          setError('Failed to fetch rooms');
        }
      } catch (err) {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);  // Đã xóa setRooms từ dependency array

  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room);
    navigate('/teacher/login');
  };

  // Extract unique buildings for filter
  const buildings = [...new Set(rooms.map(room => room.building))];
  const filteredRooms = buildingFilter 
    ? rooms.filter(room => room.building === buildingFilter) 
    : rooms;

  return (
    <Container py="xl">
      <Title order={1} ta="center" mb="md">Select a Practice Room</Title>
      <Text ta="center" size="lg" mb="xl" color="dimmed">
        Choose the room you'll be teaching in
      </Text>

      {loading ? (
        <Group align="center">
          <Loader size="lg" />
        </Group>
      ) : error ? (
        <Text color="red" ta="center">{error}</Text>
      ) : (
        <>
          <Group align="right" mb="md">
            <Select
              label="Filter by building"
              placeholder="All buildings"
              clearable
              data={buildings.map(building => ({ value: building, label: building }))}
              value={buildingFilter}
              onChange={setBuildingFilter}
              style={{ width: 200 }}
            />
          </Group>

          <SimpleGrid 
            cols={3} 
            spacing="lg" 
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
            }}
          >
            {filteredRooms.map((room) => (
              <Card key={room.id} shadow="sm" p="lg" radius="md" withBorder>
                <Group align="apart" mb="xs">
                  <Title order={3}>{room.name}</Title>
                  <Badge color="green">{room.status}</Badge>
                </Group>
                <Text size="sm" color="dimmed" mb="md">
                  {room.building}, Floor {room.floor}
                </Text>
                <Text size="sm" mb="md">
                  Capacity: {room.capacity} students
                </Text>
                <Group align="apart" mt="md">
                  <Text size="xs" color="dimmed">
                    {room.computers?.length || 0} computers available
                  </Text>
                  <Button 
                    rightSection={<IconDoorEnter size={16} />}
                    color="blue" 
                    onClick={() => handleRoomSelect(room)}
                  >
                    Select
                  </Button>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </>
      )}
    </Container>
  );
}