import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { plannerBlocksApi } from '@/api/planner/planner-blocks.api'
import type {
  PlannerBlock,
  CreatePlannerBlockDto,
  UpdatePlannerBlockDto,
  UpdateBlockStatusDto,
  CloneWeekDto,
} from '@/api/planner/planner.types'

export const usePlannerBlocksStore = defineStore('plannerBlocks', {
  state: () => ({
    blocksByDate: {} as Record<string, PlannerBlock[]>,
    loading: false,
    error: null as string | null,
    selectedBlockId: null as string | null,
  }),

  getters: {
    blocksForDate: (state) => (date: string): PlannerBlock[] =>
      state.blocksByDate[date] ?? [],
  },

  actions: {
    async fetchForDate(date: string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await plannerBlocksApi.getAll({ date, limit: 200 })
        this.blocksByDate[date] = data.data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },

    async fetchForWeek(weekStart: string) {
      this.loading = true
      this.error = null
      try {
        const weekEnd = addDaysToDate(weekStart, 6)
        const { data } = await plannerBlocksApi.getAll({ dateFrom: weekStart, dateTo: weekEnd, limit: 200 })
        // Index by date
        const grouped: Record<string, PlannerBlock[]> = {}
        for (const block of data.data) {
          if (!grouped[block.date]) grouped[block.date] = []
          grouped[block.date].push(block)
        }
        Object.assign(this.blocksByDate, grouped)
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },

    async create(dto: CreatePlannerBlockDto) {
      try {
        const { data } = await plannerBlocksApi.create(dto)
        if (!this.blocksByDate[data.date]) this.blocksByDate[data.date] = []
        this.blocksByDate[data.date].push(data)
        this.blocksByDate[data.date].sort((a, b) => a.order - b.order)
        return data
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al crear bloque')
        throw err
      }
    },

    async update(id: string, dto: UpdatePlannerBlockDto) {
      try {
        const { data } = await plannerBlocksApi.update(id, dto)
        this._replaceBlock(data)
        return data
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al actualizar bloque')
        throw err
      }
    },

    async updateStatus(id: string, dto: UpdateBlockStatusDto) {
      // Optimistic update
      const block = this._findBlock(id)
      if (block) {
        const prevStatus = block.status
        block.status = dto.status
        try {
          const { data } = await plannerBlocksApi.updateStatus(id, dto)
          this._replaceBlock(data)
          return data
        } catch (err: any) {
          if (block) block.status = prevStatus
          useToast().error('Error al actualizar estado')
          throw err
        }
      }
    },

    async remove(id: string) {
      try {
        const block = this._findBlock(id)
        if (block) {
          this.blocksByDate[block.date] = this.blocksByDate[block.date].filter(b => b._id !== id)
        }
        await plannerBlocksApi.remove(id)
      } catch (err: any) {
        useToast().error('Error al eliminar bloque')
        throw err
      }
    },

    async reorder(ids: string[], date: string) {
      // Optimistic update
      const blocks = this.blocksByDate[date] ?? []
      ids.forEach((id, index) => {
        const b = blocks.find(b => b._id === id)
        if (b) b.order = index
      })
      this.blocksByDate[date] = [...blocks].sort((a, b) => a.order - b.order)
      try {
        await plannerBlocksApi.reorder({ ids, date })
      } catch {
        useToast().error('Error al reordenar bloques')
        await this.fetchForDate(date)
      }
    },

    async duplicate(id: string, targetDate?: string) {
      try {
        const { data } = await plannerBlocksApi.duplicate(id, targetDate)
        if (!this.blocksByDate[data.date]) this.blocksByDate[data.date] = []
        this.blocksByDate[data.date].push(data)
        return data
      } catch (err: any) {
        useToast().error('Error al duplicar bloque')
        throw err
      }
    },

    async cloneWeek(dto: CloneWeekDto) {
      try {
        const { data } = await plannerBlocksApi.cloneWeek(dto)
        useToast().success(`${data.cloned} bloques clonados`)
        await this.fetchForWeek(dto.toWeekStart)
        return data
      } catch (err: any) {
        useToast().error('Error al clonar semana')
        throw err
      }
    },

    selectBlock(id: string | null) {
      this.selectedBlockId = id
    },

    _findBlock(id: string): PlannerBlock | undefined {
      for (const blocks of Object.values(this.blocksByDate)) {
        const found = blocks.find(b => b._id === id)
        if (found) return found
      }
    },

    _replaceBlock(updated: PlannerBlock) {
      const date = updated.date
      if (this.blocksByDate[date]) {
        const idx = this.blocksByDate[date].findIndex(b => b._id === updated._id)
        if (idx !== -1) this.blocksByDate[date][idx] = updated
      }
    },
  },
})

function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
