import { ref } from 'vue'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import { authApi } from '@/api/auth/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import type { WebAuthnCredentialInfo } from '@/api/auth/auth.types'

export function useWebAuthn() {
  const isSupported = typeof window !== 'undefined' && !!window.PublicKeyCredential
  const isPlatformAvailable = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function checkPlatformAvailability() {
    if (!isSupported) return
    try {
      isPlatformAvailable.value =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    } catch {
      isPlatformAvailable.value = false
    }
  }

  async function registerCredential(deviceName?: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const { data: options } = await authApi.webauthn.registerChallenge()
      const response = await startRegistration({ optionsJSON: options })
      await authApi.webauthn.registerVerify({ response, deviceName })
      return true
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        error.value = 'Autenticación biométrica cancelada.'
      } else if (err?.name === 'InvalidStateError') {
        error.value = 'Este dispositivo ya tiene una credencial registrada.'
      } else {
        error.value = err?.response?.data?.message ?? err?.message ?? 'Error al registrar biometría.'
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithBiometric(email: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const { data: options } = await authApi.webauthn.loginChallenge(email)
      const response = await startAuthentication({ optionsJSON: options })
      const { data } = await authApi.webauthn.loginVerify({ email, response })
      const authStore = useAuthStore()
      authStore.justLoggedInFirstTime = data.isFirstLogin
      await authStore.fetchMe()
      return true
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        error.value = 'Autenticación biométrica cancelada.'
      } else {
        error.value = err?.response?.data?.message ?? err?.message ?? 'Error en autenticación biométrica.'
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function getCredentials(): Promise<WebAuthnCredentialInfo[]> {
    try {
      const { data } = await authApi.webauthn.getCredentials()
      return data
    } catch {
      return []
    }
  }

  async function removeCredential(credentialId: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      await authApi.webauthn.removeCredential(credentialId)
      return true
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? 'Error al eliminar la credencial.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    isSupported,
    isPlatformAvailable,
    isLoading,
    error,
    checkPlatformAvailability,
    registerCredential,
    loginWithBiometric,
    getCredentials,
    removeCredential,
  }
}
