import { Module } from '@nestjs/common';
import { ActivityLogComputerService } from './activity-log-computer.service';
import { ActivityLogComputerController } from './activity-log-computer.controller';
import { NatsClientModule } from '../nats-client/nats-client.module';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  imports: [
    NatsClientModule,
    PrismaModule
  ],
  controllers: [ActivityLogComputerController],
  providers: [ActivityLogComputerService],
})
export class ActivityLogComputerModule {}
