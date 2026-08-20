import {
  CanActivate,
  ExecutionContext,
  GoneException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Project,
  ProjectDocument,
} from '../../modules/projects/projects.schema';

@Injectable()
export class ProjectLinkAccessGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token: string = request.params.token;

    const project = await this.projectModel
      .findOne({ publicToken: token, isDeleted: false })
      .select('linkVisibility linkExpiresAt _id')
      .lean()
      .exec();

    if (!project) throw new NotFoundException('Link inválido o revocado');

    if (project.linkExpiresAt && new Date(project.linkExpiresAt) < new Date()) {
      throw new GoneException('Este link ha expirado');
    }

    const visibility = project.linkVisibility ?? 'public';

    if (visibility === 'public') return true;

    const authHeader: string | undefined = request.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Este enlace requiere autenticación');
    }

    const jwt = authHeader.slice(7);
    let payload: any;

    try {
      payload = this.jwtService.verify(jwt, { secret: process.env.JWT_SECRET });
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    if (payload.type !== 'project-link' || payload.token !== token) {
      throw new UnauthorizedException('Token no válido para este enlace');
    }

    request.projectLinkPayload = payload;
    return true;
  }
}
