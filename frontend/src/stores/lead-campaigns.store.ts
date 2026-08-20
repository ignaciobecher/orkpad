import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { leadCampaignsApi } from '@/api/lead-campaigns/lead-campaigns.api'
import type { LeadCampaign, CreateLeadCampaignDto, UpdateLeadCampaignDto } from '@/api/lead-campaigns/lead-campaigns.types'

export const useLeadCampaignsStore = defineStore('leadCampaigns', {
  state: () => ({
    items: [] as LeadCampaign[],
    selected: null as LeadCampaign | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const { data } = await leadCampaignsApi.getAll()
        this.items = Array.isArray(data) ? data : (data as any).data ?? []
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Error al cargar campañas'
        useToast().error(this.error ?? 'Error al cargar campañas')
      } finally {
        this.loading = false
      }
    },
    async create(dto: CreateLeadCampaignDto) {
      this.loading = true
      try {
        const { data } = await leadCampaignsApi.create(dto)
        this.items.unshift(data)
        useToast().success('Campaña creada correctamente')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al crear campaña')
        throw err
      } finally {
        this.loading = false
      }
    },
    async update(id: string, dto: UpdateLeadCampaignDto) {
      this.loading = true
      try {
        const { data } = await leadCampaignsApi.update(id, dto)
        const idx = this.items.findIndex(c => c._id === id)
        if (idx !== -1) this.items[idx] = data
        if (this.selected?._id === id) this.selected = data
        return data
      } catch (err: any) {
        useToast().error('Error al actualizar campaña')
        throw err
      } finally {
        this.loading = false
      }
    },
    async remove(id: string) {
      try {
        await leadCampaignsApi.remove(id)
        this.items = this.items.filter(c => c._id !== id)
      } catch (err: any) {
        useToast().error('Error al eliminar campaña')
        throw err
      }
    },
  },
})
