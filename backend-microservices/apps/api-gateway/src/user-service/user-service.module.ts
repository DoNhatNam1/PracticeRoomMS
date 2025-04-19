import { Module } from '@nestjs/common';
import { ClientConfigModule } from '../client-config/client-config.module';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ClientConfigService } from '../client-config/client-config.service';
import { USER_SERVICE_CLIENT } from './constant';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { ProfileService } from './services/profile.service';
import { UserServiceController } from './user-service.controller';
import { AuthCoreModule } from '../auth-core/auth-core.module';

@Module({
  imports: [
    ClientConfigModule,
    AuthCoreModule
  ],
  controllers: [UserServiceController],
  providers: [
    AuthService,
    UsersService, 
    ProfileService,
    {
      provide: USER_SERVICE_CLIENT,
      useFactory: (configService: ClientConfigService) => {
        const clientOptions = configService.usersClientOptions;
        return ClientProxyFactory.create(clientOptions);
      },
      inject: [ClientConfigService],
    }
  ],
  exports: [AuthService, UsersService, ProfileService]
})
export class UserServiceModule {}