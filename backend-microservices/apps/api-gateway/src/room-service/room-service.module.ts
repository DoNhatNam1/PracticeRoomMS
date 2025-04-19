import { Module } from '@nestjs/common';
import { ClientConfigModule } from '../client-config/client-config.module';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ClientConfigService } from '../client-config/client-config.service';
import { ROOM_SERVICE_CLIENT } from './constant';
import { RoomsService } from './services/rooms.service';
import { SchedulesService } from './services/schedules.service';
import { RoomUsageService } from './services/room-usage.service';
import { RoomServiceController } from './room-service.controller';
import { AuthCoreModule } from '../auth-core/auth-core.module';

@Module({
  imports: [
    ClientConfigModule,
    AuthCoreModule
  ],
  controllers: [RoomServiceController],
  providers: [
    RoomsService,
    SchedulesService,
    RoomUsageService,
    {
      provide: ROOM_SERVICE_CLIENT,
      useFactory: (configService: ClientConfigService) => {
        const clientOptions = configService.roomsClientOptions;
        return ClientProxyFactory.create(clientOptions);
      },
      inject: [ClientConfigService],
    }
  ],
  exports: [RoomsService, SchedulesService, RoomUsageService]
})
export class RoomServiceModule {}