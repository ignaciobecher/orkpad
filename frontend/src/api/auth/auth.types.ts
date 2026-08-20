export interface User {
  _id: string
  email: string
  name: string
  workspaceId: string
  emailVerified: boolean
  phone?: string
  twoFactorEnabled: boolean
  notificationPreferences?: {
    publicTaskCreated: boolean
  }
  onboardingCompleted?: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

export interface RegisterResponse {
  requiresEmailVerification: boolean
}

export interface LoginResponse {
  success: boolean
  isFirstLogin: boolean
}

export interface OAuthExchangeResponse {
  success: boolean
  alreadyExisted: boolean
  isFirstLogin: boolean
}

export interface LoginDto {
  email: string
  password: string
  rememberMe?: boolean
}

export interface WebAuthnCredentialInfo {
  credentialId: string
  deviceName: string
  registeredAt: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
  termsAccepted: boolean
}
