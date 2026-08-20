<template>
  <auth-layout>
    <div class="callback-card">
      <div class="callback-header">
        <div class="brand">
          <w-logo :height="52" />
        </div>
      </div>

      <!-- Error state -->
      <div v-if="state === 'error'" class="callback-status">
        <div class="status-icon status-icon--error">
          <span class="material-symbols-outlined">error</span>
        </div>
        <p class="status-title status-title--error">CONEXIÓN FALLIDA</p>
        <p class="status-message">{{ errorMessage }}</p>
        <router-link to="/app/integrations" class="back-link">
          <span class="material-symbols-outlined">arrow_back</span>
          Volver a Integraciones
        </router-link>
      </div>

      <!-- Loading state -->
      <div v-else-if="state === 'loading'" class="callback-status">
        <div class="spinner"></div>
        <p class="status-title">CONECTANDO CON GOOGLE</p>
        <p class="status-message">Verificando credenciales...</p>
      </div>

      <!-- Success state -->
      <Transition name="success-fade" appear>
        <div v-if="state === 'success'" class="callback-status">
          <div class="status-icon status-icon--success">
            <span class="material-symbols-outlined">check_circle</span>
          </div>
          <p class="status-title status-title--success">¡CUENTA CONECTADA!</p>
          <p class="status-message">Tu cuenta de Google fue vinculada correctamente.</p>
        </div>
      </Transition>
    </div>
  </auth-layout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useGoogleStore } from '@/stores/google.store'
import { useToast } from '@/composables/useToast'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import WLogo from '@/components/ui/WLogo.vue'

type CallbackState = 'loading' | 'success' | 'error'

export default defineComponent({
  name: 'GoogleCallbackPage',
  components: { AuthLayout, WLogo },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const googleStore = useGoogleStore()
    const { showToast } = useToast()

    const state = ref<CallbackState>('loading')
    const errorMessage = ref('')

    onMounted(async () => {
      const { error: errorParam, code } = route.query

      if (errorParam) {
        state.value = 'error'
        errorMessage.value = 'No se pudo completar la conexión con Google. Intenta de nuevo.'
        return
      }

      if (!code) {
        state.value = 'error'
        errorMessage.value = 'No se recibieron credenciales de Google. Intenta de nuevo.'
        return
      }

      try {
        await authStore.loginWithGoogleCode(code as string)
        await googleStore.fetchStatus()

        state.value = 'success'
        showToast('Cuenta de Google conectada correctamente', 'success')
        setTimeout(() => {
          router.push('/app/integrations')
        }, 1800)
      } catch {
        state.value = 'error'
        errorMessage.value = 'Ocurrió un error al conectar con Google. Intenta de nuevo.'
      }
    })

    return { state, errorMessage }
  },
})
</script>

<style scoped>
.callback-card {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 40px;
  min-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

@media (max-width: 640px) {
  .callback-card {
    min-width: unset;
    padding: 24px;
    border: none;
    background: transparent;
  }
}

.callback-header {
  width: 100%;
  display: flex;
  justify-content: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.callback-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon--success .material-symbols-outlined {
  font-size: 48px;
  color: var(--color-success, #22c55e);
}

.status-icon--error .material-symbols-outlined {
  font-size: 48px;
  color: var(--color-error);
}

.status-title {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-base);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
}

.status-title--success { color: var(--color-success, #22c55e); }
.status-title--error { color: var(--color-error); }

.status-message {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  max-width: 280px;
  line-height: 1.5;
  margin: 0;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-primary);
  text-decoration: none;
  text-transform: uppercase;
  margin-top: 8px;
}

.back-link:hover { text-decoration: underline; }
.back-link .material-symbols-outlined { font-size: 16px; }

.success-fade-enter-active { transition: all 0.4s ease; }
.success-fade-enter-from { opacity: 0; transform: scale(0.92); }
</style>
