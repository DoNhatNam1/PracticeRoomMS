import { useState, useEffect } from 'react';
import { 
  Container, Title, Group, TextInput, Table, 
  Badge, Text, Paper, Select, Loader, Box,
  Pagination, Button
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { 
  IconSearch, IconFilter, IconCalendar, 
  IconDownload, IconRefresh
} from '@tabler/icons-react';
import { getSystemLogs } from '../../api/logs';
import { LogLevel, LogType } from '../../types';
import { notifications } from '@mantine/notifications';
import { format } from 'date-fns';

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState<string | null>(null);
  const [logTypeFilter, setLogTypeFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchLogs();
  }, [page, logLevelFilter, logTypeFilter, dateRange]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // Prepare filters
      const filters: any = {
        page,
        limit: itemsPerPage,
      };
      
      if (logLevelFilter) filters.level = logLevelFilter;
      if (logTypeFilter) filters.type = logTypeFilter;
      
      if (dateRange[0] && dateRange[1]) {
        filters.startDate = dateRange[0].toISOString();
        filters.endDate = dateRange[1].toISOString();
      }
      
      const response = await getSystemLogs(filters);
      
      if (response.success) {
        setLogs(response.data.items);
        setTotalPages(response.data.totalPages);
        setTotalLogs(response.data.total);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch system logs',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const handleExport = () => {
    // Generate CSV from logs data
    const headers = ['Timestamp', 'Level', 'Type', 'User', 'Message', 'Details'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        log.level,
        log.type,
        log.user?.name || 'System',
        `"${log.message.replace(/"/g, '""')}"`,
        `"${log.details ? log.details.replace(/"/g, '""') : ''}"`
      ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `system-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getLevelBadgeColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR: return 'red';
      case LogLevel.WARNING: return 'orange';
      case LogLevel.INFO: return 'blue';
      case LogLevel.DEBUG: return 'gray';
      default: return 'gray';
    }
  };

  const getTypeBadgeColor = (type: LogType) => {
    switch (type) {
      case LogType.AUTH: return 'indigo';
      case LogType.USER: return 'blue';
      case LogType.ROOM: return 'green';
      case LogType.COMPUTER: return 'cyan';
      case LogType.SCHEDULE: return 'grape';
      case LogType.SYSTEM: return 'gray';
      default: return 'gray';
    }
  };

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.user?.name && log.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDateTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy h:mm:ss a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Container size="xl" p="md">
      <Title order={1} mb="md">System Logs</Title>
      
      <Paper p="md" withBorder mb="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <TextInput
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              style={{ width: 250 }}
            />
            
            <Select
              placeholder="Filter by level"
              value={logLevelFilter}
              onChange={setLogLevelFilter}
              clearable
              data={[
                { value: LogLevel.ERROR, label: 'Error' },
                { value: LogLevel.WARNING, label: 'Warning' },
                { value: LogLevel.INFO, label: 'Info' },
                { value: LogLevel.DEBUG, label: 'Debug' },
              ]}
              leftSection={<IconFilter size={16} />}
              style={{ width: 150 }}
            />
            
            <Select
              placeholder="Filter by type"
              value={logTypeFilter}
              onChange={setLogTypeFilter}
              clearable
              data={[
                { value: LogType.AUTH, label: 'Authentication' },
                { value: LogType.USER, label: 'User' },
                { value: LogType.ROOM, label: 'Room' },
                { value: LogType.COMPUTER, label: 'Computer' },
                { value: LogType.SCHEDULE, label: 'Schedule' },
                { value: LogType.SYSTEM, label: 'System' },
              ]}
              leftSection={<IconFilter size={16} />}
              style={{ width: 180 }}
            />
            
            <DatePickerInput
              type="range"
              placeholder="Filter by date range"
              value={dateRange}
              onChange={setDateRange}
              clearable
              leftSection={<IconCalendar size={16} />}
              style={{ width: 300 }}
            />
          </Group>
          
          <Group>
            <Button 
              variant="outline" 
              leftSection={<IconRefresh size={16} />} 
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button 
              leftSection={<IconDownload size={16} />} 
              onClick={handleExport}
            >
              Export CSV
            </Button>
          </Group>
        </Group>
        
        <Text size="sm" mb="md">
          Showing {filteredLogs.length} of {totalLogs} logs
        </Text>
        
        {loading ? (
          <Group justify="center" p="xl">
            <Loader size="md" />
          </Group>
        ) : (
          <>
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Timestamp</Table.Th>
                  <Table.Th>Level</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Message</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredLogs.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={5} style={{ textAlign: 'center' }}>
                      No logs found
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredLogs.map((log) => (
                    <Table.Tr key={log.id}>
                      <Table.Td style={{ whiteSpace: 'nowrap' }}>
                        {formatDateTime(log.timestamp)}
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getLevelBadgeColor(log.level)}>
                          {log.level}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getTypeBadgeColor(log.type)}>
                          {log.type}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{log.user?.name || 'System'}</Table.Td>
                      <Table.Td style={{ width: '40%' }}>
                        <Box>
                          <Text size="sm">{log.message}</Text>
                          {log.details && (
                            <Text size="xs" c="dimmed" mt={4}>
                              {log.details}
                            </Text>
                          )}
                        </Box>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
            
            <Group justify="center" mt="md">
              <Pagination
                total={totalPages}
                value={page}
                onChange={setPage}
              />
            </Group>
          </>
        )}
      </Paper>
    </Container>
  );
}