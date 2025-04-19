import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';

@Injectable()
export class RoomUsageService {
  private readonly logger = new Logger(RoomUsageService.name);

  constructor(private readonly prisma: PrismaService) {}

  async startUsage(data: any) {
    const { roomId, userId, startTime } = data;

    // Logic bắt đầu sử dụng phòng
    const usage = await this.prisma.roomUsage.create({
      data: {
        roomId,
        userId,
        startTime: new Date(startTime),
      },
    });

    return usage;
  }

  async endUsage(data: any) {
    const { usageId, endTime } = data;

    // Logic kết thúc sử dụng phòng
    const usage = await this.prisma.roomUsage.update({
      where: { id: usageId },
      data: {
        endTime: new Date(endTime),
      },
    });

    return usage;
  }


  /**
   * Lấy lịch sử sử dụng phòng
   */
  async getRoomActivityHistory(roomId: number, options?: { 
    page?: number; 
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { page = 1, limit = 10, startDate, endDate } = options || {};
    const skip = (page - 1) * limit;

    const where: any = { roomId };

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = startDate;
      if (endDate) where.startTime.lte = endDate;
    }

    const [usages, total] = await Promise.all([
      this.prisma.roomUsage.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          startTime: 'desc',
        },
      }),
      this.prisma.roomUsage.count({ where }),
    ]);

    return {
      data: usages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}