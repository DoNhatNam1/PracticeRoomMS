import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { RoomsModule } from '../rooms/rooms.module';
import { ActivityLogRoomModule } from '../activity-log-room/activity-log-room.module';
import { NatsClientModule } from '../nats-client/nats-client.module';

@Module({
  imports: [
    RoomsModule,
    ActivityLogRoomModule,
    NatsClientModule,
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
