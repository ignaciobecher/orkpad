import apiClient from '../axios.config'
import type {
  LoginDto,
  LoginResponse,
  OAuthExchangeResponse,
  RegisterDto,
  RegisterResponse,
  WebAuthnCredentialInfo,
} from './auth.types'

const BASE = '/auth'

export const authApi = {
  login: (dto: LoginDto) =>
    apiClient.post<LoginResponse>(`${BASE}/login`, dto),

  register: (dto: RegisterDto) =>
    apiClient.post<RegisterResponse>(`${BASE}/register`, dto),

  logout: () =>
    apiClient.post(`${BASE}/logout`),

  me: () =>
    apiClient.get<any>(`${BASE}/me`),

  exchangeGithubCode: (code: string) =>
    apiClient.post<OAuthExchangeResponse>(`${BASE}/github/exchange`, { code }),

  resendVerification: (email: string) =>
    apiClient.post(`${BASE}/resend-verification`, { email }),

  forgotPassword: (email: string) =>
    apiClient.post(`${BASE}/forgot-password`, { email }),

  resetPasswordStatus: (token: string) =>
    apiClient.get<{ valid: boolean; requiresTwoFactor: boolean }>(`${BASE}/reset-password/status`, { params: { token } }),

  resetPassword: (token: string, password: string, totpToken?: string) =>
    apiClient.post(`${BASE}/reset-password`, { token, password, ...(totpToken ? { totpToken } : {}) }),

  changePassword: (dto: { currentPassword: string; newPassword: string; totpToken?: string }) =>
    apiClient.post(`${BASE}/change-password`, dto),

  updateProfile: (dto: { name?: string; phone?: string }) =>
    apiClient.patch(`${BASE}/profile`, dto),

  setup2FA: () =>
    apiClient.post<{ qrCodeDataUrl: string }>(`${BASE}/2fa/setup`),

  verify2FA: (token: string) =>
    apiClient.post(`${BASE}/2fa/verify`, { token }),

  disable2FA: () =>
    apiClient.delete(`${BASE}/2fa`),

  exportData: () =>
    apiClient.get(`${BASE}/export`),

  updateNotificationPreferences: (prefs: { publicTaskCreated?: boolean }) =>
    apiClient.patch(`${BASE}/notification-preferences`, prefs),

  deleteAccount: () =>
    apiClient.delete(`${BASE}/account`),

  webauthn: {
    registerChallenge: () =>
      apiClient.post<any>(`${BASE}/webauthn/register-challenge`),

    registerVerify: (dto: { response: any; deviceName?: string }) =>
      apiClient.post<{ verified: boolean }>(`${BASE}/webauthn/register-verify`, dto),

    loginChallenge: (email: string) =>
      apiClient.post<any>(`${BASE}/webauthn/login-challenge`, { email }),

    loginVerify: (dto: { email: string; response: any }) =>
      apiClient.post<{ success: boolean; isFirstLogin: boolean }>(`${BASE}/webauthn/login-verify`, dto),

    getCredentials: () =>
      apiClient.get<WebAuthnCredentialInfo[]>(`${BASE}/webauthn/credentials`),

    removeCredential: (credentialId: string) =>
      apiClient.delete<{ success: boolean }>(`${BASE}/webauthn/credential/${encodeURIComponent(credentialId)}`),
  },
}
