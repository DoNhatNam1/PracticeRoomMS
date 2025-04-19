import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ClientConfigModule } from './client-config/client-config.module';
import { AuthCoreModule } from './auth-core/auth-core.module';
import { UserServiceModule } from './user-service/user-service.module';
import { ComputerServiceModule } from './computer-service/computer-service.module';
import { RoomServiceModule } from './room-service/room-service.module';
import { ApiGatewayController } from './api-gateway.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserServiceModule,
    ComputerServiceModule,
    RoomServiceModule,
    ClientConfigModule,
    AuthCoreModule,
  ],
  controllers: [ApiGatewayController],
  providers: [],
})
export class ApiGatewayModule {}
