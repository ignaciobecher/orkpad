import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { tasksApi } from '../api/tasks/tasks.api'
import type { Task, TaskQueryDto, MoveTaskDto } from '../api/tasks/tasks.types'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    items: [] as Task[],
    total: 0,
    loading: false,
    error: null as string | null,
    selected: null as Task | null,
    filters: {
      page: 1,
      limit: 20,
      search: '',
      status: '',
      projectId: ''
    } as TaskQueryDto
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const { data } = await tasksApi.getAll(this.filters)
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
        const { data } = await tasksApi.getById(id)
        this.selected = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async create(dto: any) {
      this.loading = true
      try {
        await tasksApi.create(dto)
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
        await tasksApi.update(id, dto)
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
        await tasksApi.remove(id)
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
    async move(id: string, dto: MoveTaskDto) {
      try {
        const { data } = await tasksApi.move(id, dto)
        const idx = this.items.findIndex(t => t._id === id)
        if (idx !== -1) this.items[idx] = data
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al mover tarea')
        throw err
      }
    },
    async fetchByColumn(columnId: string) {
      try {
        const { data } = await tasksApi.getAll({ columnId, limit: 200 })
        return data.data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        return []
      }
    },
    setFilters(filters: Partial<TaskQueryDto>) {
      this.filters = { ...this.filters, ...filters, page: 1 }
      this.fetchAll()
    }
  }
})
