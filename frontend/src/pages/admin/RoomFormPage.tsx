import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Container, Title, TextInput, NumberInput, Select, Switch,
  Button, Group, Box, Paper, LoadingOverlay, Textarea
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { IconChevronLeft } from '@tabler/icons-react';
import { createRoom, getRoomById, updateRoom } from '../../api/rooms';
import { RoomStatus, RoomType } from '../../types';

interface RoomFormValues {
  name: string;
  location: string;
  capacity: number;
  description: string;
  isActive: boolean;
  status: RoomStatus;
  type: RoomType;
}

export default function RoomFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(!!id);
  const isEditMode = !!id;

  const form = useForm<RoomFormValues>({
    initialValues: {
      name: '',
      location: '',
      capacity: 1,
      description: '',
      isActive: true,
      status: RoomStatus.AVAILABLE,
      type: RoomType.PRACTICE
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Name is too short' : null),
      location: (value) => (value.trim().length < 2 ? 'Location is required' : null),
      capacity: (value) => (value < 1 ? 'Capacity must be at least 1' : null),
    },
  });

  useEffect(() => {
    if (isEditMode) {
      fetchRoom(parseInt(id));
    }
  }, [id]);

  const fetchRoom = async (roomId: number) => {
    try {
      setInitializing(true);
      const response = await getRoomById(roomId);
      if (response.success) {
        const room = response.data;
        form.setValues({
          name: room.name,
          location: room.location || '',
          capacity: room.capacity,
          description: room.description || '',
          isActive: room.isActive,
          status: room.status
        });
      }
    } catch (error) {
      console.error('Error fetching room:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load room data',
        color: 'red',
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleSubmit = async (values: RoomFormValues) => {
    try {
      setLoading(true);
      
      const response = isEditMode ? 
        await updateRoom(parseInt(id), values) : 
        await createRoom(values);
      
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: `Room ${isEditMode ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        navigate('/admin/rooms');
      }
    } catch (error) {
      console.error('Error saving room:', error);
      notifications.show({
        title: 'Error',
        message: `Failed to ${isEditMode ? 'update' : 'create'} room`,
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
            onClick={() => navigate('/admin/rooms')}
          >
            Back to Rooms
          </Button>
        </Group>
        
        <Paper p="xl" withBorder>
          <Title order={2} mb="xl">{isEditMode ? 'Edit Room' : 'Create New Room'}</Title>
          
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              required
              label="Room Name"
              placeholder="Enter room name"
              {...form.getInputProps('name')}
              mb="md"
            />
            
            <TextInput
              required
              label="Location"
              placeholder="Building and room location (e.g. Building A, Floor 2)"
              {...form.getInputProps('location')}
              mb="md"
            />
            
            <Group grow mb="md">
              <NumberInput
                required
                label="Capacity (computers)"
                placeholder="Enter capacity"
                min={1}
                {...form.getInputProps('capacity')}
              />
              
              <Select
                required
                label="Room Type"
                placeholder="Select room type"
                data={[
                  { value: RoomType.PRACTICE, label: 'Practice Room' },
                  { value: RoomType.CLASSROOM, label: 'Classroom' },
                  { value: RoomType.STUDIO, label: 'Studio' },
                  { value: RoomType.LAB, label: 'Computer Lab' },
                ]}
                {...form.getInputProps('type')}
              />
            </Group>
            
            <Select
              required
              label="Status"
              placeholder="Select room status"
              data={[
                { value: RoomStatus.AVAILABLE, label: 'Available' },
                { value: RoomStatus.IN_USE, label: 'In Use' },
                { value: RoomStatus.MAINTENANCE, label: 'Maintenance' },
              ]}
              {...form.getInputProps('status')}
              mb="md"
            />
            
            <Switch
              label="Active"
              description="Inactive rooms will not be available for scheduling"
              checked={form.values.isActive}
              onChange={(event) => form.setFieldValue('isActive', event.currentTarget.checked)}
              mb="md"
            />
            
            <Textarea
              label="Description"
              placeholder="Enter room description (optional)"
              {...form.getInputProps('description')}
              mb="xl"
              minRows={3}
            />
            
            <Group justify="space-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/rooms')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={loading}
              >
                {isEditMode ? 'Update Room' : 'Create Room'}
              </Button>
            </Group>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}