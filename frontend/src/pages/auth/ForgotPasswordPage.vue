<template>
  <auth-layout>
    <div class="forgot-card">
      <div class="forgot-header">
        <div class="brand">
          <w-logo :height="52" />
        </div>
        <h2 class="forgot-title">Restablecer contraseña</h2>
      </div>

      <div v-if="sent" class="success-state">
        <div class="icon-wrapper">
          <span class="material-symbols-outlined">mark_email_unread</span>
        </div>
        <span class="badge">EMAIL ENVIADO</span>
        <p class="success-desc">
          Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.
          Revisá también tu carpeta de spam.
        </p>
        <router-link to="/login" class="back-link">
          <span class="material-symbols-outlined">arrow_back</span>
          Volver al inicio de sesión
        </router-link>
      </div>

      <form v-else class="forgot-form" @submit.prevent="handleSubmit">
        <p class="instructions">
          Ingresá el email de tu cuenta y te enviaremos un enlace para crear una nueva contraseña.
        </p>
        <w-input
          v-model="email"
          label="Correo Electrónico"
          placeholder="USUARIO@DOMINIO.COM"
          id="email"
          type="email"
        />
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <div class="form-actions">
          <w-button variant="primary" block :loading="loading" type="submit">
            Enviar enlace
            <span class="material-symbols-outlined ml-2">send</span>
          </w-button>
        </div>
        <div class="footer">
          <router-link to="/login" class="back-link">
            <span class="material-symbols-outlined">arrow_back</span>
            Volver al inicio de sesión
          </router-link>
        </div>
      </form>
    </div>
  </auth-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { authApi } from '@/api/auth/auth.api'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import WButton from '@/components/ui/WButton.vue'
import WInput from '@/components/ui/WInput.vue'
import WLogo from '@/components/ui/WLogo.vue'

export default defineComponent({
  name: 'ForgotPasswordPage',
  components: { AuthLayout, WButton, WInput, WLogo },
  setup() {
    const email = ref('')
    const loading = ref(false)
    const sent = ref(false)
    const errorMsg = ref('')

    async function handleSubmit() {
      if (!email.value) return
      errorMsg.value = ''
      loading.value = true
      try {
        await authApi.forgotPassword(email.value)
        sent.value = true
      } catch {
        errorMsg.value = 'Ocurrió un error. Intentá de nuevo.'
      } finally {
        loading.value = false
      }
    }

    return { email, loading, sent, errorMsg, handleSubmit }
  },
})
</script>

<style scoped>
.forgot-card {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 40px;
}

@media (max-width: 640px) {
  .forgot-card {
    padding: 24px;
    border: none;
    background: transparent;
  }
}

.forgot-header {
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

.forgot-title {
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
  margin: 0 0 24px;
}

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.error-msg {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-error);
  margin-top: 8px;
}

.form-actions {
  margin-top: 20px;
}

.footer {
  margin-top: 24px;
  text-align: center;
}

/* Success state */
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
  max-width: 320px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--color-primary);
}

.back-link .material-symbols-outlined {
  font-size: 16px;
}

.ml-2 {
  margin-left: 8px;
}
</style>
