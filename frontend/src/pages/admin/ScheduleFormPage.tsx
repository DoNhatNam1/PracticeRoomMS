import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Container, Title, TextInput, Select, Button, 
  Group, Box, Paper, LoadingOverlay, Grid
} from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { IconChevronLeft, IconCalendar, IconClock } from '@tabler/icons-react';
import { createSchedule, getSchedule, updateSchedule } from '../../api/schedules';
import { getRooms } from '../../api/rooms';
import { ScheduleStatus, RepeatType } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { format } from 'date-fns';

interface ScheduleFormValues {
  title: string;
  roomId: number;
  startDate: Date | null;
  startTime: string;
  endTime: string;
  repeat: RepeatType;
  status: ScheduleStatus;
}

export default function ScheduleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(!!id);
  const [rooms, setRooms] = useState<any[]>([]);
  const { user } = useAuthStore();
  const isEditMode = !!id;

  const form = useForm<ScheduleFormValues>({
    initialValues: {
      title: '',
      roomId: 0,
      startDate: new Date(),
      startTime: '09:00',
      endTime: '10:00',
      repeat: RepeatType.NONE,
      status: ScheduleStatus.PENDING,
    },
    validate: {
      title: (value) => (value.trim().length < 2 ? 'Title is too short' : null),
      roomId: (value) => (!value ? 'Room is required' : null),
      startDate: (value) => (!value ? 'Start date is required' : null),
      startTime: (value) => (!value ? 'Start time is required' : null),
      endTime: (value) => {
        if (!value) return 'End time is required';
        
        if (form.values.startDate && form.values.startTime && value) {
          const startDateTime = combineDateAndTime(form.values.startDate, form.values.startTime);
          const endDateTime = combineDateAndTime(form.values.startDate, value);
          
          return startDateTime >= endDateTime 
            ? 'End time must be after start time' 
            : null;
        }
        
        return null;
      },
    },
  });

  useEffect(() => {
    fetchRooms();
    
    if (isEditMode) {
      fetchSchedule(parseInt(id));
    }
  }, [id]);

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

  const fetchSchedule = async (scheduleId: number) => {
    try {
      setInitializing(true);
      const response = await getSchedule(scheduleId);
      if (response.success) {
        const schedule = response.data;
        
        const startDate = new Date(schedule.startTime);
        const startTimeStr = format(new Date(schedule.startTime), 'HH:mm');
        const endTimeStr = format(new Date(schedule.endTime), 'HH:mm');
        
        form.setValues({
          title: schedule.title,
          roomId: schedule.roomId,
          startDate,
          startTime: startTimeStr,
          endTime: endTimeStr,
          repeat: schedule.repeat || RepeatType.NONE,
          status: schedule.status,
        });
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load schedule data',
        color: 'red',
      });
    } finally {
      setInitializing(false);
    }
  };

  // Helper function to combine date and time
  const combineDateAndTime = (date: Date, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  const handleSubmit = async (values: ScheduleFormValues) => {
    if (!values.startDate) {
      notifications.show({
        title: 'Error',
        message: 'Start date is required',
        color: 'red',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Combine date and time to create startTime and endTime
      const startDateTime = combineDateAndTime(values.startDate, values.startTime);
      const endDateTime = combineDateAndTime(values.startDate, values.endTime);
      
      const payload = {
        title: values.title,
        roomId: values.roomId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        repeat: values.repeat,
        status: values.status,
        createdBy: user?.id || 0,
      };
      
      const response = isEditMode ? 
        await updateSchedule(parseInt(id), payload) : 
        await createSchedule(payload);
      
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: `Schedule ${isEditMode ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        navigate('/admin/schedules');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      notifications.show({
        title: 'Error',
        message: `Failed to ${isEditMode ? 'update' : 'create'} schedule`,
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
            onClick={() => navigate('/admin/schedules')}
          >
            Back to Schedules
          </Button>
        </Group>
        
        <Paper p="xl" withBorder>
          <Title order={2} mb="xl">{isEditMode ? 'Edit Schedule' : 'Create New Schedule'}</Title>
          
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              required
              label="Schedule Title"
              placeholder="Enter schedule title"
              {...form.getInputProps('title')}
              mb="md"
            />
            
            <Select
              required
              label="Room"
              placeholder="Select room"
              data={rooms.map(room => ({ 
                value: room.id.toString(), 
                label: `${room.name} (${room.location || 'No location'})` 
              }))}
              {...form.getInputProps('roomId')}
              mb="md"
              onChange={(value) => form.setFieldValue('roomId', parseInt(value || '0'))}
            />
            
            <Grid mb="md">
              <Grid.Col span={4}>
                <DatePickerInput
                  required
                  label="Date"
                  placeholder="Select date"
                  leftSection={<IconCalendar size={16} />}
                  {...form.getInputProps('startDate')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TimeInput
                  required
                  label="Start Time"
                  placeholder="09:00"
                  leftSection={<IconClock size={16} />}
                  {...form.getInputProps('startTime')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TimeInput
                  required
                  label="End Time"
                  placeholder="10:00"
                  leftSection={<IconClock size={16} />}
                  {...form.getInputProps('endTime')}
                />
              </Grid.Col>
            </Grid>
            
            <Grid mb="md">
              <Grid.Col span={6}>
                <Select
                  required
                  label="Repeat"
                  placeholder="Select repeat type"
                  data={[
                    { value: RepeatType.NONE, label: 'None' },
                    { value: RepeatType.DAILY, label: 'Daily' },
                    { value: RepeatType.WEEKLY, label: 'Weekly' },
                    { value: RepeatType.MONTHLY, label: 'Monthly' },
                  ]}
                  {...form.getInputProps('repeat')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  required
                  label="Status"
                  placeholder="Select status"
                  data={[
                    { value: ScheduleStatus.PENDING, label: 'Pending' },
                    { value: ScheduleStatus.APPROVED, label: 'Approved' },
                    { value: ScheduleStatus.COMPLETED, label: 'Completed' },
                    { value: ScheduleStatus.REJECTED, label: 'Rejected' },
                    { value: ScheduleStatus.CANCELLED, label: 'Cancelled' },
                  ]}
                  {...form.getInputProps('status')}
                />
              </Grid.Col>
            </Grid>
            
            <Group justify="space-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/schedules')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={loading}
              >
                {isEditMode ? 'Update Schedule' : 'Create Schedule'}
              </Button>
            </Group>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}