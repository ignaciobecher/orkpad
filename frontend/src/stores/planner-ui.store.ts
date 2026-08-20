import { defineStore } from 'pinia'
import { format, startOfWeek, addDays } from 'date-fns'

export type PlannerView = 'day' | 'week' | 'month' | 'agenda'
export type SidebarTab = 'goals' | 'habits' | 'templates' | 'analytics'

export const usePlannerUIStore = defineStore('plannerUI', {
  state: () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    return {
      view: 'day' as PlannerView,
      selectedDate: today,
      selectedWeek: weekStart,
      selectedMonth: format(new Date(), 'yyyy-MM'),
      sidebarTab: 'templates' as SidebarTab,
      isDragging: false,
      focusMode: false,
      sidebarOpen: true,
    }
  },
  getters: {
    weekDates(state): string[] {
      const start = new Date(state.selectedWeek + 'T00:00:00')
      return Array.from({ length: 7 }, (_, i) =>
        format(addDays(start, i), 'yyyy-MM-dd'),
      )
    },
  },
  actions: {
    setView(view: PlannerView) {
      this.view = view
    },
    setDate(date: string) {
      this.selectedDate = date
      this.view = 'day'
    },
    goToToday() {
      const today = format(new Date(), 'yyyy-MM-dd')
      this.selectedDate = today
      this.selectedWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      this.selectedMonth = format(new Date(), 'yyyy-MM')
    },
    prevDay() {
      const d = new Date(this.selectedDate + 'T00:00:00')
      d.setDate(d.getDate() - 1)
      this.selectedDate = format(d, 'yyyy-MM-dd')
    },
    nextDay() {
      const d = new Date(this.selectedDate + 'T00:00:00')
      d.setDate(d.getDate() + 1)
      this.selectedDate = format(d, 'yyyy-MM-dd')
    },
    prevWeek() {
      const d = new Date(this.selectedWeek + 'T00:00:00')
      d.setDate(d.getDate() - 7)
      this.selectedWeek = format(d, 'yyyy-MM-dd')
    },
    nextWeek() {
      const d = new Date(this.selectedWeek + 'T00:00:00')
      d.setDate(d.getDate() + 7)
      this.selectedWeek = format(d, 'yyyy-MM-dd')
    },
    setSidebarTab(tab: SidebarTab) {
      this.sidebarTab = tab
    },
    toggleFocusMode() {
      this.focusMode = !this.focusMode
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
  },
})
