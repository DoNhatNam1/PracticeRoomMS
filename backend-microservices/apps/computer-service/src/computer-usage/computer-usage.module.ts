import { Module } from '@nestjs/common';
import { ComputerUsageService } from './computer-usage.service';
import { ComputerUsageController } from './computer-usage.controller';
import { PrismaModule } from '@app/prisma/prisma.module';
import { NatsClientModule } from '../nats-client/nats-client.module';
import { ActivityLogComputerModule } from '../activity-log-computer/activity-log-computer.module';

@Module({
  imports: [
    PrismaModule,
    ActivityLogComputerModule,
    NatsClientModule,
  ],
  controllers: [ComputerUsageController],
  providers: [ComputerUsageService],
})
export class ComputerUsageModule {}
