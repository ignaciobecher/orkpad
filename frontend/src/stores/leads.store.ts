import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { leadsApi } from '@/api/leads/leads.api'
import type { Lead, LeadQueryDto, UpdateLeadDto, CreateLeadDto } from '@/api/leads/leads.types'

export const useLeadsStore = defineStore('leads', {
  state: () => ({
    items: [] as Lead[],
    selected: null as Lead | null,
    total: 0,
    page: 1,
    limit: 20,
    loading: false,
    harvesting: false,
    error: null as string | null,
    filters: {} as LeadQueryDto,
  }),
  getters: {
    totalPages: (state) => Math.ceil(state.total / state.limit),
    byStatus: (state) => (status: string) => state.items.filter(l => l.status === status),
  },
  actions: {
    async fetchAll(params?: LeadQueryDto) {
      this.loading = true
      this.error = null
      try {
        const { data } = await leadsApi.getAll({
          page: this.page,
          limit: this.limit,
          ...this.filters,
          ...params,
        })
        this.items = data.data
        this.total = data.total
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Error al cargar leads'
        useToast().error(this.error ?? 'Error al cargar leads')
      } finally {
        this.loading = false
      }
    },
    async fetchById(id: string) {
      this.loading = true
      try {
        const { data } = await leadsApi.getById(id)
        this.selected = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al cargar lead')
      } finally {
        this.loading = false
      }
    },
    async create(dto: CreateLeadDto) {
      this.loading = true
      try {
        const { data } = await leadsApi.create(dto)
        this.items.unshift(data)
        this.total++
        useToast().success('Lead creado')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al crear lead')
        throw err
      } finally {
        this.loading = false
      }
    },
    async update(id: string, dto: UpdateLeadDto) {
      this.loading = true
      try {
        const { data } = await leadsApi.update(id, dto)
        const idx = this.items.findIndex(l => l._id === id)
        if (idx !== -1) this.items[idx] = data
        if (this.selected?._id === id) this.selected = data
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al actualizar lead')
        throw err
      } finally {
        this.loading = false
      }
    },
    async harvestEmail(id: string) {
      this.harvesting = true
      try {
        const { data } = await leadsApi.harvestEmail(id)
        const idx = this.items.findIndex(l => l._id === id)
        if (idx !== -1) this.items[idx] = data
        if (this.selected?._id === id) this.selected = data
        if (data.email) {
          useToast().success('Email encontrado')
        } else {
          useToast().info('No se encontró email en el sitio')
        }
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al buscar email')
        throw err
      } finally {
        this.harvesting = false
      }
    },
    async remove(id: string) {
      this.loading = true
      try {
        await leadsApi.remove(id)
        this.items = this.items.filter(l => l._id !== id)
        this.total--
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al eliminar lead')
        throw err
      } finally {
        this.loading = false
      }
    },
    setFilters(filters: LeadQueryDto) {
      this.filters = filters
      this.page = 1
      this.fetchAll()
    },
    setPage(page: number) {
      this.page = page
      this.fetchAll()
    },
  },
})
