import { Module } from '@nestjs/common';
import { ComputersService } from './computers.service';
import { ComputersController } from './computers.controller';
import { PrismaModule } from '@app/prisma/prisma.module';
import { NatsClientModule } from '../nats-client/nats-client.module';
import { ActivityLogComputerModule } from '../activity-log-computer/activity-log-computer.module';

@Module({
  imports: [
    PrismaModule,
    ActivityLogComputerModule,
    NatsClientModule,
  ],
  controllers: [ComputersController],
  providers: [ComputersService],
})
export class ComputersModule {}
