import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { railwayApi } from '../api/railway/railway.api'
import type {
  RailwayConnection,
  RailwayProject,
  RailwayProjectOverview,
  RailwayService,
  RailwayDeployment,
  RailwayStats,
  RailwayServiceMetrics,
  RailwayProjectMetrics,
  ConnectRailwayDto,
  LinkProjectDto,
} from '../api/railway/railway.types'

export const useRailwayStore = defineStore('railway', {
  state: () => ({
    connection: null as RailwayConnection | null,
    railwayProjects: [] as RailwayProject[],
    overview: [] as RailwayProjectOverview[],
    services: [] as RailwayService[],
    deployments: [] as RailwayDeployment[],
    stats: null as RailwayStats | null,
    serviceMetrics: {} as Record<string, RailwayServiceMetrics>,
    metricsSummary: [] as RailwayProjectMetrics[],
    loading: false,
    connectLoading: false,
    projectsLoading: false,
    overviewLoading: false,
    deploymentsLoading: false,
    statsLoading: false,
    metricsLoading: false,
    metricsSummaryLoading: false,
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
        const { data } = await railwayApi.getConnection()
        this.connection = data.connected ? data : null
      } catch (err: any) {
        this.connection = null
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },

    async connect(dto: ConnectRailwayDto) {
      this.connectLoading = true
      this.error = null
      try {
        const { data } = await railwayApi.connect(dto)
        this.connection = data
        useToast().success('Railway conectado correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al conectar Railway')
        throw err
      } finally {
        this.connectLoading = false
      }
    },

    async disconnect() {
      this.loading = true
      try {
        await railwayApi.disconnect()
        this.connection = null
        this.railwayProjects = []
        this.deployments = []
        useToast().success('Railway desconectado')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al desconectar Railway')
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchOverview() {
      this.overviewLoading = true
      this.error = null
      try {
        const { data } = await railwayApi.getOverview()
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
        const { data } = await railwayApi.getStats(days)
        this.stats = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.statsLoading = false
      }
    },

    async fetchServiceMetrics(railwayProjectId: string, serviceId: string, hours?: number) {
      this.metricsLoading = true
      this.error = null
      try {
        const { data } = await railwayApi.getServiceMetrics(railwayProjectId, serviceId, hours)
        this.serviceMetrics = { ...this.serviceMetrics, [serviceId]: data }
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.metricsLoading = false
      }
    },

    async fetchMetricsSummary(hours?: number) {
      this.metricsSummaryLoading = true
      this.error = null
      try {
        const { data } = await railwayApi.getMetricsSummary(hours)
        this.metricsSummary = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.metricsSummaryLoading = false
      }
    },

    async fetchProjects() {
      this.projectsLoading = true
      this.error = null
      try {
        const { data } = await railwayApi.getProjects()
        this.railwayProjects = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error('No se pudieron cargar los proyectos de Railway')
      } finally {
        this.projectsLoading = false
      }
    },

    async fetchServices(railwayProjectId: string) {
      this.error = null
      try {
        const { data } = await railwayApi.getServices(railwayProjectId)
        this.services = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      }
    },

    async fetchDeployments(railwayProjectId: string) {
      this.deploymentsLoading = true
      this.error = null
      try {
        const { data } = await railwayApi.getDeployments(railwayProjectId)
        this.deployments = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error('No se pudieron cargar los deployments de Railway')
      } finally {
        this.deploymentsLoading = false
      }
    },

    async linkProject(projectId: string, dto: LinkProjectDto) {
      this.loading = true
      try {
        await railwayApi.linkProject(projectId, dto)
        useToast().success('Proyecto Railway vinculado')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al vincular proyecto')
        throw err
      } finally {
        this.loading = false
      }
    },

    async unlinkProject(projectId: string) {
      this.loading = true
      try {
        await railwayApi.unlinkProject(projectId)
        useToast().success('Proyecto Railway desvinculado')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al desvincular proyecto')
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
