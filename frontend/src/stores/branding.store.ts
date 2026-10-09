import { defineStore } from 'pinia'
import { workspacesApi } from '@/api/workspaces/workspaces.api'
import type { Workspace } from '@/api/workspaces/workspaces.types'
import { useUIStore } from './ui.store'

export const useBrandingStore = defineStore('branding', {
  state: () => ({
    workspace: null as Workspace | null,
    loading: false,
  }),

  getters: {
    displayName: (s) => s.workspace?.displayName || s.workspace?.name || 'Orkpad',
    logoUrl: (s) => {
      if (!s.workspace?.logoFileId) return null
      const base = (import.meta.env.VITE_API_URL as string | undefined) || ''
      return `${base}/files/${s.workspace.logoFileId}`
    },
  },

  actions: {
    async fetch() {
      this.loading = true
      try {
        const { data } = await workspacesApi.getMe()
        this.workspace = data
        this.apply()
      } catch {
        // sin workspace (o sin sesión): se mantiene marca por defecto
      } finally {
        this.loading = false
      }
    },

    apply() {
      const ui = useUIStore()
      document.title = `${this.displayName} — App open source`
      if (this.workspace?.primaryColor) {
        document.documentElement.style.setProperty(
          '--color-primary',
          this.workspace.primaryColor,
        )
      } else {
        document.documentElement.style.removeProperty('--color-primary')
      }
      if (
        this.workspace?.defaultTheme &&
        !localStorage.getItem('workos_theme')
      ) {
        ui.setTheme(this.workspace.defaultTheme)
      }
    },

    async save(dto: {
      displayName?: string | null
      logoFileId?: string | null
      primaryColor?: string | null
      defaultTheme?: 'dark' | 'light' | null
      agencyEmail?: string | null
      agencyPhone?: string | null
      agencyAddress?: string | null
      agencyWebsite?: string | null
      taxId?: string | null
      maxUploadMb?: number | null
    }) {
      const { data } = await workspacesApi.updateMe(dto)
      this.workspace = data
      this.apply()
    },
  },
})
