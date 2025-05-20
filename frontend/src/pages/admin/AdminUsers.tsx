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
  Filter,
  ChevronLeft,  // Thêm dòng này
  ChevronRight  // Thêm dòng này
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
import { PaginationMeta } from '@/types/common/response';
import { User } from '@/types/user-service/users';
// Tự định nghĩa Role để sử dụng cục bộ
// type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


export default function AdminUsers() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  // Fetch users when component mounts or when filter/search/page changes
  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token, meta.page, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setAuthHeader(token);
      
      // Construct query parameters
      let queryParams = `page=${meta.page}&limit=${meta.limit}`;
      if (roleFilter && roleFilter !== 'ALL') {
        queryParams += `&role=${roleFilter}`;
      }
      if (searchTerm) {
        queryParams += `&search=${searchTerm}`;
      }
      
      // Sử dụng interface tùy chỉnh cho response
      interface UsersResponse {
        data: User[];
        meta: PaginationMeta;
      }
      
      // Make the API request với type cụ thể
      const response = await apiRequest<UsersResponse>('GET', `/users?${queryParams}`);
      
      // Process the response
      if (response) {
        // Sử dụng as để ép kiểu một cách an toàn
        const usersData = response as unknown as UsersResponse;
        setUsers(usersData.data);
        setMeta(usersData.meta);
      } else {
        console.error('Unexpected response format:', response);
        toast('Failed to fetch users: Invalid response format');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast(error.message || 'An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  // const getUserById = async (userId: number) => {
  //   try {
  //     setAuthHeader(token);
  //     const response = await apiRequest('GET', `/users/${userId}`);
  //     return response;
  //   } catch (error: any) {
  //     console.error('Error fetching user:', error);
  //     toast(error.message || 'An error occurred while fetching user details');
  //     return null;
  //   }
  // };

  const updateUserStatus = async (userId: number, isActive: boolean) => {
    try {
      setAuthHeader(token);
      const response = await apiRequest('PUT', `/users/${userId}/status`, {
        data: { isActive }
      });
      
      if (response && response.success) {
        toast(`User status updated successfully`);
        fetchUsers(); // Refresh the list
      } else {
        toast('Failed to update user status');
      }
    } catch (error: any) {
      toast(error.message || 'An error occurred while updating user status');
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      setAuthHeader(token);
      const response = await apiRequest('DELETE', `/users/${userId}`);
      
      if (response && response.success) {
        toast(response.message || 'User deleted successfully');
        fetchUsers(); // Refresh the list
      } else {
        toast('Failed to delete user');
      }
    } catch (error: any) {
      toast(error.message || 'An error occurred while deleting user');
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setMeta({ ...meta, page: newPage });
  };

  // Filter users by role
  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setMeta({ ...meta, page: 1 }); // Reset to first page on filter change
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMeta({ ...meta, page: 1 }); // Reset to first page on search
  };

  return (
    <div className="container py-8 mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Add User
        </Button>
      </div>
      
      <div className="flex justify-between gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={18} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="pl-10"
            />
          </div>
        </form>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} />
              Filter: {roleFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleRoleFilter('ALL')}>
              All Roles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleFilter('ADMIN')}>
              Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleFilter('TEACHER')}>
              Teacher
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleFilter('STUDENT')}>
              Student
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
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
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={
                      user.role === 'ADMIN' ? 'destructive' : 
                      user.role === 'TEACHER' ? 'default' : 'secondary'
                    }>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.department || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'outline'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
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
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Edit size={14} />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateUserStatus(user.id, !user.isActive)}
                          className="flex items-center gap-2"
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteUser(user.id)}
                          className="flex items-center gap-2 text-red-600"
                        >
                          <Trash size={14} />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Add pagination controls here */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {users.length} of {meta.total} users
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
    </div>
  );
}