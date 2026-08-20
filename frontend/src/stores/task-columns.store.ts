import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { taskColumnsApi } from '@/api/task-columns/task-columns.api'
import type { TaskColumn, CreateTaskColumnDto, UpdateTaskColumnDto } from '@/api/task-columns/task-columns.types'

export const useTaskColumnsStore = defineStore('taskColumns', {
  state: () => ({
    columns: [] as TaskColumn[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchAll(projectId: string) {
      this.loading = true
      this.error = null
      this.columns = []
      try {
        const { data } = await taskColumnsApi.getAll(projectId)
        this.columns = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al cargar columnas')
      } finally {
        this.loading = false
      }
    },
    async create(dto: CreateTaskColumnDto) {
      try {
        const { data } = await taskColumnsApi.create(dto)
        this.columns.push(data)
        useToast().success('Columna creada')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al crear columna')
        throw err
      }
    },
    async update(id: string, dto: UpdateTaskColumnDto) {
      try {
        const { data } = await taskColumnsApi.update(id, dto)
        const idx = this.columns.findIndex(c => c._id === id)
        if (idx !== -1) this.columns[idx] = data
        useToast().success('Columna actualizada')
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al actualizar columna')
        throw err
      }
    },
    async remove(id: string) {
      try {
        await taskColumnsApi.remove(id)
        this.columns = this.columns.filter(c => c._id !== id)
        useToast().success('Columna eliminada')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al eliminar columna')
        throw err
      }
    },
  },
})
