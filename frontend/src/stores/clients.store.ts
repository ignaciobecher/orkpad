import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { clientsApi } from '@/api/clients/clients.api'
import type { Client, ClientQueryDto } from '@/api/clients/clients.types'

export const useClientsStore = defineStore('clients', {
  state: () => ({
    items: [] as Client[],
    selected: null as Client | null,
    total: 0,
    page: 1,
    limit: 20,
    loading: false,
    error: null as string | null,
    filters: {} as ClientQueryDto,
  }),
  getters: {
    activeClients: (state) => state.items.filter(c => c.status === 'active'),
    totalPages: (state) => Math.ceil(state.total / state.limit),
  },
  actions: {
    async fetchAll(params?: ClientQueryDto) {
      this.loading = true
      this.error = null
      try {
        const { data } = await clientsApi.getAll({
          page: this.page,
          limit: this.limit,
          ...this.filters,
          ...params,
        })
        this.items = data.data
        this.total = data.total
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Error al cargar clientes'
        useToast().error(this.error ?? 'Error al cargar clientes')
      } finally {
        this.loading = false
      }
    },
    async fetchById(id: string) {
      this.loading = true
      try {
        const { data } = await clientsApi.getById(id)
        this.selected = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al cargar cliente')
      } finally {
        this.loading = false
      }
    },
    async create(dto: any) {
      this.loading = true
      try {
        const { data } = await clientsApi.create(dto)
        this.items.unshift(data)
        this.total++
        useToast().success('Cliente creado correctamente')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al crear cliente')
        throw err
      } finally {
        this.loading = false
      }
    },
    async update(id: string, dto: any) {
      this.loading = true
      try {
        const { data } = await clientsApi.update(id, dto)
        const idx = this.items.findIndex(c => c._id === id)
        if (idx !== -1) this.items[idx] = data
        if (this.selected?._id === id) this.selected = data
        useToast().success('Cliente actualizado correctamente')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al actualizar cliente')
        throw err
      } finally {
        this.loading = false
      }
    },
    async remove(id: string) {
      this.loading = true
      try {
        await clientsApi.remove(id)
        this.items = this.items.filter(c => c._id !== id)
        this.total--
        useToast().success('Cliente eliminado correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al eliminar cliente')
        throw err
      } finally {
        this.loading = false
      }
    },
    setFilters(filters: ClientQueryDto) {
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
