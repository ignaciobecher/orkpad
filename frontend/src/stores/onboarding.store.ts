import { defineStore } from 'pinia'
import { onboardingApi } from '@/api/onboarding/onboarding.api'
import type { OnboardingStatus, OnboardingSteps, WelcomeContent } from '@/api/onboarding/onboarding.types'
import { ONBOARDING_STEP_LABELS } from '@/components/onboarding/onboarding-steps'
import { success } from '@/composables/useToast'

const STEP_LABELS = ONBOARDING_STEP_LABELS

const dismissedKey = (uid: string) => `orkpad_setup_dismissed_${uid}`

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    status: null as OnboardingStatus | null,
    loading: false,
    visible: false,
    welcome: null as WelcomeContent | null,
    welcomeLoading: false,
    showWelcome: false,
    demoLoading: false,
    lastUserId: '' as string,
  }),

  getters: {
    isComplete: (state) => state.status?.completed ?? false,
    completedCount: (state) => state.status?.completedCount ?? 0,
    totalCount: (state) => state.status?.totalCount ?? 6,
    checklist: (state) => state.status?.checklist ?? [],
    hasDemoData: (state) => state.status?.hasDemoData ?? false,
  },

  actions: {
    async fetchStatus() {
      if (this.loading) return
      this.loading = true
      try {
        const prev = this.status ? { ...this.status.steps } : null
        const { data } = await onboardingApi.getStatus()

        if (prev) {
          this._notifyNewlyCompleted(prev, data.steps, data.completedCount)
        }

        this.status = data

        if (data.completed) {
          this.visible = false
        }
      } catch {
        // silently ignore — onboarding is non-critical
      } finally {
        this.loading = false
      }
    },

    _notifyNewlyCompleted(
      prev: OnboardingSteps,
      next: OnboardingSteps,
      newCount: number,
    ) {
      const prevCount = Object.values(prev).filter(Boolean).length

      for (const key of Object.keys(next) as (keyof OnboardingSteps)[]) {
        if (!prev[key] && next[key]) {
          success(`¡${STEP_LABELS[key]}!`)
        }
      }

      if (prevCount < 3 && newCount >= 3) {
        setTimeout(() => success('¡Ya tienes la mitad del setup! La app empieza a tomar forma.'), 600)
      }
    },

    markVisible(v: boolean) {
      this.visible = v
      // Reabrir a mano (menú Inicio) levanta la omisión
      if (v && this.lastUserId) {
        try { localStorage.removeItem(dismissedKey(this.lastUserId)) } catch { /* noop */ }
      }
    },

    /** Omite el setup para siempre en este navegador/usuario. */
    dismiss() {
      this.visible = false
      if (this.lastUserId) {
        try { localStorage.setItem(dismissedKey(this.lastUserId), '1') } catch { /* noop */ }
      }
    },

    isDismissed(uid: string): boolean {
      if (!uid) return false
      try { return localStorage.getItem(dismissedKey(uid)) === '1' } catch { return false }
    },

    async checkAndShow(userId: string) {
      this.lastUserId = userId || ''
      await this.fetchStatus()
      if (this.status && !this.status.completed && !this.isDismissed(this.lastUserId)) {
        this.visible = true
      }
    },

    complete() {
      this.fetchStatus()
    },

    async fetchWelcome() {
      if (this.welcome || this.welcomeLoading) return
      this.welcomeLoading = true
      try {
        const { data } = await onboardingApi.getWelcome()
        this.welcome = data
      } catch {
        // silently ignore — welcome content is non-critical
      } finally {
        this.welcomeLoading = false
      }
    },

    async maybeShowWelcome(isFirstLogin: boolean) {
      if (!isFirstLogin) return
      await this.fetchWelcome()
      this.showWelcome = true
    },

    hideWelcome() {
      this.showWelcome = false
    },

    async seedDemoData() {
      if (this.demoLoading) return
      this.demoLoading = true
      try {
        await onboardingApi.seedDemoData()
        await this.fetchStatus()
      } finally {
        this.demoLoading = false
      }
    },

    async removeDemoData() {
      if (this.demoLoading) return
      this.demoLoading = true
      try {
        await onboardingApi.removeDemoData()
        await this.fetchStatus()
      } finally {
        this.demoLoading = false
      }
    },
  },
})
