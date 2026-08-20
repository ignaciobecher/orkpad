import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { leadSearchesApi } from '@/api/lead-searches/lead-searches.api'
import type { LeadSearch, CreateLeadSearchDto, LeadSearchQueryDto } from '@/api/lead-searches/lead-searches.types'

export const useLeadSearchesStore = defineStore('leadSearches', {
  state: () => ({
    items: [] as LeadSearch[],
    selected: null as LeadSearch | null,
    total: 0,
    page: 1,
    limit: 20,
    loading: false,
    creating: false,
    error: null as string | null,
  }),
  getters: {
    activeSearch: (state) => state.items.find(s => s.status === 'running'),
    totalPages: (state) => Math.ceil(state.total / state.limit),
  },
  actions: {
    async fetchAll(params?: LeadSearchQueryDto) {
      this.loading = true
      this.error = null
      try {
        const { data } = await leadSearchesApi.getAll({
          page: this.page,
          limit: this.limit,
          ...params,
        })
        this.items = data.data
        this.total = data.total
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Error al cargar búsquedas'
        useToast().error(this.error ?? 'Error al cargar búsquedas')
      } finally {
        this.loading = false
      }
    },
    async fetchById(id: string) {
      try {
        const { data } = await leadSearchesApi.getById(id)
        const idx = this.items.findIndex(s => s._id === id)
        if (idx !== -1) this.items[idx] = data
        if (this.selected?._id === id) this.selected = data
        return data
      } catch {
        return null
      }
    },
    async create(dto: CreateLeadSearchDto) {
      this.creating = true
      try {
        const { data } = await leadSearchesApi.create(dto)
        this.items.unshift(data)
        this.total++
        useToast().success('Búsqueda iniciada correctamente')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al crear búsqueda')
        throw err
      } finally {
        this.creating = false
      }
    },
    async remove(id: string) {
      try {
        await leadSearchesApi.remove(id)
        this.items = this.items.filter(s => s._id !== id)
        this.total--
      } catch (err: any) {
        useToast().error('Error al eliminar búsqueda')
        throw err
      }
    },
    updateItem(updated: LeadSearch) {
      const idx = this.items.findIndex(s => s._id === updated._id)
      if (idx !== -1) this.items[idx] = updated
    },
  },
})
