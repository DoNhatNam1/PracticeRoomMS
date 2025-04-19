import { Module } from '@nestjs/common';
import { RoomUsageService } from './room-usage.service';
import { RoomUsageController } from './room-usage.controller';
import { NatsClientModule } from '../nats-client/nats-client.module';

@Module({
  imports: [
    NatsClientModule
  ],
  controllers: [RoomUsageController],
  providers: [RoomUsageService],
  exports: [RoomUsageService],
})
export class RoomUsageModule {}
