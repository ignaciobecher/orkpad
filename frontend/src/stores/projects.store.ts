import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { projectsApi } from '../api/projects/projects.api'
import type { Project, ProjectQueryDto, ProjectOverview } from '../api/projects/projects.types'

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    items: [] as Project[],
    total: 0,
    loading: false,
    error: null as string | null,
    selected: null as Project | null,
    overview: null as ProjectOverview | null,
    filters: {
      page: 1,
      limit: 20,
      search: '',
      status: ''
    } as ProjectQueryDto
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const { data } = await projectsApi.getAll(this.filters)
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
        const { data } = await projectsApi.getById(id)
        this.selected = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async fetchOverview(id: string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await projectsApi.getOverview(id)
        this.overview = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async create(dto: any) {
      this.loading = true
      try {
        await projectsApi.create(dto)
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
        await projectsApi.update(id, dto)
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
        await projectsApi.remove(id)
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
    async generateInvoices(id: string) {
      try {
        const { data } = await projectsApi.generateInvoices(id)
        useToast().success(`${data.generated} facturas generadas`)
        await this.fetchOverview(id)
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al generar facturas')
        throw err
      }
    },

    setFilters(filters: Partial<ProjectQueryDto>) {
      this.filters = { ...this.filters, ...filters, page: 1 }
      this.fetchAll()
    }
  }
})
