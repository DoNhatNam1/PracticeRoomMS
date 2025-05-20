import { Module } from '@nestjs/common';
import { ActivityLogRoomService } from './activity-log-room.service';
import { ActivityLogRoomController } from './activity-log-room.controller';
import { PrismaModule } from '@app/prisma/prisma.module';
import { NatsClientModule } from '../nats-client/nats-client.module';

@Module({
  imports: [
    PrismaModule,
    NatsClientModule
  ],
  controllers: [ActivityLogRoomController],
  providers: [ActivityLogRoomService],
  exports: [ActivityLogRoomService],
})
export class ActivityLogRoomModule {}