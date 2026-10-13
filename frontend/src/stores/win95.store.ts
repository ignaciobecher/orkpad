import { defineStore } from 'pinia'

export interface Win95Window {
  route: string
  title: string
  icon: string
  minimized: boolean
  maximized: boolean
  z: number
  x: number
  y: number
  w: number
  h: number | null
}

const POS_KEY = 'orkpad95_winpos_v1'

function loadPos(): Record<string, { x: number; y: number }> {
  try {
    return JSON.parse(localStorage.getItem(POS_KEY) || '{}')
  } catch {
    return {}
  }
}

export const WIN_META: Record<string, { title: string; icon: string }> = {
  dashboard: { title: 'Mi PC — Panel', icon: 'computer' },
  clients: { title: 'Clientes', icon: 'users' },
  projects: { title: 'Proyectos', icon: 'briefcase' },
  'project-detail': { title: 'Proyecto', icon: 'folder-open' },
  'project-github': { title: 'Proyecto — GitHub', icon: 'console' },
  tasks: { title: 'Tareas', icon: 'check' },
  finance: { title: 'Finanzas', icon: 'calculator' },
  reports: { title: 'Reportes', icon: 'chart' },
  subscriptions: { title: 'Cuotas', icon: 'sched-tasks' },
  'subscription-detail': { title: 'Cuota', icon: 'file-lines' },
  'time-tracking': { title: 'Horas', icon: 'clock' },
  goals: { title: 'Objetivos', icon: 'dir-check' },
  docs: { title: 'Documentos', icon: 'wordpad' },
  agenda: { title: 'Agenda', icon: 'calendar' },
  settings: { title: 'Panel de control', icon: 'settings' },
  notifications: { title: 'Bandeja de entrada', icon: 'mail' },
  'admin-users': { title: 'Administrador', icon: 'users-key' },
  quotes: { title: 'Presupuestos', icon: 'newspaper' },
  notes: { title: 'Bloc de notas', icon: 'note' },
  integrations: { title: 'Integraciones', icon: 'network' },
  planner: { title: 'Planificador', icon: 'user-calendar' },
}

let zCounter = 10

export const useWin95Store = defineStore('win95', {
  state: () => ({
    startOpen: false,
    windows: [] as Win95Window[],
    activeRoute: '' as string,
  }),
  getters: {
    activeWindow: (s) => s.windows.find((w) => w.route === s.activeRoute),
    visibleWindows: (s) => s.windows.filter((w) => !w.minimized),
    taskbarWindows: (s) => s.windows,
  },
  actions: {
    toggleStart(force?: boolean) {
      this.startOpen = force !== undefined ? force : !this.startOpen
    },
    ensureWindow(routeName: string) {
      const name = String(routeName || 'dashboard')
      const meta = WIN_META[name] || { title: name, icon: 'file-lines' }
      let win = this.windows.find((w) => w.route === name)
      if (!win) {
        const saved = loadPos()[name]
        const idx = this.windows.length
        win = {
          route: name,
          title: meta.title,
          icon: meta.icon,
          minimized: false,
          maximized: window.innerWidth < 768,
          z: ++zCounter,
          x: saved?.x ?? 24 + (idx % 6) * 28,
          y: saved?.y ?? 16 + (idx % 6) * 26,
          w: 0,
          h: null,
        }
        this.windows.push(win)
        // Limitar a 10 ventanas en taskbar: se descarta la menos usada que no sea la activa
        if (this.windows.length > 10) {
          const victim = [...this.windows]
            .filter((w) => w.route !== name)
            .sort((a, b) => a.z - b.z)[0]
          if (victim) this.windows = this.windows.filter((w) => w.route !== victim.route)
        }
      } else {
        win.minimized = false
        win.z = ++zCounter
        win.title = meta.title
        win.icon = meta.icon
      }
      this.activeRoute = name
    },
    focus(route: string) {
      const win = this.windows.find((w) => w.route === route)
      if (win) {
        win.minimized = false
        win.z = ++zCounter
        this.activeRoute = route
      }
      this.startOpen = false
    },
    minimize(route: string) {
      const win = this.windows.find((w) => w.route === route)
      if (win) win.minimized = true
      // Foco a la ventana visible con mayor z
      const rest = this.windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)
      if (rest[0]) this.activeRoute = rest[0].route
    },
    toggleMaximize(route: string) {
      const win = this.windows.find((w) => w.route === route)
      if (win) win.maximized = !win.maximized
    },
    close(route: string) {
      this.windows = this.windows.filter((w) => w.route !== route)
      const rest = [...this.windows].sort((a, b) => b.z - a.z)
      if (rest[0]) this.activeRoute = rest[0].route
    },
    /** Cierra todo salvo la ruta indicada (por defecto dashboard). Devuelve la ruta activa final. */
    closeAll(keep = 'dashboard'): string {
      const kept = this.windows.find((w) => w.route === keep)
      if (kept) {
        kept.minimized = false
        kept.z = ++zCounter
        this.windows = [kept]
      } else {
        this.windows = []
      }
      this.activeRoute = keep
      this.startOpen = false
      return keep
    },
    /** Ruta a la que navegar tras cerrar: la visible con mayor z, o dashboard. */
    nextAfterClose(closedRoute: string): string {
      const rest = this.windows
        .filter((w) => w.route !== closedRoute && !w.minimized)
        .sort((a, b) => b.z - a.z)
      if (rest[0]) return rest[0].route
      const anyRest = [...this.windows]
        .filter((w) => w.route !== closedRoute)
        .sort((a, b) => b.z - a.z)
      if (anyRest[0]) {
        anyRest[0].minimized = false
        return anyRest[0].route
      }
      return 'dashboard'
    },
    move(route: string, x: number, y: number) {
      const win = this.windows.find((w) => w.route === route)
      if (!win || win.maximized) return
      win.x = Math.max(0, Math.min(window.innerWidth - 120, x))
      win.y = Math.max(0, Math.min(window.innerHeight - 120, y))
      try {
        const all = loadPos()
        all[route] = { x: win.x, y: win.y }
        localStorage.setItem(POS_KEY, JSON.stringify(all))
      } catch { /* noop */ }
    },
  },
})
