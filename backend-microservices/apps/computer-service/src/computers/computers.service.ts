import { CreateComputerDto } from '@app/contracts/computer-service/computers/dto/create-computer.dto';
import { ComputerDto } from '@app/contracts/computer-service/computers/dto/computers.dto';
import { UpdateComputerDto } from '@app/contracts/computer-service/computers/dto/update-computer.dto';
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import { Prisma, ComputerStatus } from '@prisma/client';
import { ActivityLogComputerService } from '../activity-log-computer/activity-log-computer.service';

@Injectable()
export class ComputersService {
  private context: any;
  private readonly logger = new Logger(ComputersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogComputerService: ActivityLogComputerService,
  ) {}

  setContext(metadata: any) {
    this.context = metadata;
  }

  // Chuyển đổi từ entity thành DTO
  private mapToComputerDto(computer: any): ComputerDto {
    return {
      id: computer.id,
      name: computer.name,
      ipAddress: computer.ipAddress,
      macAddress: computer.macAddress,
      status:
        computer.status === ComputerStatus.OPERATIONAL ? 'active' : 'inactive',
      roomId: computer.roomId,
      room: computer.room,
      specs: computer.specs,
      // Thêm các trường khác nếu cần
    };
  }

  // Sửa hàm validateRoomId để không bao giờ trả về undefined
  private async validateRoomId(roomId: number | undefined): Promise<number> {
    if (roomId === undefined) {
      throw new NotFoundException(
        `Room ID is required for creating a computer`,
      );
    }

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    return roomId;
  }

  async create(createComputerDto: CreateComputerDto, user: any) {
    try {
      const { roomId, ...data } = createComputerDto;

      // Kiểm tra và xác thực roomId
      const validatedRoomId = await this.validateRoomId(roomId);

      // Sử dụng kiểu dữ liệu Prisma.ComputerUncheckedCreateInput
      const computerData: Prisma.ComputerUncheckedCreateInput = {
        name: data.name,
        ipAddress: data.ipAddress,
        macAddress: data.macAddress,
        status:
          data.status === 'active'
            ? ComputerStatus.OPERATIONAL
            : ComputerStatus.IN_USE,
        specs: data.specs || {},
        roomId: validatedRoomId, // Giờ validatedRoomId luôn là number
      };

      const computer = await this.prisma.computer.create({
        data: computerData,
        include: {
          room: true,
        },
      });

      // Log activity
      await this.activityLogComputerService.logActivity(
        user?.sub,
        'CREATE_COMPUTER',
        'COMPUTER',
        computer.id,
        {
          computerId: computer.id,
          roomId: computer.roomId,
          computerName: computer.name,
          // Other details...
        },
        null, // visibleToId if needed
      );

      return {
        success: true,
        message: 'Computer created successfully',
        data: {
          ...computer,
          ipAddress: computer.ipAddress ?? undefined,
          macAddress: computer.macAddress ?? undefined,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error creating computer: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(page = 1, limit = 10, filters: any = {}, currentUser: any) {
    try {
      const { status, roomId } = filters;

      // Build where condition
      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (roomId) {
        where.roomId = +roomId; // Convert to number with + operator
      }

      // Convert pagination params to numbers
      const pageNum = +page || 1; // Ensure it's a number, default to 1
      const limitNum = +limit || 10; // Ensure it's a number, default to 10
      const skip = (pageNum - 1) * limitNum;

      const [computers, total] = await Promise.all([
        this.prisma.computer.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { name: 'asc' },
          include: {
            room: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
            usages: {
              take: 5,
              orderBy: { startTime: 'desc' },
              include: {
                roomUsage: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        this.prisma.computer.count({ where }),
      ]);

      // Filter sensitive data from specs before returning
      const filteredComputers = computers.map((computer) => ({
        ...computer,
        specs: computer.specs
          ? {
              processor: (computer.specs as any).processor || 'Unknown',
              ram: (computer.specs as any).ram || 'Unknown',
              storage: (computer.specs as any).storage || 'Unknown',
              operatingSystem:
                (computer.specs as any).operatingSystem || 'Unknown',
            }
          : null,
      }));

      return {
        success: true,
        message: 'Computers retrieved successfully',
        data: filteredComputers, // Return filtered data
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      this.logger.error(`Error finding all computers: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve computers',
        error: error.message,
      };
    }
  }

  async findOne(id: number): Promise<ComputerDto> {
    try {
      const computer = await this.prisma.computer.findUnique({
        where: { id },
        include: {
          room: true,
          usages: {
            where: {
              endTime: null,
            },
            include: {
              roomUsage: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      name: true, // Sửa từ firstName, lastName thành fullName
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!computer) {
        throw new NotFoundException(`Computer with ID ${id} not found`);
      }

      // Log activity
      if (this.context?.userId) {
        await this.logComputerActivity(
          this.context.userId,
          'VIEW_COMPUTER_DETAILS',
          'computer',
          id,
          {},
        );
      }

      return this.mapToComputerDto(computer);
    } catch (error) {
      this.logger.error(
        `Error finding computer by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    id: number,
    updateComputerDto: UpdateComputerDto,
    user: any,
  ): Promise<{ success: boolean; message: string; data: ComputerDto; }> {
    try {
      // Kiểm tra computer có tồn tại
      const existingComputer = await this.prisma.computer.findUnique({
        where: { id },
      });

      if (!existingComputer) {
        throw new NotFoundException(`Computer with ID ${id} not found`);
      }

      // Chuẩn bị dữ liệu update
      const updateData: Prisma.ComputerUncheckedUpdateInput = {};

      if (updateComputerDto.name !== undefined) {
        updateData.name = updateComputerDto.name;
      }

      if (updateComputerDto.ipAddress !== undefined) {
        updateData.ipAddress = updateComputerDto.ipAddress;
      }

      if (updateComputerDto.macAddress !== undefined) {
        updateData.macAddress = updateComputerDto.macAddress;
      }

      if (updateComputerDto.status !== undefined) {
        updateData.status =
          updateComputerDto.status === 'active'
            ? ComputerStatus.OPERATIONAL
            : ComputerStatus.IN_USE;
      }

      if (updateComputerDto.specs !== undefined) {
        updateData.specs = updateComputerDto.specs;
      }

      // Kiểm tra roomId nếu được cung cấp
      if (updateComputerDto.roomId !== undefined) {
        // Kiểm tra và xác thực roomId
        const validatedRoomId = await this.validateRoomId(
          updateComputerDto.roomId,
        );
        updateData.roomId = validatedRoomId;
      }

      const computer = await this.prisma.computer.update({
        where: { id },
        data: updateData,
        include: {
          room: true,
        },
      });

      // Log activity
      await this.activityLogComputerService.logActivity(
        user?.sub, // Add user ID as actorId
        'UPDATE_COMPUTER',
        'COMPUTER',
        id,
        {
          computerId: id,
          changes: updateComputerDto,
          // Other details...
        },
        null, // visibleToId if needed
      );

      return {
        success: true,
        message: 'Computer updated successfully',
        data: {
          ...computer,
          ipAddress: computer.ipAddress ?? undefined,
          macAddress: computer.macAddress ?? undefined,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error updating computer: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: number, user: any) {
    try {
      // Find the computer first to include details in the log
      const computer = await this.prisma.computer.findUnique({
        where: { id },
        include: { room: true },
      });

      if (!computer) {
        return {
          success: false,
          message: 'Computer not found',
          statusCode: 404,
        };
      }

      // Delete the computer
      await this.prisma.computer.delete({
        where: { id },
      });

      // Log the activity with proper actorId
      await this.activityLogComputerService.logActivity(
        user?.sub,
        'DELETE_COMPUTER',
        'COMPUTER',
        id,
        {
          computerId: id,
          computerName: computer?.name,
          roomId: computer?.roomId,
          roomName: computer?.room?.name,
        },
        null,
      );

      return {
        success: true,
        message: 'Computer deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting computer: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Failed to delete computer',
        error: error.message,
        statusCode: 500,
      };
    }
  }

  // Method ghi log nội bộ
  async logComputerActivity(
    userId: number,
    action: string,
    entityType: string,
    entityId: number | null,
    details: any,
    ipAddress: string = '127.0.0.1',
  ) {
    try {
      // Tạo đối tượng Prisma.ActivityUncheckedCreateInput thay vì any
      const activityData: Prisma.ActivityUncheckedCreateInput = {
        action,
        details,
        createdAt: new Date(),
      };

      return this.prisma.activity.create({
        data: activityData,
      });
    } catch (error) {
      this.logger.error(
        `Lỗi khi ghi log computer activity: ${error.message}`,
        error.stack,
      );
      // Không throw lỗi để tránh ảnh hưởng đến luồng chính
    }
  }

  async getRoomComputersForClient(filters: any = {}) {
    try {
      const { roomId } = filters;

      // Validate roomId is provided
      if (!roomId) {
        return {
          success: false,
          message: 'Room ID is required to view computers',
          statusCode: 400,
        };
      }

      // Build where condition - only filter by roomId, not status
      const where: any = {
        roomId: +roomId,
        // No status filter - return all computers
      };

      const computers = await this.prisma.computer.findMany({
        where,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          status: true,
          specs: true,
          room: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: `All computers in the specified room retrieved successfully`,
        data: {
          computers,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error finding all computers for client: ${error.message}`,
      );
      return {
        success: false,
        message: 'Failed to retrieve computers',
        error: error.message,
      };
    }
  }

  async updateStatus(id: number, status: string, user?: any) {
    try {
      this.logger.log(`Updating computer ${id} status to ${status}`);

      // Get current computer to record old status
      const computer = await this.prisma.computer.findUnique({
        where: { id },
      });

      if (!computer) {
        return {
          success: false,
          message: 'Computer not found',
          statusCode: 404,
        };
      }

      // Validate status is a valid enum value
      const validStatuses = [
        'OPERATIONAL',
        'MAINTENANCE',
        'IN_USE',
        'OFFLINE',
        'OUT_OF_ORDER',
      ];
      if (!validStatuses.includes(status)) {
        return {
          success: false,
          message: 'Invalid status value',
          statusCode: 400,
        };
      }

      // Convert string status to ComputerStatus enum
      const computerStatus = status as unknown as ComputerStatus;

      // Update the status with the enum value
      const updatedComputer = await this.prisma.computer.update({
        where: { id },
        data: {
          status: computerStatus, // Now it's properly typed
          updatedAt: new Date(),
        },
      });

      // Log the activity with proper actorId
      await this.activityLogComputerService.logActivity(
        user?.sub, // Add user ID as actorId
        'UPDATE_STATUS',
        'COMPUTER',
        id,
        {
          computerId: id,
          oldStatus: computer.status,
          newStatus: status,
          // Other details...
        },
        null, // visibleToId if needed
      );

      return {
        success: true,
        message: 'Computer status updated successfully',
        data: updatedComputer,
      };
    } catch (error) {
      this.logger.error(`Error updating computer status: ${error.message}`);
      return {
        success: false,
        message: 'Failed to update computer status',
        error: error.message,
        statusCode: 500,
      };
    }
  }
}
