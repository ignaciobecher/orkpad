import { defineStore } from 'pinia'
import { paymentMethodsApi } from '@/api/payment-methods/payment-methods.api'
import type { PaymentMethod } from '@/api/payment-methods/payment-methods.types'
import { useToast } from '@/composables/useToast'

export const usePaymentMethodsStore = defineStore('paymentMethods', {
  state: () => ({
    items: [] as PaymentMethod[],
    loading: false,
    loaded: false,
  }),
  getters: {
    activeMethods: (state) => state.items.filter((m) => m.active),
    activeNames: (state): string[] =>
      state.items.filter((m) => m.active).map((m) => m.name),
  },
  actions: {
    async fetchAll(force = false) {
      if ((this.loaded && !force) || this.loading) return
      this.loading = true
      try {
        const { data } = await paymentMethodsApi.getAll()
        this.items = data.data
        this.loaded = true
      } finally {
        this.loading = false
      }
    },
    async create(name: string) {
      const { data } = await paymentMethodsApi.create({ name: name.trim() })
      useToast().success('Método de pago creado')
      await this.fetchAll(true)
      return data
    },
    async toggleActive(item: PaymentMethod) {
      await paymentMethodsApi.update(item._id, { active: !item.active })
      await this.fetchAll(true)
    },
    async rename(item: PaymentMethod, name: string) {
      const clean = name.trim()
      if (!clean || clean === item.name) return
      await paymentMethodsApi.update(item._id, { name: clean })
      useToast().success('Método actualizado')
      await this.fetchAll(true)
    },
    async remove(id: string) {
      await paymentMethodsApi.remove(id)
      useToast().success('Método eliminado')
      await this.fetchAll(true)
    },
  },
})
