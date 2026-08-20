import { defineStore } from 'pinia'
import { workSessionsApi } from '@/api/work-sessions/work-sessions.api'
import { timeTrackingApi } from '@/api/time-tracking/time-tracking.api'
import type { WorkSession } from '@/api/work-sessions/work-sessions.types'
import type { TimeEntry } from '@/api/time-tracking/time-tracking.types'
import { useToast } from '@/composables/useToast'

export const useWorkSessionsStore = defineStore('workSessions', {
  state: () => ({
    sessions: [] as WorkSession[],
    total: 0,
    activeSession: null as WorkSession | null,
    entriesBySession: {} as Record<string, TimeEntry[]>,
    loading: false,
    entriesLoading: false,
  }),

  getters: {
    hasActiveSession: (state) => state.activeSession !== null,
    pastSessions: (state) =>
      state.sessions.filter((s) => s.endTime),
  },

  actions: {
    async init() {
      await Promise.all([this.fetchActive(), this.fetchAll()])
      if (this.activeSession) {
        await this.fetchEntriesForSession(this.activeSession._id)
      }
    },

    async fetchAll(page = 1) {
      this.loading = true
      try {
        const { data } = await workSessionsApi.getAll({ page, limit: 30 })
        this.sessions = data.data
        this.total = data.total
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error cargando jornadas')
      } finally {
        this.loading = false
      }
    },

    async fetchActive() {
      try {
        const { data } = await workSessionsApi.getActive()
        this.activeSession = data
      } catch (err: any) {
        // A genuine "no active session" is a 200 response with data: null,
        // handled above — reaching this catch is always a transient error
        // (network, auth). Don't clear activeSession here: doing so invites
        // the user to start a duplicate session while the real one is still
        // active server-side.
        useToast().error(err.response?.data?.message || 'No se pudo verificar la jornada activa')
      }
    },

    async fetchEntriesForSession(sessionId: string) {
      this.entriesLoading = true
      try {
        const { data } = await timeTrackingApi.getAll({ sessionId, limit: 100 })
        this.entriesBySession = { ...this.entriesBySession, [sessionId]: data.data }
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error cargando bloques')
      } finally {
        this.entriesLoading = false
      }
    },

    async startSession() {
      this.loading = true
      try {
        const { data } = await workSessionsApi.start()
        this.activeSession = data
        this.entriesBySession[data._id] = []
        useToast().success('Jornada iniciada')
        return data
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error iniciando jornada')
        throw err
      } finally {
        this.loading = false
      }
    },

    async endSession(id: string) {
      this.loading = true
      try {
        const { data } = await workSessionsApi.end(id)
        this.activeSession = null
        const idx = this.sessions.findIndex((s) => s._id === id)
        if (idx >= 0) this.sessions[idx] = data
        else this.sessions.unshift(data)
        useToast().success('Jornada finalizada')
        return data
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error finalizando jornada')
        throw err
      } finally {
        this.loading = false
      }
    },

    async addBlock(sessionId: string, dto: {
      projectId?: string
      startTime: string
      endTime?: string
      description?: string
    }) {
      try {
        const { data } = await timeTrackingApi.create({ ...dto, sessionId })
        // The backend auto-closes the previously open entry in this session
        // (its endTime/duration change server-side), so re-fetch instead of
        // only appending — otherwise the closed entry would show a stale 0m.
        await this.fetchEntriesForSession(sessionId)
        useToast().success('Bloque registrado')
        return data
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error guardando bloque')
        throw err
      }
    },

    async removeBlock(sessionId: string, entryId: string) {
      try {
        await timeTrackingApi.remove(entryId)
        const entries = this.entriesBySession[sessionId] ?? []
        this.entriesBySession = {
          ...this.entriesBySession,
          [sessionId]: entries.filter((e) => e._id !== entryId),
        }
        useToast().success('Bloque eliminado')
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error eliminando bloque')
        throw err
      }
    },

    async removeSession(id: string) {
      this.loading = true
      try {
        await workSessionsApi.remove(id)
        this.sessions = this.sessions.filter((s) => s._id !== id)
        useToast().success('Jornada eliminada')
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error eliminando jornada')
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
