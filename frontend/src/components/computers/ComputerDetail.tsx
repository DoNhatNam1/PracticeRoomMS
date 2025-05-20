import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { setAuthHeader } from '@/api/base';
import { apiRequest } from '@/api/base';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Server, 
  Cpu, 
  HardDrive, 
  Clock, 
  Loader2,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';

// Định nghĩa kiểu dữ liệu chính xác theo API trả về
interface ComputerResponse {
  id: number;
  name: string;
  ipAddress: string;
  macAddress: string;
  status: string;
  roomId: number;
  room: {
    id: number;
    name: string;
    location: string | null;
    capacity: number;
    description: string | null;
    isActive: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  specs: {
    os?: string;
    gpu?: string;
    ram: string;
    audio?: string;
    monitor?: string;
    storage: string;
    software?: string[];
    processor: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Định nghĩa kiểu dữ liệu cho Computer Usage theo API
interface ComputerUsage {
  id: number;
  computerId: number;
  notes: string | null;
  roomUsageId: number;
  startTime: string;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
  computer?: {
    id: number;
    name: string;
    // Có thể mở rộng nếu cần
  };
  roomUsage: {
    id: number;
    roomId: number;
    userId: number;
    startTime: string;
    endTime: string;
    purpose: string;
    createdAt: string;
    updatedAt: string;
    scheduleId: number | null;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function ComputerDetail() {
  const { computerId } = useParams<{ computerId: string }>();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [computer, setComputer] = useState<ComputerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [usages, setUsages] = useState<ComputerUsage[]>([]);
  const [usagesLoading, setUsagesLoading] = useState(false);
  const [usagesMeta, setUsagesMeta] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });

  const fetchUsages = async (page: number = 1) => {
    try {
      setUsagesLoading(true);
      setAuthHeader(token);
      
      interface UsagesResponse {
        success: boolean;
        message: string;
        data: {
          usages: ComputerUsage[];
        };
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }
      
      const usagesResponse = await apiRequest<UsagesResponse>(
        'GET', 
        `/computer-usages?computerId=${computerId}&page=${page}&limit=${usagesMeta.limit}`
      );
      
      if (usagesResponse) {
        const usagesData = usagesResponse as unknown as UsagesResponse;
        if (usagesData.success && usagesData.data && usagesData.data.usages) {
          setUsages(usagesData.data.usages);
          if (usagesData.meta) {
            setUsagesMeta(usagesData.meta);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching computer usages:', error);
    } finally {
      setUsagesLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= usagesMeta.totalPages) {
      fetchUsages(newPage);
    }
  };

  useEffect(() => {
    if (!computerId || !token) return;

    const fetchComputerDetails = async () => {
      try {
        setLoading(true);
        setAuthHeader(token);
        
        const response = await apiRequest<ComputerResponse>('GET', `/computers/${computerId}`);
        
        if (response) {
          const computerData = response as unknown as ComputerResponse;
          setComputer(computerData);
          
          fetchUsages(1);
        } else {
          toast('Failed to fetch computer details');
        }
      } catch (error: any) {
        console.error('Error fetching computer details:', error);
        toast(error.message || 'An error occurred while fetching computer details');
      } finally {
        setLoading(false);
      }
    };

    fetchComputerDetails();
  }, [computerId, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!computer) {
    return (
      <div className="p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">Computer Not Found</h2>
        <p className="mb-6">The computer you're looking for could not be found or you don't have permission to view it.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    status = status.toUpperCase();
    if (status === 'ACTIVE' || status === 'OPERATIONAL') return 'default';
    if (status === 'MAINTENANCE') return 'outline';
    if (status === 'OFFLINE') return 'outline';
    return 'default';
  };

  return (
    <div className="container py-8 mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-3xl font-bold">Computer Details</h1>
        <Badge variant={getStatusVariant(computer.status)}>
          {computer.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server size={18} />
              {computer.name}
            </CardTitle>
            <CardDescription>Basic Information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">ID:</span>
                <span className="font-medium">{computer.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Room:</span>
                <span className="font-medium">{computer.room?.name || `Room ${computer.roomId}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">IP Address:</span>
                <span className="font-medium">{computer.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">MAC Address:</span>
                <span className="font-medium">{computer.macAddress}</span>
              </div>
              {computer.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Last Updated:</span>
                  <span className="font-medium">{formatDateTime(computer.updatedAt)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu size={18} />
              Specifications
            </CardTitle>
            <CardDescription>Hardware Details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {computer.specs?.processor && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Processor:</span>
                  <span className="font-medium">{computer.specs.processor}</span>
                </div>
              )}
              {computer.specs?.ram && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">RAM:</span>
                  <span className="font-medium">{computer.specs.ram}</span>
                </div>
              )}
              {computer.specs?.storage && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Storage:</span>
                  <span className="font-medium">{computer.specs.storage}</span>
                </div>
              )}
              {computer.specs?.os && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Operating System:</span>
                  <span className="font-medium">{computer.specs.os}</span>
                </div>
              )}
              {computer.specs?.gpu && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">GPU:</span>
                  <span className="font-medium">{computer.specs.gpu}</span>
                </div>
              )}
              {computer.specs?.audio && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Audio:</span>
                  <span className="font-medium">{computer.specs.audio}</span>
                </div>
              )}
              {computer.specs?.monitor && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Monitor:</span>
                  <span className="font-medium">{computer.specs.monitor}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive size={18} />
              Software
            </CardTitle>
            <CardDescription>Installed Software</CardDescription>
          </CardHeader>
          <CardContent>
            {computer.specs?.software && computer.specs.software.length > 0 ? (
              <ul className="pl-5 space-y-1 list-disc">
                {computer.specs.software.map((software, index) => (
                  <li key={index}>{software}</li>
                ))}
              </ul>
            ) : (
              <p className="italic text-gray-500">No software information available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={18} />
            Usage History
          </CardTitle>
          <CardDescription>Recent computer usages</CardDescription>
        </CardHeader>
        <CardContent>
          {usagesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : usages.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Session Time</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usages.map((usage) => (
                    <TableRow key={usage.id}>
                      <TableCell>
                        <div className="font-medium">{usage.user?.name}</div>
                        <div className="text-sm text-gray-500">{usage.user?.email}</div>
                      </TableCell>
                      <TableCell>
                        <div>{formatDateTime(usage.startTime)}</div>
                        <div>to {usage.endTime ? formatDateTime(usage.endTime) : 'Ongoing'}</div>
                      </TableCell>
                      <TableCell>{usage.roomUsage?.purpose || '-'}</TableCell>
                      <TableCell>{usage.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {usages.length} of {usagesMeta.total} usages
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={usagesMeta.page <= 1}
                    onClick={() => handlePageChange(usagesMeta.page - 1)}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="px-2">
                    Page {usagesMeta.page} of {usagesMeta.totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={usagesMeta.page >= usagesMeta.totalPages}
                    onClick={() => handlePageChange(usagesMeta.page + 1)}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="italic text-gray-500">No usage history available for this computer</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}