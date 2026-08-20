<template>
  <auth-layout>
    <div class="pending-card">
      <div class="pending-header">
        <div class="brand">
          <w-logo :height="52" />
        </div>
      </div>

      <div class="pending-body">
        <div class="icon-wrapper">
          <span class="material-symbols-outlined">mark_email_unread</span>
        </div>
        <span class="badge">VERIFICACIÓN PENDIENTE</span>
        <h2 class="title">Revisá tu bandeja de entrada</h2>
        <p class="description">
          Te enviamos un email de confirmación a
          <strong class="email-highlight">{{ email }}</strong
          >. Hacé clic en el enlace para activar tu cuenta.
        </p>

        <div v-if="resendSuccess" class="resend-success">
          <span class="material-symbols-outlined">check_circle</span>
          Email reenviado correctamente.
        </div>

        <div class="actions">
          <button class="resend-btn" :disabled="resending || resendSuccess" @click="handleResend">
            <span v-if="resending" class="spinner"></span>
            <span v-else class="material-symbols-outlined">refresh</span>
            {{ resending ? 'Enviando...' : 'Reenviar email' }}
          </button>
        </div>
      </div>

      <div class="pending-footer">
        <router-link to="/login" class="back-link">
          <span class="material-symbols-outlined">arrow_back</span>
          Volver al inicio de sesión
        </router-link>
      </div>
    </div>
  </auth-layout>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/api/auth/auth.api'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import WLogo from '@/components/ui/WLogo.vue'

export default defineComponent({
  name: 'EmailVerificationPendingPage',
  components: { AuthLayout, WLogo },
  setup() {
    const authStore = useAuthStore()
    const resending = ref(false)
    const resendSuccess = ref(false)

    const email = computed(() => authStore.pendingEmail || 'tu correo electrónico')

    async function handleResend() {
      if (!authStore.pendingEmail) return
      resending.value = true
      try {
        await authApi.resendVerification(authStore.pendingEmail)
        resendSuccess.value = true
        setTimeout(() => {
          resendSuccess.value = false
        }, 5000)
      } finally {
        resending.value = false
      }
    }

    return { email, resending, resendSuccess, handleResend }
  },
})
</script>

<style scoped>
.pending-card {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 40px;
  min-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

@media (max-width: 640px) {
  .pending-card {
    min-width: unset;
    padding: 24px;
    border: none;
    background: transparent;
  }
}

.pending-header {
  display: flex;
  justify-content: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
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

.pending-body {
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

.title {
  font-family: var(--font-body);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-base);
  margin: 0;
}

.description {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.65;
  margin: 0;
  max-width: 320px;
}

.email-highlight {
  color: var(--color-text-base);
  font-weight: 600;
}

.resend-success {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-success, #22c55e);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.resend-success .material-symbols-outlined {
  font-size: 16px;
}

.actions {
  margin-top: 8px;
}

.resend-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: none;
  border: 1px solid var(--color-border);
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  height: 36px;
}

.resend-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.resend-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.resend-btn .material-symbols-outlined {
  font-size: 16px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pending-footer {
  display: flex;
  justify-content: center;
}

.back-link {
  display: flex;
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
</style>
