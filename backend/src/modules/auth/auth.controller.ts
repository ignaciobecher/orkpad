import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GithubAuthGuard } from '../../common/guards/github-auth.guard';
import { GoogleAuthGuard } from '../../common/guards/google-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyTotpDto } from './dto/verify-totp.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { WebAuthnRegisterVerifyDto } from './dto/webauthn-register-verify.dto';
import { WebAuthnLoginVerifyDto } from './dto/webauthn-login-verify.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new account — sends verification email',
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive access + refresh tokens' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto);
    this.setTokensCookies(
      res,
      tokens.accessToken,
      tokens.refreshToken,
      tokens.rememberMe,
    );
    return { success: true, isFirstLogin: tokens.isFirstLogin };
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address via token link' })
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    try {
      await this.authService.verifyEmail(token);
      res.redirect(`${frontendUrl}/auth/email-verified`);
    } catch {
      res.redirect(`${frontendUrl}/auth/email-verified?error=true`);
    }
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification link' })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Get('reset-password/status')
  @ApiOperation({
    summary: 'Check reset token validity and whether 2FA is required',
  })
  async resetPasswordStatus(@Query('token') token: string) {
    return this.authService.resetPasswordStatus(token);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(
      dto.token,
      dto.password,
      dto.totpToken,
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using a valid refresh token' })
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RefreshTokenDto,
  ) {
    const token = req.cookies?.refreshToken || dto.refreshToken;
    if (!token) throw new UnauthorizedException('Refresh token missing');

    const tokens = await this.authService.refresh(token);
    this.setTokensCookies(res, tokens.accessToken, tokens.refreshToken);
    return { success: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and invalidate the refresh token' })
  async logout(
    @CurrentUser() user: { userId: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.userId);
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? ('none' as const) : ('lax' as const),
    };
    res.clearCookie('accessToken', cookieOpts);
    res.clearCookie('refreshToken', { ...cookieOpts, path: '/auth/refresh' });
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentUser() user: { userId: string }) {
    return this.authService.getMe(user.userId);
  }

  @Get('onboarding-status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get live onboarding checklist status computed from real counts',
  })
  getOnboardingStatus(
    @CurrentUser() user: { userId: string },
    @WorkspaceId() workspaceId: string,
  ) {
    return this.authService.getOnboardingStatus(user.userId, workspaceId);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile (name, phone)' })
  updateProfile(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.userId, dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change password — requires 2FA token if enabled' })
  changePassword(
    @CurrentUser() user: { userId: string },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.userId, dto);
  }

  @Post('2fa/setup')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  setup2FA(@CurrentUser() user: { userId: string }) {
    return this.authService.setup2FA(user.userId);
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify TOTP token and enable 2FA' })
  enable2FA(
    @CurrentUser() user: { userId: string },
    @Body() dto: VerifyTotpDto,
  ) {
    return this.authService.enable2FA(user.userId, dto.token);
  }

  @Delete('2fa')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Disable 2FA' })
  disable2FA(@CurrentUser() user: { userId: string }) {
    return this.authService.disable2FA(user.userId);
  }

  @Get('export')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Export all user workspace data as JSON' })
  exportData(
    @CurrentUser() user: { userId: string },
    @WorkspaceId() workspaceId: string,
  ) {
    return this.authService.exportData(user.userId, workspaceId);
  }

  @Patch('notification-preferences')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update notification preferences' })
  updateNotificationPreferences(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.authService.updateNotificationPreferences(user.userId, dto);
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Permanently delete the user account' })
  deleteAccount(@CurrentUser() user: { userId: string }) {
    return this.authService.deleteAccount(user.userId);
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({ summary: 'Initiate GitHub OAuth flow' })
  githubLogin() {}

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({
    summary: 'GitHub OAuth callback — redirects with a one-time exchange code',
  })
  async githubCallback(@Req() req: any, @Res() res: Response) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    try {
      const { code, alreadyExisted } = await this.authService.githubLogin(
        req.user,
      );

      const params = new URLSearchParams({ code });
      if (alreadyExisted) params.set('info', 'already_exists');

      res.redirect(`${frontendUrl}/auth/github/callback?${params.toString()}`);
    } catch {
      res.redirect(`${frontendUrl}/auth/github/callback?error=github_failed`);
    }
  }

  @Post('github/exchange')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Exchange one-time OAuth code for httpOnly session cookies',
  })
  async githubExchange(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!code) throw new UnauthorizedException('Missing code');
    const { tokens, alreadyExisted, isFirstLogin } =
      this.authService.exchangeOAuthCode(code);
    this.setTokensCookies(res, tokens.accessToken, tokens.refreshToken);
    return { success: true, alreadyExisted, isFirstLogin };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth callback — redirects with a one-time exchange code',
  })
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    try {
      const { code, alreadyExisted } = await this.authService.googleLogin(
        req.user,
      );

      const params = new URLSearchParams({ code });
      if (alreadyExisted) params.set('info', 'already_exists');

      res.redirect(`${frontendUrl}/auth/google/callback?${params.toString()}`);
    } catch {
      res.redirect(`${frontendUrl}/auth/google/callback?error=google_failed`);
    }
  }

  @Post('google/exchange')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Exchange one-time Google OAuth code for httpOnly session cookies',
  })
  async googleExchange(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!code) throw new UnauthorizedException('Missing code');
    const { tokens, alreadyExisted, isFirstLogin } =
      this.authService.exchangeOAuthCode(code);
    this.setTokensCookies(res, tokens.accessToken, tokens.refreshToken);
    return { success: true, alreadyExisted, isFirstLogin };
  }

  // ─── WebAuthn / Biometric ───────────────────────────────────────────────────

  @Post('webauthn/register-challenge')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Generate WebAuthn registration challenge for the current user',
  })
  webauthnRegisterChallenge(@CurrentUser() user: { userId: string }) {
    return this.authService.webauthnRegisterChallenge(user.userId);
  }

  @Post('webauthn/register-verify')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify WebAuthn registration and save credential' })
  webauthnRegisterVerify(
    @CurrentUser() user: { userId: string },
    @Body() dto: WebAuthnRegisterVerifyDto,
  ) {
    return this.authService.webauthnRegisterVerify(
      user.userId,
      dto.response,
      dto.deviceName,
    );
  }

  @Post('webauthn/login-challenge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate WebAuthn authentication challenge for a given email',
  })
  webauthnLoginChallenge(@Body('email') email: string) {
    return this.authService.webauthnLoginChallenge(email);
  }

  @Post('webauthn/login-verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Verify WebAuthn authentication assertion and issue session cookies',
  })
  async webauthnLoginVerify(
    @Body() dto: WebAuthnLoginVerifyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.webauthnLoginVerify(
      dto.email,
      dto.response,
    );
    this.setTokensCookies(res, tokens.accessToken, tokens.refreshToken);
    return { success: true, isFirstLogin: tokens.isFirstLogin };
  }

  @Get('webauthn/credentials')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List registered WebAuthn credentials for the current user',
  })
  getWebAuthnCredentials(@CurrentUser() user: { userId: string }) {
    return this.authService.getWebAuthnCredentials(user.userId);
  }

  @Delete('webauthn/credential/:credentialId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove a registered WebAuthn credential' })
  removeWebAuthnCredential(
    @CurrentUser() user: { userId: string },
    @Param('credentialId') credentialId: string,
  ) {
    return this.authService.removeWebAuthnCredential(user.userId, credentialId);
  }

  // ────────────────────────────────────────────────────────────────────────────

  private setTokensCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    rememberMe?: boolean,
  ) {
    const nodeEnv =
      this.configService.get<string>('NODE_ENV') || process.env.NODE_ENV;
    const isProd = nodeEnv === 'production';

    // Frontend and backend may be served from different domains,
    // so cookies must be allowed to be sent cross-site.
    const cookieOptions: any = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      partitioned: isProd, // Enable CHIPS for cross-site cookies in modern browsers
      maxAge: 15 * 60 * 1000,
    };

    res.cookie('accessToken', accessToken, cookieOptions);

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      path: '/auth/refresh',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    });
  }
}
