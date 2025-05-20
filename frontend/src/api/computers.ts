import { apiRequest } from './base';
import { 
  Computer, 
  ComputerUsage,
  FileTransfer,
  ComputerActivity,
  CreateComputerDto,
  UpdateComputerDto,
  UpdateComputerStatusDto,
  CreateComputerUsageDto,
  FileTransferStatusUpdateDto
} from '../types/computer-service/computers';
import { ApiResponse } from '../types/common/response';

/**
 * Lấy danh sách máy tính cho client view (không yêu cầu xác thực)
 */
export const getComputersForClient = async (roomId: number) => {
  try {
    // Không cần setAuthHeader
    const response = await apiRequest('GET', `/computers/client-view?roomId=${roomId}`);
    return response;
  } catch (error: any) {
    console.error('Error fetching computers for client:', error);
    throw error;
  }
};

/**
 * Lấy danh sách máy tính cho dashboard view (admin/teacher)
 */
export const getComputersForDashboard = (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  roomId?: number;
} = {}): Promise<ApiResponse<Computer[]>> => {
  return apiRequest<Computer[]>('GET', '/computers/dashboard-view', { params });
};

/**
 * Lấy thông tin chi tiết của máy tính
 */
export const getComputer = (id: number): Promise<ApiResponse<Computer>> => {
  return apiRequest<Computer>('GET', `/computers/${id}`);
};

/**
 * Lấy thông tin chi tiết của máy tính bằng ID
 */
export const getComputerById = async (computerId: number) => {
  try {
    const response = await apiRequest('GET', `/computers/${computerId}`);
    return response;
  } catch (error) {
    console.error('Error fetching computer details:', error);
    throw error;
  }
};

/**
 * Lấy danh sách máy tính trong một phòng
 */
export const getComputersInRoom = (
  roomId: number,
  params: { page?: number; limit?: number } = {}
): Promise<ApiResponse<Computer[]>> => {
  return apiRequest<Computer[]>('GET', `/rooms/${roomId}/computers`, { params });
};

/**
 * Tạo máy tính mới
 */
export const createComputer = (computerData: CreateComputerDto): Promise<ApiResponse<Computer>> => {
  return apiRequest<Computer>('POST', '/computers', { data: computerData });
};

/**
 * Cập nhật thông tin máy tính
 */
export const updateComputer = (id: number, computerData: UpdateComputerDto): Promise<ApiResponse<Computer>> => {
  return apiRequest<Computer>('PUT', `/computers/${id}`, { data: computerData });
};

/**
 * Cập nhật trạng thái máy tính
 */
export const updateComputerStatus = (id: number, statusData: UpdateComputerStatusDto): Promise<ApiResponse<Computer>> => {
  return apiRequest<Computer>('PUT', `/computers/${id}/status`, { data: statusData });
};

/**
 * Xóa máy tính
 */
export const deleteComputer = (id: number): Promise<ApiResponse<{ message: string }>> => {
  return apiRequest<{ message: string }>('DELETE', `/computers/${id}`);
};

/**
 * Lấy lịch sử hoạt động của máy tính
 */
export const getComputerActivityHistory = (
  computerId: number,
  params: { page?: number; limit?: number } = {}
): Promise<ApiResponse<{ activities: ComputerActivity[]; meta: any }>> => {
  return apiRequest<{ activities: ComputerActivity[]; meta: any }>('GET', `/computers/${computerId}/activity-history`, { params });
};

/**
 * Tạo phiên sử dụng máy tính
 */
export const createComputerUsage = (usageData: CreateComputerUsageDto): Promise<ApiResponse<ComputerUsage>> => {
  return apiRequest<ComputerUsage>('POST', '/computer-usages', { data: usageData });
};

/**
 * Lấy danh sách phiên sử dụng máy tính
 */
export const getComputerUsages = (params: {
  page?: number;
  limit?: number;
  computerId?: number;
  userId?: number;
} = {}): Promise<ApiResponse<{ usages: ComputerUsage[]; meta: any }>> => {
  return apiRequest<{ usages: ComputerUsage[]; meta: any }>('GET', '/computer-usages', { params });
};

/**
 * Lấy chi tiết phiên sử dụng máy tính
 */
export const getComputerUsage = (id: number): Promise<ApiResponse<ComputerUsage>> => {
  return apiRequest<ComputerUsage>('GET', `/computer-usages/${id}`);
};

/**
 * Xóa phiên sử dụng máy tính
 */
export const deleteComputerUsage = (id: number, notes?: string): Promise<ApiResponse<{ message: string }>> => {
  return apiRequest<{ message: string }>('DELETE', `/computer-usages/${id}`, { 
    data: notes ? { notes } : undefined 
  });
};

/**
 * Upload file từ giáo viên đến sinh viên
 */
export const uploadFileToStudents = (
  file: File,
  targetComputerIds: number[],
  sourceId: number,
  notes?: string
): Promise<ApiResponse<FileTransfer>> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetComputerIds', targetComputerIds.join(','));
  formData.append('sourceId', sourceId.toString());
  if (notes) {
    formData.append('notes', notes);
  }
  
  return apiRequest<FileTransfer>('POST', '/file-transfers', {
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * Lấy danh sách chuyển file
 */
export const getFileTransfers = (params: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<ApiResponse<{ transfers: FileTransfer[]; meta: any }>> => {
  return apiRequest<{ transfers: FileTransfer[]; meta: any }>('GET', '/file-transfers/find-all', { params });
};

/**
 * Lấy danh sách chuyển file cho máy tính cụ thể
 */
export const getFileTransfersForComputer = (
  computerId: number,
  params: { page?: number; limit?: number; status?: string } = {}
): Promise<ApiResponse<{ transfers: FileTransfer[]; meta: any }>> => {
  return apiRequest<{ transfers: FileTransfer[]; meta: any }>('GET', `/computers/${computerId}/file-transfers`, { params });
};

/**
 * Cập nhật trạng thái chuyển file
 */
export const updateFileTransferStatus = (
  id: number,
  statusData: FileTransferStatusUpdateDto
): Promise<ApiResponse<FileTransfer>> => {
  return apiRequest<FileTransfer>('PUT', `/file-transfers/${id}/status`, { data: statusData });
};

/**
 * Lấy URL download cho file
 */
export const getFileTransferDownloadUrl = (fileTransferId: number, computerId: number): string => {
  return `/api/file-transfers/${fileTransferId}/download?computerId=${computerId}`;
};