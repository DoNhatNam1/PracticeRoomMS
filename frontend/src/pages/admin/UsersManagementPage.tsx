import { useState, useEffect } from 'react';
import { 
  Container, Title, Group, TextInput, Button, Table, 
  ActionIcon, Badge, Text, Paper, Menu, Select
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconSearch, IconPlus, IconEdit, IconTrash, IconDotsVertical, IconFilter } from '@tabler/icons-react';
import { getUsers, deleteUser } from '../../api/users';
import { Role, User } from '../../types';
import { notifications } from '@mantine/notifications';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      if (response.success) {
        setUsers(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch users',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await deleteUser(id);
        if (response.success) {
          setUsers(users.filter(user => user.id !== id));
          notifications.show({
            title: 'Success',
            message: 'User deleted successfully',
            color: 'green'
          });
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to delete user',
          color: 'red'
        });
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN: return 'blue';
      case Role.TEACHER: return 'green';
      case Role.STUDENT: return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Container size="xl" p="md">
      <Title order={1} mb="md">Users Management</Title>
      
      <Paper p="md" withBorder mb="lg">
        <Group align="apart" mb="md">
          <Group>
            <TextInput
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
            />
            
            <Select
              placeholder="Filter by role"
              value={roleFilter}
              onChange={setRoleFilter}
              clearable
              data={[
                { value: Role.ADMIN, label: 'Admin' },
                { value: Role.TEACHER, label: 'Teacher' },
                { value: Role.STUDENT, label: 'Student' }
              ]}
              leftSection={<IconFilter size={16} />}
            />
          </Group>
          
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={() => navigate('/admin/users/new')}
          >
            Add User
          </Button>
        </Group>
        
        {loading ? (
          <Text ta="center" p="md">Loading users...</Text>
        ) : (
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Department</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredUsers.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                    No users found
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredUsers.map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>{user.name}</Table.Td>
                    <Table.Td>{user.email}</Table.Td>
                    <Table.Td>
                      <Badge color={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{user.department || '-'}</Table.Td>
                    <Table.Td>
                      <Badge color={user.isActive ? 'green' : 'red'}>
                        {user.isActive ? 'Active' : 'Inactive'}
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
                            onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IconTrash size={16} />}
                            onClick={() => handleDeleteUser(user.id)}
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