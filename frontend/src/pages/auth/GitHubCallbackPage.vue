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
        <p class="status-title status-title--error">AUTENTICACIÓN FALLIDA</p>
        <p class="status-message">{{ errorMessage }}</p>
        <router-link to="/login" class="back-link">
          <span class="material-symbols-outlined">arrow_back</span>
          Volver al inicio de sesión
        </router-link>
      </div>

      <!-- Loading state -->
      <div v-else-if="state === 'loading'" class="callback-status">
        <div class="spinner"></div>
        <p class="status-title">{{ loadingTitle }}</p>
        <p class="status-message">{{ loadingSubtitle }}</p>
      </div>

      <!-- Success state -->
      <Transition name="success-fade" appear>
        <div v-if="state === 'success'" class="callback-status">
          <div class="status-icon status-icon--success">
            <span class="material-symbols-outlined">check_circle</span>
          </div>
          <p class="status-title status-title--success">{{ successTitle }}</p>
          <p class="status-message">{{ $t('githubAuth.success') }}</p>
        </div>
      </Transition>
    </div>
  </auth-layout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '@/composables/useToast'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import WLogo from '@/components/ui/WLogo.vue'

type CallbackState = 'loading' | 'success' | 'error'

export default defineComponent({
  name: 'GitHubCallbackPage',
  components: { AuthLayout, WLogo },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const { showToast } = useToast()

    const state = ref<CallbackState>('loading')
    const errorMessage = ref('')
    const authMode = ref<'login' | 'register' | 'link'>(
      (localStorage.getItem('github_auth_mode') as 'login' | 'register' | 'link') ?? 'login',
    )

    const isRegister = computed(() => authMode.value === 'register')
    const isLink = computed(() => authMode.value === 'link')

    const loadingTitle = computed(() =>
      isLink.value
        ? 'CONECTANDO TU CUENTA DE GITHUB'
        : isRegister.value
          ? 'CREANDO TU CUENTA CON GITHUB'
          : 'INICIANDO SESIÓN CON GITHUB',
    )

    const loadingSubtitle = computed(() =>
      isLink.value
        ? 'Vinculando repositorios...'
        : isRegister.value
          ? 'Configurando tu workspace...'
          : 'Verificando credenciales...',
    )

    const successTitle = computed(() =>
      isLink.value
        ? '¡CUENTA CONECTADA!'
        : isRegister.value
          ? '¡CUENTA CREADA!'
          : '¡BIENVENIDO DE VUELTA!',
    )

    onMounted(async () => {
      const { error: errorParam, code } = route.query

      if (errorParam) {
        state.value = 'error'
        errorMessage.value = 'No se pudo completar la autenticación con GitHub. Intenta de nuevo.'
        return
      }

      if (!code) {
        state.value = 'error'
        errorMessage.value = 'No se recibieron credenciales de GitHub. Intenta de nuevo.'
        return
      }

      const mode = localStorage.getItem('github_auth_mode')

      try {
        const { alreadyExisted } = await authStore.loginWithGithubCode(code as string)

        if (authStore.isAuthenticated) {
          localStorage.removeItem('github_auth_mode')

          if (alreadyExisted && mode === 'register') {
            showToast('Ya tenías una cuenta vinculada. Iniciamos sesión por vos.', 'info')
          }

          state.value = 'success'
          setTimeout(() => {
            router.push(mode === 'link' ? '/app/integrations' : '/app/dashboard')
          }, 1800)
        } else {
          state.value = 'error'
          errorMessage.value = 'No se pudo iniciar sesión. La sesión no se estableció correctamente.'
        }
      } catch (e) {
        state.value = 'error'
        errorMessage.value = 'Ocurrió un error al conectar con el servidor. Intenta de nuevo.'
        console.error('GitHub callback error:', e)
      }
    })

    return { state, errorMessage, loadingTitle, loadingSubtitle, successTitle }
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

.callback-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}

/* Spinner */
.spinner {
  width: 36px;
  height: 36px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Status icon */
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

/* Text */
.status-title {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-base);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
}

.status-title--success {
  color: var(--color-success, #22c55e);
}

.status-title--error {
  color: var(--color-error);
}

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

.back-link:hover {
  text-decoration: underline;
}

.back-link .material-symbols-outlined {
  font-size: 16px;
}

/* Success transition */
.success-fade-enter-active {
  transition: all 0.4s ease;
}

.success-fade-enter-from {
  opacity: 0;
  transform: scale(0.92);
}
</style>
