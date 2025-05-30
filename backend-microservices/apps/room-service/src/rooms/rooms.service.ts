import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomDto } from '@app/contracts/room-service/rooms/dto/room.dto';
import { CreateRoomDto } from '@app/contracts/room-service/rooms/dto/create-room.dto';
import { UpdateRoomDto } from '@app/contracts/room-service/rooms/dto/update-room.dto';
import { PrismaService } from '@app/prisma/prisma.service';
import { ComputerStatus, Prisma, RoomStatus } from '@prisma/client';
import { UpdateRoomStatusDto } from '@app/contracts/room-service';
import { ROOMS_EVENTS, ROOMS_PATTERNS } from '@app/contracts/room-service/rooms/constants';
import { Logger } from '@nestjs/common';
import { ActivityLogRoomService } from '../activity-log-room/activity-log-room.service';

@Injectable()
export class RoomsService {
  private context: any;
  private readonly logger = new Logger(RoomsService.name);
  
  constructor(
    private prisma: PrismaService,
    private readonly activityLogService: ActivityLogRoomService 
  ) {}
  
  setContext(metadata: any) {
    this.context = metadata;
  }
  
  private transformToRoomDto(room: any): RoomDto {
    return {
      ...room,
      location: room.location ?? undefined,
      description: room.description ?? undefined,
      // Transform any other null fields to undefined as needed
    };
  }

  async create(createRoomDto: CreateRoomDto): Promise<RoomDto> {
    try {
      // Sử dụng RoomStatus từ @prisma/client
      // Lưu ý: RoomType không có trong schema, nên không sử dụng
      const roomStatus = this.mapStatusToEnum(createRoomDto.status);
      
      const room = await this.prisma.room.create({
        data: {
          name: createRoomDto.name,
          capacity: createRoomDto.capacity || 1,
          location: createRoomDto.location || '',
          description: createRoomDto.description || '',
          status: roomStatus,
        },
      });
      
      // Log activity
      if (this.context?.userId) {
        await this.logRoomActivity(
          this.context.userId,
          'CREATE_ROOM',
          'room',
          room.id,
          { room }
        );
      }
      
      return this.transformToRoomDto(room);
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  // Helper function để map status string sang RoomStatus enum
  private mapStatusToEnum(status?: string): RoomStatus {
    if (!status) return RoomStatus.AVAILABLE;
    
    switch (status.toUpperCase()) {
      case 'AVAILABLE': return RoomStatus.AVAILABLE;
      case 'IN_USE': return RoomStatus.IN_USE;
      case 'MAINTENANCE': return RoomStatus.MAINTENANCE;
      case 'RESERVED': return RoomStatus.RESERVED;
      default: return RoomStatus.AVAILABLE;
    }
  }

  async findAll(query: any = {}): Promise<RoomDto[]> {
    const { status, search, locationId } = query;
    
    // Xây dựng query filter
    const where: Prisma.RoomWhereInput = {};
    
    if (status) {
      where.status = this.mapStatusToEnum(status);
    }
    
    // Type không có trong schema
    // if (type) {
    //   where.type = type;
    // }
    
    if (locationId) {
      where.location = { contains: locationId }; // locationId là string trong schema
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const rooms = await this.prisma.room.findMany({
      where,
      include: {
        computers: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        },
        usages: { // Sửa roomUsages thành usages theo schema
          where: {
            endTime: null
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              }
            },
            computerUsages: true // Thêm computerUsages vì có trong schema
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // Log activity
    if (this.context?.userId) {
      await this.activityLogService.logActivity(
        this.context.userId,
        'VIEW_ROOMS',
        {
          entityType: 'room',
          entityId: null,
          filters: query 
        }
      );
    }
    
    return rooms.map(room => this.transformToRoomDto(room));
  }

  async findOne(id: number): Promise<RoomDto> {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        computers: true,
        usages: {
          where: {
            endTime: null,
          },
          include: {
            user: true,
            computerUsages: {
              include: {
                computer: true,
              }
            }
          },
        },
      },
    });
    
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    
    // Log activity
    if (this.context?.userId) {
      await this.activityLogService.logActivity(
        this.context.userId,
        'VIEW_ROOM_DETAILS',
        {
          entityType: 'room',
          entityId: id
        }
      );
    }
    
    return this.transformToRoomDto(room);
  }

  async findOnePublic(id: number) {
    try {
      // Return limited fields for public view
      const room = await this.prisma.room.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          location: true,
          capacity: true,
          status: true,
          description: true,
          // Omit sensitive fields: createdById, detailed specs, etc.
        }
      });
      
      if (!room) {
        return {
          success: false,
          message: 'Room not found',
          statusCode: 404
        };
      }
      
      return {
        success: true,
        message: 'Room information retrieved',
        data: room
      };
    } catch (error) {
      this.logger.error(`Error finding public info for room ${id}: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve room information',
        error: error.message
      };
    }
  }

  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<RoomDto> {
    // Kiểm tra room có tồn tại
    const existingRoom = await this.prisma.room.findUnique({
      where: { id }
    });
    
    if (!existingRoom) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    
    // Chuẩn bị dữ liệu update theo schema
    const updateData: Prisma.RoomUpdateInput = {};
    
    if (updateRoomDto.name !== undefined) {
      updateData.name = updateRoomDto.name;
    }
    
    if (updateRoomDto.capacity !== undefined) {
      updateData.capacity = updateRoomDto.capacity;
    }
    
    if (updateRoomDto.location !== undefined) {
      updateData.location = updateRoomDto.location;
    }
    
    if (updateRoomDto.description !== undefined) {
      updateData.description = updateRoomDto.description;
    }
    
    // Không update type vì không có trong schema
    
    if (updateRoomDto.status !== undefined) {
      updateData.status = this.mapStatusToEnum(updateRoomDto.status);
    }
    
    const room = await this.prisma.room.update({
      where: { id },
      data: updateData,
    });
    
    // Log activity
    if (this.context?.userId) {
      await this.logRoomActivity(
        this.context.userId,
        'UPDATE_ROOM',
        'room',
        id,
        { updatedFields: Object.keys(updateRoomDto) }
      );
    }
    
    return this.transformToRoomDto(room);
  }

  async remove(id: number) {
    // Kiểm tra room có tồn tại
    const existingRoom = await this.prisma.room.findUnique({
      where: { id }
    });
    
    if (!existingRoom) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    
    // Kiểm tra room có đang được sử dụng
    const activeUsage = await this.prisma.roomUsage.findFirst({
      where: {
        roomId: id,
        endTime: null,
      },
    });
    
    if (activeUsage) {
      throw new Error(`Cannot delete room that is currently in use`);
    }
    
    // Kiểm tra room còn máy tính
    const computerCount = await this.prisma.computer.count({
      where: {
        roomId: id,
      },
    });
    
    if (computerCount > 0) {
      throw new Error(`Cannot delete room that contains computers. Please remove or reassign all computers first.`);
    }
    
    await this.prisma.room.delete({
      where: { id },
    });
    
    // Log activity
    if (this.context?.userId) {
      await this.logRoomActivity(
        this.context.userId,
        'DELETE_ROOM',
        'room',
        id,
        { id }
      );
    }
    
    return { message: `Room with ID ${id} removed successfully` };
  }

  // Method ghi log nội bộ
  async logRoomActivity(
    userId: number | null,
    action: string,
    entityType: string,
    entityId: number | null,
    details: any,
    ipAddress: string = '127.0.0.1'
  ) {
    try {
      const activityData: any = {
        action,
        entityType,
        entityId,
        details,
        ipAddress: this.context?.ipAddress || ipAddress,
        createdAt: new Date(),
      };

      if (userId) {
        activityData.user = {
          connect: { id: userId }
        };
      }

      return this.prisma.activity.create({
        data: activityData
      });
    } catch (error) {
      console.error('Lỗi khi ghi log room activity:', error);
    }
  }

  async updateStatus(id: number, updateStatusDto: UpdateRoomStatusDto) {
    try {
      // Đọc thông tin phòng TRƯỚC KHI cập nhật
      const room = await this.prisma.room.findUnique({
        where: { id },
      });
  
      if (!room) {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }
  
      // Lưu trạng thái cũ để sử dụng sau này
      const previousStatus = room.status;
  
      // Cập nhật trạng thái phòng
      const updatedRoom = await this.prisma.room.update({
        where: { id },
        data: {
          status: updateStatusDto.status,
          description: updateStatusDto.reason 
            ? `${room.description || ''}\n[${new Date().toISOString()}] Status update: ${updateStatusDto.reason}`
            : room.description
        }
      });
  
      // Ghi log hoạt động
      if (this.context?.userId) {
        await this.activityLogService.logActivity(
          this.context.userId,
          'UPDATE_ROOM_STATUS',
          { 
            entityType: 'room',  // Đưa vào details
            entityId: id,        // Đưa vào details
            previousStatus: previousStatus,
            newStatus: updateStatusDto.status,
            reason: updateStatusDto.reason 
          }
        );
      }
  
      return {
        success: true,
        data: updatedRoom,
      };
    } catch (error) {
      this.logger.error(`Error updating room status: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Find all rooms for dashboard view with pagination and detailed info
   * For admin and teacher roles
   */
  async findAllForDashboard(params: {
    page: number;
    limit: number;
    filters?: {
      status?: string;
      type?: string;
      building?: string;
      search?: string;
      isActive?: boolean;
    };
  }) {
    try {
      const { page = 1, limit = 10, filters = {} } = params;
      const { status, type, building, search, isActive } = filters;
      const skip = (page - 1) * limit;
      
      // Xây dựng query filter
      const where: Prisma.RoomWhereInput = {};
      
      if (status) {
        where.status = this.mapStatusToEnum(status);
      }
      
      if (building) {
        where.location = { contains: building };
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ];
      }
      
      if (isActive !== undefined) {
        where.isActive = isActive;
      }
      
      // Query with pagination
      const [rooms, total] = await Promise.all([
        this.prisma.room.findMany({
          where,
          skip,
          take: limit,
          include: {
            computers: {
              select: {
                id: true,
                name: true,
                status: true,
                specs: true, // Include full specs for admin/teacher
              }
            },
            usages: {
              where: {
                endTime: { gt: new Date() }, // Show current and future usages
              },
              take: 5,
              orderBy: { startTime: 'asc' },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                  }
                },
                computerUsages: {
                  include: {
                    computer: true,
                  }
                }
              }
            }
          },
          orderBy: {
            name: 'asc',
          },
        }),
        this.prisma.room.count({ where })
      ]);
      
      // Log activity
      if (this.context?.userId) {
        await this.activityLogService.logActivity(
          this.context.userId,
          'VIEW_ROOMS_DASHBOARD',
          {
            entityType: 'room',
            entityId: null,
            filters 
          }
        );
      }
      
      return {
        success: true,
        data: rooms.map(room => this.transformToRoomDto(room)),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.logger.error(`Error finding rooms for dashboard: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve rooms',
        error: error.message
      };
    }
  }

  /**
   * Find all rooms for client view with limited info
   * For public display on client side
   */
  async findAllForClient({ filters = {} }: { filters?: any }) {
    try {
      const { status = 'AVAILABLE', building, isActive = true } = filters;
      
      // Build where condition for client view
      const where: Prisma.RoomWhereInput = {
        isActive, // Default to active rooms only
      };
      
      if (status) {
        where.status = this.mapStatusToEnum(status);
      }
      
      if (building) {
        where.location = { contains: building };
      }
      
      // For client view, include minimal information
      const rooms = await this.prisma.room.findMany({
        where,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          capacity: true,
          location: true,
          status: true,
          // Include limited description
          description: true,
          // Only include public information
          computers: {
            select: {
              id: true,
              name: true,
              status: true,
              // Limited computer specs for client view
              specs: true
            },
            where: {
              status: { not: ComputerStatus.MAINTENANCE }
            }
          }
        }
      });
      
      // No need to log activity for public view
      
      return {
        success: true,
        data: rooms
        // No pagination metadata for client view
      };
    } catch (error) {
      this.logger.error(`Error finding rooms for client view: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve rooms',
        error: error.message
      };
    }
  }
}