import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ActivityLogUserModule } from '../activity-log-user/activity-log-user.module'; // Import module thay vì service
import { NatsClientModule } from '../nats-client/nats-client.module';

@Module({
  imports: [
    ActivityLogUserModule,
    NatsClientModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}