import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    sidebarOpen: false,
    theme: (localStorage.getItem('workos_theme') || 'dark') as 'dark' | 'light'
  }),
  actions: {
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
    initTheme() {
      document.documentElement.setAttribute('data-theme', this.theme)
      document.documentElement.style.colorScheme = this.theme
    }
  }
})
