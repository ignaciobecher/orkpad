import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ProjectSharesRepository } from '../project-shares/project-shares.repository';
import { ProjectSharesService } from '../project-shares/project-shares.service';

@Injectable()
export class PortalAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sharesRepository: ProjectSharesRepository,
    private readonly sharesService: ProjectSharesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Falta el token del portal');

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Sesión de portal inválida o vencida');
    }
    if (payload?.type !== 'portal' || !payload?.shareId)
      throw new UnauthorizedException('Token inválido');

    const share = await this.sharesRepository
      .findOne(payload.workspaceId, payload.shareId)
      .catch(() => null);
    const active = await this.sharesService.resolveActive(share);
    if (!active) throw new UnauthorizedException('Acceso revocado o vencido');

    request.portal = {
      share: active,
      workspaceId: (active as any).workspaceId,
      projectId: (active as any).projectId,
      actor: {
        userId: `portal:${(active as any)._id.toString()}`,
        name: (active as any).label || (active as any).username,
      },
    };
    return true;
  }

  private extractToken(request: any): string | undefined {
    const cookieToken = request.cookies?.portalToken;
    if (cookieToken) return cookieToken;
    const header = request.headers?.authorization;
    if (header?.startsWith('Bearer ')) return header.slice(7);
    if (typeof request.query?.token === 'string') return request.query.token;
    return undefined;
  }
}
