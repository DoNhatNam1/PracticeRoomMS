import { RepeatType, ScheduleStatus } from '../../common/enums';

export interface Schedule {
  id: number;
  title: string;
  description?: string;
  roomId: number;
  createdBy: number;
  startTime: string;
  endTime: string;
  repeat: RepeatType;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleWithDetails extends Schedule {
  room: {
    id: number;
    name: string;
    location?: string;
  };
  creator: {
    id: number;
    name: string;
  };
}

export interface ScheduleFilter {
  roomId?: number;
  userId?: number;
  startDate?: string;
  endDate?: string;
  status?: ScheduleStatus | ScheduleStatus[];
  repeat?: RepeatType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateScheduleDto {
  title: string;
  description?: string;
  roomId: number;
  startTime: string;
  endTime: string;
  repeat?: RepeatType;
}

export interface UpdateScheduleDto {
  title?: string;
  description?: string;
  roomId?: number;
  startTime?: string;
  endTime?: string;
  repeat?: RepeatType;
}

export interface ChangeScheduleStatusDto {
  status: ScheduleStatus;
  reason?: string;
}

export interface ScheduleConflict {
  conflictingSchedules: Schedule[];
  hasConflict: boolean;
}

export interface CheckScheduleConflictDto {
  roomId: number;
  startTime: string;
  endTime: string;
  excludeScheduleId?: number;
}