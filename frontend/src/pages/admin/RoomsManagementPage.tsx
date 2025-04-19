import { useState, useEffect } from 'react';
import { 
  Container, Title, Group, TextInput, Button, Table, 
  ActionIcon, Badge, Text, Paper, Menu, Select
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { 
  IconSearch, IconPlus, IconEdit, IconTrash, 
  IconDotsVertical, IconFilter, IconBuilding 
} from '@tabler/icons-react';
import { getRooms, deleteRoom } from '../../api/rooms';
import { Room, RoomStatus } from '../../types';
import { notifications } from '@mantine/notifications';

export default function RoomsManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<string | null>(null);
  const [buildings, setBuildings] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await getRooms({});
      if (response.success) {
        setRooms(response.data.items);
        
        // Extract unique buildings for filter
        const uniqueBuildings = Array.from(
          new Set(response.data.items.map(room => room.building))
        );
        setBuildings(uniqueBuildings);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch rooms',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const response = await deleteRoom(id);
        if (response.success) {
          setRooms(rooms.filter(room => room.id !== id));
          notifications.show({
            title: 'Success',
            message: 'Room deleted successfully',
            color: 'green'
          });
        }
      } catch (error) {
        console.error('Error deleting room:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to delete room',
          color: 'red'
        });
      }
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.building.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBuilding = 
      !buildingFilter || room.building === buildingFilter;
    
    return matchesSearch && matchesBuilding;
  });

  const getStatusBadgeColor = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE: return 'green';
      case RoomStatus.OCCUPIED: return 'yellow';
      case RoomStatus.MAINTENANCE: return 'red';
      case RoomStatus.RESERVED: return 'blue';
      default: return 'gray';
    }
  };

  return (
    <Container size="xl" p="md">
      <Title order={1} mb="md">Rooms Management</Title>
      
      <Paper p="md" withBorder mb="lg">
        <Group position="apart" mb="md">
          <Group>
            <TextInput
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
            />
            
            <Select
              placeholder="Filter by building"
              value={buildingFilter}
              onChange={setBuildingFilter}
              clearable
              data={buildings.map(building => ({ value: building, label: building }))}
              leftSection={<IconBuilding size={16} />}
            />
          </Group>
          
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={() => navigate('/admin/rooms/new')}
          >
            Add Room
          </Button>
        </Group>
        
        {loading ? (
          <Text ta="center" p="md">Loading rooms...</Text>
        ) : (
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Building</Table.Th>
                <Table.Th>Floor</Table.Th>
                <Table.Th>Capacity</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredRooms.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                    No rooms found
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredRooms.map((room) => (
                  <Table.Tr key={room.id}>
                    <Table.Td>{room.name}</Table.Td>
                    <Table.Td>{room.building}</Table.Td>
                    <Table.Td>{room.floor}</Table.Td>
                    <Table.Td>{room.capacity}</Table.Td>
                    <Table.Td>
                      <Badge color={getStatusBadgeColor(room.status)}>
                        {room.status.replace('_', ' ')}
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
                            onClick={() => navigate(`/admin/rooms/edit/${room.id}`)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IconTrash size={16} />}
                            onClick={() => handleDeleteRoom(room.id)}
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