import { defineStore } from 'pinia'
import { authApi } from '@/api/auth/auth.api'
import type { LoginDto, RegisterDto, User } from '@/api/auth/auth.types'

let fetchMePromise: Promise<void> | null = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
    initialized: false,
    error: null as string | null,
    pendingEmailVerification: false,
    pendingEmail: '',
    justLoggedInFirstTime: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async login(dto: LoginDto) {
      this.loading = true
      this.error = null
      try {
        const { data } = await authApi.login(dto)
        this.justLoggedInFirstTime = data.isFirstLogin
        await this.fetchMe()
      } catch (err: any) {
        const status = err.response?.status
        const code = err.response?.data?.code
        if (code === 'EMAIL_NOT_VERIFIED') {
          this.error = null
        } else if (status === 401) {
          this.error = 'Email o contraseña incorrectos.'
        } else if (status === 403) {
          this.error = 'Acceso denegado.'
        } else if (status === 429) {
          this.error = 'Demasiados intentos. Esperá unos minutos.'
        } else {
          this.error = 'Error al iniciar sesión. Intentá de nuevo.'
        }
        throw err
      } finally {
        this.loading = false
      }
    },
    async register(dto: RegisterDto) {
      this.loading = true
      this.error = null
      try {
        const { data } = await authApi.register(dto)
        if (data.requiresEmailVerification) {
          this.pendingEmailVerification = true
          this.pendingEmail = dto.email
        } else {
          await this.fetchMe()
        }
      } catch (err: any) {
        const status = err.response?.status
        if (status === 409) {
          this.error = 'Este email ya está registrado.'
        } else if (status === 400) {
          this.error = 'Datos inválidos. Revisá el formulario.'
        } else {
          this.error = 'Error al registrar. Intentá de nuevo.'
        }
        throw err
      } finally {
        this.loading = false
      }
    },
    async logout() {
      try {
        await authApi.logout()
      } finally {
        this.user = null
        this.initialized = true
      }
    },
    async fetchMe() {
      if (fetchMePromise) return fetchMePromise

      fetchMePromise = (async () => {
        try {
          const { data } = await authApi.me()
          this.user = data
        } catch {
          this.user = null
        } finally {
          this.initialized = true
          fetchMePromise = null
        }
      })()

      return fetchMePromise
    },
    async loginWithGithubCode(code: string): Promise<{ alreadyExisted: boolean }> {
      const { data } = await authApi.exchangeGithubCode(code)
      this.justLoggedInFirstTime = data.isFirstLogin
      await this.fetchMe()
      return { alreadyExisted: data.alreadyExisted }
    },
    async loginWithGoogleCode(code: string): Promise<{ alreadyExisted: boolean }> {
      const { data } = await authApi.exchangeGoogleCode(code)
      this.justLoggedInFirstTime = data.isFirstLogin
      await this.fetchMe()
      return { alreadyExisted: data.alreadyExisted }
    },
  },
})
