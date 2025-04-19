import { Controller, Get } from '@nestjs/common';
import { Public } from '@app/contracts/common/auth';

@Controller()
export class ApiGatewayController {
  @Public()
  @Get()
  getApiInfo() {
    return {
      name: 'PracticeRoomMS API Gateway',
      version: '1.0.0',
      status: 'online',
      timestamp: new Date().toISOString(),
      services: {
        user: '/api/users',
        auth: '/api/auth',
        profile: '/api/profile',
        room: '/api/rooms',
        computer: '/api/computers',
      }
    };
  }

  @Public()
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage()
    };
  }
}