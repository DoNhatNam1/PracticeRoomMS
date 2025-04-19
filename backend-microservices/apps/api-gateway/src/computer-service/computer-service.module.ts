import { Module } from '@nestjs/common';
import { ClientConfigModule } from '../client-config/client-config.module';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ClientConfigService } from '../client-config/client-config.service';
import { COMPUTER_SERVICE_CLIENT } from './constant';
import { ComputerServiceController } from './computer-service.controller';
import { ComputersService } from './services/computers.service';
import { ComputerUsageService } from './services/computer-usage.service';
import { FileTransferService } from './services/file-transfer.service';
import { ActivityLogComputerService } from './services/activity-log-computer.service';
import { AuthCoreModule } from '../auth-core/auth-core.module';

@Module({
  imports: [
    ClientConfigModule,
    AuthCoreModule
  ],
  controllers: [ComputerServiceController],
  providers: [
    ComputersService,
    ComputerUsageService,
    FileTransferService,
    ActivityLogComputerService,
    {
      provide: COMPUTER_SERVICE_CLIENT,
      useFactory: (configService: ClientConfigService) => {
        const clientOptions = configService.computersClientOptions;
        return ClientProxyFactory.create(clientOptions);
      },
      inject: [ClientConfigService],
    }
  ],
  exports: [
    ComputersService, 
    ComputerUsageService, 
    FileTransferService, 
    ActivityLogComputerService
  ]
})
export class ComputerServiceModule {}