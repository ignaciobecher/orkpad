<template>
  <auth-layout>
    <div class="reset-card">
      <div class="reset-header">
        <div class="brand">
          <w-logo :height="52" />
        </div>
        <h2 class="reset-title">Nueva contraseña</h2>
      </div>

      <div v-if="!token" class="error-state">
        <p class="error-text">
          Enlace inválido. Por favor solicitá un nuevo enlace desde la página de inicio de sesión.
        </p>
        <router-link to="/forgot-password" class="back-link">
          <span class="material-symbols-outlined">arrow_back</span>
          Solicitar nuevo enlace
        </router-link>
      </div>

      <div v-else-if="success" class="success-state">
        <div class="icon-wrapper">
          <span class="material-symbols-outlined">lock_reset</span>
        </div>
        <span class="badge">CONTRASEÑA ACTUALIZADA</span>
        <p class="success-desc">
          Tu contraseña fue restablecida correctamente. Ya podés iniciar sesión con tu nueva
          contraseña.
        </p>
        <router-link to="/login" class="cta-btn">
          Ir al inicio de sesión
          <span class="material-symbols-outlined">arrow_forward</span>
        </router-link>
      </div>

      <form v-else class="reset-form" @submit.prevent="handleSubmit">
        <p class="instructions">Elegí una contraseña segura de al menos 8 caracteres.</p>
        <w-input
          v-model="password"
          label="Nueva contraseña"
          type="password"
          placeholder="••••••••"
          id="password"
        />
        <w-input
          v-model="confirm"
          label="Confirmar contraseña"
          type="password"
          placeholder="••••••••"
          id="confirm"
        />

        <template v-if="requiresTwoFactor">
          <div class="totp-hint">
            <span class="material-symbols-outlined">shield</span>
            <span>Tu cuenta tiene 2FA activo. Ingresá el código de tu app de autenticación para confirmar el cambio.</span>
          </div>
          <w-input
            v-model="totpToken"
            label="Código 2FA"
            placeholder="000000"
            maxlength="6"
          />
        </template>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <div class="form-actions">
          <w-button variant="primary" block :loading="loading" type="submit">
            Restablecer contraseña
            <span class="material-symbols-outlined ml-2">lock_reset</span>
          </w-button>
        </div>
      </form>
    </div>
  </auth-layout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { authApi } from '@/api/auth/auth.api'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import WButton from '@/components/ui/WButton.vue'
import WInput from '@/components/ui/WInput.vue'
import WLogo from '@/components/ui/WLogo.vue'

export default defineComponent({
  name: 'ResetPasswordPage',
  components: { AuthLayout, WButton, WInput, WLogo },
  setup() {
    const route = useRoute()
    const token = computed(() => (route.query.token as string) || '')
    const password = ref('')
    const confirm = ref('')
    const totpToken = ref('')
    const loading = ref(false)
    const success = ref(false)
    const errorMsg = ref('')
    const requiresTwoFactor = ref(false)

    onMounted(async () => {
      if (!token.value) return
      try {
        const { data } = await authApi.resetPasswordStatus(token.value)
        requiresTwoFactor.value = data.requiresTwoFactor
      } catch {
        // If status check fails, proceed without 2FA field
      }
    })

    async function handleSubmit() {
      errorMsg.value = ''
      if (password.value.length < 8) {
        errorMsg.value = 'La contraseña debe tener al menos 8 caracteres.'
        return
      }
      if (password.value !== confirm.value) {
        errorMsg.value = 'Las contraseñas no coinciden.'
        return
      }
      if (requiresTwoFactor.value && totpToken.value.length !== 6) {
        errorMsg.value = 'Ingresá el código 2FA de 6 dígitos.'
        return
      }
      loading.value = true
      try {
        await authApi.resetPassword(
          token.value,
          password.value,
          requiresTwoFactor.value ? totpToken.value : undefined,
        )
        success.value = true
      } catch (err: any) {
        errorMsg.value =
          err.response?.data?.message || 'El enlace expiró o es inválido. Solicitá uno nuevo.'
      } finally {
        loading.value = false
      }
    }

    return { token, password, confirm, totpToken, loading, success, errorMsg, requiresTwoFactor, handleSubmit }
  },
})
</script>

<style scoped>
.reset-card {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 40px;
}

@media (max-width: 640px) {
  .reset-card {
    padding: 24px;
    border: none;
    background: transparent;
  }
}

.reset-header {
  margin-bottom: 28px;
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

.reset-title {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-base);
}

.instructions {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0 0 4px;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.totp-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background-color: rgba(91, 78, 255, 0.06);
  border: 1px solid rgba(91, 78, 255, 0.2);
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.totp-hint .material-symbols-outlined {
  font-size: 16px;
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 1px;
}

.error-msg {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-error);
  margin-top: 4px;
}

.form-actions {
  margin-top: 8px;
}

.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  background-color: rgba(91, 78, 255, 0.08);
  border: 1px solid rgba(91, 78, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper .material-symbols-outlined {
  font-size: 28px;
  color: var(--color-primary);
}

.badge {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.success-desc {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.65;
  margin: 0;
  max-width: 300px;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 10px 24px;
  background-color: var(--color-primary);
  color: white;
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  height: 40px;
  transition: opacity 0.2s;
}

.cta-btn:hover { opacity: 0.88; }
.cta-btn .material-symbols-outlined { font-size: 16px; }

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.error-text {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;
  max-width: 300px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-primary);
  text-decoration: none;
  text-transform: uppercase;
}

.back-link .material-symbols-outlined { font-size: 16px; }
.ml-2 { margin-left: 8px; }
</style>
