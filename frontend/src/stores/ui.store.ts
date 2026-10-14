import { defineStore } from 'pinia'

export type Appearance = 'win95' | 'classic'

export const WIN95_TITLE = 'Orkpad95 — Mi PC freelance'
export const CLASSIC_TITLE = 'Orkpad — App open source para freelancers'

/** Título + favicon de la pestaña según apariencia. */
export function applyBrowserChrome(appearance: Appearance) {
  try {
    document.title = appearance === 'win95' ? WIN95_TITLE : CLASSIC_TITLE
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (link) link.href = appearance === 'win95' ? '/favicon.ico' : '/favicon-classic.ico'
    const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')
    if (apple) apple.href = appearance === 'win95' ? '/pwa-192x192.png' : '/apple-touch-icon.png'
  } catch { /* noop */ }
}

function storedAppearance(): Appearance {
  try {
    const v = localStorage.getItem('orkpad_appearance')
    if (v === 'classic' || v === 'win95') return v
  } catch { /* noop */ }
  return 'win95'
}

export const useUIStore = defineStore('ui', {
  state: () => ({
    sidebarOpen: false,
    theme: (localStorage.getItem('workos_theme') || 'dark') as 'dark' | 'light',
    appearance: storedAppearance(),
    pendingRequests: 0,
  }),
  getters: {
    globalLoading: (state) => state.pendingRequests > 0,
    isWin95: (state) => state.appearance === 'win95',
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
    setAppearance(appearance: Appearance) {
      this.appearance = appearance
      try { localStorage.setItem('orkpad_appearance', appearance) } catch { /* noop */ }
      document.documentElement.setAttribute('data-appearance', appearance)
      applyBrowserChrome(appearance)
    },
    initTheme() {
      document.documentElement.setAttribute('data-theme', this.theme)
      document.documentElement.style.colorScheme = this.theme
      document.documentElement.setAttribute('data-appearance', this.appearance)
      applyBrowserChrome(this.appearance)
    }
  }
})
