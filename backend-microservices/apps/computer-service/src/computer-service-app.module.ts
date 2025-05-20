import { Module } from '@nestjs/common';
import { ComputersModule } from './computers/computers.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/prisma/prisma.module';
import * as Joi from 'joi';
import { NatsClientModule } from './nats-client/nats-client.module';
import { ActivityLogComputerModule } from './activity-log-computer/activity-log-computer.module';
import { ComputerUsageModule } from './computer-usage/computer-usage.module';
import { FileTransferModule } from './file-transfer/file-transfer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    ComputersModule,
    NatsClientModule,
    PrismaModule,
    ActivityLogComputerModule,
    ComputerUsageModule,
    FileTransferModule
  ],
  controllers: [],
  providers: [],
})
export class ComputerServiceAppModule {}
