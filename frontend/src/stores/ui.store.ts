import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    sidebarOpen: false,
    theme: (localStorage.getItem('workos_theme') || 'dark') as 'dark' | 'light',
    pendingRequests: 0,
  }),
  getters: {
    globalLoading: (state) => state.pendingRequests > 0,
  },
  actions: {
    trackRequestStart() {
      this.pendingRequests += 1
    },
    trackRequestEnd() {
      if (this.pendingRequests > 0) this.pendingRequests -= 1
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    openSidebar() {
      this.sidebarOpen = true
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('workos_theme', this.theme)
      document.documentElement.setAttribute('data-theme', this.theme)
      document.documentElement.style.colorScheme = this.theme
    },
    setTheme(theme: 'dark' | 'light') {
      this.theme = theme
      localStorage.setItem('workos_theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
      document.documentElement.style.colorScheme = theme
    },
    initTheme() {
      document.documentElement.setAttribute('data-theme', this.theme)
      document.documentElement.style.colorScheme = this.theme
    }
  }
})
