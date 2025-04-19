import { apiRequest, ApiResponse } from './base';
import { 
  Schedule,
  ScheduleFilter, 
  CreateScheduleDto, 
  UpdateScheduleDto,
  ChangeScheduleStatusDto,
  CheckScheduleConflictDto,
  ScheduleConflict
} from '../types/room-service/schedules';
import { ScheduleStatus, RepeatType } from '../types/common/enums';
import { PaginatedResponse } from '../types/common/pagination';

export interface SchedulesResponse extends PaginatedResponse<Schedule> {}

// Sử dụng mock data khi dev
export const useMockData = true;

/**
 * Mock data cho phát triển front-end khi chưa có API thực
 */
export const getMockSchedules = (filter: ScheduleFilter): ApiResponse<SchedulesResponse> => {
  const mockSchedules = [
    {
      id: 1,
      title: 'Piano Masterclass',
      roomId: 1,
      startTime: '2025-04-20T09:00:00Z',
      endTime: '2025-04-20T11:00:00Z',
      repeat: RepeatType.WEEKLY,
      status: ScheduleStatus.APPROVED,
      createdBy: 1,
      createdAt: '2025-04-01T10:00:00Z',
      updatedAt: '2025-04-01T10:00:00Z'
    },
    {
      id: 2,
      title: 'Recording Session',
      roomId: 2,
      startTime: '2025-04-22T14:00:00Z',
      endTime: '2025-04-22T17:00:00Z',
      repeat: RepeatType.NONE,
      status: ScheduleStatus.PENDING,
      createdBy: 3,
      createdAt: '2025-04-05T09:30:00Z',
      updatedAt: '2025-04-05T09:30:00Z'
    },
    // Thêm các mock data khác...
  ];

  // Lọc schedules theo filter
  let filteredSchedules = [...mockSchedules];
  
  if (filter.search) {
    const search = filter.search.toLowerCase();
    filteredSchedules = filteredSchedules.filter(schedule => 
      schedule.title.toLowerCase().includes(search)
    );
  }
  
  if (filter.roomId) {
    filteredSchedules = filteredSchedules.filter(schedule => schedule.roomId === filter.roomId);
  }
  
  if (filter.userId) {
    filteredSchedules = filteredSchedules.filter(schedule => 
      schedule.createdBy === filter.userId
    );
  }
  
  if (filter.status) {
    filteredSchedules = filteredSchedules.filter(schedule => schedule.status === filter.status);
  }
  
  // Phân trang
  const page = filter.page || 1;
  const limit = filter.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedSchedules = filteredSchedules.slice(startIndex, endIndex);
  
  return {
    success: true,
    data: {
      items: paginatedSchedules,
      meta: {
        totalItems: filteredSchedules.length,
        itemCount: paginatedSchedules.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(filteredSchedules.length / limit),
        currentPage: page
      }
    }
  };
};

// Tạo các hàm mock function riêng biệt
export const mockGetSchedules = (filters: ScheduleFilter) => {
  return Promise.resolve(getMockSchedules(filters));
};

export const mockGetSchedule = (id: number) => {
  const allSchedules = getMockSchedules({ limit: 100 });
  const schedule = allSchedules.data.items.find(s => s.id === id);
  
  return Promise.resolve({
    success: !!schedule,
    data: schedule || null,
    message: schedule ? undefined : 'Schedule not found'
  });
};

/**
 * Lấy danh sách schedules với các bộ lọc
 */
export const getSchedules = (filters: ScheduleFilter) => {
  if (useMockData) {
    return mockGetSchedules(filters);
  }
  return apiRequest<SchedulesResponse>('GET', '/schedules', { params: filters });
};

/**
 * Lấy thông tin chi tiết của một schedule
 */
export const getSchedule = (id: number) => {
  if (useMockData) {
    return mockGetSchedule(id);
  }
  return apiRequest<Schedule>('GET', `/schedules/${id}`);
};

/**
 * Tạo một schedule mới
 */
export const createSchedule = (data: CreateScheduleDto) => {
  return apiRequest<Schedule>('POST', '/schedules', { data });
};

/**
 * Cập nhật thông tin của một schedule
 */
export const updateSchedule = (id: number, data: UpdateScheduleDto) => {
  return apiRequest<Schedule>('PATCH', `/schedules/${id}`, { data });
};

/**
 * Xóa một schedule
 */
export const deleteSchedule = (id: number) => {
  return apiRequest<{ success: boolean }>('DELETE', `/schedules/${id}`);
};

/**
 * Thay đổi trạng thái của một schedule
 */
export const changeScheduleStatus = (id: number, data: ChangeScheduleStatusDto) => {
  return apiRequest<Schedule>('PATCH', `/schedules/${id}/status`, { data });
};

/**
 * Kiểm tra xung đột lịch
 */
export const checkScheduleConflict = (data: CheckScheduleConflictDto) => {
  return apiRequest<ScheduleConflict>('POST', '/schedules/check-conflict', { data });
};