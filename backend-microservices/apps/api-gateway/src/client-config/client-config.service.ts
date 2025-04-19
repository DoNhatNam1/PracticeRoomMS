import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class ClientConfigService {
  constructor(private configService: ConfigService) {}

  // Port configuration
  getRoomsClientPort(): number {
    return this.configService.get<number>('ROOMS_CLIENT_PORT') || 3002;
  }

  getComputersClientPort(): number {
    return this.configService.get<number>('COMPUTERS_CLIENT_PORT') || 3003;
  }

  getUsersClientPort(): number {
    return this.configService.get<number>('USER_CLIENT_PORT') || 3001;
  }

  // Host configuration
  getRoomsClientHost(): string {
    return this.configService.get<string>('ROOMS_CLIENT_HOST') || 'localhost';
  }

  getComputersClientHost(): string {
    return this.configService.get<string>('COMPUTERS_CLIENT_HOST') || 'localhost';
  }

  getUsersClientHost(): string {
    return this.configService.get<string>('USERS_CLIENT_HOST') || 'localhost';
  }

  // Client options with both host and port
  get roomsClientOptions(): ClientOptions {
    return {
      transport: Transport.NATS,
      options: {
        servers: [this.configService.get('NATS_URL') || 'nats://localhost:4222'],
      },
    };
  }

  get computersClientOptions(): ClientOptions {
    return {
      transport: Transport.NATS,
      options: {
        servers: [this.configService.get('NATS_URL') || 'nats://localhost:4222'],
      },
    };
  }
  
  get usersClientOptions(): ClientOptions {
    return {
      transport: Transport.NATS,
      options: {
        servers: [this.configService.get('NATS_URL') || 'nats://localhost:4222'],
      },
    };
  }
}