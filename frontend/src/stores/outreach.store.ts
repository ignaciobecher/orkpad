import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { outreachApi } from '../api/outreach/outreach.api'
import type {
  OutreachActivity,
  OutreachWeeklyGoal,
  OutreachStats,
  CreateOutreachActivityDto,
  UpdateOutreachActivityDto,
} from '../api/outreach/outreach.types'

export const useOutreachStore = defineStore('outreach', {
  state: () => ({
    activities: [] as OutreachActivity[],
    total: 0,
    currentWeek: null as OutreachWeeklyGoal | null,
    history: [] as OutreachWeeklyGoal[],
    stats: null as OutreachStats | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchActivities(params?: { type?: string; outcome?: string }) {
      this.loading = true
      this.error = null
      try {
        const { data } = await outreachApi.getActivities(params)
        this.activities = data.data
        this.total = data.total
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async logActivity(dto: CreateOutreachActivityDto) {
      this.loading = true
      try {
        await outreachApi.logActivity(dto)
        await Promise.all([this.fetchActivities(), this.fetchCurrentWeek(), this.fetchStats()])
        useToast().success('Actividad de prospección registrada')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al registrar la actividad')
        throw err
      } finally {
        this.loading = false
      }
    },
    async updateActivity(id: string, dto: UpdateOutreachActivityDto) {
      this.loading = true
      try {
        await outreachApi.updateActivity(id, dto)
        await Promise.all([this.fetchActivities(), this.fetchStats()])
        useToast().success('Actividad actualizada')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al actualizar la actividad')
        throw err
      } finally {
        this.loading = false
      }
    },
    async removeActivity(id: string) {
      this.loading = true
      try {
        await outreachApi.removeActivity(id)
        await Promise.all([this.fetchActivities(), this.fetchStats()])
        useToast().success('Actividad eliminada')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al eliminar la actividad')
        throw err
      } finally {
        this.loading = false
      }
    },
    async fetchCurrentWeek() {
      try {
        const { data } = await outreachApi.getCurrentWeek()
        this.currentWeek = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      }
    },
    async setWeeklyTarget(targetCount: number) {
      try {
        await outreachApi.setWeeklyTarget(targetCount)
        await this.fetchCurrentWeek()
        useToast().success('Meta semanal actualizada')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al actualizar la meta')
        throw err
      }
    },
    async fetchHistory() {
      try {
        const { data } = await outreachApi.getHistory()
        this.history = data.data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      }
    },
    async fetchStats() {
      try {
        const { data } = await outreachApi.getStats()
        this.stats = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      }
    },
  },
})
