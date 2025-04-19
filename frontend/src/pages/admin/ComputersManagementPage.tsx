import { useState, useEffect } from 'react';
import { 
  Container, Title, Group, TextInput, Button, Table, 
  ActionIcon, Badge, Text, Paper, Menu, Select, Loader
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { 
  IconSearch, IconPlus, IconEdit, IconTrash, 
  IconDotsVertical, IconFilter, IconBuilding 
} from '@tabler/icons-react';
import { getComputers, deleteComputer } from '../../api/computers';
import { getRooms } from '../../api/rooms';
import { ComputerStatus, Room, Computer } from '../../types';
import { notifications } from '@mantine/notifications';

export default function ComputersManagementPage() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
    fetchComputers();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await getRooms({});
      if (response.success) {
        setRooms(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchComputers = async () => {
    try {
      setLoading(true);
      const response = await getComputers({});
      if (response.success) {
        setComputers(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching computers:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch computers',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComputer = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this computer?')) {
      try {
        const response = await deleteComputer(id);
        if (response.success) {
          setComputers(computers.filter(computer => computer.id !== id));
          notifications.show({
            title: 'Success',
            message: 'Computer deleted successfully',
            color: 'green'
          });
        }
      } catch (error) {
        console.error('Error deleting computer:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to delete computer',
          color: 'red'
        });
      }
    }
  };

  const filteredComputers = computers.filter(computer => {
    const matchesSearch = 
      computer.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRoom = !roomFilter || computer.roomId.toString() === roomFilter;
    const matchesStatus = !statusFilter || computer.status === statusFilter;
    
    return matchesSearch && matchesRoom && matchesStatus;
  });

  const getStatusBadgeColor = (status: ComputerStatus) => {
    switch (status) {
      case ComputerStatus.OPERATIONAL: return 'green';
      case ComputerStatus.IN_USE: return 'blue';
      case ComputerStatus.MAINTENANCE: return 'yellow';
      case ComputerStatus.OUT_OF_ORDER: return 'red';
      case ComputerStatus.RESERVED: return 'violet';
      default: return 'gray';
    }
  };

  const getRoomName = (roomId: number) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'Unknown';
  };

  return (
    <Container size="xl" p="md">
      <Title order={1} mb="md">Computers Management</Title>
      
      <Paper p="md" withBorder mb="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <TextInput
              placeholder="Search computers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
            />
            
            <Select
              placeholder="Filter by room"
              value={roomFilter}
              onChange={setRoomFilter}
              clearable
              data={rooms.map(room => ({ 
                value: room.id.toString(), 
                label: `${room.name} (${room.location || 'No location'})` 
              }))}
              leftSection={<IconBuilding size={16} />}
            />
            
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              clearable
              data={[
                { value: ComputerStatus.OPERATIONAL, label: 'Operational' },
                { value: ComputerStatus.IN_USE, label: 'In Use' },
                { value: ComputerStatus.MAINTENANCE, label: 'Maintenance' },
                { value: ComputerStatus.OUT_OF_ORDER, label: 'Out of Order' },
                { value: ComputerStatus.RESERVED, label: 'Reserved' },
              ]}
              leftSection={<IconFilter size={16} />}
            />
          </Group>
          
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={() => navigate('/admin/computers/new')}
          >
            Add Computer
          </Button>
        </Group>
        
        {loading ? (
          <Group justify="center" p="xl">
            <Loader size="md" />
          </Group>
        ) : (
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name / ID</Table.Th>
                <Table.Th>Room</Table.Th>
                <Table.Th>Model</Table.Th>
                <Table.Th>Specifications</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredComputers.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                    No computers found
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredComputers.map((computer) => (
                  <Table.Tr key={computer.id}>
                    <Table.Td>
                      <Text fw={500}>{computer.name}</Text>
                      <Text size="xs" c="dimmed">ID: {computer.id}</Text>
                    </Table.Td>
                    <Table.Td>{getRoomName(computer.roomId)}</Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {computer.specs ? (
                          <>
                            CPU: {computer.specs.cpu || 'N/A'}<br />
                            RAM: {computer.specs.ram || 'N/A'}<br />
                            Storage: {computer.specs.storage || 'N/A'}
                          </>
                        ) : (
                          'No specifications available'
                        )}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getStatusBadgeColor(computer.status)}>
                        {computer.status}
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
                            onClick={() => navigate(`/admin/computers/edit/${computer.id}`)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IconTrash size={16} />}
                            onClick={() => handleDeleteComputer(computer.id)}
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