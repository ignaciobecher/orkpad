import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { quotesApi } from '../api/quotes/quotes.api'
import type { Quote, QuoteQueryDto } from '../api/quotes/quotes.types'

export const useQuotesStore = defineStore('quotes', {
  state: () => ({
    items: [] as Quote[],
    total: 0,
    loading: false,
    error: null as string | null,
    selected: null as Quote | null,
    filters: {
      page: 1,
      limit: 50,
      search: '',
      status: '',
      clientId: '',
      projectId: '',
    } as QuoteQueryDto,
  }),
  getters: {
    totalAccepted: (state) =>
      state.items
        .filter((q) => q.status === 'accepted')
        .reduce((sum, q) => sum + (q.total || 0), 0),
    totalPending: (state) =>
      state.items
        .filter((q) => q.status === 'sent' || q.status === 'draft')
        .reduce((sum, q) => sum + (q.total || 0), 0),
    countByStatus: (state) => {
      const counts: Record<string, number> = {}
      state.items.forEach((q) => {
        counts[q.status] = (counts[q.status] || 0) + 1
      })
      return counts
    },
  },
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const params: QuoteQueryDto = { ...this.filters }
        if (!params.status) delete params.status
        if (!params.clientId) delete params.clientId
        if (!params.projectId) delete params.projectId
        if (!params.search) delete params.search
        const { data } = await quotesApi.getAll(params)
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
        const { data } = await quotesApi.getById(id)
        this.selected = data
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async create(dto: any) {
      this.loading = true
      try {
        const { data } = await quotesApi.create(dto)
        await this.fetchAll()
        useToast().success('Presupuesto creado')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al crear presupuesto')
        throw err
      } finally {
        this.loading = false
      }
    },
    async update(id: string, dto: any) {
      this.loading = true
      try {
        const { data } = await quotesApi.update(id, dto)
        await this.fetchAll()
        useToast().success('Presupuesto actualizado')
        return data
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
        await quotesApi.remove(id)
        await this.fetchAll()
        useToast().success('Presupuesto eliminado')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al eliminar')
        throw err
      } finally {
        this.loading = false
      }
    },
    async downloadPdf(id: string, title: string) {
      try {
        const { data } = await quotesApi.downloadPdf(id)
        const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
        const a = document.createElement('a')
        a.href = url
        a.download = `presupuesto-${title || id}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } catch (err: any) {
        useToast().error('Error al generar PDF')
        throw err
      }
    },
    async convertToInvoice(id: string) {
      try {
        const { data } = await quotesApi.convertToInvoice(id)
        useToast().success('Factura creada como borrador en Finanzas')
        return data
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Error al convertir a factura'
        useToast().error(msg)
        throw err
      }
    },
    setFilters(filters: Partial<QuoteQueryDto>) {
      this.filters = { ...this.filters, ...filters, page: 1 }
      this.fetchAll()
    },
  },
})
