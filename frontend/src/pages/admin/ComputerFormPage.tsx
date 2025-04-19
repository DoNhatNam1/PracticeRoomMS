import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Container, Title, TextInput, Select, Textarea,
  Button, Group, Box, Paper, LoadingOverlay, Grid
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { IconChevronLeft } from '@tabler/icons-react';
import { createComputer, getComputer, updateComputer } from '../../api/computers';
import { getRooms } from '../../api/rooms';
import { ComputerStatus, Room } from '../../types';

interface ComputerFormValues {
  name: string;
  roomId: number;
  ipAddress?: string;
  macAddress?: string;
  status: ComputerStatus;
  notes?: string;
  specs: {
    cpu?: string;
    ram?: string;
    storage?: string;
    gpu?: string;
    os?: string; // changed from operatingSystem
  };
}

export default function ComputerFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(!!id);
  const [rooms, setRooms] = useState<Room[]>([]);
  const isEditMode = !!id;

  const form = useForm<ComputerFormValues>({
    initialValues: {
      name: '',
      roomId: 0,
      ipAddress: '',
      macAddress: '',
      status: ComputerStatus.OPERATIONAL,
      notes: '',
      specs: {
        cpu: '',
        ram: '',
        storage: '',
        gpu: '',
        os: '',
      }
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Name is too short' : null),
      roomId: (value) => (!value ? 'Room is required' : null),
      ipAddress: (value) => {
        if (!value) return null;
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        return ipRegex.test(value) ? null : 'Invalid IP address format';
      },
      macAddress: (value) => {
        if (!value) return null;
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        return macRegex.test(value) ? null : 'Invalid MAC address format';
      },
    },
  });

  useEffect(() => {
    fetchRooms();
    if (isEditMode) {
      fetchComputer(parseInt(id));
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
      notifications.show({
        title: 'Error',
        message: 'Failed to load rooms',
        color: 'red',
      });
    }
  };

  const fetchComputer = async (computerId: number) => {
    try {
      setInitializing(true);
      const response = await getComputer(computerId);
      
      if (response.success && response.data) {
        const computer = response.data;
        
        // Đảm bảo specs luôn là object
        const specsObj = (() => {
          // Nếu specs không tồn tại, trả về object rỗng
          if (!computer.specs) return {};
          
          // Nếu specs là string, thử parse thành JSON
          if (typeof computer.specs === 'string') {
            try {
              return JSON.parse(computer.specs);
            } catch (e) {
              console.warn('Failed to parse specs string:', e);
              return {};
            }
          }
          
          // Nếu specs đã là object, sử dụng trực tiếp
          return computer.specs;
        })();
        
        // Set giá trị cho form
        form.setValues({
          name: computer.name,
          roomId: computer.roomId,
          ipAddress: computer.ipAddress || '',
          macAddress: computer.macAddress || '',
          status: computer.status,
          notes: computer.notes || '',
          specs: {
            cpu: specsObj.cpu || '',
            ram: specsObj.ram || '',
            storage: specsObj.storage || '',
            gpu: specsObj.gpu || '',
            os: specsObj.os || '',
          }
        });
      } else {
        // Xử lý khi không tìm thấy computer
        notifications.show({
          title: 'Not Found',
          message: response.message || 'Computer not found',
          color: 'yellow',
        });
        navigate('/admin/computers'); // Quay về trang danh sách
      }
    } catch (error) {
      console.error('Error fetching computer:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to load computer data',
        color: 'red',
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleSubmit = async (values: ComputerFormValues) => {
    try {
      setLoading(true);
      
      // Clean up empty values in specs
      const cleanSpecs = Object.fromEntries(
        Object.entries(values.specs).filter(([_, v]) => v !== '')
      );
      
      const computerData = {
        ...values,
        specs: cleanSpecs
      };
      
      const response = isEditMode ? 
        await updateComputer(parseInt(id), computerData) : 
        await createComputer(computerData);
      
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: `Computer ${isEditMode ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        navigate('/admin/computers');
      } else {
        notifications.show({
          title: 'Error',
          message: response.message || `Failed to ${isEditMode ? 'update' : 'create'} computer`,
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error saving computer:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} computer`,
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
            onClick={() => navigate('/admin/computers')}
          >
            Back to Computers
          </Button>
        </Group>
        
        <Paper p="xl" withBorder>
          <Title order={2} mb="xl">{isEditMode ? 'Edit Computer' : 'Create New Computer'}</Title>
          
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid>
              <Grid.Col span={12}>
                <TextInput
                  required
                  label="Computer Name"
                  placeholder="Enter computer name"
                  {...form.getInputProps('name')}
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={12}>
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
                  onChange={(value) => {
                    if (value) {
                      form.setFieldValue('roomId', parseInt(value, 10));
                    }
                  }}
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <TextInput
                  label="IP Address"
                  placeholder="e.g. 192.168.1.100"
                  {...form.getInputProps('ipAddress')}
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <TextInput
                  label="MAC Address"
                  placeholder="e.g. 00:1A:2B:3C:4D:5E"
                  {...form.getInputProps('macAddress')}
                  mb="md"
                />
              </Grid.Col>
            </Grid>
            
            <Title order={4} mt="lg" mb="sm">Hardware Specifications</Title>
            
            <Grid mb="md">
              <Grid.Col span={6}>
                <TextInput
                  label="CPU"
                  placeholder="e.g. Intel Core i7-10700"
                  {...form.getInputProps('specs.cpu')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="RAM"
                  placeholder="e.g. 16GB DDR4"
                  {...form.getInputProps('specs.ram')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Storage"
                  placeholder="e.g. 512GB SSD"
                  {...form.getInputProps('specs.storage')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="GPU"
                  placeholder="e.g. NVIDIA GTX 1660"
                  {...form.getInputProps('specs.gpu')}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput
                  label="Operating System"
                  placeholder="e.g. Windows 11 Pro"
                  {...form.getInputProps('specs.os')}
                />
              </Grid.Col>
            </Grid>
            
            <Select
              required
              label="Status"
              placeholder="Select computer status"
              data={[
                { value: ComputerStatus.OPERATIONAL, label: 'Operational' },
                { value: ComputerStatus.IN_USE, label: 'In Use' },
                { value: ComputerStatus.MAINTENANCE, label: 'Maintenance' },
                { value: ComputerStatus.OUT_OF_ORDER, label: 'Out of Order' },
                { value: ComputerStatus.RESERVED, label: 'Reserved' },
              ]}
              {...form.getInputProps('status')}
              mb="md"
            />
            
            <Textarea
              label="Notes"
              placeholder="Enter additional notes (optional)"
              {...form.getInputProps('notes')}
              mb="xl"
              minRows={3}
            />
            
            <Group justify="space-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/computers')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={loading}
              >
                {isEditMode ? 'Update Computer' : 'Create Computer'}
              </Button>
            </Group>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}