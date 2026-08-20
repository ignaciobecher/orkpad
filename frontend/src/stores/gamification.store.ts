import { defineStore } from 'pinia'
import { gamificationApi } from '../api/gamification/gamification.api'
import type { GamificationProfile, GamificationEvent } from '../api/gamification/gamification.types'

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    profile: null as GamificationProfile | null,
    events: [] as GamificationEvent[],
    total: 0,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchProfile() {
      this.loading = true
      this.error = null
      try {
        const { data } = await gamificationApi.getProfile()
        this.profile = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async fetchEvents(params?: { page?: number; limit?: number }) {
      try {
        const { data } = await gamificationApi.getEvents(params)
        this.events = data.data
        this.total = data.total
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      }
    },
  },
})
