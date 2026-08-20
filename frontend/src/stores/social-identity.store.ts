import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { socialIdentityApi } from '../api/social-identity/social-identity.api'
import type {
  SocialAccount,
  SocialAccountSummary,
  SocialAccountQueryDto,
  CreateSocialAccountDto,
  UpdateSocialAccountDto,
  AddWeeklyMetricDto,
  ContentPillar,
  MessageTemplate,
} from '../api/social-identity/social-identity.types'

export const useSocialIdentityStore = defineStore('social-identity', {
  state: () => ({
    summary: [] as SocialAccountSummary[],
    items: [] as SocialAccount[],
    total: 0,
    selected: null as SocialAccount | null,
    filters: { page: 1, limit: 50 } as SocialAccountQueryDto,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchSummary() {
      this.loading = true
      this.error = null
      try {
        const { data } = await socialIdentityApi.getSummary()
        this.summary = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },

    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const { data } = await socialIdentityApi.getAll(this.filters)
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
        const { data } = await socialIdentityApi.getById(id)
        this.selected = data
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async createAccount(dto: CreateSocialAccountDto) {
      this.loading = true
      try {
        const { data } = await socialIdentityApi.create(dto)
        await this.fetchSummary()
        useToast().success('Cuenta creada correctamente')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al crear la cuenta')
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateAccount(id: string, dto: UpdateSocialAccountDto) {
      this.loading = true
      try {
        const { data } = await socialIdentityApi.update(id, dto)
        this.selected = data
        await this.fetchSummary()
        useToast().success('Cuenta actualizada correctamente')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al actualizar la cuenta')
        throw err
      } finally {
        this.loading = false
      }
    },

    async archiveAccount(id: string) {
      this.loading = true
      try {
        await socialIdentityApi.archive(id)
        await this.fetchSummary()
        useToast().success('Cuenta archivada correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al archivar la cuenta')
        throw err
      } finally {
        this.loading = false
      }
    },

    async addMetric(id: string, dto: AddWeeklyMetricDto) {
      this.loading = true
      try {
        const { data } = await socialIdentityApi.addMetric(id, dto)
        this.selected = data
        await this.fetchSummary()
        useToast().success('Métricas registradas correctamente')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al registrar las métricas')
        throw err
      } finally {
        this.loading = false
      }
    },

    async addPillar(id: string, dto: ContentPillar) {
      this.loading = true
      try {
        const { data } = await socialIdentityApi.addPillar(id, dto)
        this.selected = data
        useToast().success('Pilar agregado correctamente')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al agregar el pilar')
        throw err
      } finally {
        this.loading = false
      }
    },

    async removePillar(id: string, pillarId: string) {
      this.loading = true
      try {
        const { data } = await socialIdentityApi.removePillar(id, pillarId)
        this.selected = data
        useToast().success('Pilar eliminado correctamente')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al eliminar el pilar')
        throw err
      } finally {
        this.loading = false
      }
    },

    async addTemplate(id: string, dto: MessageTemplate) {
      this.loading = true
      try {
        const { data } = await socialIdentityApi.addTemplate(id, dto)
        this.selected = data
        useToast().success('Template agregado correctamente')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al agregar el template')
        throw err
      } finally {
        this.loading = false
      }
    },

    async removeTemplate(id: string, templateId: string) {
      this.loading = true
      try {
        const { data } = await socialIdentityApi.removeTemplate(id, templateId)
        this.selected = data
        useToast().success('Template eliminado correctamente')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al eliminar el template')
        throw err
      } finally {
        this.loading = false
      }
    },

    async duplicateAccount(id: string, platform: string, accountName: string) {
      this.loading = true
      try {
        const { data } = await socialIdentityApi.duplicate(id, platform, accountName)
        await this.fetchSummary()
        useToast().success('Cuenta duplicada correctamente')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al duplicar la cuenta')
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
