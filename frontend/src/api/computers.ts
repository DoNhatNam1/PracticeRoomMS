import { apiRequest, ApiResponse } from './base';
import { 
  Computer, 
  ComputerFilter, 
  CreateComputerDto,
  UpdateComputerDto,
  MaintenanceDto 
} from '../types/computer-service/computers';
import { ComputerStatus } from '../types/common/enums';
import { PaginatedResponse } from '../types/common/pagination';

export interface ComputersResponse extends PaginatedResponse<Computer> {}

// Sử dụng mock data khi dev
export const useMockData = true;

/**
 * Mock data cho phát triển front-end khi chưa có API thực
 */
export const getMockComputers = (filter: ComputerFilter): ApiResponse<ComputersResponse> => {
  const mockComputers: Computer[] = [
    {
      id: 1,
      name: 'PC-A101',
      roomId: 1,
      specs: {
        cpu: 'Intel Core i7-10700K',
        ram: '16GB DDR4',
        storage: '512GB NVMe SSD',
        gpu: 'NVIDIA RTX 3060',
        os: 'Windows 11 Pro',
        audioInterface: 'Focusrite Scarlett 2i2',
        monitors: 'Dual 24" 1080p',
        installedSoftware: ['Ableton Live 11', 'Pro Tools', 'Sibelius', 'Office 365']
      },
      ipAddress: '192.168.1.101',
      macAddress: '00:1A:2B:3C:4D:5E',
      status: ComputerStatus.OPERATIONAL,
      lastMaintenance: '2025-01-15T08:00:00Z',
      notes: 'Newly installed computer',
      isActive: true,
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2025-01-15T08:00:00Z'
    },
    {
      id: 2,
      name: 'PC-A102',
      roomId: 1,
      specs: {
        cpu: 'Intel Core i5-10600K',
        ram: '8GB DDR4',
        storage: '256GB NVMe SSD',
        gpu: 'Intel UHD Graphics',
        os: 'Windows 11 Pro',
        audioInterface: 'PreSonus AudioBox USB',
        monitors: 'Single 24" 1080p',
        installedSoftware: ['Ableton Live 11 Lite', 'MuseScore', 'Office 365']
      },
      ipAddress: '192.168.1.102',
      macAddress: '00:1A:2B:3C:4D:5F',
      status: ComputerStatus.IN_USE,
      lastMaintenance: '2024-12-20T09:30:00Z',
      notes: 'Assigned to music production',
      isActive: true,
      createdAt: '2024-12-01T10:05:00Z',
      updatedAt: '2025-01-10T13:45:00Z'
    },
    {
      id: 3,
      name: 'PC-B201',
      roomId: 2,
      specs: {
        cpu: 'AMD Ryzen 7 5800X',
        ram: '32GB DDR4',
        storage: '1TB NVMe SSD',
        gpu: 'NVIDIA RTX 3080',
        os: 'Windows 11 Pro',
        audioInterface: 'Universal Audio Apollo Twin',
        monitors: 'Dual 27" 1440p',
        installedSoftware: ['Pro Tools', 'Logic Pro X', 'Final Cut Pro', 'Adobe Creative Cloud']
      },
      ipAddress: '192.168.2.101',
      macAddress: '00:2C:3D:4E:5F:6G',
      status: ComputerStatus.MAINTENANCE,
      lastMaintenance: '2025-02-01T11:15:00Z',
      notes: 'Scheduled for software update',
      isActive: true,
      createdAt: '2024-11-15T14:20:00Z',
      updatedAt: '2025-02-01T11:15:00Z'
    },
    {
      id: 4,
      name: 'PC-C301',
      roomId: 3,
      specs: {
        cpu: 'Intel Core i9-11900K',
        ram: '64GB DDR4',
        storage: '2TB NVMe SSD + 4TB HDD',
        gpu: 'NVIDIA RTX 3090',
        os: 'Windows 11 Pro',
        audioInterface: 'RME Fireface UFX+',
        monitors: 'Triple 27" 4K',
        installedSoftware: ['Pro Tools Ultimate', 'Cubase Pro', 'Adobe Creative Cloud', 'Native Instruments Komplete']
      },
      ipAddress: '192.168.3.101',
      macAddress: '00:3D:4E:5F:6G:7H',
      status: ComputerStatus.OUT_OF_ORDER,
      lastMaintenance: '2025-01-05T09:00:00Z',
      notes: 'Hardware issue with graphics card',
      isActive: false,
      createdAt: '2024-10-10T08:30:00Z',
      updatedAt: '2025-01-25T10:45:00Z'
    },
    {
      id: 5,
      name: 'PC-A103',
      roomId: 1,
      specs: {
        cpu: 'Intel Core i7-11700',
        ram: '16GB DDR4',
        storage: '1TB NVMe SSD',
        gpu: 'NVIDIA RTX 3060 Ti',
        os: 'Windows 11 Pro',
        audioInterface: 'Focusrite Scarlett 4i4',
        monitors: 'Dual 24" 1080p',
        installedSoftware: ['Ableton Live 11 Suite', 'FL Studio', 'Office 365']
      },
      ipAddress: '192.168.1.103',
      macAddress: '00:1A:2B:3C:4D:60',
      status: ComputerStatus.OPERATIONAL,
      lastMaintenance: '2025-01-20T13:30:00Z',
      notes: 'Recently upgraded RAM',
      isActive: true,
      createdAt: '2024-12-01T10:10:00Z',
      updatedAt: '2025-01-20T13:30:00Z'
    }
  ];

  // Lọc computers theo filter
  let filteredComputers = [...mockComputers];

  if (filter.search) {
    const search = filter.search.toLowerCase();
    filteredComputers = filteredComputers.filter(computer => {
      if (computer.name.toLowerCase().includes(search)) return true;
      if (computer.notes && computer.notes.toLowerCase().includes(search)) return true;
      const specs = computer.specs as Record<string, unknown>;
      for (const [, value] of Object.entries(specs)) {
        if (Array.isArray(value)) {
          for (const item of value) {
            if (typeof item === 'string' && item.toLowerCase().includes(search)) {
              return true;
            }
          }
        } else if (typeof value === 'string' && value.toLowerCase().includes(search)) {
          return true;
        }
      }
      return false;
    });
  }

  if (filter.roomId) {
    filteredComputers = filteredComputers.filter(computer => computer.roomId === filter.roomId);
  }

  if (filter.status) {
    filteredComputers = filteredComputers.filter(computer => computer.status === filter.status);
  }

  if (filter.isActive !== undefined) {
    filteredComputers = filteredComputers.filter(computer => computer.isActive === filter.isActive);
  }

  const page = filter.page || 1;
  const limit = filter.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedComputers = filteredComputers.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      items: paginatedComputers,
      meta: {
        totalItems: filteredComputers.length,
        itemCount: paginatedComputers.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(filteredComputers.length / limit),
        currentPage: page
      }
    }
  };
};

// Định nghĩa API functions
/**
 * Lấy danh sách computers với các bộ lọc
 */
export const getComputers = (filters: ComputerFilter) => {
  if (useMockData) {
    return mockGetComputers(filters);
  }
  return apiRequest<ComputersResponse>('GET', '/computers', { params: filters });
};

/**
 * Lấy thông tin chi tiết của một computer
 */
export const getComputer = (id: number) => {
  if (useMockData) {
    return mockGetComputer(id);
  }
  return apiRequest<Computer>('GET', `/computers/${id}`);
};

/**
 * Tạo một computer mới
 */
export const createComputer = (data: CreateComputerDto) => {
  return apiRequest<Computer>('POST', '/computers', { data });
};

/**
 * Cập nhật thông tin của một computer
 */
export const updateComputer = (id: number, data: UpdateComputerDto) => {
  return apiRequest<Computer>('PATCH', `/computers/${id}`, { data });
};

/**
 * Xóa một computer
 */
export const deleteComputer = (id: number) => {
  return apiRequest<{ success: boolean }>('DELETE', `/computers/${id}`);
};

/**
 * Thay đổi trạng thái của một computer
 */
export const changeComputerStatus = (id: number, status: ComputerStatus, reason?: string) => {
  return apiRequest<Computer>('PATCH', `/computers/${id}/status`, { 
    data: { status, reason }
  });
};

/**
 * Lấy lịch sử sử dụng của một computer
 */
export const getComputerUsageHistory = (computerId: number, params: { 
  startDate?: string; 
  endDate?: string;
  limit?: number;
  page?: number;
}) => {
  return apiRequest<PaginatedResponse<any>>('GET', `/computers/${computerId}/usage-history`, { params });
};

/**
 * Thêm thông tin bảo trì cho một computer
 */
export const addMaintenanceRecord = (computerId: number, data: MaintenanceDto) => {
  return apiRequest<Computer>('POST', `/computers/${computerId}/maintenance`, { data });
};