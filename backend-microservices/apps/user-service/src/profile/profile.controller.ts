import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProfileService } from './profile.service';
import { PROFILE_PATTERNS } from '@app/contracts/user-service/profile/constants';
import { UpdateProfileDto } from '@app/contracts/user-service';

@Controller()
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(private readonly profileService: ProfileService) {}

  @MessagePattern(PROFILE_PATTERNS.GET_PROFILE)
  async getProfile(@Payload() data: { userId: number }) {
    const { userId } = data;
    this.logger.log(`Nhận yêu cầu lấy profile cho userId: ${userId}`);
    return this.profileService.getProfile(userId);
  }

  @MessagePattern(PROFILE_PATTERNS.UPDATE_PROFILE)
  async updateProfile(@Payload() data: { userId: number, updateProfileDto: UpdateProfileDto, metadata?: any }) {
    const { userId, updateProfileDto } = data;
    this.logger.log(`Nhận yêu cầu cập nhật profile cho userId: ${userId}`);
    return this.profileService.updateProfile(userId, updateProfileDto);
  }
}
