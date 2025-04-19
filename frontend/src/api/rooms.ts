import { apiRequest, ApiResponse } from './base';
import { Room, RoomStatus, RoomType } from '../types';

export interface RoomFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: RoomStatus;
  type?: RoomType;
  isActive?: boolean;
}

export interface RoomsResponse {
  items: Room[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

/**
 * Lấy danh sách rooms với các bộ lọc
 */
export const getRooms = (filters: RoomFilter) => {
  return apiRequest<RoomsResponse>('GET', '/rooms', { params: filters });
};

/**
 * Lấy thông tin chi tiết của một room
 */
export const getRoomById = (id: number) => {
  return apiRequest<Room>('GET', `/rooms/${id}`);
};

/**
 * Tạo một room mới
 */
export const createRoom = (data: Omit<Room, 'id' | 'createdAt' | 'updatedAt' | 'computers' | 'schedules' | 'usages'>) => {
  return apiRequest<Room>('POST', '/rooms', { data });
};

/**
 * Cập nhật thông tin của một room
 */
export const updateRoom = (id: number, data: Partial<Omit<Room, 'id' | 'createdAt' | 'updatedAt' | 'computers' | 'schedules' | 'usages'>>) => {
  return apiRequest<Room>('PATCH', `/rooms/${id}`, { data });
};

/**
 * Xóa một room
 */
export const deleteRoom = (id: number) => {
  return apiRequest<{ success: boolean }>('DELETE', `/rooms/${id}`);
};

/**
 * Thay đổi trạng thái của một room
 */
export const changeRoomStatus = (id: number, status: RoomStatus, reason?: string) => {
  return apiRequest<Room>('PATCH', `/rooms/${id}/status`, { 
    data: { status, reason }
  });
};

/**
 * Lấy danh sách computers trong một room
 */
export const getRoomComputers = (roomId: number) => {
  return apiRequest<{ items: any[] }>('GET', `/rooms/${roomId}/computers`);
};

/**
 * Lấy lịch sử sử dụng của một room
 */
export const getRoomUsageHistory = (roomId: number, params: { 
  startDate?: string; 
  endDate?: string;
  limit?: number;
  page?: number;
}) => {
  return apiRequest<{
    items: any[];
    meta: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
    }
  }>('GET', `/rooms/${roomId}/usage-history`, { params });
};

/**
 * Mock data cho phát triển front-end khi chưa có API thực
 */
export const getMockRooms = (filter: RoomFilter): ApiResponse<RoomsResponse> => {
  const mockRooms: Room[] = [
    {
      id: 1,
      name: 'Piano Practice Room 1',
      location: 'Building A, Floor 2',
      capacity: 5,
      description: 'Piano practice room with 1 grand piano and 4 upright pianos',
      isActive: true,
      status: RoomStatus.AVAILABLE,
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2023-01-15T08:00:00Z'
    },
    {
      id: 2,
      name: 'Recording Studio',
      location: 'Building B, Basement',
      capacity: 8,
      description: 'Professional recording studio with control room and isolation booth',
      isActive: true,
      status: RoomStatus.IN_USE,
      createdAt: '2023-01-16T09:30:00Z',
      updatedAt: '2023-04-10T14:20:00Z'
    },
    {
      id: 3,
      name: 'Computer Lab 101',
      location: 'Building C, Floor 1',
      capacity: 25,
      description: 'Computer lab with music production software',
      isActive: true,
      status: RoomStatus.AVAILABLE,
      createdAt: '2023-02-01T10:15:00Z',
      updatedAt: '2023-02-01T10:15:00Z'
    },
    {
      id: 4,
      name: 'Classroom 201',
      location: 'Building A, Floor 2',
      capacity: 30,
      description: 'Large classroom for music theory classes',
      isActive: true,
      status: RoomStatus.MAINTENANCE,
      createdAt: '2022-12-10T08:45:00Z',
      updatedAt: '2023-05-05T09:30:00Z'
    },
    {
      id: 5,
      name: 'String Practice Room',
      location: 'Building A, Floor 3',
      capacity: 10,
      description: 'Room for string instrument practice with proper acoustics',
      isActive: false,
      status: RoomStatus.MAINTENANCE,
      createdAt: '2023-03-20T11:00:00Z',
      updatedAt: '2023-06-01T15:30:00Z'
    }
  ];

  // Lọc rooms theo filter
  let filteredRooms = [...mockRooms];
  
  if (filter.search) {
    const search = filter.search.toLowerCase();
    filteredRooms = filteredRooms.filter(room => 
      room.name.toLowerCase().includes(search) ||
      room.location?.toLowerCase().includes(search) ||
      room.description?.toLowerCase().includes(search)
    );
  }
  
  if (filter.status) {
    filteredRooms = filteredRooms.filter(room => room.status === filter.status);
  }
  
  if (filter.isActive !== undefined) {
    filteredRooms = filteredRooms.filter(room => room.isActive === filter.isActive);
  }
  
  // Phân trang
  const page = filter.page || 1;
  const limit = filter.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedRooms = filteredRooms.slice(startIndex, endIndex);
  
  return {
    success: true,
    data: {
      items: paginatedRooms,
      meta: {
        totalItems: filteredRooms.length,
        itemCount: paginatedRooms.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(filteredRooms.length / limit),
        currentPage: page
      }
    }
  };
};

// Sử dụng mock data khi dev
export const useMockData = true;

// Override các functions với mock data nếu useMockData = true
if (useMockData) {
  const originalGetRooms = getRooms;
  const originalGetRoomById = getRoomById;
  
//   // @ts-ignore - Ignore để override các functions này
//   getRooms = (filters: RoomFilter) => {
//     return Promise.resolve(getMockRooms(filters));
//   };
  
//   // @ts-ignore
//   getRoomById = (id: number) => {
//     const allRooms = getMockRooms({ limit: 100 });
//     const room = allRooms.data.items.find(r => r.id === id);
    
//     return Promise.resolve({
//       success: !!room,
//       data: room || null,
//       message: room ? undefined : 'Room not found'
//     });
//   };
  
//   // @ts-ignore
//   createRoom = (data: any) => {
//     const newId = Math.max(...getMockRooms({ limit: 100 }).data.items.map(r => r.id)) + 1;
//     const newRoom = {
//       id: newId,
//       ...data,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString()
//     };
    
//     return Promise.resolve({
//       success: true,
//       data: newRoom
//     });
//   };
  
//   // @ts-ignore
//   updateRoom = (id: number, data: any) => {
//     const allRooms = getMockRooms({ limit: 100 });
//     const room = allRooms.data.items.find(r => r.id === id);
    
//     if (!room) {
//       return Promise.resolve({
//         success: false,
//         message: 'Room not found'
//       });
//     }
    
//     const updatedRoom = {
//       ...room,
//       ...data,
//       updatedAt: new Date().toISOString()
//     };
    
//     return Promise.resolve({
//       success: true,
//       data: updatedRoom
//     });
//   };
}