import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { invoicesApi } from '../api/invoices/invoices.api'
import type { Invoice, InvoiceQueryDto } from '../api/invoices/invoices.types'

export const useInvoicesStore = defineStore('invoices', {
  state: () => ({
    items: [] as Invoice[],
    total: 0,
    loading: false,
    error: null as string | null,
    selected: null as Invoice | null,
    filters: {
      page: 1,
      limit: 50, // Increased limit for better overview
      search: '',
      status: '',
      type: ''
    } as any
  }),
  getters: {
    incomeByCurrency: (state) => {
      const map = new Map<string, number>()
      for (const i of state.items.filter(i => i.type === 'income' || !i.type)) {
        const c = (i as any).currency ?? 'USD'
        map.set(c, (map.get(c) ?? 0) + (i.total || 0))
      }
      return [...map.entries()].map(([currency, total]) => ({ currency, total }))
    },
    expenseByCurrency: (state) => {
      const map = new Map<string, number>()
      for (const i of state.items.filter(i => i.type === 'expense')) {
        const c = (i as any).currency ?? 'USD'
        map.set(c, (map.get(c) ?? 0) + (i.total || 0))
      }
      return [...map.entries()].map(([currency, total]) => ({ currency, total }))
    },
    totalIncome: (state) => state.items
      .filter(i => i.type === 'income' || !i.type)
      .reduce((sum, i) => sum + (i.total || 0), 0),
    totalExpense: (state) => state.items
      .filter(i => i.type === 'expense')
      .reduce((sum, i) => sum + (i.total || 0), 0),
    balance(): number {
      return this.totalIncome - this.totalExpense
    }
  },
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const { data } = await invoicesApi.getAll(this.filters)
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
        const { data } = await invoicesApi.getById(id)
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
        await invoicesApi.create(dto)
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
        await invoicesApi.update(id, dto)
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
        await invoicesApi.remove(id)
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
    setFilters(filters: Partial<InvoiceQueryDto>) {
      this.filters = { ...this.filters, ...filters, page: 1 }
      this.fetchAll()
    }
  }
})
