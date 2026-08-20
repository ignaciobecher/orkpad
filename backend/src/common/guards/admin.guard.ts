import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

export const ADMIN_USER_ID = process.env.ADMIN_USER_ID || '';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // request.user from jwt.strategy maps 'sub' to 'userId'.
    const userId = user?.userId || user?.sub || user?._id;

    if (!ADMIN_USER_ID || !userId || userId !== ADMIN_USER_ID) {
      throw new ForbiddenException('No tienes acceso a esta sección');
    }

    return true;
  }
}
