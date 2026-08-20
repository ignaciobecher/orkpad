import crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  GoneException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './projects.schema';
import { ProjectLinkCredentialRepository } from './project-link-credential.repository';
import { SetLinkCredentialDto } from './dto/set-link-credential.dto';
import { AuthLinkDto } from './dto/auth-link.dto';

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const RANDOM_PASSWORD_LENGTH = 16;
const RANDOM_PASSWORD_CHARS =
  'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

@Injectable()
export class ProjectLinkCredentialService {
  constructor(
    private readonly credentialRepo: ProjectLinkCredentialRepository,
    private readonly jwtService: JwtService,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async getLinkStatus(workspaceId: string, projectId: string) {
    const project = await this.projectModel
      .findOne({ _id: projectId, workspaceId, isDeleted: false })
      .select('publicToken linkVisibility linkExpiresAt')
      .lean()
      .exec();

    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    const credential = await this.credentialRepo.findByProjectId(
      workspaceId,
      projectId,
    );

    return {
      linkVisibility: project.linkVisibility ?? 'public',
      publicToken: project.publicToken,
      linkExpiresAt: project.linkExpiresAt,
      hasCredential: !!credential,
      username: credential?.username ?? null,
      permissions: credential?.permissions ?? null,
    };
  }

  async setCredential(
    workspaceId: string,
    projectId: string,
    dto: SetLinkCredentialDto,
  ) {
    const project = await this.projectModel
      .findOne({ _id: projectId, workspaceId, isDeleted: false })
      .exec();

    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    await this.credentialRepo.softDeleteByProjectId(workspaceId, projectId);

    await this.credentialRepo.create(workspaceId, {
      projectId,
      username: dto.username,
      passwordHash,
      permissions: dto.permissions ?? ['view', 'create-task'],
      failedAttempts: 0,
      lockedUntil: null,
      lastSuccessAt: null,
    });

    await this.projectModel
      .findOneAndUpdate(
        { _id: projectId, workspaceId, isDeleted: false },
        { $set: { linkVisibility: 'private' } },
      )
      .exec();

    return { success: true };
  }

  async removeCredential(workspaceId: string, projectId: string) {
    const project = await this.projectModel
      .findOne({ _id: projectId, workspaceId, isDeleted: false })
      .exec();

    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    await this.credentialRepo.softDeleteByProjectId(workspaceId, projectId);

    await this.projectModel
      .findOneAndUpdate(
        { _id: projectId, workspaceId, isDeleted: false },
        { $set: { linkVisibility: 'public' } },
      )
      .exec();

    return { success: true };
  }

  async rotateCredential(workspaceId: string, projectId: string) {
    const project = await this.projectModel
      .findOne({ _id: projectId, workspaceId, isDeleted: false })
      .exec();

    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    const existing = await this.credentialRepo.findByProjectId(
      workspaceId,
      projectId,
    );
    if (!existing)
      throw new NotFoundException(
        'No credential configured for this project link',
      );

    const plaintext = this.generateRandomPassword();
    const passwordHash = await bcrypt.hash(plaintext, BCRYPT_ROUNDS);

    await this.credentialRepo.softDeleteByProjectId(workspaceId, projectId);

    await this.credentialRepo.create(workspaceId, {
      projectId,
      username: existing.username,
      passwordHash,
      permissions: existing.permissions,
      failedAttempts: 0,
      lockedUntil: null,
      lastSuccessAt: null,
    });

    return { password: plaintext };
  }

  async authenticateLink(
    publicToken: string,
    dto: AuthLinkDto,
  ): Promise<{ accessToken: string }> {
    const project = await this.projectModel
      .findOne({ publicToken, isDeleted: false })
      .select('_id workspaceId linkVisibility linkExpiresAt')
      .lean()
      .exec();

    if (!project) throw new NotFoundException('Link inválido o revocado');

    if (project.linkExpiresAt && new Date(project.linkExpiresAt) < new Date()) {
      throw new GoneException('Este link ha expirado');
    }

    const projectId = (project._id as any).toString();
    const workspaceId = project.workspaceId;

    const credential = await this.credentialRepo.findByProjectIdWithHash(
      workspaceId,
      projectId,
    );
    if (!credential)
      throw new UnauthorizedException(
        'Este enlace no tiene credenciales configuradas',
      );

    if (
      credential.lockedUntil &&
      new Date(credential.lockedUntil) > new Date()
    ) {
      const minutesLeft = Math.ceil(
        (new Date(credential.lockedUntil).getTime() - Date.now()) / 60000,
      );
      throw new HttpException(
        `Demasiados intentos fallidos. Intenta de nuevo en ${minutesLeft} minuto(s).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      credential.passwordHash,
    );

    if (!passwordValid || credential.username !== dto.username) {
      const newFailedAttempts = (credential.failedAttempts ?? 0) + 1;
      const lockedUntil =
        newFailedAttempts >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          : null;

      await this.credentialRepo.update(
        workspaceId,
        (credential._id as any).toString(),
        {
          failedAttempts: newFailedAttempts,
          lockedUntil,
        },
      );

      if (lockedUntil) {
        throw new HttpException(
          `Demasiados intentos fallidos. Cuenta bloqueada por ${LOCKOUT_MINUTES} minutos.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    await this.credentialRepo.update(
      workspaceId,
      (credential._id as any).toString(),
      {
        failedAttempts: 0,
        lockedUntil: null,
        lastSuccessAt: new Date(),
      },
    );

    const payload = {
      sub: projectId,
      workspaceId,
      type: 'project-link',
      token: publicToken,
      permissions: credential.permissions,
    };

    const expiresIn = process.env.PROJECT_LINK_JWT_EXPIRES_IN ?? '4h';
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: expiresIn as any,
    });

    return { accessToken };
  }

  private generateRandomPassword(): string {
    const bytes = crypto.randomBytes(RANDOM_PASSWORD_LENGTH);
    return Array.from(bytes)
      .map((b) => RANDOM_PASSWORD_CHARS[b % RANDOM_PASSWORD_CHARS.length])
      .join('');
  }
}
