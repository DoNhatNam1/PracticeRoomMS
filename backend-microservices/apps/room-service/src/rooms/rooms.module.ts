import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { ActivityLogRoomModule } from '../activity-log-room/activity-log-room.module';
import { NatsClientModule } from '../nats-client/nats-client.module';

@Module({
    imports: [
      ActivityLogRoomModule,
      NatsClientModule
    ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService], // Export RoomsService để các module khác có thể sử dụng
})
export class RoomsModule {}
