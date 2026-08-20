import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { agendaApi } from '../api/agenda/agenda.api'
import type { Event, EventQueryDto } from '../api/agenda/agenda.types'

export const useAgendaStore = defineStore('agendaStore', {
  state: () => ({
    items: [] as Event[],
    total: 0,
    loading: false,
    error: null as string | null,
    selected: null as Event | null,
    filters: {
      page: 1,
      limit: 20,
      search: '',
      status: ''
    } as EventQueryDto
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const { data } = await agendaApi.getAll(this.filters)
        this.items = data.data
        this.total = data.total
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async fetchById(id: string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await agendaApi.getById(id)
        this.selected = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async create(dto: any) {
      this.loading = true
      try {
        await agendaApi.create(dto)
        await this.fetchAll()
        useToast().success('Creado correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al crear')
        throw err
      } finally {
        this.loading = false
      }
    },
    async update(id: string, dto: any) {
      this.loading = true
      try {
        await agendaApi.update(id, dto)
        await this.fetchAll()
        useToast().success('Actualizado correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al actualizar')
        throw err
      } finally {
        this.loading = false
      }
    },
    async remove(id: string) {
      this.loading = true
      try {
        await agendaApi.remove(id)
        await this.fetchAll()
        useToast().success('Eliminado correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al eliminar')
        throw err
      } finally {
        this.loading = false
      }
    },
    setFilters(filters: Partial<EventQueryDto>) {
      this.filters = { ...this.filters, ...filters, page: 1 }
      this.fetchAll()
    }
  }
})
