import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { plannerTasksApi } from '@/api/planner/planner-tasks.api'
import type {
  PlannerTask,
  CreatePlannerTaskDto,
  UpdatePlannerTaskDto,
  ReorderPlannerTasksDto,
} from '@/api/planner/planner.types'

export const usePlannerTasksStore = defineStore('plannerTasks', {
  state: () => ({
    tasksByBlock: {} as Record<string, PlannerTask[]>,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    tasksForBlock: (state) => (blockId: string): PlannerTask[] =>
      state.tasksByBlock[blockId] ?? [],

    completionRate: (state) => (blockId: string): number => {
      const tasks = state.tasksByBlock[blockId] ?? []
      if (!tasks.length) return 0
      const done = tasks.filter(t => t.completed).length
      return Math.round((done / tasks.length) * 100)
    },
  },

  actions: {
    async fetchForBlock(blockId: string) {
      this.loading = true
      try {
        const { data } = await plannerTasksApi.getAll({ blockId, limit: 200 })
        this.tasksByBlock[blockId] = data.data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },

    async create(dto: CreatePlannerTaskDto) {
      try {
        const { data } = await plannerTasksApi.create(dto)
        if (!this.tasksByBlock[dto.blockId]) this.tasksByBlock[dto.blockId] = []
        this.tasksByBlock[dto.blockId].push(data)
        return data
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al crear tarea')
        throw err
      }
    },

    async update(id: string, blockId: string, dto: UpdatePlannerTaskDto) {
      try {
        const { data } = await plannerTasksApi.update(id, dto)
        this._replaceTask(blockId, data)
        return data
      } catch (err: any) {
        useToast().error('Error al actualizar tarea')
        throw err
      }
    },

    async toggle(id: string, blockId: string) {
      // Optimistic toggle
      const tasks = this.tasksByBlock[blockId] ?? []
      const task = tasks.find(t => t._id === id)
      if (task) {
        const prev = task.completed
        task.completed = !prev
        task.status = task.completed ? 'completed' : 'pending'
        try {
          const { data } = await plannerTasksApi.toggle(id)
          this._replaceTask(blockId, data)
          return data
        } catch (err: any) {
          task.completed = prev
          task.status = prev ? 'completed' : 'pending'
          useToast().error('Error al actualizar tarea')
          throw err
        }
      }
    },

    async remove(id: string, blockId: string) {
      try {
        this.tasksByBlock[blockId] = (this.tasksByBlock[blockId] ?? []).filter(t => t._id !== id)
        await plannerTasksApi.remove(id)
      } catch (err: any) {
        useToast().error('Error al eliminar tarea')
        throw err
      }
    },

    async reorder(dto: ReorderPlannerTasksDto) {
      const tasks = this.tasksByBlock[dto.blockId] ?? []
      dto.ids.forEach((id, index) => {
        const t = tasks.find(t => t._id === id)
        if (t) t.order = index
      })
      this.tasksByBlock[dto.blockId] = [...tasks].sort((a, b) => a.order - b.order)
      try {
        await plannerTasksApi.reorder(dto)
      } catch {
        await this.fetchForBlock(dto.blockId)
      }
    },

    _replaceTask(blockId: string, updated: PlannerTask) {
      const tasks = this.tasksByBlock[blockId]
      if (tasks) {
        const idx = tasks.findIndex(t => t._id === updated._id)
        if (idx !== -1) tasks[idx] = updated
      }
    },
  },
})
