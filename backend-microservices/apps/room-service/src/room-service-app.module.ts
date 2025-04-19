import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoomsModule } from './rooms/rooms.module';
import { SchedulesModule } from './schedules/schedules.module';
import { RoomUsageModule } from './room-usage/room-usage.module';
import { NatsClientModule } from './nats-client/nats-client.module';
import { ActivityLogRoomModule } from './activity-log-room/activity-log-room.module';
import * as Joi from 'joi';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    PrismaModule,
    RoomsModule,
    NatsClientModule,
    SchedulesModule,
    RoomUsageModule,
    ActivityLogRoomModule,
  ],
})
export class RoomServiceAppModule {}
