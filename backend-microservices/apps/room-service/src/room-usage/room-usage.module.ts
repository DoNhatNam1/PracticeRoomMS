import { Module } from '@nestjs/common';
import { RoomUsageService } from './room-usage.service';
import { RoomUsageController } from './room-usage.controller';
import { NatsClientModule } from '../nats-client/nats-client.module';
import { ActivityLogRoomModule } from '../activity-log-room/activity-log-room.module';

@Module({
  imports: [
    NatsClientModule,
    ActivityLogRoomModule
  ],
  controllers: [RoomUsageController],
  providers: [RoomUsageService],
  exports: [RoomUsageService],
})
export class RoomUsageModule {}
