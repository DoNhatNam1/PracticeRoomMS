import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomUsageService } from './room-usage.service';
import { ROOM_USAGE_EVENTS } from '@app/contracts/room-service/room-usage/constants';

@Controller()
export class RoomUsageController {
  private readonly logger = new Logger(RoomUsageController.name);

  constructor(private readonly roomUsageService: RoomUsageService) {}

  /**
   * Bắt đầu sử dụng phòng
   */
  @MessagePattern(ROOM_USAGE_EVENTS.STARTED)
  async startUsage(@Payload() data: any) {
    this.logger.log(`Starting room usage: ${JSON.stringify(data)}`);
    return this.roomUsageService.startUsage(data);
  }

  /**
   * Kết thúc sử dụng phòng
   */
  @MessagePattern(ROOM_USAGE_EVENTS.ENDED)
  async endUsage(@Payload() data: any) {
    this.logger.log(`Ending room usage: ${JSON.stringify(data)}`);
    return this.roomUsageService.endUsage(data);
  }

  /**
   * Lấy lịch sử sử dụng phòng
   */
  @MessagePattern(ROOM_USAGE_EVENTS.HISTORY_REQUESTED)
  async getUsageHistory(@Payload() data: any) {
    const { roomId, page, limit, startDate, endDate } = data;
    this.logger.log(`Getting usage history for room ${roomId}`);
    return this.roomUsageService.getRoomActivityHistory(roomId, {
      page,
      limit,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }
}
