import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Container, Title, TextInput, PasswordInput, Select, Switch,
  Button, Group, Box, Paper, LoadingOverlay
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { IconChevronLeft } from '@tabler/icons-react';
import { createUser, getUser, updateUser } from '../../api/users';
import { Role } from '../../types';

interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  isActive: boolean;
}

export default function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(!!id);
  const isEditMode = !!id;

  const form = useForm<UserFormValues>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      role: Role.STUDENT,
      department: '',
      isActive: true,
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Name is too short' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (!isEditMode && value.length < 6 ? 'Password should be at least 6 characters' : null),
    },
  });

  useEffect(() => {
    if (isEditMode) {
      fetchUser(parseInt(id));
    }
  }, [id]);

  const fetchUser = async (userId: number) => {
    try {
      setInitializing(true);
      // Thay getUserById bằng getUser
      const response = await getUser(userId);
      if (response.success) {
        const user = response.data;
        form.setValues({
          name: user.name,
          email: user.email,
          password: '', // Don't fill password for security
          role: user.role,
          department: user.department || '',
          isActive: user.isActive,
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load user data',
        color: 'red',
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleSubmit = async (values: UserFormValues) => {
    try {
      setLoading(true);
      
      // If empty password in edit mode, remove it from payload
      const payload = isEditMode && !values.password ? 
        { ...values, password: undefined } : 
        values;
      
      const response = isEditMode ? 
        await updateUser(parseInt(id), payload) : 
        await createUser(payload);
      
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: `User ${isEditMode ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        navigate('/admin/users');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      notifications.show({
        title: 'Error',
        message: `Failed to ${isEditMode ? 'update' : 'create'} user`,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="md" p="md">
      <Box pos="relative">
        <LoadingOverlay visible={initializing} />
        
        <Group mb="md">
          <Button 
            variant="subtle" 
            leftSection={<IconChevronLeft size={16} />}
            onClick={() => navigate('/admin/users')}
          >
            Back to Users
          </Button>
        </Group>
        
        <Paper p="xl" withBorder>
          <Title order={2} mb="xl">{isEditMode ? 'Edit User' : 'Create New User'}</Title>
          
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              required
              label="Full Name"
              placeholder="Enter full name"
              {...form.getInputProps('name')}
              mb="md"
            />
            
            <TextInput
              required
              label="Email"
              placeholder="user@example.com"
              {...form.getInputProps('email')}
              mb="md"
            />
            
            <PasswordInput
              label={isEditMode ? "Password (leave empty to keep current)" : "Password"}
              placeholder="Enter password"
              {...form.getInputProps('password')}
              mb="md"
              required={!isEditMode}
            />
            
            <Select
              required
              label="Role"
              placeholder="Select user role"
              data={[
                { value: Role.ADMIN, label: 'Admin' },
                { value: Role.TEACHER, label: 'Teacher' },
                { value: Role.STUDENT, label: 'Student' },
              ]}
              {...form.getInputProps('role')}
              mb="md"
            />
            
            <TextInput
              label="Department"
              placeholder="Enter department or leave empty"
              {...form.getInputProps('department')}
              mb="md"
            />
            
            <Switch
              label="Active Account"
              {...form.getInputProps('isActive', { type: 'checkbox' })}
              mb="xl"
            />
            
            <Group justify="space-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/users')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={loading}
              >
                {isEditMode ? 'Update User' : 'Create User'}
              </Button>
            </Group>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}