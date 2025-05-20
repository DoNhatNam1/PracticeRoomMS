import { Module } from '@nestjs/common';
import { FileTransferController } from './file-transfer.controller';
import { FileTransferService } from './file-transfer.service';
import { ActivityLogComputerModule } from '../activity-log-computer/activity-log-computer.module';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ActivityLogComputerModule
  ],
  controllers: [FileTransferController],
  providers: [FileTransferService],
  exports: [FileTransferService]
})
export class FileTransferModule {}