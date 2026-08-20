import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { learningApi } from '../api/learning/learning.api'
import type {
  LearningResource,
  TodayLearningProgress,
  SkillFocus,
  CreateLearningResourceDto,
  UpdateLearningResourceDto,
  CreateSkillFocusDto,
  UpdateSkillFocusDto,
} from '../api/learning/learning.types'

export const useLearningStore = defineStore('learning', {
  state: () => ({
    resources: [] as LearningResource[],
    total: 0,
    today: [] as TodayLearningProgress[],
    currentFocus: null as SkillFocus | null,
    focusHistory: [] as SkillFocus[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchResources(params?: { type?: string; status?: string }) {
      this.loading = true
      this.error = null
      try {
        const { data } = await learningApi.getResources(params)
        this.resources = data.data
        this.total = data.total
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async fetchToday() {
      try {
        const { data } = await learningApi.getTodayProgress()
        this.today = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      }
    },
    async createResource(dto: CreateLearningResourceDto) {
      this.loading = true
      try {
        await learningApi.createResource(dto)
        await this.fetchResources()
        useToast().success('Recurso de aprendizaje creado')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al crear el recurso')
        throw err
      } finally {
        this.loading = false
      }
    },
    async updateResource(id: string, dto: UpdateLearningResourceDto) {
      this.loading = true
      try {
        await learningApi.updateResource(id, dto)
        await this.fetchResources()
        useToast().success('Recurso actualizado')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al actualizar el recurso')
        throw err
      } finally {
        this.loading = false
      }
    },
    async removeResource(id: string) {
      this.loading = true
      try {
        await learningApi.removeResource(id)
        await this.fetchResources()
        useToast().success('Recurso eliminado')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al eliminar el recurso')
        throw err
      } finally {
        this.loading = false
      }
    },
    async logProgress(id: string, unitsLogged: number, note?: string) {
      try {
        const { data } = await learningApi.logProgress(id, unitsLogged, note)
        const idx = this.resources.findIndex((r) => r._id === id)
        if (idx !== -1) this.resources[idx] = data
        await this.fetchToday()
        useToast().success('Progreso registrado')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al registrar progreso')
        throw err
      }
    },
    async fetchCurrentFocus() {
      try {
        const { data } = await learningApi.getCurrentFocus()
        this.currentFocus = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      }
    },
    async fetchFocusHistory() {
      try {
        const { data } = await learningApi.getFocusHistory()
        this.focusHistory = data.data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      }
    },
    async setWeeklyFocus(dto: CreateSkillFocusDto) {
      this.loading = true
      try {
        await learningApi.setWeeklyFocus(dto)
        await this.fetchCurrentFocus()
        useToast().success('Foco semanal definido')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al definir el foco semanal')
        throw err
      } finally {
        this.loading = false
      }
    },
    async updateFocus(id: string, dto: UpdateSkillFocusDto) {
      this.loading = true
      try {
        await learningApi.updateFocus(id, dto)
        await Promise.all([this.fetchCurrentFocus(), this.fetchFocusHistory()])
        useToast().success('Foco semanal actualizado')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al actualizar el foco semanal')
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
