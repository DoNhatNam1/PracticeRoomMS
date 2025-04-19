import { apiRequest, ApiResponse } from './base';
import { LogLevel, LogType } from '../types/common/enums';
import { PaginatedResponse } from '../types/common/pagination';
import { addDays, format, subDays } from 'date-fns';

export interface Log {
  id: number;
  timestamp: string;
  level: LogLevel;
  type: LogType;
  message: string;
  details?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  userId?: number;
}

export interface LogFilter {
  page?: number;
  limit?: number;
  level?: LogLevel;
  type?: LogType;
  search?: string;
  startDate?: string;
  endDate?: string;
  userId?: number;
}

export interface LogsResponse extends PaginatedResponse<Log> {}

/**
 * Lấy danh sách system logs với các bộ lọc
 */
export const getSystemLogs = (filters: LogFilter) => {
  if (useMockData) {
    return mockGetSystemLogs(filters);
  }
  return apiRequest<LogsResponse>('GET', '/logs', { params: filters });
};

/**
 * Xóa logs
 */
export const deleteLogs = (ids: number[]) => {
  return apiRequest<{ success: boolean }>('DELETE', '/logs', { 
    data: { ids } 
  });
};

// Thêm biến flag để kiểm soát việc sử dụng mock data
export const useMockData = true;

// Tạo hàm mock riêng biệt
export const mockGetSystemLogs = (filters: LogFilter) => {
  return Promise.resolve(getMockLogs(filters));
};

/**
 * Mock data cho phát triển front-end khi chưa có API thực
 */
export const getMockLogs = (filter: LogFilter): ApiResponse<LogsResponse> => {
  const today = new Date();
  
  // Tạo mock data cho logs
  const generateMockLogs = (count: number) => {
    const logs = [];
    const users = [
      { id: 1, name: 'Admin User', email: 'admin@example.com' },
      { id: 2, name: 'Teacher User', email: 'teacher@example.com' },
      { id: 3, name: 'Student User', email: 'student@example.com' },
      null // Để tạo một số log từ system
    ];
    
    const logTypes = [
      LogType.AUTH, LogType.USER, LogType.ROOM, 
      LogType.COMPUTER, LogType.SCHEDULE, LogType.SYSTEM
    ];
    
    const logLevels = [
      LogLevel.ERROR, LogLevel.WARNING, LogLevel.INFO, LogLevel.DEBUG
    ];
    
    const logMessages = {
      [LogType.AUTH]: [
        "User login successful",
        "User login failed - incorrect password",
        "Password reset requested",
        "User logged out",
        "User session expired",
        "Too many failed login attempts - account locked"
      ],
      [LogType.USER]: [
        "User profile updated",
        "New user created",
        "User password changed",
        "User role updated",
        "User account deactivated",
        "User account activated"
      ],
      [LogType.ROOM]: [
        "New room created",
        "Room information updated",
        "Room status changed to MAINTENANCE",
        "Room status changed to AVAILABLE",
        "Room deleted",
        "Room schedule conflict detected"
      ],
      [LogType.COMPUTER]: [
        "Computer added to room",
        "Computer status changed to OUT_OF_ORDER",
        "Computer removed from room",
        "Computer information updated",
        "Software installed on computer",
        "Maintenance performed on computer"
      ],
      [LogType.SCHEDULE]: [
        "New schedule created",
        "Schedule updated",
        "Schedule cancelled",
        "Schedule completed",
        "Schedule request approved",
        "Schedule request rejected"
      ],
      [LogType.SYSTEM]: [
        "System backup completed",
        "System update initiated",
        "Database maintenance completed",
        "System performance issue detected",
        "Disk space warning",
        "Application restarted"
      ]
    };
    
    for (let i = 0; i < count; i++) {
      const id = i + 1;
      const type = logTypes[Math.floor(Math.random() * logTypes.length)];
      const level = logLevels[Math.floor(Math.random() * logLevels.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const messages = logMessages[type];
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      // Tạo timestamp ngẫu nhiên trong 30 ngày qua
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      const timestamp = subDays(today, daysAgo);
      timestamp.setHours(hoursAgo);
      timestamp.setMinutes(minutesAgo);
      
      // Thêm chi tiết cho một số log
      let details = null;
      if (Math.random() > 0.7) {
        if (type === LogType.AUTH) {
          details = `IP: 192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}, User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)`;
        } else if (type === LogType.SYSTEM) {
          details = `Server: app-server-${Math.floor(Math.random() * 5) + 1}, Process ID: ${Math.floor(Math.random() * 10000)}`;
        } else if (type === LogType.ROOM || type === LogType.COMPUTER || type === LogType.SCHEDULE) {
          details = `ID: ${Math.floor(Math.random() * 100) + 1}, Action performed by: ${user?.name || 'System'}`;
        }
      }
      
      logs.push({
        id,
        timestamp: timestamp.toISOString(),
        level,
        type,
        user,
        message,
        details
      });
    }
    
    // Sắp xếp logs theo thời gian giảm dần
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };
  
  const allLogs = generateMockLogs(200);
  
  // Lọc logs theo filter
  let filteredLogs = [...allLogs];
  
  if (filter.level) {
    filteredLogs = filteredLogs.filter(log => log.level === filter.level);
  }
  
  if (filter.type) {
    filteredLogs = filteredLogs.filter(log => log.type === filter.type);
  }
  
  if (filter.search) {
    const search = filter.search.toLowerCase();
    filteredLogs = filteredLogs.filter(log => 
      log.message.toLowerCase().includes(search) ||
      (log.details && log.details.toLowerCase().includes(search)) ||
      (log.user?.name && log.user.name.toLowerCase().includes(search))
    );
  }
  
  if (filter.startDate) {
    const startDate = new Date(filter.startDate);
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
  }
  
  if (filter.endDate) {
    const endDate = new Date(filter.endDate);
    endDate.setHours(23, 59, 59, 999); // End of the day
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
  }
  
  if (filter.userId) {
    filteredLogs = filteredLogs.filter(log => log.user?.id === filter.userId);
  }
  
  // Phân trang
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredLogs.length / limit);
  
  return {
    success: true,
    data: {
      items: paginatedLogs,
      meta: {
        totalItems: filteredLogs.length,
        itemCount: paginatedLogs.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page
      },
      total: filteredLogs.length,
      totalPages
    }
  };
};