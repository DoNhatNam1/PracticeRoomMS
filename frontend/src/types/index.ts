// Enum Types
export enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export enum RoomType {
  PRACTICE = 'PRACTICE',
  CLASSROOM = 'CLASSROOM',
  STUDIO = 'STUDIO',
  LAB = 'LAB'
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED'
}

export enum ComputerStatus {
  OPERATIONAL = 'OPERATIONAL',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_ORDER = 'OUT_OF_ORDER',
  RESERVED = 'RESERVED'
}

export enum ScheduleStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum RepeatType {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export enum LogLevel {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export enum LogType {
  AUTH = 'AUTH',
  USER = 'USER',
  ROOM = 'ROOM',
  COMPUTER = 'COMPUTER',
  SCHEDULE = 'SCHEDULE',
  SYSTEM = 'SYSTEM'
}

// Entity Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  department?: string;
  phone?: string;
  isActive: boolean;
  teacherId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: number;
  name: string;
  location?: string;
  capacity: number;
  description?: string;
  isActive: boolean;
  status: RoomStatus;
  computers?: Computer[];
  schedules?: Schedule[];
  usages?: RoomUsage[];
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa lại các trường cụ thể cho specs
export interface ComputerSpecs {
  cpu?: string;        // The CPU model (optional)
  ram?: string;        // The RAM size (optional)
  storage?: string;    // The storage size (optional)
  gpu?: string;        // The GPU model (if applicable) (optional)
  os?: string;         // The operating system (optional)
  // Các trường mở rộng có thể thêm sau
  [key: string]: any;  // Cho phép thêm trường tùy ý
}

export interface Computer {
  id: number;
  name: string;
  roomId: number;
  room?: Room;
  specs: ComputerSpecs;  // Thay đổi từ union type thành object type
  ipAddress?: string;
  macAddress?: string;
  status: ComputerStatus;
  lastMaintenance?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: number;
  roomId: number;
  room?: Room;
  title: string;
  startTime: string;
  endTime: string;
  repeat?: RepeatType; 
  status: ScheduleStatus;
  createdBy: number;
  user?: User;
  roomUsages?: RoomUsage[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomUsage {
  id: number;
  roomId: number;
  roomName?: string;
  userId: number;
  userName?: string;
  startTime: string;
  endTime?: string;
  purpose?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComputerUsage {
  id: number;
  computerId: number;
  computerName?: string;
  userId: number;
  userName?: string;
  startTime: string;
  endTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: number;
  targetId: number;
  targetType: 'ROOM' | 'COMPUTER';
  targetName?: string;
  reason: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completedBy?: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface SystemLog {
  id: number;
  type: string;
  userId: number;
  userName: string;
  targetId?: string;
  targetType?: string;
  targetName?: string;
  details?: string;
  createdAt: string;
}

export interface Log {
  id: number;
  timestamp: string;
  level: LogLevel;
  type: LogType;
  message: string;
  details?: string;
  user?: User;
  userId?: number;
}

// Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  roomId?: number;
  computerId?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: Role;
  department?: string;
  phone?: string;
}

// Common Event Types
export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  details?: any;
}

// Component Prop Types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: Role | Role[];
  redirectPath?: string;
}

