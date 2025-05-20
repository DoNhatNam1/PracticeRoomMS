import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { setAuthHeader } from '@/api/base';
import { apiRequest } from '@/api/base';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDateTime } from '@/lib/utils';
import { Computer } from '@/types/computer-service/computers';
import { PaginationMeta } from '@/types/common/response';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

export default function AdminComputers() {
  const { token } = useAuthStore();
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchComputers();
    }
  }, [token, meta.page, searchTerm]);

  const fetchComputers = async () => {
    try {
      setLoading(true);
      setAuthHeader(token);
      
      // Sử dụng interface tùy chỉnh cho endpoint dashboard-view
      interface ComputersResponse {
        success: boolean;
        message: string;
        data: Computer[];
        meta: PaginationMeta;
      }
      
      // Sử dụng endpoint dashboard-view
      const response = await apiRequest<ComputersResponse>(
        'GET', 
        `/computers/dashboard-view?page=${meta.page}&limit=${meta.limit}${searchTerm ? `&search=${searchTerm}` : ''}`
      );
      
      if (response) {
        // Sử dụng type assertion để tránh lỗi TypeScript
        const computersData = response as unknown as ComputersResponse;
        
        // Truy cập các trường data và meta sau khi ép kiểu
        if (computersData.success) {
          setComputers(computersData.data);
          setMeta(computersData.meta);
        } else {
          toast(computersData.message || 'Failed to fetch computers');
        }
      } else {
        toast('Failed to fetch computers');
      }
    } catch (error: any) {
      console.error('Error fetching computers:', error);
      toast(error.message || 'An error occurred while fetching computers');
    } finally {
      setLoading(false);
    }
  };

  const getComputerById = async (computerId: number) => {
    try {
      setAuthHeader(token);
      const response = await apiRequest('GET', `/computers/${computerId}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching computer details:', error);
      toast(error.message || 'An error occurred while fetching computer details');
      return null;
    }
  };

  const updateComputerStatus = async (computerId: number, status: string) => {
    try {
      setAuthHeader(token);
      const response = await apiRequest('PUT', `/computers/${computerId}/status`, {
        data: { status }
      });
      
      if (response && response.success) {
        toast('Computer status updated successfully');
        fetchComputers(); // Refresh the list
      } else {
        toast('Failed to update computer status');
      }
    } catch (error: any) {
      toast(error.message || 'An error occurred while updating computer status');
    }
  };

  const deleteComputer = async (computerId: number) => {
    try {
      setAuthHeader(token);
      const response = await apiRequest('DELETE', `/computers/${computerId}`);
      
      if (response && response.success) {
        toast(response.message || 'Computer deleted successfully');
        fetchComputers(); // Refresh the list
      } else {
        toast('Failed to delete computer');
      }
    } catch (error: any) {
      toast(error.message || 'An error occurred while deleting computer');
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setMeta({ ...meta, page: newPage });
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMeta({ ...meta, page: 1 }); // Reset to first page on search
  };

  return (
    <div className="container py-8 mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Computers Management</h1>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Add Computer
        </Button>
      </div>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={18} />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search computers..."
            className="pl-10"
          />
        </div>
      </form>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {computers.map((computer) => (
                <TableRow key={computer.id}>
                  <TableCell>{computer.id}</TableCell>
                  <TableCell>{computer.name}</TableCell>
                  <TableCell>{computer.ipAddress}</TableCell>
                  <TableCell>{computer.room?.name || `Room ${computer.roomId}`}</TableCell>
                  <TableCell>
                    <Badge variant={
                      computer.status === 'OPERATIONAL' ? 'default' : 
                      computer.status === 'MAINTENANCE' ? 'secondary' : 
                      computer.status === 'OFFLINE' ? 'outline' : 'default'
                    }>
                      {computer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(computer.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            getComputerById(computer.id).then(data => {
                              if (data && data.success) {
                                // Lưu máy tính vào state và hiển thị dialog
                                setSelectedComputer(data.data as Computer);
                                setShowDetailsDialog(true);
                              }
                            });
                          }}
                          className="flex items-center gap-2"
                        >
                          <Eye size={14} />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Edit size={14} />
                          Edit Computer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateComputerStatus(
                            computer.id, 
                            computer.status === 'OPERATIONAL' ? 'MAINTENANCE' : 'OPERATIONAL'
                          )}
                          className="flex items-center gap-2"
                        >
                          {computer.status === 'OPERATIONAL' ? 'Set to Maintenance' : 'Set to Operational'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteComputer(computer.id)}
                          className="flex items-center gap-2 text-red-600"
                        >
                          <Trash size={14} />
                          Delete Computer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {computers.length} of {meta.total} computers
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={meta.page <= 1}
                onClick={() => handlePageChange(meta.page - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => handlePageChange(meta.page + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Computer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Computer Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected computer.
            </DialogDescription>
          </DialogHeader>
          
          {selectedComputer && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">ID:</span>
                  <span>{selectedComputer.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Name:</span>
                  <span>{selectedComputer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">IP Address:</span>
                  <span>{selectedComputer.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">MAC Address:</span>
                  <span>{selectedComputer.macAddress || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Status:</span>
                  <Badge variant={
                    selectedComputer.status === 'OPERATIONAL' ? 'default' : 
                    selectedComputer.status === 'MAINTENANCE' ? 'secondary' : 
                    selectedComputer.status === 'OFFLINE' ? 'outline' : 'default'
                  }>
                    {selectedComputer.status}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Room:</span>
                  <span>{selectedComputer.room?.name || `Room ${selectedComputer.roomId}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Created At:</span>
                  <span>{formatDateTime(selectedComputer.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Updated At:</span>
                  <span>{formatDateTime(selectedComputer.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">CPU:</span>
                  <span>{selectedComputer.specs?.processor || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">RAM:</span>
                  <span>{selectedComputer.specs?.ram || 'N/A'}</span>
                </div>
              </div>
              
              {(selectedComputer as Computer & { description?: string }).description && (
                <div className="col-span-2 mt-4">
                  <span className="font-medium text-gray-500">Description:</span>
                  <p className="mt-1 text-sm text-gray-700">{(selectedComputer as Computer & { description?: string }).description}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowDetailsDialog(false);
                if (selectedComputer) {
                  navigate(`/admin/computers/${selectedComputer.id}`);
                }
              }}
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}