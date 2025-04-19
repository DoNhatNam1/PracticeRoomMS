import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { USER_SERVICE_CLIENT } from '../constant';
import { PROFILE_PATTERNS } from '@app/contracts/user-service/profile/constants';
import { UpdateProfileDto } from '../dto/profile/update-profile.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(@Inject(USER_SERVICE_CLIENT) private usersClient: ClientProxy) {}

  async getProfile(userId: number) {
    this.logger.log(`Gửi yêu cầu lấy profile cho userId: ${userId}`);
    return firstValueFrom(
      this.usersClient.send(PROFILE_PATTERNS.GET_PROFILE, { userId })
    );
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    this.logger.log(`Gửi yêu cầu cập nhật profile cho userId: ${userId}`);
    return firstValueFrom(
      this.usersClient.send(PROFILE_PATTERNS.UPDATE_PROFILE, {
        userId,
        updateProfileDto
      })
    );
  }
}
