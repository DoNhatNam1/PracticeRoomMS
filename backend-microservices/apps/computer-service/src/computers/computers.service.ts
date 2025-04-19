import { CreateComputerDto } from '@app/contracts/computer-service/computers/dto/create-computer.dto';
import { ComputerDto } from '@app/contracts/computer-service/computers/dto/computers.dto';
import { UpdateComputerDto } from '@app/contracts/computer-service/computers/dto/update-computer.dto';
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import { Prisma, ComputerStatus } from '@prisma/client';

@Injectable()
export class ComputersService {
  private context: any;
  private readonly logger = new Logger(ComputersService.name);

  constructor(private prisma: PrismaService) {}

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
      status: computer.status === ComputerStatus.OPERATIONAL ? 'active' : 'inactive',
      roomId: computer.roomId,
      room: computer.room,
      specs: computer.specs,
      // Thêm các trường khác nếu cần
    };
  }

  // Sửa hàm validateRoomId để không bao giờ trả về undefined
  private async validateRoomId(roomId: number | undefined): Promise<number> {
    if (roomId === undefined) {
      throw new NotFoundException(`Room ID is required for creating a computer`);
    }
    
    const room = await this.prisma.room.findUnique({
      where: { id: roomId }
    });
    
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }
    
    return roomId;
  }

  async create(createComputerDto: CreateComputerDto): Promise<ComputerDto> {
    try {
      const { roomId, ...data } = createComputerDto;
      
      // Kiểm tra và xác thực roomId
      const validatedRoomId = await this.validateRoomId(roomId);
      
      // Sử dụng kiểu dữ liệu Prisma.ComputerUncheckedCreateInput
      const computerData: Prisma.ComputerUncheckedCreateInput = {
        name: data.name,
        ipAddress: data.ipAddress,
        macAddress: data.macAddress,
        status: data.status === 'active' ? ComputerStatus.OPERATIONAL : ComputerStatus.IN_USE,
        specs: data.specs || {},
        roomId: validatedRoomId, // Giờ validatedRoomId luôn là number
      };
      
      const computer = await this.prisma.computer.create({
        data: computerData,
        include: {
          room: true
        }
      });
      
      // Log activity
      if (this.context?.userId) {
        await this.logComputerActivity(
          this.context.userId,
          'CREATE_COMPUTER',
          'computer',
          computer.id,
          { computer: { ...computer, specs: undefined } }
        );
      }
      
      return this.mapToComputerDto(computer);
    } catch (error) {
      this.logger.error(`Error creating computer: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(query: any): Promise<ComputerDto[]> {
    try {
      const { status, roomId, search } = query;

      // Xây dựng query filter
      const where: Prisma.ComputerWhereInput = {};

      if (status) {
        // Chuyển đổi từ active/inactive sang OPERATIONAL/OUT_OF_ORDER
        where.status = status === 'active' ? ComputerStatus.OPERATIONAL : ComputerStatus.IN_USE;
      }

      if (roomId) {
        where.roomId = +roomId;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          // Sửa cách tìm kiếm trong JSON để phù hợp với Prisma
          {
            specs: {
              path: ['os'],
              string_contains: search,
            },
          },
          {
            specs: {
              path: ['cpu'],
              string_contains: search,
            },
          },
        ];
      }

      const computers = await this.prisma.computer.findMany({
        where,
        include: {
          room: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
          usages: { // Sửa từ "computers" thành "computerUsages"
            where: {
              endTime: null,
            },
            take: 1,
            include: {
              roomUsage: {
                select: {
                  userId: true,
                  user: {
                    select: {
                      id: true,
                      email: true,
                      name: true,  // Sửa từ firstName, lastName thành fullName
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Log activity
      if (this.context?.userId) {
        await this.logComputerActivity(
          this.context.userId,
          'VIEW_COMPUTERS',
          'computer',
          null,
          { filters: query }
        );
      }

      return computers.map(computer => this.mapToComputerDto(computer));
    } catch (error) {
      this.logger.error(`Error finding computers: ${error.message}`, error.stack);
      throw error;
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
                      name: true,  // Sửa từ firstName, lastName thành fullName
                    }
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
          {}
        );
      }

      return this.mapToComputerDto(computer);
    } catch (error) {
      this.logger.error(`Error finding computer by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: number, updateComputerDto: UpdateComputerDto): Promise<ComputerDto> {
    try {
      // Kiểm tra computer có tồn tại
      const existingComputer = await this.prisma.computer.findUnique({
        where: { id }
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
        updateData.status = updateComputerDto.status === 'active'
          ? ComputerStatus.OPERATIONAL
          : ComputerStatus.IN_USE;
      }
      
      if (updateComputerDto.specs !== undefined) {
        updateData.specs = updateComputerDto.specs;
      }
      
      // Kiểm tra roomId nếu được cung cấp
      if (updateComputerDto.roomId !== undefined) {
        // Kiểm tra và xác thực roomId
        const validatedRoomId = await this.validateRoomId(updateComputerDto.roomId);
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
      if (this.context?.userId) {
        await this.logComputerActivity(
          this.context.userId,
          'UPDATE_COMPUTER',
          'computer',
          id,
          { updatedFields: Object.keys(updateComputerDto) }
        );
      }
      
      return this.mapToComputerDto(computer);
    } catch (error) {
      this.logger.error(`Error updating computer: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      // Kiểm tra computer có tồn tại
      const existingComputer = await this.prisma.computer.findUnique({
        where: { id }
      });

      if (!existingComputer) {
        throw new NotFoundException(`Computer with ID ${id} not found`);
      }

      // Kiểm tra computer có đang được sử dụng
      const activeUsage = await this.prisma.computerUsage.findFirst({
        where: {
          computerId: id,
          endTime: null,
        },
      });

      if (activeUsage) {
        throw new Error(`Cannot delete computer that is currently in use`);
      }

      await this.prisma.computer.delete({
        where: { id },
      });

      // Log activity
      if (this.context?.userId) {
        await this.logComputerActivity(
          this.context.userId,
          'DELETE_COMPUTER',
          'computer',
          id,
          { id }
        );
      }

      return { message: `Computer with ID ${id} removed successfully` };
    } catch (error) {
      this.logger.error(`Error removing computer: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Method ghi log nội bộ
  async logComputerActivity(
    userId: number,
    action: string,
    entityType: string,
    entityId: number | null,
    details: any,
    ipAddress: string = '127.0.0.1'
  ) {
    try {
      // Tạo đối tượng Prisma.ActivityUncheckedCreateInput thay vì any
      const activityData: Prisma.ActivityUncheckedCreateInput = {
        action,
        details,
        createdAt: new Date(),
      };

      return this.prisma.activity.create({
        data: activityData
      });
    } catch (error) {
      this.logger.error(`Lỗi khi ghi log computer activity: ${error.message}`, error.stack);
      // Không throw lỗi để tránh ảnh hưởng đến luồng chính
    }
  }
}