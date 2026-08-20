<template>
  <auth-layout>
    <div class="login-card">
      <router-link to="/" class="back-link">
        <span class="material-symbols-outlined">arrow_back</span>
        {{ $t('auth.back') }}
      </router-link>
      <div class="login-header">
        <div class="brand">
          <w-logo :height="52" />
        </div>
        <h2 class="login-title">{{ $t('auth.login.title') }}</h2>
      </div>

      <form class="login-form" autocomplete="on" @submit.prevent="handleLogin">
        <w-input
          v-model="form.email"
          :label="$t('auth.login.email')"
          placeholder="USUARIO@DOMINIO.COM"
          id="email"
          type="email"
          autocomplete="email"
        />
        <w-input
          v-model="form.password"
          :label="$t('auth.login.password')"
          type="password"
          placeholder="••••••••"
          id="password"
          autocomplete="current-password"
        />

        <div class="remember-me-row">
          <label class="remember-me-label">
            <input
              type="checkbox"
              v-model="rememberMe"
              class="remember-me-checkbox"
            />
            <span>Recordar mis datos</span>
          </label>
        </div>

        <div v-if="error && !emailNotVerified" class="error-notice">
          <span class="material-symbols-outlined">error</span>
          <span>{{ error }}</span>
        </div>

        <div v-if="emailNotVerified" class="verification-notice">
          <span class="material-symbols-outlined">mail</span>
          <div>
            <p class="notice-title">EMAIL NO VERIFICADO</p>
            <p class="notice-text">
              Revisá tu bandeja de entrada. ¿No llegó?
              <button type="button" class="resend-btn" :disabled="resending" @click="handleResend">
                {{ resending ? 'Enviando...' : 'Reenviar email' }}
              </button>
            </p>
          </div>
        </div>

        <div v-if="biometricError" class="biometric-error-notice">
          <span class="material-symbols-outlined">fingerprint</span>
          <span>{{ biometricError }}</span>
        </div>

        <div class="login-actions">
          <button
            v-if="hasExistingCredential && form.email"
            type="button"
            class="biometric-btn"
            :disabled="biometricLoading"
            @click="handleBiometricLogin"
          >
            <span class="material-symbols-outlined">fingerprint</span>
            <span>{{ biometricLoading ? 'Verificando...' : 'Iniciar sesión con biometría' }}</span>
          </button>

          <w-button variant="primary" block :loading="loading" type="submit">
            {{ $t('auth.login.submit') }}
            <span class="material-symbols-outlined ml-2">arrow_forward</span>
          </w-button>
        </div>

        <social-auth />

        <div class="login-footer">
          <router-link to="/register" class="forgot-link">{{
            $t('auth.login.createAccount')
          }}</router-link>
          <span class="divider">|</span>
          <router-link to="/forgot-password" class="forgot-link">{{
            $t('auth.login.forgotPassword')
          }}</router-link>
        </div>
      </form>
    </div>

    <!-- Biometric setup prompt shown after first successful login -->
    <div v-if="showBiometricPrompt" class="biometric-overlay">
      <div class="biometric-prompt">
        <div class="biometric-prompt-icon">
          <span class="material-symbols-outlined">fingerprint</span>
        </div>
        <h3 class="biometric-prompt-title">Iniciá sesión más rápido</h3>
        <p class="biometric-prompt-text">
          Activá el acceso biométrico para ingresar con tu huella digital o Face ID la próxima vez, sin escribir tu contraseña.
        </p>
        <p v-if="biometricRegisterError" class="biometric-prompt-error">{{ biometricRegisterError }}</p>
        <div class="biometric-prompt-actions">
          <w-button variant="primary" block :loading="biometricRegisterLoading" @click="handleAcceptBiometric">
            <span class="material-symbols-outlined">fingerprint</span>
            Activar biometría
          </w-button>
          <button type="button" class="skip-btn" :disabled="biometricRegisterLoading" @click="handleSkipBiometric">
            Ahora no
          </button>
        </div>
      </div>
    </div>
  </auth-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/api/auth/auth.api'
import { useWebAuthn } from '@/composables/useWebAuthn'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import WButton from '@/components/ui/WButton.vue'
import WInput from '@/components/ui/WInput.vue'
import SocialAuth from '@/components/auth/SocialAuth.vue'
import WLogo from '@/components/ui/WLogo.vue'

const REMEMBER_EMAIL_KEY = 'orkpad_remember_email'
const BIOMETRIC_DISMISSED_KEY = 'orkpad_biometric_dismissed'

export default defineComponent({
  name: 'LoginPage',
  components: { AuthLayout, WButton, WInput, SocialAuth, WLogo },
  setup() {
    const {
      isPlatformAvailable,
      isLoading: biometricIsLoading,
      error: biometricError,
      checkPlatformAvailability,
      loginWithBiometric,
      registerCredential,
      getCredentials,
    } = useWebAuthn()
    return {
      isPlatformAvailable,
      biometricIsLoading,
      biometricError,
      checkPlatformAvailability,
      loginWithBiometric,
      registerCredential,
      getCredentials,
    }
  },
  data() {
    return {
      form: {
        email: '',
        password: '',
      },
      rememberMe: false,
      emailNotVerified: false,
      resending: false,
      biometricLoading: false,
      hasExistingCredential: false,
      showBiometricPrompt: false,
      biometricRegisterLoading: false,
      biometricRegisterError: '',
    }
  },
  computed: {
    ...mapState(useAuthStore, ['loading', 'error']),
  },
  async mounted() {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY)
    if (savedEmail) {
      this.form.email = savedEmail
      this.rememberMe = true
    }
    await this.checkPlatformAvailability()
    if (this.isPlatformAvailable && savedEmail) {
      await this.checkExistingCredential()
    }
  },
  methods: {
    ...mapActions(useAuthStore, ['login']),

    async checkExistingCredential() {
      try {
        const creds = await this.getCredentials()
        this.hasExistingCredential = creds.length > 0
      } catch {
        this.hasExistingCredential = false
      }
    },

    async handleLogin() {
      this.emailNotVerified = false
      try {
        await this.login({ ...this.form, rememberMe: this.rememberMe })
        if (this.rememberMe) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, this.form.email)
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY)
        }

        // After successful login: check if we should offer biometric setup
        if (this.isPlatformAvailable && !this.hasExistingCredential) {
          const dismissed = localStorage.getItem(BIOMETRIC_DISMISSED_KEY)
          if (!dismissed) {
            this.showBiometricPrompt = true
            return  // Don't navigate yet — wait for user response
          }
        }

        this.$router.push('/app/dashboard')
      } catch (err: any) {
        if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
          this.emailNotVerified = true
        }
      }
    },

    async handleAcceptBiometric() {
      this.biometricRegisterLoading = true
      this.biometricRegisterError = ''
      try {
        const success = await this.registerCredential('Mi dispositivo')
        if (success) {
          this.$router.push('/app/dashboard')
        } else {
          // biometricError from composable already set — show it inline
          this.biometricRegisterError = (this.biometricError as string) || 'No se pudo activar la biometría.'
        }
      } finally {
        this.biometricRegisterLoading = false
      }
    },

    handleSkipBiometric() {
      localStorage.setItem(BIOMETRIC_DISMISSED_KEY, '1')
      this.$router.push('/app/dashboard')
    },

    async handleBiometricLogin() {
      this.biometricLoading = true
      try {
        const success = await this.loginWithBiometric(this.form.email)
        if (success) {
          this.$router.push('/app/dashboard')
        }
      } finally {
        this.biometricLoading = false
      }
    },

    async handleResend() {
      this.resending = true
      try {
        await authApi.resendVerification(this.form.email)
      } finally {
        this.resending = false
      }
    },
  },
})
</script>

<style scoped>
.login-card {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 40px;
  position: relative;
}

.back-link {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  transition: all 0.2s ease;
  z-index: 10;
}

.back-link:hover {
  color: var(--color-primary);
  transform: translateX(-2px);
}

.back-link span {
  font-size: 16px;
}

@media (max-width: 640px) {
  .login-card {
    padding: 24px;
    border: none;
    background: transparent;
  }
}

.login-header {
  margin-bottom: 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.brand-text {
  font-family: var(--font-body);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
  letter-spacing: -0.05em;
}

.brand-square {
  width: 16px;
  height: 16px;
  background-color: var(--color-primary);
}

.login-title {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-base);
}

.remember-me-row {
  margin-bottom: 16px;
}

.remember-me-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  user-select: none;
}

.remember-me-checkbox {
  width: 14px;
  height: 14px;
  accent-color: var(--color-primary);
  cursor: pointer;
  flex-shrink: 0;
}

.login-actions {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.biometric-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  cursor: pointer;
  transition: all 0.2s ease;
}

.biometric-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.biometric-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.biometric-btn .material-symbols-outlined {
  font-size: 18px;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.divider {
  color: var(--color-text-muted);
  font-size: 11px;
}

.forgot-link {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-decoration: none;
  text-transform: uppercase;
}

.forgot-link:hover {
  color: var(--color-primary);
}

.ml-2 {
  margin-left: 8px;
}

.error-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background-color: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.3);
  margin-bottom: 16px;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-error);
}

.error-notice .material-symbols-outlined {
  font-size: 18px;
  flex-shrink: 0;
}

.biometric-error-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background-color: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.3);
  margin-bottom: 16px;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-error);
}

.biometric-error-notice .material-symbols-outlined {
  font-size: 18px;
  flex-shrink: 0;
}

.verification-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background-color: rgba(91, 78, 255, 0.06);
  border: 1px solid rgba(91, 78, 255, 0.25);
  margin-bottom: 16px;
}

.verification-notice .material-symbols-outlined {
  font-size: 20px;
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 1px;
}

.notice-title {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 4px;
}

.notice-text {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.5;
}

.resend-btn {
  background: none;
  border: none;
  padding: 0;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
}

.resend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Biometric post-login prompt ─────────────────────────────────── */

.biometric-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.biometric-prompt {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 40px 32px;
  max-width: 380px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.biometric-prompt-icon .material-symbols-outlined {
  font-size: 48px;
  color: var(--color-primary);
}

.biometric-prompt-title {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-base);
  margin: 0;
}

.biometric-prompt-text {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;
}

.biometric-prompt-error {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-error);
  margin: 0;
}

.biometric-prompt-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.skip-btn {
  background: none;
  border: none;
  padding: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  cursor: pointer;
  transition: color 0.2s ease;
}

.skip-btn:hover:not(:disabled) {
  color: var(--color-text-base);
}

.skip-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
