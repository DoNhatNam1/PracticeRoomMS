import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { COMPUTER_SERVICE_CLIENT } from './constant';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ComputerServiceController } from './computer-service.controller';
import { ComputersService } from './services/computers.service';
import { ComputerUsageService } from './services/computer-usage.service';
import { FileTransferService } from './services/file-transfer.service';
import { ActivityLogComputerService } from './services/activity-log-computer.service';
import { FileTransferGateway } from './socket/file-transfer.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: COMPUTER_SERVICE_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers: [configService.get<string>('NATS_URL')].filter((server): server is string => !!server),
            queue: 'computer_service_queue'
          }
        })
      }
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [ComputerServiceController],
  providers: [
    ComputersService, 
    ComputerUsageService, 
    FileTransferService, 
    ActivityLogComputerService,
    FileTransferGateway
  ]
})
export class ComputerServiceModule {}