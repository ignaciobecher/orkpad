import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { QueryUserDto } from './dto/query-user.dto';
import { UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.usersRepository.findById(id);
  }

  findAllByWorkspace(workspaceId: string, query: QueryUserDto) {
    const { search, page, limit } = query;
    return this.usersRepository.findAllByWorkspace(workspaceId, {
      search,
      page,
      limit,
    });
  }

  findWorkspaceMemberById(
    workspaceId: string,
    id: string,
  ): Promise<UserDocument | null> {
    return this.usersRepository.findWorkspaceMemberById(workspaceId, id);
  }

  findAll(query: QueryUserDto) {
    const { search, page, limit } = query;
    return this.usersRepository.findAll({ search, page, limit });
  }

  async findWorkspaceMemberByIdOrThrow(
    workspaceId: string,
    id: string,
  ): Promise<UserDocument> {
    const user = await this.findWorkspaceMemberById(workspaceId, id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByGithubId(githubId: string): Promise<UserDocument | null> {
    return this.usersRepository.findByGithubId(githubId);
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    workspaceId: string;
    termsAccepted?: boolean;
    termsAcceptedAt?: Date;
    termsVersion?: string;
  }): Promise<UserDocument> {
    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) throw new ConflictException('Este email ya está registrado.');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.usersRepository.create({ ...data, password: hashedPassword });
  }

  async createGithubUser(data: {
    name: string;
    email: string;
    githubId: string;
    avatarUrl?: string;
    workspaceId: string;
  }): Promise<UserDocument> {
    return this.usersRepository.create({
      ...data,
      emailVerified: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      termsVersion: '1.0.0',
    });
  }

  async linkGithub(
    userId: string,
    githubId: string,
    avatarUrl?: string,
  ): Promise<void> {
    await this.usersRepository.update(userId, { githubId, avatarUrl });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    const hashed = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.usersRepository.update(userId, { refreshToken: hashed });
  }

  async validateRefreshToken(
    userId: string,
    token: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findByIdWithSecrets(userId);
    if (!user?.refreshToken) return null;
    const valid = await bcrypt.compare(token, user.refreshToken);
    return valid ? user : null;
  }

  async setEmailVerificationToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: expiresAt,
    });
  }

  async findByVerificationToken(token: string) {
    return this.usersRepository.findByVerificationToken(token);
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    });
  }

  async setPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      passwordResetToken: token,
      passwordResetTokenExpiresAt: expiresAt,
    });
  }

  async findByPasswordResetToken(token: string) {
    return this.usersRepository.findByPasswordResetToken(token);
  }

  async updatePassword(userId: string, password: string): Promise<void> {
    const hashed = await bcrypt.hash(password, 10);
    await this.usersRepository.update(userId, {
      password: hashed,
      passwordResetToken: null,
      passwordResetTokenExpiresAt: null,
    });
  }

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string },
  ): Promise<UserDocument | null> {
    return this.usersRepository.update(userId, data);
  }

  async findByIdWithTwoFactor(userId: string): Promise<UserDocument | null> {
    return this.usersRepository.findByIdWithTwoFactor(userId);
  }

  async setTwoFactorSecret(userId: string, secret: string): Promise<void> {
    await this.usersRepository.update(userId, {
      twoFactorSecret: secret,
    });
  }

  async enableTwoFactor(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      twoFactorEnabled: true,
    });
  }

  async disableTwoFactor(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });
  }

  async updateNotificationPreferences(
    userId: string,
    prefs: { publicTaskCreated?: boolean },
  ): Promise<UserDocument | null> {
    return this.usersRepository.update(userId, {
      notificationPreferences: prefs,
    } as any);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.usersRepository.deleteById(userId);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { lastLogin: new Date() });
  }

  async updateOnboardingSteps(
    userId: string,
    steps: {
      addedFirstClient: boolean;
      addedFirstProject: boolean;
      addedThreeTasks: boolean;
      loggedFirstHours: boolean;
    },
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      onboardingSteps: steps,
    });
  }

  async updateGithubAccessToken(userId: string, token: string): Promise<void> {
    await this.usersRepository.update(userId, {
      githubAccessToken: token,
    });
  }

  async getGithubAccessToken(userId: string): Promise<string | null> {
    const user = await this.usersRepository.findByIdWithGithubToken(userId);
    return (user as any)?.githubAccessToken ?? null;
  }

  async findByIdWithWebAuthn(userId: string): Promise<UserDocument | null> {
    return this.usersRepository.findByIdWithWebAuthn(userId);
  }

  async findByCredentialId(credentialId: string): Promise<UserDocument | null> {
    return this.usersRepository.findByCredentialId(credentialId);
  }

  async addWebAuthnCredential(
    userId: string,
    credential: {
      credentialId: string;
      publicKey: string;
      counter: number;
      transports: string[];
      deviceName: string;
    },
  ): Promise<void> {
    return this.usersRepository.addWebAuthnCredential(userId, credential);
  }

  async updateWebAuthnCounter(
    userId: string,
    credentialId: string,
    counter: number,
  ): Promise<void> {
    return this.usersRepository.updateWebAuthnCounter(
      userId,
      credentialId,
      counter,
    );
  }

  async removeWebAuthnCredential(
    userId: string,
    credentialId: string,
  ): Promise<void> {
    return this.usersRepository.removeWebAuthnCredential(userId, credentialId);
  }
}
