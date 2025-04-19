import { Module } from '@nestjs/common';
import { ActivityLogUserService } from './activity-log-user.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ActivityLogUserService],
  exports: [ActivityLogUserService],
})
export class ActivityLogUserModule {}
