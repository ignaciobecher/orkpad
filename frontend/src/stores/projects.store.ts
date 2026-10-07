import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { projectsApi } from '../api/projects/projects.api'
import type { Project, ProjectQueryDto, ProjectOverview, LinkStatus, SetLinkCredentialDto } from '../api/projects/projects.types'

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    items: [] as Project[],
    total: 0,
    loading: false,
    error: null as string | null,
    selected: null as Project | null,
    overview: null as ProjectOverview | null,
    linkStatus: null as LinkStatus | null,
    linkStatusLoading: false,
    filters: {
      page: 1,
      limit: 20,
      search: '',
      status: ''
    } as ProjectQueryDto
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const { data } = await projectsApi.getAll(this.filters)
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
        const { data } = await projectsApi.getById(id)
        this.selected = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async fetchOverview(id: string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await projectsApi.getOverview(id)
        this.overview = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async create(dto: any) {
      this.loading = true
      try {
        await projectsApi.create(dto)
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
        await projectsApi.update(id, dto)
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
        await projectsApi.remove(id)
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
    async generatePublicLink(id: string) {
      try {
        const { data } = await projectsApi.generatePublicLink(id)
        if (this.overview?.project) {
          this.overview.project.publicToken = data.publicToken
        }
        const item = this.items.find(i => i._id === id)
        if (item) item.publicToken = data.publicToken
        if (this.linkStatus) this.linkStatus.publicToken = data.publicToken
        useToast().success('Link público generado')
        return data.publicToken
      } catch (err: any) {
        useToast().error('Error al generar link')
        throw err
      }
    },
    async generateInvoices(id: string) {
      try {
        const { data } = await projectsApi.generateInvoices(id)
        useToast().success(`${data.generated} facturas generadas`)
        await this.fetchOverview(id)
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al generar facturas')
        throw err
      }
    },
    async revokePublicLink(id: string) {
      try {
        await projectsApi.revokePublicLink(id)
        if (this.overview?.project) {
          this.overview.project.publicToken = null
        }
        const item = this.items.find(i => i._id === id)
        if (item) item.publicToken = null
        if (this.linkStatus) this.linkStatus.publicToken = null
        useToast().success('Link público revocado')
      } catch (err: any) {
        useToast().error('Error al revocar link')
        throw err
      }
    },

    // ─── Link visibility & credential management ─────────────────────────

    async fetchLinkStatus(id: string) {
      this.linkStatusLoading = true
      try {
        const { data } = await projectsApi.getLinkStatus(id)
        this.linkStatus = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.linkStatusLoading = false
      }
    },

    async setLinkCredential(id: string, dto: SetLinkCredentialDto) {
      try {
        await projectsApi.setLinkCredential(id, dto)
        await this.fetchLinkStatus(id)
        useToast().success('Credenciales guardadas. El link es ahora privado.')
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al guardar credenciales')
        throw err
      }
    },

    async removeLinkCredential(id: string) {
      try {
        await projectsApi.removeLinkCredential(id)
        await this.fetchLinkStatus(id)
        useToast().success('Credenciales eliminadas. El link es ahora público.')
      } catch (err: any) {
        useToast().error('Error al eliminar credenciales')
        throw err
      }
    },

    async rotateLinkCredential(id: string): Promise<string> {
      try {
        const { data } = await projectsApi.rotateLinkCredential(id)
        useToast().success('Contraseña rotada correctamente')
        return data.password
      } catch (err: any) {
        useToast().error('Error al rotar contraseña')
        throw err
      }
    },

    setFilters(filters: Partial<ProjectQueryDto>) {
      this.filters = { ...this.filters, ...filters, page: 1 }
      this.fetchAll()
    }
  }
})
