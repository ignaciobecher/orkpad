import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { marketingIdeasApi } from '../api/marketing/marketing-ideas.api'
import { marketingPromptsApi } from '../api/marketing/marketing-prompts.api'
import { marketingPostsApi } from '../api/marketing/marketing-posts.api'
import type {
  MarketingIdea,
  MarketingIdeaQueryDto,
  MarketingIdeaKanban,
  CreateMarketingIdeaDto,
  UpdateMarketingIdeaDto,
} from '../api/marketing/marketing-ideas.types'
import type {
  MarketingPrompt,
  MarketingPromptQueryDto,
  CreateMarketingPromptDto,
  UpdateMarketingPromptDto,
} from '../api/marketing/marketing-prompts.types'
import type {
  MarketingPost,
  MarketingPostQueryDto,
  CreateMarketingPostDto,
  UpdateMarketingPostDto,
  RecordMetricsDto,
} from '../api/marketing/marketing-posts.types'
import type { MarketingDashboardStats } from '../api/marketing/marketing-dashboard.types'
import type { PreviewImportResponse, ImportPostsDto } from '../api/marketing/marketing-import.types'

export const useMarketingStore = defineStore('marketing', {
  state: () => ({
    ideas: {
      items: [] as MarketingIdea[],
      total: 0,
      kanban: null as MarketingIdeaKanban | null,
      loading: false,
      selected: null as MarketingIdea | null,
      filters: { page: 1, limit: 20, status: '', network: '', search: '' } as MarketingIdeaQueryDto,
    },
    prompts: {
      items: [] as MarketingPrompt[],
      total: 0,
      loading: false,
      selected: null as MarketingPrompt | null,
      filters: { page: 1, limit: 20, network: '', category: '', search: '' } as MarketingPromptQueryDto,
    },
    posts: {
      items: [] as MarketingPost[],
      total: 0,
      calendarEvents: [] as MarketingPost[],
      loading: false,
      selected: null as MarketingPost | null,
      filters: { page: 1, limit: 20, status: '', network: '', format: '', ideaId: '' } as MarketingPostQueryDto,
    },
    dashboard: {
      stats: null as MarketingDashboardStats | null,
      loading: false,
    },
    error: null as string | null,
  }),
  actions: {
    // ─── Ideas ────────────────────────────────────────────────────────────

    async fetchIdeas() {
      this.ideas.loading = true
      this.error = null
      try {
        const { data } = await marketingIdeasApi.getAll(this.ideas.filters)
        this.ideas.items = data.data
        this.ideas.total = data.total
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.ideas.loading = false
      }
    },

    async fetchIdeasKanban() {
      this.ideas.loading = true
      this.error = null
      try {
        const { data } = await marketingIdeasApi.getKanban()
        this.ideas.kanban = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.ideas.loading = false
      }
    },

    async fetchIdeaById(id: string) {
      this.ideas.loading = true
      this.error = null
      try {
        const { data } = await marketingIdeasApi.getById(id)
        this.ideas.selected = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.ideas.loading = false
      }
    },

    async createIdea(dto: CreateMarketingIdeaDto) {
      this.ideas.loading = true
      try {
        await marketingIdeasApi.create(dto)
        await this.fetchIdeasKanban()
        useToast().success('Idea creada correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al crear la idea')
        throw err
      } finally {
        this.ideas.loading = false
      }
    },

    async updateIdea(id: string, dto: UpdateMarketingIdeaDto) {
      this.ideas.loading = true
      try {
        await marketingIdeasApi.update(id, dto)
        await this.fetchIdeasKanban()
        useToast().success('Idea actualizada correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al actualizar la idea')
        throw err
      } finally {
        this.ideas.loading = false
      }
    },

    async removeIdea(id: string) {
      this.ideas.loading = true
      try {
        await marketingIdeasApi.remove(id)
        await this.fetchIdeasKanban()
        useToast().success('Idea eliminada correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al eliminar la idea')
        throw err
      } finally {
        this.ideas.loading = false
      }
    },

    setIdeaFilters(filters: Partial<MarketingIdeaQueryDto>) {
      this.ideas.filters = { ...this.ideas.filters, ...filters, page: 1 }
      this.fetchIdeas()
    },

    // ─── Prompts ──────────────────────────────────────────────────────────

    async fetchPrompts() {
      this.prompts.loading = true
      this.error = null
      try {
        const { data } = await marketingPromptsApi.getAll(this.prompts.filters)
        this.prompts.items = data.data
        this.prompts.total = data.total
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.prompts.loading = false
      }
    },

    async fetchPromptById(id: string) {
      this.prompts.loading = true
      this.error = null
      try {
        const { data } = await marketingPromptsApi.getById(id)
        this.prompts.selected = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.prompts.loading = false
      }
    },

    async createPrompt(dto: CreateMarketingPromptDto) {
      this.prompts.loading = true
      try {
        await marketingPromptsApi.create(dto)
        await this.fetchPrompts()
        useToast().success('Prompt creado correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al crear el prompt')
        throw err
      } finally {
        this.prompts.loading = false
      }
    },

    async updatePrompt(id: string, dto: UpdateMarketingPromptDto) {
      this.prompts.loading = true
      try {
        await marketingPromptsApi.update(id, dto)
        await this.fetchPrompts()
        useToast().success('Prompt actualizado correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al actualizar el prompt')
        throw err
      } finally {
        this.prompts.loading = false
      }
    },

    async removePrompt(id: string) {
      this.prompts.loading = true
      try {
        await marketingPromptsApi.remove(id)
        await this.fetchPrompts()
        useToast().success('Prompt eliminado correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al eliminar el prompt')
        throw err
      } finally {
        this.prompts.loading = false
      }
    },

    setPromptFilters(filters: Partial<MarketingPromptQueryDto>) {
      this.prompts.filters = { ...this.prompts.filters, ...filters, page: 1 }
      this.fetchPrompts()
    },

    // ─── Posts ────────────────────────────────────────────────────────────

    async fetchPosts() {
      this.posts.loading = true
      this.error = null
      try {
        const { data } = await marketingPostsApi.getAll(this.posts.filters)
        this.posts.items = data.data
        this.posts.total = data.total
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.posts.loading = false
      }
    },

    async fetchPostsCalendar(from: string, to: string, network?: string) {
      this.posts.loading = true
      this.error = null
      try {
        const { data } = await marketingPostsApi.getCalendar(from, to, network)
        console.log('[fetchPostsCalendar] from:', from, 'to:', to, 'network:', network, 'posts:', data.length, data)
        this.posts.calendarEvents = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        console.error('[fetchPostsCalendar] error:', this.error)
      } finally {
        this.posts.loading = false
      }
    },

    async fetchPostById(id: string) {
      this.posts.loading = true
      this.error = null
      try {
        const { data } = await marketingPostsApi.getById(id)
        this.posts.selected = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.posts.loading = false
      }
    },

    async createPost(dto: CreateMarketingPostDto) {
      this.posts.loading = true
      try {
        await marketingPostsApi.create(dto)
        await this.fetchPosts()
        useToast().success('Publicación creada correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al crear la publicación')
        throw err
      } finally {
        this.posts.loading = false
      }
    },

    async updatePost(id: string, dto: UpdateMarketingPostDto) {
      this.posts.loading = true
      try {
        await marketingPostsApi.update(id, dto)
        await this.fetchPosts()
        useToast().success('Publicación actualizada correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al actualizar la publicación')
        throw err
      } finally {
        this.posts.loading = false
      }
    },

    async removePost(id: string) {
      this.posts.loading = true
      try {
        await marketingPostsApi.remove(id)
        await this.fetchPosts()
        useToast().success('Publicación eliminada correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al eliminar la publicación')
        throw err
      } finally {
        this.posts.loading = false
      }
    },

    async recordPostMetrics(id: string, dto: RecordMetricsDto) {
      this.posts.loading = true
      try {
        const { data } = await marketingPostsApi.recordMetrics(id, dto)
        this.posts.selected = data
        useToast().success('Métricas registradas correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al registrar las métricas')
        throw err
      } finally {
        this.posts.loading = false
      }
    },

    setPostFilters(filters: Partial<MarketingPostQueryDto>) {
      this.posts.filters = { ...this.posts.filters, ...filters, page: 1 }
      this.fetchPosts()
    },

    setPostPage(page: number) {
      this.posts.filters = { ...this.posts.filters, page }
      this.fetchPosts()
    },

    async downloadImportTemplate() {
      try {
        const { data } = await marketingPostsApi.getImportTemplate()
        const url = window.URL.createObjectURL(new Blob([data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'plantilla-importacion-posts.xlsx')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        useToast().success('Plantilla descargada correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al descargar la plantilla')
      }
    },

    async previewImport(file: File): Promise<PreviewImportResponse> {
      try {
        const { data } = await marketingPostsApi.previewImport(file)
        return data
      } catch (err: any) {
        this.error = this.resolveImportErrorMessage(err)
        useToast().error(this.error ?? 'Error al procesar el archivo')
        throw err
      }
    },

    async confirmImport(dto: ImportPostsDto) {
      this.posts.loading = true
      try {
        await marketingPostsApi.confirmImport(dto)
        await this.fetchPosts()
        useToast().success('Publicaciones importadas correctamente')
      } catch (err: any) {
        this.error = this.resolveImportErrorMessage(err)
        useToast().error(this.error ?? 'Error al importar las publicaciones')
        throw err
      } finally {
        this.posts.loading = false
      }
    },

    resolveImportErrorMessage(err: any): string {
      if (err.response?.status === 413) {
        return 'El archivo o la cantidad de publicaciones a importar supera el tamaño máximo permitido (10MB). Probá importar en lotes más chicos.'
      }
      return err.response?.data?.message || err.message
    },

    // ─── Dashboard ────────────────────────────────────────────────────────

    async fetchDashboard() {
      this.dashboard.loading = true
      this.error = null
      try {
        const { data } = await marketingPostsApi.getDashboard()
        this.dashboard.stats = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.dashboard.loading = false
      }
    },
  },
})
