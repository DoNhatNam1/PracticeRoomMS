import { apiRequest } from './base';
import { 
  Room, 
  CreateRoomDto, 
  UpdateRoomDto, 
  UpdateRoomStatusDto,
  RoomMaintenance,
  RoomActivityHistory,
  Schedule,
  CreateScheduleDto,
  UpdateScheduleDto
} from '../types/room-service/rooms';
import { 
  ApiResponse, 
  PaginatedResponse
} from '../types/common/response';

/**
 * Lấy danh sách phòng cho dashboard (admin/teacher)
 */
export const getRoomsForDashboard = (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  isActive?: boolean;
} = {}): Promise<ApiResponse<Room[]>> => {
  return apiRequest<Room[]>('GET', '/rooms/dashboard-view', { params });
};

/**
 * Lấy danh sách phòng cho client (không yêu cầu xác thực)
 */
export const getRoomsForClient = (): Promise<ApiResponse<Room[]>> => {
  return apiRequest<Room[]>('GET', '/rooms/client-view');
};

/**
 * Lấy thông tin chi tiết của phòng
 */
export const getRoomById = (id: number): Promise<ApiResponse<Room>> => {
  return apiRequest<Room>('GET', `/rooms/${id}`);
};

/**
 * Tạo phòng mới
 */
export const createRoom = (roomData: CreateRoomDto): Promise<ApiResponse<Room>> => {
  return apiRequest<Room>('POST', '/rooms', { data: roomData });
};

/**
 * Cập nhật thông tin phòng
 */
export const updateRoom = (id: number, roomData: UpdateRoomDto): Promise<ApiResponse<Room>> => {
  return apiRequest<Room>('PUT', `/rooms/${id}`, { data: roomData });
};

/**
 * Cập nhật trạng thái phòng
 */
export const updateRoomStatus = (id: number, statusData: UpdateRoomStatusDto): Promise<ApiResponse<Room>> => {
  return apiRequest<Room>('PATCH', `/rooms/${id}/status`, { data: statusData });
};

/**
 * Xóa phòng
 */
export const deleteRoom = (id: number): Promise<ApiResponse<{ message: string }>> => {
  return apiRequest<{ message: string }>('DELETE', `/rooms/${id}`);
};

/**
 * Lấy lịch sử hoạt động của phòng
 */
export const getRoomActivityHistory = (
  roomId: number,
  params: { page?: number; limit?: number } = {}
): Promise<ApiResponse<PaginatedResponse<RoomActivityHistory>>> => {
  return apiRequest<PaginatedResponse<RoomActivityHistory>>('GET', `/rooms/${roomId}/activity-history`, { params });
};

/**
 * Đánh dấu phòng bảo trì
 */
export const markRoomForMaintenance = (
  roomId: number, 
  maintenanceData: { reason: string; startTime: string; endTime: string }
): Promise<ApiResponse<RoomMaintenance>> => {
  return apiRequest<RoomMaintenance>('POST', `/rooms/${roomId}/maintenance`, { data: maintenanceData });
};

/**
 * Lấy danh sách lịch học
 */
export const getSchedules = (params: { 
  page?: number; 
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<ApiResponse<PaginatedResponse<Schedule>>> => {
  return apiRequest<PaginatedResponse<Schedule>>('GET', '/schedules', { params });
};

/**
 * Lấy chi tiết lịch học
 */
export const getScheduleById = (id: number): Promise<ApiResponse<Schedule>> => {
  return apiRequest<Schedule>('GET', `/schedules/${id}`);
};

/**
 * Tạo lịch học mới
 */
export const createSchedule = (scheduleData: CreateScheduleDto): Promise<ApiResponse<Schedule>> => {
  return apiRequest<Schedule>('POST', '/schedules', { data: scheduleData });
};

/**
 * Cập nhật lịch học
 */
export const updateSchedule = (id: number, scheduleData: UpdateScheduleDto): Promise<ApiResponse<Schedule>> => {
  return apiRequest<Schedule>('PUT', `/schedules/${id}`, { data: scheduleData });
};

/**
 * Xóa lịch học
 */
export const deleteSchedule = (id: number): Promise<ApiResponse<{ message: string }>> => {
  return apiRequest<{ message: string }>('DELETE', `/schedules/${id}`);
};
