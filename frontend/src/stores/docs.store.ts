import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { docsApi } from '../api/docs/docs.api'
import type { Document, DocumentQueryDto } from '../api/docs/docs.types'

export const useDocsStore = defineStore('docsStore', {
  state: () => ({
    items: [] as Document[],
    total: 0,
    loading: false,
    error: null as string | null,
    selected: null as Document | null,
    filters: {
      page: 1,
      limit: 1000,
      search: '',
      status: ''
    } as DocumentQueryDto
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const { data } = await docsApi.getAll(this.filters)
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
        const { data } = await docsApi.getById(id)
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
        await docsApi.create(dto)
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
        await docsApi.update(id, dto)
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
        await docsApi.remove(id)
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
    setFilters(filters: Partial<DocumentQueryDto>) {
      this.filters = { ...this.filters, ...filters, page: 1 }
      this.fetchAll()
    }
  }
})
