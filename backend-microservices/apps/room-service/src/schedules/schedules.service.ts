import { BadRequestException, ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClientNats } from '@nestjs/microservices';
import { RoomsService } from '../rooms/rooms.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { Role, ScheduleStatus, RepeatType } from '@prisma/client';
import { SCHEDULES_EVENTS } from '@app/contracts/room-service';
import { ActivityLogRoomService } from '../activity-log-room/activity-log-room.service';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly roomsService: RoomsService,
    private readonly activityLogRoomService: ActivityLogRoomService,
    @Inject('NATS_CLIENT') private readonly natsClient: ClientNats
  ) {}

  /**
   * 1. Tạo lịch phòng học
   * - Input: ID phòng, thời gian bắt đầu, thời gian kết thúc, thông tin người dùng
   * - Output: Lịch phòng đã được tạo
   */
  async create(data: {
    roomId: number;
    title: string;
    startTime: string | Date;
    endTime: string | Date;
    repeat?: RepeatType;
    userId: number;
    userRole: Role;
  }) {
    const { roomId, title, startTime, endTime, repeat, userId, userRole } = data;
    
    // Kiểm tra thời gian hợp lệ
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);
    
    if (startDateTime >= endDateTime) {
      throw new BadRequestException('Thời gian bắt đầu phải trước thời gian kết thúc');
    }

    // Kiểm tra xem phòng có tồn tại và đang hoạt động không
    const room = await this.prisma.room.findUnique({
      where: { 
        id: roomId,
        isActive: true
      },
    });

    if (!room) {
      this.logger.error(`Phòng với ID ${roomId} không tồn tại hoặc không khả dụng`);
      throw new NotFoundException(`Phòng với ID ${roomId} không tồn tại hoặc không khả dụng`);
    }

    // Kiểm tra xung đột lịch
    const conflicts = await this.checkScheduleConflicts({
      roomId,
      startTime: startDateTime,
      endTime: endDateTime
    });
    
    if (conflicts.length > 0) {
      throw new BadRequestException('Lịch bị trùng với các lịch đã đặt');
    }

    // Xác định trạng thái lịch dựa trên vai trò người dùng
    // Admin và Teacher được tự duyệt, Student cần chờ duyệt
    const initialStatus = userRole === Role.STUDENT 
      ? ScheduleStatus.PENDING 
      : ScheduleStatus.APPROVED;

    // Logic tạo lịch đặt phòng
    const schedule = await this.prisma.schedule.create({
      data: {
        roomId,
        title,
        startTime: startDateTime,
        endTime: endDateTime,
        repeat: repeat || RepeatType.NONE,
        status: initialStatus,
        createdBy: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdById: true
          }
        },
        room: true
      }
    });

    this.logger.log(`Lịch đã được tạo: ${JSON.stringify(schedule)}`);

    // Xác định người nhận thông báo (ngoài admin)
    let visibleToId = null as number | null;
    if (userRole === Role.STUDENT && schedule.user.createdById) {
      visibleToId = schedule.user.createdById; // Teacher của Student
    }

    // Ghi log hoạt động - Sửa signature
    await this.activityLogRoomService.logActivity(
      userId,
      'ROOM_SCHEDULED',
      { 
        roomId, 
        roomName: room.name,
        title, 
        startTime, 
        endTime,
        status: initialStatus,
        entityType: 'SCHEDULE',  // Chuyển entityType vào details
        entityId: schedule.id    // Chuyển entityId vào details
      },
      visibleToId
    );

    // Phát event sử dụng pattern từ libs
    this.natsClient.emit(SCHEDULES_EVENTS.SCHEDULED, {
      scheduleId: schedule.id,
      roomId,
      userId,
      title,
      startTime,
      endTime,
      repeat,
      status: initialStatus
    });

    // Nếu lịch đã được duyệt, cập nhật trạng thái phòng
    if (initialStatus === ScheduleStatus.APPROVED) {
      this.natsClient.emit(SCHEDULES_EVENTS.ROOM_RESERVED, {
        roomId: schedule.roomId,
        scheduleId: schedule.id
      });
    }

    return schedule;
  }

  /**
   * 2. Duyệt lịch phòng học
   * - Input: ID lịch, trạng thái mới, thông tin người duyệt
   * - Output: Lịch phòng đã được cập nhật trạng thái
   */
  async approveSchedule(data: {
    scheduleId: number;
    status: ScheduleStatus;
    userId: number;
    userRole: Role;
  }) {
    const { scheduleId, status, userId, userRole } = data;
    
    // Kiểm tra quyền duyệt lịch (chỉ Admin và Teacher được duyệt)
    if (userRole === Role.STUDENT) {
      throw new ForbiddenException('Sinh viên không có quyền duyệt lịch');
    }

    // Chỉ cho phép duyệt/từ chối, không cho phép cập nhật sang trạng thái khác
    if (status !== ScheduleStatus.APPROVED && status !== ScheduleStatus.REJECTED) {
      throw new BadRequestException('Trạng thái không hợp lệ cho việc duyệt lịch');
    }
    
    // Tìm lịch cần duyệt
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { 
        user: {
          select: {
            id: true,
            name: true, 
            role: true,
            createdById: true
          }
        },
        room: true
      }
    });
    
    if (!schedule) {
      throw new NotFoundException(`Lịch với ID ${scheduleId} không tồn tại`);
    }

    // Chỉ được duyệt lịch đang ở trạng thái PENDING
    if (schedule.status !== ScheduleStatus.PENDING) {
      throw new BadRequestException(`Lịch không ở trạng thái chờ duyệt`);
    }
    
    // Kiểm tra nếu là giáo viên, họ chỉ được duyệt lịch của sinh viên do họ tạo
    if (userRole === Role.TEACHER && 
        schedule.user.role === Role.STUDENT && 
        schedule.user.createdById !== userId) {
      throw new ForbiddenException(
        'Giáo viên chỉ có thể duyệt lịch của sinh viên do mình quản lý'
      );
    }
    
    // Cập nhật trạng thái lịch
    const updatedSchedule = await this.prisma.schedule.update({
      where: { id: scheduleId },
      data: { status },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    // Ghi log hoạt động - Sửa signature
    await this.activityLogRoomService.logActivity(
      userId,
      status === ScheduleStatus.APPROVED ? 'ROOM_SCHEDULE_APPROVED' : 'ROOM_SCHEDULE_REJECTED',
      {
        roomId: schedule.roomId,
        roomName: schedule.room.name,
        title: schedule.title,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        previousStatus: schedule.status,
        newStatus: status,
        entityType: 'SCHEDULE',  // Chuyển entityType vào details
        entityId: scheduleId     // Chuyển entityId vào details
      },
      schedule.createdBy as number | null
    );
    
    // Phát event
    this.natsClient.emit(SCHEDULES_EVENTS.STATUS_UPDATED, {
      scheduleId,
      roomId: schedule.roomId,
      userId,
      previousStatus: schedule.status,
      status,
      schedule: {
        title: schedule.title,
        startTime: schedule.startTime,
        endTime: schedule.endTime
      }
    });
    
    // Xử lý logic đặc biệt cho từng status
    if (status === ScheduleStatus.APPROVED) {
      this.natsClient.emit(SCHEDULES_EVENTS.ROOM_RESERVED, {
        roomId: schedule.roomId,
        scheduleId
      });
    } else if (status === ScheduleStatus.REJECTED) {
      this.natsClient.emit(SCHEDULES_EVENTS.ROOM_RELEASED, {
        roomId: schedule.roomId,
        scheduleId
      });
    }
    
    return updatedSchedule;
  }
  
  /**
   * 3. Hủy lịch phòng học
   * - Input: ID lịch, thông tin người hủy
   * - Output: Lịch phòng đã bị hủy
   */
  async cancelSchedule(data: {
    scheduleId: number;
    userId: number;
    userRole: Role;
  }) {
    const { scheduleId, userId, userRole } = data;
    
    // Tìm lịch cần hủy
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            createdById: true
          }
        },
        room: true
      }
    });
    
    if (!schedule) {
      throw new NotFoundException(`Lịch với ID ${scheduleId} không tồn tại`);
    }
    
    // Kiểm tra quyền hủy lịch
    // - Admin: hủy được tất cả
    // - Giáo viên: hủy được lịch của mình và sinh viên của họ
    // - Sinh viên: chỉ hủy được lịch của mình
    if (userRole === Role.STUDENT && schedule.createdBy !== userId) {
      throw new ForbiddenException('Sinh viên chỉ được hủy lịch do mình tạo');
    }
    
    if (userRole === Role.TEACHER) {
      // Nếu không phải lịch của giáo viên đó tạo
      if (schedule.createdBy !== userId) {
        // Kiểm tra xem lịch có phải của sinh viên do giáo viên này tạo không
        if (schedule.user.createdById !== userId) {
          throw new ForbiddenException(
            'Giáo viên chỉ được hủy lịch của mình hoặc sinh viên do mình quản lý'
          );
        }
      }
    }
    
    // Không cho phép hủy lịch đã hoàn thành hoặc đã bị hủy/từ chối
    if (schedule.status === ScheduleStatus.COMPLETED || 
        schedule.status === ScheduleStatus.CANCELLED || 
        schedule.status === ScheduleStatus.REJECTED) {
      throw new BadRequestException(`Không thể hủy lịch đang ở trạng thái ${schedule.status}`);
    }
    
    // Hủy lịch
    const cancelledSchedule = await this.prisma.schedule.update({
      where: { id: scheduleId },
      data: { status: ScheduleStatus.CANCELLED },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    // Xác định người nhận thông báo (ngoài admin)
    let visibleToId = null as number | null;
    
    if (userRole === Role.ADMIN) {
      // Nếu admin hủy lịch, thông báo cho người tạo lịch
      visibleToId = schedule.createdBy;
    } 
    else if (userRole === Role.TEACHER && schedule.createdBy !== userId) {
      // Nếu giáo viên hủy lịch của sinh viên, thông báo cho sinh viên đó
      visibleToId = schedule.createdBy;
    }
    else if (userRole === Role.STUDENT && schedule.user.createdById) {
      // Nếu sinh viên hủy lịch của mình, thông báo cho giáo viên quản lý
      visibleToId = schedule.user.createdById;
    }
    
    // Ghi log hoạt động - Sửa signature
    await this.activityLogRoomService.logActivity(
      userId,
      'ROOM_SCHEDULE_CANCELLED',
      {
        roomId: schedule.roomId,
        roomName: schedule.room.name,
        title: schedule.title,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        previousStatus: schedule.status,
        entityType: 'SCHEDULE',  // Chuyển entityType vào details
        entityId: scheduleId     // Chuyển entityId vào details
      },
      visibleToId
    );
    
    // Phát event
    this.natsClient.emit(SCHEDULES_EVENTS.STATUS_UPDATED, {
      scheduleId,
      roomId: schedule.roomId,
      userId,
      previousStatus: schedule.status,
      status: ScheduleStatus.CANCELLED,
      schedule: {
        title: schedule.title,
        startTime: schedule.startTime,
        endTime: schedule.endTime
      }
    });
    
    // Phát event giải phóng phòng nếu lịch đang được duyệt
    if (schedule.status === ScheduleStatus.APPROVED) {
      this.natsClient.emit(SCHEDULES_EVENTS.ROOM_RELEASED, {
        roomId: schedule.roomId,
        scheduleId
      });
    }
    
    return cancelledSchedule;
  }
  
  /**
   * 4. Kiểm tra xung đột lịch phòng
   * - Input: ID phòng, thời gian bắt đầu, thời gian kết thúc
   * - Output: Danh sách các lịch xung đột
   */
  async checkScheduleConflicts(data: {
    roomId: number;
    startTime: Date;
    endTime: Date;
    excludeScheduleId?: number;
  }) {
    const { roomId, startTime, endTime, excludeScheduleId } = data;
    
    // Xây dựng điều kiện tìm kiếm
    const whereCondition: any = {
      roomId,
      status: { in: [ScheduleStatus.PENDING, ScheduleStatus.APPROVED] },
      OR: [
        // Trường hợp 1: Thời gian bắt đầu mới nằm trong khoảng thời gian của lịch cũ
        {
          startTime: { lte: startTime },
          endTime: { gt: startTime }
        },
        // Trường hợp 2: Thời gian kết thúc mới nằm trong khoảng thời gian của lịch cũ
        {
          startTime: { lt: endTime },
          endTime: { gte: endTime }
        },
        // Trường hợp 3: Lịch mới bao trọn lịch cũ
        {
          startTime: { gte: startTime },
          endTime: { lte: endTime }
        }
      ]
    };
    
    // Nếu có ID lịch cần loại trừ (khi cập nhật lịch hiện có)
    if (excludeScheduleId) {
      whereCondition.id = { not: excludeScheduleId };
    }
    
    // Tìm các lịch xung đột
    const conflicts = await this.prisma.schedule.findMany({
      where: whereCondition,
      include: {
        room: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });
    
    return conflicts;
  }
}