import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { goalsApi } from '../api/goals/goals.api'
import type { Goal, GoalQueryDto, GoalsSummary, GoalEntry, QueryGoalEntriesDto } from '../api/goals/goals.types'

export const useGoalsStore = defineStore('goals', {
  state: () => ({
    items: [] as Goal[],
    total: 0,
    loading: false,
    error: null as string | null,
    selected: null as Goal | null,
    summary: null as GoalsSummary | null,
    filters: {
      page: 1,
      limit: 50,
      type: '',
      status: 'active',
      period: '',
    } as GoalQueryDto,
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const { data } = await goalsApi.getAll(this.filters)
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
        const { data } = await goalsApi.getById(id)
        this.selected = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async fetchSummary() {
      try {
        const { data } = await goalsApi.getSummary()
        this.summary = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      }
    },
    async fetchEntries(goalId: string, params?: QueryGoalEntriesDto): Promise<GoalEntry[]> {
      try {
        const { data } = await goalsApi.getEntries(goalId, params)
        return data.data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        return []
      }
    },
    async create(dto: any) {
      this.loading = true
      try {
        await goalsApi.create(dto)
        await this.fetchAll()
        await this.fetchSummary()
        useToast().success('Objetivo creado correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al crear el objetivo')
        throw err
      } finally {
        this.loading = false
      }
    },
    async update(id: string, dto: any) {
      this.loading = true
      try {
        await goalsApi.update(id, dto)
        await this.fetchAll()
        await this.fetchSummary()
        useToast().success('Objetivo actualizado correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al actualizar el objetivo')
        throw err
      } finally {
        this.loading = false
      }
    },
    async remove(id: string) {
      this.loading = true
      try {
        await goalsApi.remove(id)
        await this.fetchAll()
        await this.fetchSummary()
        useToast().success('Objetivo eliminado correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al eliminar el objetivo')
        throw err
      } finally {
        this.loading = false
      }
    },
    applyEntryToItem(goalId: string, entry: GoalEntry) {
      const idx = this.items.findIndex((g) => g._id === goalId)
      if (idx !== -1) this.items[idx] = { ...this.items[idx], currentEntry: entry }
    },
    async incrementProgress(goalId: string, amount = 1) {
      const idx = this.items.findIndex((g) => g._id === goalId)
      const previousEntry = idx !== -1 ? this.items[idx].currentEntry : undefined

      if (idx !== -1 && previousEntry) {
        this.applyEntryToItem(goalId, {
          ...previousEntry,
          currentCount: previousEntry.currentCount + amount,
        })
      }

      try {
        const { data } = await goalsApi.increment(goalId, amount)
        this.applyEntryToItem(goalId, data)
        return data
      } catch (err: any) {
        if (previousEntry) this.applyEntryToItem(goalId, previousEntry)
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al registrar progreso')
        throw err
      }
    },
    async setProgress(goalId: string, currentCount: number) {
      try {
        const { data } = await goalsApi.setProgress(goalId, currentCount)
        this.applyEntryToItem(goalId, data)
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al registrar progreso')
        throw err
      }
    },
    async complete(goalId: string) {
      try {
        const { data } = await goalsApi.complete(goalId)
        this.applyEntryToItem(goalId, data)
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al completar el objetivo')
        throw err
      }
    },
    async uncomplete(goalId: string) {
      try {
        const { data } = await goalsApi.uncomplete(goalId)
        this.applyEntryToItem(goalId, data)
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al desmarcar el objetivo')
        throw err
      }
    },
    setFilters(filters: Partial<GoalQueryDto>) {
      this.filters = { ...this.filters, ...filters, page: 1 }
      this.fetchAll()
    },
  },
})
