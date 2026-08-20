import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { googleApi } from '@/api/google/google.api'
import { baseURL } from '@/api/axios.config'
import type { GoogleConnection, GoogleCalendarEvent } from '@/api/google/google.types'

export const useGoogleStore = defineStore('google', {
  state: () => ({
    connection: null as GoogleConnection | null,
    loading: false,
    syncing: false,
    calendarEvents: [] as GoogleCalendarEvent[],
  }),
  getters: {
    isConnected: (state) => state.connection?.connected === true,
    connectedEmail: (state) => state.connection?.email,
  },
  actions: {
    async fetchStatus() {
      this.loading = true
      try {
        const { data } = await googleApi.getStatus()
        this.connection = data
      } catch {
        this.connection = { connected: false }
      } finally {
        this.loading = false
      }
    },

    connectWithGoogle() {
      window.location.href = `${baseURL}/auth/google`
    },

    async disconnect() {
      this.loading = true
      try {
        await googleApi.disconnect()
        this.connection = { connected: false }
        useToast().success('Cuenta de Google desconectada')
      } catch (err: any) {
        useToast().error(err.response?.data?.message ?? 'Error al desconectar')
        throw err
      } finally {
        this.loading = false
      }
    },

    async syncCalendar() {
      this.syncing = true
      try {
        const { data } = await googleApi.syncCalendar()
        this.calendarEvents = data.events
        useToast().success(`${data.synced} eventos sincronizados de Google Calendar`)
        return data
      } catch (err: any) {
        useToast().error(err.response?.data?.message ?? 'Error al sincronizar Calendar')
        throw err
      } finally {
        this.syncing = false
      }
    },
  },
})
