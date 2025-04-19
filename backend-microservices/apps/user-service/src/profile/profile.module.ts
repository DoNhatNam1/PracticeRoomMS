import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { ActivityLogUserModule } from '../activity-log-user/activity-log-user.module';

@Module({
  imports: [ActivityLogUserModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
