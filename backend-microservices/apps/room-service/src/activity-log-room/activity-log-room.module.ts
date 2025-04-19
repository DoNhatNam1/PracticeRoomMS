import { Module } from '@nestjs/common';
import { ActivityLogRoomService } from './activity-log-room.service';
import { ActivityLogRoomController } from './activity-log-room.controller';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityLogRoomController],
  providers: [ActivityLogRoomService],
  exports: [ActivityLogRoomService],
})
export class ActivityLogRoomModule {}