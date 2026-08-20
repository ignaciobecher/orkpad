import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { pipelineApi } from '../api/pipeline/pipeline.api'
import type { Deal, DealQueryDto } from '../api/pipeline/pipeline.types'

export const usePipelineStore = defineStore('pipelineStore', {
  state: () => ({
    items: [] as Deal[],
    total: 0,
    loading: false,
    error: null as string | null,
    selected: null as Deal | null,
    filters: {
      page: 1,
      limit: 20,
      search: '',
      status: ''
    } as DealQueryDto
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const { data } = await pipelineApi.getAll(this.filters)
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
        const { data } = await pipelineApi.getById(id)
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
        await pipelineApi.create(dto)
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
        await pipelineApi.update(id, dto)
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
        await pipelineApi.remove(id)
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
    setFilters(filters: Partial<DealQueryDto>) {
      this.filters = { ...this.filters, ...filters, page: 1 }
      this.fetchAll()
    }
  }
})
