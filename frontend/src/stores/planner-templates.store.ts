import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { plannerTemplatesApi } from '@/api/planner/planner-templates.api'
import type {
  PlannerTemplate,
  CreatePlannerTemplateDto,
  UpdatePlannerTemplateDto,
  QueryPlannerTemplateDto,
  CaptureDayTemplateDto,
} from '@/api/planner/planner.types'

export const usePlannerTemplatesStore = defineStore('plannerTemplates', {
  state: () => ({
    items: [] as PlannerTemplate[],
    total: 0,
    loading: false,
    error: null as string | null,
    filters: {
      page: 1,
      limit: 50,
      includePublic: true,
    } as QueryPlannerTemplateDto,
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const { data } = await plannerTemplatesApi.getAll(this.filters)
        this.items = data.data
        this.total = data.total
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },

    async create(dto: CreatePlannerTemplateDto) {
      try {
        const { data } = await plannerTemplatesApi.create(dto)
        this.items.unshift(data)
        return data
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al crear plantilla')
        throw err
      }
    },

    async update(id: string, dto: UpdatePlannerTemplateDto) {
      try {
        const { data } = await plannerTemplatesApi.update(id, dto)
        const idx = this.items.findIndex(t => t._id === id)
        if (idx !== -1) this.items[idx] = data
        return data
      } catch (err: any) {
        useToast().error('Error al actualizar plantilla')
        throw err
      }
    },

    async remove(id: string) {
      try {
        this.items = this.items.filter(t => t._id !== id)
        await plannerTemplatesApi.remove(id)
      } catch (err: any) {
        useToast().error('Error al eliminar plantilla')
        throw err
      }
    },

    async duplicate(id: string) {
      try {
        const { data } = await plannerTemplatesApi.duplicate(id)
        this.items.unshift(data)
        useToast().success('Plantilla duplicada')
        return data
      } catch (err: any) {
        useToast().error('Error al duplicar plantilla')
        throw err
      }
    },

    async captureFromDay(dto: CaptureDayTemplateDto) {
      try {
        const { data } = await plannerTemplatesApi.captureFromDay(dto)
        this.items.unshift(data)
        useToast().success('Día guardado como plantilla')
        return data
      } catch (err: any) {
        useToast().error('Error al guardar plantilla')
        throw err
      }
    },

    async applyToDate(id: string, targetDate: string) {
      try {
        const { data } = await plannerTemplatesApi.applyToDate(id, targetDate)
        useToast().success(`${data.applied} bloques aplicados`)
        return data
      } catch (err: any) {
        useToast().error('Error al aplicar plantilla')
        throw err
      }
    },
  },
})
