import { defineStore } from 'pinia'
import { resourcesApi } from '@/api/resources/resources.api'
import type { Resource, ResourceCategory, QueryResourceDto } from '@/api/resources/resources.types'
import { useToast } from '@/composables/useToast'

interface ResourcesState {
  items: Resource[]
  selected: Resource | null
  categories: ResourceCategory[]
  total: number
  page: number
  limit: number
  loading: boolean
  loadingDetail: boolean
  error: string | null
  filters: QueryResourceDto
}

export const useResourcesStore = defineStore('resources', {
  state: (): ResourcesState => ({
    items: [],
    selected: null,
    categories: [],
    total: 0,
    page: 1,
    limit: 20,
    loading: false,
    loadingDetail: false,
    error: null,
    filters: {},
  }),

  getters: {
    categoryMap: (state): Record<string, ResourceCategory> =>
      Object.fromEntries(state.categories.map((c) => [c._id, c])),
  },

  actions: {
    async fetchAll(params?: QueryResourceDto) {
      this.loading = true
      this.error = null
      try {
        const { data } = await resourcesApi.getAll({ ...this.filters, ...params })
        this.items = data.data
        this.total = data.total
        this.page = data.page
      } catch (err: any) {
        this.error = err?.response?.data?.message ?? 'Error al cargar recursos'
        useToast().error(this.error as string)
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      try {
        const { data } = await resourcesApi.getCategories()
        this.categories = data
      } catch {
        // Categories are non-critical; fail silently
      }
    },

    async fetchBySlug(slug: string) {
      this.loadingDetail = true
      this.selected = null
      try {
        const { data } = await resourcesApi.getBySlug(slug)
        this.selected = data
        return data
      } catch {
        useToast().error('Recurso no encontrado')
        return null
      } finally {
        this.loadingDetail = false
      }
    },

    setFilter(key: keyof QueryResourceDto, value: string | number | undefined) {
      this.filters = { ...this.filters, [key]: value }
    },

    clearFilters() {
      this.filters = {}
    },
  },
})
