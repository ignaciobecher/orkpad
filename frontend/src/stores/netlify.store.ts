import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { netlifyApi } from '../api/netlify/netlify.api'
import type {
  NetlifyConnection,
  NetlifySite,
  NetlifySiteOverview,
  NetlifyDeploy,
  NetlifyStats,
  ConnectNetlifyDto,
  LinkSiteDto,
} from '../api/netlify/netlify.types'

export const useNetlifyStore = defineStore('netlify', {
  state: () => ({
    connection: null as NetlifyConnection | null,
    sites: [] as NetlifySite[],
    overview: [] as NetlifySiteOverview[],
    deployments: [] as NetlifyDeploy[],
    stats: null as NetlifyStats | null,
    loading: false,
    connectLoading: false,
    sitesLoading: false,
    overviewLoading: false,
    deploymentsLoading: false,
    statsLoading: false,
    error: null as string | null,
  }),

  getters: {
    isConnected: (state) => state.connection?.connected === true,
  },

  actions: {
    async fetchConnection() {
      this.loading = true
      this.error = null
      try {
        const { data } = await netlifyApi.getConnection()
        this.connection = data?.connected ? data : null
      } catch (err: any) {
        this.connection = null
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },

    async connect(dto: ConnectNetlifyDto) {
      this.connectLoading = true
      this.error = null
      try {
        const { data } = await netlifyApi.connect(dto)
        this.connection = data
        useToast().success('Netlify conectado correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al conectar Netlify')
        throw err
      } finally {
        this.connectLoading = false
      }
    },

    async disconnect() {
      this.loading = true
      try {
        await netlifyApi.disconnect()
        this.connection = null
        this.sites = []
        this.deployments = []
        useToast().success('Netlify desconectado')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al desconectar Netlify')
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchOverview() {
      this.overviewLoading = true
      this.error = null
      try {
        const { data } = await netlifyApi.getOverview()
        this.overview = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.overviewLoading = false
      }
    },

    async fetchStats(days?: number) {
      this.statsLoading = true
      this.error = null
      try {
        const { data } = await netlifyApi.getStats(days)
        this.stats = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.statsLoading = false
      }
    },

    async fetchSites() {
      this.sitesLoading = true
      this.error = null
      try {
        const { data } = await netlifyApi.getSites()
        this.sites = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error('No se pudieron cargar los sites de Netlify')
      } finally {
        this.sitesLoading = false
      }
    },

    async fetchDeployments(siteId: string) {
      this.deploymentsLoading = true
      this.error = null
      try {
        const { data } = await netlifyApi.getDeployments(siteId)
        this.deployments = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error('No se pudieron cargar los deploys de Netlify')
      } finally {
        this.deploymentsLoading = false
      }
    },

    async linkProject(projectId: string, dto: LinkSiteDto) {
      this.loading = true
      try {
        await netlifyApi.linkProject(projectId, dto)
        useToast().success('Site de Netlify vinculado')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al vincular site')
        throw err
      } finally {
        this.loading = false
      }
    },

    async unlinkProject(projectId: string) {
      this.loading = true
      try {
        await netlifyApi.unlinkProject(projectId)
        useToast().success('Site de Netlify desvinculado')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al desvincular site')
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
