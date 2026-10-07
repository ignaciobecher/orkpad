import crypto from 'crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { generateSecret, generateURI, verify: verifyTotp } = require('otplib');
import * as QRCode from 'qrcode';
import { UsersService } from '../users/users.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Client, ClientDocument } from '../clients/clients.schema';
import { Project, ProjectDocument } from '../projects/projects.schema';
import { Task, TaskDocument } from '../tasks/tasks.schema';
import { Invoice, InvoiceDocument } from '../invoices/invoices.schema';
import { Event, EventDocument } from '../agenda/agenda.schema';
import {
  Subscription,
  SubscriptionDocument,
} from '../subscriptions/subscriptions.schema';
import { Document as Doc, DocumentDocument } from '../docs/docs.schema';
import {
  TaskColumn,
  TaskColumnDocument,
} from '../task-columns/task-columns.schema';
import {
  TimeEntry,
  TimeEntryDocument,
} from '../time-tracking/time-tracking.schema';
import {
  WorkSession,
  WorkSessionDocument,
} from '../work-sessions/work-sessions.schema';
import { Quote, QuoteDocument } from '../quotes/quotes.schema';
import {
  PushSubscription,
  PushSubscriptionDocument,
} from '../push-subscriptions/push-subscriptions.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

// One-time OAuth exchange codes: code -> { tokens, alreadyExisted, isFirstLogin, expiresAt }
const oauthCodes = new Map<
  string,
  {
    tokens: { accessToken: string; refreshToken: string };
    alreadyExisted: boolean;
    isFirstLogin: boolean;
    expiresAt: number;
  }
>();

// WebAuthn challenges: key (userId for registration, email for login) -> { challenge, expiresAt }
const webauthnChallenges = new Map<
  string,
  { challenge: string; expiresAt: number }
>();

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly workspacesService: WorkspacesService,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Doc.name) private readonly docModel: Model<DocumentDocument>,
    @InjectModel(TaskColumn.name)
    private readonly taskColumnModel: Model<TaskColumnDocument>,
    @InjectModel(TimeEntry.name)
    private readonly timeEntryModel: Model<TimeEntryDocument>,
    @InjectModel(WorkSession.name)
    private readonly workSessionModel: Model<WorkSessionDocument>,
    @InjectModel(Quote.name) private readonly quoteModel: Model<QuoteDocument>,
    @InjectModel(PushSubscription.name)
    private readonly pushSubscriptionModel: Model<PushSubscriptionDocument>,
  ) {}

  async register(dto: RegisterDto): Promise<{
    requiresEmailVerification: boolean;
    accessToken?: string;
    refreshToken?: string;
    isFirstLogin?: boolean;
  }> {
    const workspace = await this.workspacesService.create('pending', {
      name: `${dto.name}'s Workspace`,
    });

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      workspaceId: (workspace._id as any).toString(),
      termsAccepted: dto.termsAccepted,
      termsAcceptedAt: new Date(),
      termsVersion: '1.0.0',
    });

    const userId = (user._id as any).toString();
    const workspaceId = (workspace._id as any).toString();

    await this.workspacesService.update(workspaceId, {
      ownerId: userId,
    } as any);

    // Self-hosted instances often run without an email provider. When email
    // sending is disabled, verify the account immediately so registration
    // works fully inside the container with just email + password.
    if (!this.mailService.isEmailEnabled()) {
      await this.usersService.markEmailVerified(userId);
      const tokens = await this.generateTokens(
        userId,
        user.email,
        user.workspaceId,
      );
      await this.usersService.updateRefreshToken(userId, tokens.refreshToken);
      await this.usersService.updateLastLogin(userId);
      await this.sendWelcomeNotification(user.workspaceId, userId);
      return { requiresEmailVerification: false, ...tokens, isFirstLogin: true };
    }

    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.usersService.setEmailVerificationToken(
      userId,
      token,
      expiresAt,
    );

    await this.mailService.sendVerificationEmail(user.email, user.name, token);

    return { requiresEmailVerification: true };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password)
      throw new UnauthorizedException('Email o contraseña incorrectos.');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid)
      throw new UnauthorizedException('Email o contraseña incorrectos.');

    if (!user.emailVerified) {
      throw new ForbiddenException({
        message: 'Por favor verificá tu email antes de ingresar.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    const isFirstLogin = !user.lastLogin;
    const tokens = await this.generateTokens(
      (user._id as any).toString(),
      user.email,
      user.workspaceId,
      dto.rememberMe,
    );
    await this.usersService.updateRefreshToken(
      (user._id as any).toString(),
      tokens.refreshToken,
    );
    await this.usersService.updateLastLogin((user._id as any).toString());
    if (isFirstLogin)
      await this.sendWelcomeNotification(
        user.workspaceId,
        (user._id as any).toString(),
      );
    return { ...tokens, rememberMe: dto.rememberMe ?? false, isFirstLogin };
  }

  private async sendWelcomeNotification(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    try {
      await this.notificationsService.create(workspaceId, {
        userId,
        title: '¡Bienvenido a Orkpad! 🎉',
        message:
          'Completá estos pasos para sacarle el máximo provecho a tu cuenta.',
        type: 'success',
        link: '/app/dashboard',
        refType: 'onboarding',
      });
    } catch {
      // Non-blocking: a notification failure must never break login.
    }
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) throw new BadRequestException('Token inválido o expirado.');

    if (
      user.emailVerificationTokenExpiresAt &&
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'El enlace de verificación expiró. Solicitá uno nuevo.',
      );
    }

    await this.usersService.markEmailVerified((user._id as any).toString());
    return { success: true };
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.emailVerified) return { success: true };

    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.usersService.setEmailVerificationToken(
      (user._id as any).toString(),
      token,
      expiresAt,
    );
    await this.mailService.sendVerificationEmail(user.email, user.name, token);

    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.emailVerified || !user.password)
      return { success: true };

    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.usersService.setPasswordResetToken(
      (user._id as any).toString(),
      token,
      expiresAt,
    );
    await this.mailService.sendPasswordResetEmail(user.email, user.name, token);

    return { success: true };
  }

  async resetPasswordStatus(token: string) {
    const user = await this.usersService.findByPasswordResetToken(token);
    if (!user) return { valid: false, requiresTwoFactor: false };
    if (
      user.passwordResetTokenExpiresAt &&
      user.passwordResetTokenExpiresAt < new Date()
    ) {
      return { valid: false, requiresTwoFactor: false };
    }
    return { valid: true, requiresTwoFactor: user.twoFactorEnabled };
  }

  async resetPassword(token: string, password: string, totpToken?: string) {
    const user = await this.usersService.findByPasswordResetToken(token);
    if (!user) throw new BadRequestException('Token inválido o expirado.');

    if (
      user.passwordResetTokenExpiresAt &&
      user.passwordResetTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'El enlace de restablecimiento expiró. Solicitá uno nuevo.',
      );
    }

    if (user.twoFactorEnabled) {
      if (!totpToken)
        throw new BadRequestException(
          'Se requiere el código 2FA para restablecer la contraseña.',
        );
      const userWith2FA = await this.usersService.findByIdWithTwoFactor(
        (user._id as any).toString(),
      );
      if (!userWith2FA?.twoFactorSecret)
        throw new BadRequestException('Error de configuración 2FA.');
      const result = await verifyTotp({
        secret: userWith2FA.twoFactorSecret,
        token: totpToken,
        strategy: 'totp',
      });
      if (!result?.valid)
        throw new BadRequestException('Código 2FA incorrecto.');
    }

    await this.usersService.updatePassword(
      (user._id as any).toString(),
      password,
    );
    return { success: true };
  }

  async refresh(token: string) {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId = payload.sub;
    const user = await this.usersService.validateRefreshToken(userId, token);
    if (!user) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.generateTokens(
      (user._id as any).toString(),
      user.email,
      user.workspaceId,
    );
    await this.usersService.updateRefreshToken(
      (user._id as any).toString(),
      tokens.refreshToken,
    );
    return tokens;
  }

  async githubLogin(profile: {
    githubId: string;
    name: string;
    email: string | undefined;
    avatarUrl: string | undefined;
    accessToken: string;
  }): Promise<{
    code: string;
    alreadyExisted: boolean;
    isFirstLogin: boolean;
  }> {
    if (!profile.email) {
      throw new UnauthorizedException(
        'Your GitHub account must have a public email. Please add one in GitHub settings.',
      );
    }

    let user = await this.usersService.findByGithubId(profile.githubId);
    let alreadyExisted = !!user;

    if (!user) {
      user = await this.usersService.findByEmail(profile.email);
      if (user) {
        alreadyExisted = true;
        await this.usersService.linkGithub(
          (user._id as any).toString(),
          profile.githubId,
          profile.avatarUrl,
        );
        if (!user.emailVerified) {
          await this.usersService.markEmailVerified(
            (user._id as any).toString(),
          );
        }
        // Re-fetch to get updated user with linked githubId and other potential changes
        user = await this.usersService.findById((user._id as any).toString());
      }
    }

    if (!user) {
      const workspace = await this.workspacesService.create('pending', {
        name: `${profile.name}'s Workspace`,
      });
      user = await this.usersService.createGithubUser({
        name: profile.name,
        email: profile.email,
        githubId: profile.githubId,
        avatarUrl: profile.avatarUrl,
        workspaceId: (workspace._id as any).toString(),
      });
      await this.workspacesService.update((workspace._id as any).toString(), {
        ownerId: (user._id as any).toString(),
      } as any);
    }

    if (!user)
      throw new UnauthorizedException('Error al procesar el usuario de GitHub');

    const isFirstLogin = !user.lastLogin;
    const tokens = await this.generateTokens(
      (user._id as any).toString(),
      user.email,
      user.workspaceId,
    );
    await this.usersService.updateRefreshToken(
      (user._id as any).toString(),
      tokens.refreshToken,
    );
    await this.usersService.updateLastLogin((user._id as any).toString());
    await this.usersService.updateGithubAccessToken(
      (user._id as any).toString(),
      profile.accessToken,
    );
    if (isFirstLogin)
      await this.sendWelcomeNotification(
        user.workspaceId,
        (user._id as any).toString(),
      );

    // Generate a one-time exchange code valid for 30 seconds
    const code = crypto.randomBytes(32).toString('hex');
    oauthCodes.set(code, {
      tokens,
      alreadyExisted,
      isFirstLogin,
      expiresAt: Date.now() + 30_000,
    });

    return { code, alreadyExisted, isFirstLogin };
  }

  exchangeOAuthCode(code: string): {
    tokens: { accessToken: string; refreshToken: string };
    alreadyExisted: boolean;
    isFirstLogin: boolean;
  } {
    const entry = oauthCodes.get(code);
    if (!entry)
      throw new UnauthorizedException('Invalid or expired OAuth code');
    oauthCodes.delete(code);
    if (Date.now() > entry.expiresAt)
      throw new UnauthorizedException('Invalid or expired OAuth code');
    return {
      tokens: entry.tokens,
      alreadyExisted: entry.alreadyExisted,
      isFirstLogin: entry.isFirstLogin,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    const { password, ...result } = (user as any).toObject();
    return result;
  }

  async changePassword(
    userId: string,
    dto: { currentPassword: string; newPassword: string; totpToken?: string },
  ) {
    const user = await this.usersService.findByEmail(
      (await this.usersService.findById(userId))!.email,
    );
    if (!user || !user.password)
      throw new BadRequestException(
        'No se puede cambiar la contraseña de esta cuenta.',
      );

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid)
      throw new BadRequestException('La contraseña actual es incorrecta.');

    if (user.twoFactorEnabled) {
      if (!dto.totpToken)
        throw new BadRequestException(
          'Se requiere el código 2FA para cambiar la contraseña.',
        );
      const userWith2FA = await this.usersService.findByIdWithTwoFactor(userId);
      if (!userWith2FA?.twoFactorSecret)
        throw new BadRequestException('Error de configuración 2FA.');
      const result = await verifyTotp({
        secret: userWith2FA.twoFactorSecret,
        token: dto.totpToken,
        strategy: 'totp',
      });
      if (!result?.valid)
        throw new BadRequestException('Código 2FA incorrecto.');
    }

    await this.usersService.updatePassword(userId, dto.newPassword);
    return { success: true };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(userId, dto);
    if (!user) throw new UnauthorizedException();
    const { password, twoFactorSecret, ...result } = (user as any).toObject();
    return result;
  }

  async setup2FA(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    if (user.twoFactorEnabled)
      throw new BadRequestException('El 2FA ya está habilitado.');

    const secret = generateSecret();
    const otpAuthUrl = generateURI({
      secret,
      label: user.email,
      issuer: 'Orkpad',
      type: 'totp',
    });
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    await this.usersService.setTwoFactorSecret(userId, secret);

    return { qrCodeDataUrl };
  }

  async enable2FA(userId: string, token: string) {
    const user = await this.usersService.findByIdWithTwoFactor(userId);
    if (!user?.twoFactorSecret)
      throw new BadRequestException('Primero iniciá la configuración del 2FA.');

    const result = await verifyTotp({
      secret: user.twoFactorSecret,
      token,
      strategy: 'totp',
    });
    if (!result?.valid)
      throw new BadRequestException('Código incorrecto. Intentá de nuevo.');

    await this.usersService.enableTwoFactor(userId);
    return { success: true };
  }

  async disable2FA(userId: string) {
    await this.usersService.disableTwoFactor(userId);
    return { success: true };
  }

  async exportData(userId: string, workspaceId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    const baseFilter = { workspaceId, isDeleted: false };

    const [
      clients,
      projects,
      tasks,
      invoices,
      events,
      subscriptions,
      docs,
      taskColumns,
      timeEntries,
      workSessions,
    ] = await Promise.all([
      this.clientModel
        .find(baseFilter as any)
        .lean()
        .exec(),
      this.projectModel
        .find(baseFilter as any)
        .lean()
        .exec(),
      this.taskModel
        .find(baseFilter as any)
        .lean()
        .exec(),
      this.invoiceModel
        .find(baseFilter as any)
        .lean()
        .exec(),
      this.eventModel
        .find(baseFilter as any)
        .lean()
        .exec(),
      this.subscriptionModel
        .find(baseFilter as any)
        .lean()
        .exec(),
      this.docModel
        .find(baseFilter as any)
        .lean()
        .exec(),
      this.taskColumnModel
        .find(baseFilter as any)
        .lean()
        .exec(),
      this.timeEntryModel
        .find(baseFilter as any)
        .lean()
        .exec(),
      this.workSessionModel
        .find(baseFilter as any)
        .lean()
        .exec(),
    ]);

    const { password, twoFactorSecret, refreshToken, ...safeUser } = (
      user as any
    ).toObject();

    return {
      exportedAt: new Date().toISOString(),
      user: safeUser,
      clients,
      projects,
      tasks,
      taskColumns,
      invoices,
      timeEntries,
      workSessions,
      events,
      subscriptions,
      docs,
    };
  }

  async updateNotificationPreferences(
    userId: string,
    prefs: { publicTaskCreated?: boolean },
  ) {
    const user = await this.usersService.updateNotificationPreferences(
      userId,
      prefs,
    );
    if (!user) throw new UnauthorizedException();
    return { notificationPreferences: user.notificationPreferences };
  }

  async deleteAccount(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    await this.usersService.deleteUser(userId);
    return { success: true };
  }

  private static readonly ONBOARDING_STEP_DEFS = [
    {
      id: 'addedFirstClient' as const,
      order: 1,
      title: 'Agregá tu primer cliente',
      description:
        'Así vas a poder facturarle y trackear todos sus proyectos en un solo lugar.',
      cta: { label: 'Agregar cliente', route: '/app/clients?new=1' },
    },
    {
      id: 'addedFirstProject' as const,
      order: 2,
      title: 'Creá tu primer proyecto',
      description:
        'Organizá el trabajo de tus clientes en proyectos con tareas, tiempos y entregables.',
      cta: { label: 'Crear proyecto', route: '/app/projects?new=1' },
    },
    {
      id: 'addedThreeTasks' as const,
      order: 3,
      title: 'Sumá al menos 3 tareas',
      description:
        'Desglosá tu trabajo en tareas para no perder de vista lo que falta hacer.',
      cta: { label: 'Crear tarea', route: '/app/tasks' },
    },
    {
      id: 'loggedFirstHours' as const,
      order: 4,
      title: 'Registrá tus primeras horas',
      description:
        'Trackeá el tiempo que le dedicás a cada proyecto para facturar con precisión.',
      cta: { label: 'Iniciar timer', route: '/app/time-tracking' },
    },
    {
      id: 'createdFirstQuote' as const,
      order: 5,
      title: 'Creá tu primer presupuesto',
      description:
        'Cotizá el trabajo para un cliente y seguilo hasta que lo acepte.',
      cta: { label: 'Crear presupuesto', route: '/app/quotes' },
    },
    {
      id: 'addedFirstRetainer' as const,
      order: 6,
      title: 'Registrá tu primera cuota',
      description:
        'Si tenés ingresos recurrentes, cargalos como suscripción para no perder de vista ningún cobro.',
      cta: { label: 'Registrar cuota', route: '/app/subscriptions' },
    },
  ];

  async getOnboardingStatus(userId: string, workspaceId: string) {
    const base = { workspaceId, isDeleted: false, isDemo: { $ne: true } };

    const [clientCount, projectCount, taskCount, timeEntryCount, quoteCount, retainerCount, demoCount] =
      await Promise.all([
        this.clientModel.countDocuments(base as any),
        this.projectModel.countDocuments(base as any),
        this.taskModel.countDocuments(base as any),
        this.timeEntryModel.countDocuments({
          workspaceId,
          isDeleted: false,
        } as any),
        this.quoteModel.countDocuments(base as any),
        this.subscriptionModel.countDocuments({
          ...base,
          type: { $ne: 'expense' },
        } as any),
        Promise.all([
          this.clientModel.countDocuments({ workspaceId, isDemo: true, isDeleted: false } as any),
          this.projectModel.countDocuments({ workspaceId, isDemo: true, isDeleted: false } as any),
          this.taskModel.countDocuments({ workspaceId, isDemo: true, isDeleted: false } as any),
          this.quoteModel.countDocuments({ workspaceId, isDemo: true, isDeleted: false } as any),
          this.subscriptionModel.countDocuments({ workspaceId, isDemo: true, isDeleted: false } as any),
        ]).then((counts) => counts.reduce((a, b) => a + b, 0)),
      ]);

    const steps = {
      addedFirstClient: clientCount > 0,
      addedFirstProject: projectCount > 0,
      addedThreeTasks: taskCount >= 3,
      loggedFirstHours: timeEntryCount > 0,
      createdFirstQuote: quoteCount > 0,
      addedFirstRetainer: retainerCount > 0,
    };

    const completedCount = Object.values(steps).filter(Boolean).length;
    const completed = completedCount === 6;

    const user = await this.usersService.findById(userId);
    const stepsChanged =
      !user?.onboardingSteps ||
      Object.entries(steps).some(
        ([key, value]) => (user.onboardingSteps as any)[key] !== value,
      );
    if (stepsChanged) {
      await this.usersService.updateOnboardingSteps(userId, steps);
    }
    if (completed && !user?.onboardingCompleted) {
      await this.usersService.updateProfile(userId, {
        onboardingCompleted: true,
      } as any);
    }

    const checklist = AuthService.ONBOARDING_STEP_DEFS.map((def) => ({
      ...def,
      completed: steps[def.id],
    }));

    return {
      completed,
      steps,
      completedCount,
      totalCount: 6,
      checklist,
      hasDemoData: demoCount > 0,
    };
  }

  async webauthnRegisterChallenge(userId: string) {
    const user = await this.usersService.findByIdWithWebAuthn(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const rpID = new URL(
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173',
    ).hostname;
    const options = await generateRegistrationOptions({
      rpName: 'Orkpad',
      rpID,
      userName: user.email,
      userID: isoUint8Array.fromUTF8String(userId),
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
      excludeCredentials: (user.webauthnCredentials ?? []).map((c) => ({
        id: c.credentialId,
        transports: c.transports as any,
      })),
    });

    webauthnChallenges.set(userId, {
      challenge: options.challenge,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return options;
  }

  async webauthnRegisterVerify(
    userId: string,
    body: Record<string, any>,
    deviceName?: string,
  ) {
    const entry = webauthnChallenges.get(userId);
    if (!entry || Date.now() > entry.expiresAt) {
      webauthnChallenges.delete(userId);
      throw new BadRequestException('No hay un challenge activo o expiró.');
    }
    webauthnChallenges.delete(userId);

    const expectedOrigin =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const rpID = new URL(expectedOrigin).hostname;

    const verification = await verifyRegistrationResponse({
      response: body as any,
      expectedChallenge: entry.challenge,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new BadRequestException('Verificación biométrica fallida.');
    }

    const { credential } = verification.registrationInfo;

    await this.usersService.addWebAuthnCredential(userId, {
      credentialId: credential.id,
      publicKey: isoBase64URL.fromBuffer(credential.publicKey),
      counter: credential.counter,
      transports: (body.response?.transports ?? []) as string[],
      deviceName: deviceName ?? 'Dispositivo',
    });

    return { verified: true };
  }

  async webauthnLoginChallenge(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const userWithCreds = await this.usersService.findByIdWithWebAuthn(
      (user._id as any).toString(),
    );
    const credentials = userWithCreds?.webauthnCredentials ?? [];

    if (credentials.length === 0) {
      throw new BadRequestException(
        'No hay credenciales biométricas registradas.',
      );
    }

    const rpID = new URL(
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173',
    ).hostname;
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
      allowCredentials: credentials.map((c) => ({
        id: c.credentialId,
        transports: c.transports as any,
      })),
    });

    webauthnChallenges.set(email, {
      challenge: options.challenge,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return options;
  }

  async webauthnLoginVerify(email: string, body: Record<string, any>) {
    const entry = webauthnChallenges.get(email);
    if (!entry || Date.now() > entry.expiresAt) {
      webauthnChallenges.delete(email);
      throw new UnauthorizedException('No hay un challenge activo o expiró.');
    }
    webauthnChallenges.delete(email);

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    if (!user.emailVerified) {
      throw new ForbiddenException({
        message: 'Por favor verificá tu email antes de ingresar.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    const userWithCreds = await this.usersService.findByIdWithWebAuthn(
      (user._id as any).toString(),
    );
    const credential = (userWithCreds?.webauthnCredentials ?? []).find(
      (c) => c.credentialId === body.id,
    );

    if (!credential)
      throw new UnauthorizedException('Credencial no encontrada.');

    const expectedOrigin =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const rpID = new URL(expectedOrigin).hostname;

    const verification = await verifyAuthenticationResponse({
      response: body as any,
      expectedChallenge: entry.challenge,
      expectedOrigin,
      expectedRPID: rpID,
      credential: {
        id: credential.credentialId,
        publicKey: isoBase64URL.toBuffer(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports as any,
      },
      requireUserVerification: false,
    });

    if (!verification.verified)
      throw new UnauthorizedException('Verificación biométrica fallida.');

    const userId = (user._id as any).toString();
    await this.usersService.updateWebAuthnCounter(
      userId,
      credential.credentialId,
      verification.authenticationInfo.newCounter,
    );

    const isFirstLogin = !user.lastLogin;
    const tokens = await this.generateTokens(
      userId,
      user.email,
      user.workspaceId,
    );
    await this.usersService.updateRefreshToken(userId, tokens.refreshToken);
    await this.usersService.updateLastLogin(userId);
    if (isFirstLogin)
      await this.sendWelcomeNotification(user.workspaceId, userId);

    return { ...tokens, isFirstLogin };
  }

  async getWebAuthnCredentials(userId: string) {
    const user = await this.usersService.findByIdWithWebAuthn(userId);
    return (user?.webauthnCredentials ?? []).map((c) => ({
      credentialId: c.credentialId,
      deviceName: c.deviceName,
      registeredAt: c.registeredAt,
    }));
  }

  async removeWebAuthnCredential(userId: string, credentialId: string) {
    await this.usersService.removeWebAuthnCredential(userId, credentialId);
    return { success: true };
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async generateTokens(
    userId: string,
    email: string,
    workspaceId: string,
    rememberMe?: boolean,
  ) {
    const payload = { sub: userId, email, workspaceId };
    const refreshExpiry = rememberMe
      ? '30d'
      : (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') ??
          '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiry as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
