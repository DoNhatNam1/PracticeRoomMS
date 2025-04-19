import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = parseInt(request.params.id);
    
    // Admin luôn có quyền truy cập
    if (user.role === 'ADMIN') {
      return true;
    }
    
    // Kiểm tra nếu người dùng là chủ sở hữu tài nguyên
    if (user.sub === resourceId) {
      return true;
    }
    
    throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này');
  }
}