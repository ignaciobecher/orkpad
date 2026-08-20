import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { supabaseApi } from '../api/supabase/supabase.api'
import type {
  SupabaseConnection,
  SupabaseProject,
  SupabaseProjectStats,
  SupabaseProjectMetrics,
  SupabaseMetricsSummaryItem,
  ConnectSupabaseDto,
  LinkSupabaseProjectDto,
} from '../api/supabase/supabase.types'

export const useSupabaseStore = defineStore('supabase', {
  state: () => ({
    connection: null as SupabaseConnection | null,
    supabaseProjects: [] as SupabaseProject[],
    projectStats: null as SupabaseProjectStats | null,
    projectMetrics: null as SupabaseProjectMetrics | null,
    metricsSummary: [] as SupabaseMetricsSummaryItem[],
    loading: false,
    connectLoading: false,
    projectsLoading: false,
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
        const { data } = await supabaseApi.getConnection()
        this.connection = data.connected ? data : null
      } catch (err: any) {
        this.connection = null
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },

    async connect(dto: ConnectSupabaseDto) {
      this.connectLoading = true
      this.error = null
      try {
        const { data } = await supabaseApi.connect(dto)
        this.connection = data
        useToast().success('Supabase conectado correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al conectar Supabase')
        throw err
      } finally {
        this.connectLoading = false
      }
    },

    async disconnect() {
      this.loading = true
      try {
        await supabaseApi.disconnect()
        this.connection = null
        this.supabaseProjects = []
        this.metricsSummary = []
        useToast().success('Supabase desconectado')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al desconectar Supabase')
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchProjects() {
      this.projectsLoading = true
      this.error = null
      try {
        const { data } = await supabaseApi.listProjects()
        this.supabaseProjects = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error('No se pudieron cargar los proyectos de Supabase')
      } finally {
        this.projectsLoading = false
      }
    },

    async fetchProjectStats(ref: string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await supabaseApi.getProjectStats(ref)
        this.projectStats = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },

    async fetchProjectMetrics(ref: string, hours?: number) {
      this.metricsLoading = true
      this.error = null
      try {
        const { data } = await supabaseApi.getProjectMetrics(ref, hours)
        this.projectMetrics = data
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
        const { data } = await supabaseApi.getMetricsSummary(hours)
        this.metricsSummary = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.metricsSummaryLoading = false
      }
    },

    async linkProject(projectId: string, dto: LinkSupabaseProjectDto) {
      this.loading = true
      try {
        await supabaseApi.linkProject(projectId, dto)
        useToast().success('Proyecto Supabase vinculado')
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
        await supabaseApi.unlinkProject(projectId)
        useToast().success('Proyecto Supabase desvinculado')
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
