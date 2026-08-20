import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { notesApi } from '@/api/notes/notes.api'
import type { Note, CreateNoteDto, UpdateNoteDto, NoteQueryDto, ReorderItem } from '@/api/notes/notes.types'

export type NotesView = 'grid' | 'list'

export const useNotesStore = defineStore('notes', {
  state: () => ({
    items: [] as Note[],
    selected: null as Note | null,
    total: 0,
    page: 1,
    limit: 50,
    loading: false,
    error: null as string | null,
    filters: {} as NoteQueryDto,
    view: (localStorage.getItem('notes_view') ?? 'grid') as NotesView,
  }),

  getters: {
    pinnedNotes: (state) => state.items.filter(n => n.isPinned && n.status === 'active'),
    activeNotes: (state) => state.items.filter(n => !n.isPinned && n.status === 'active'),
    doneNotes: (state) => state.items.filter(n => n.status === 'done'),
    totalPages: (state) => Math.ceil(state.total / state.limit),
  },

  actions: {
    setView(v: NotesView) {
      this.view = v
      localStorage.setItem('notes_view', v)
    },

    async fetchAll(params?: NoteQueryDto) {
      this.loading = true
      this.error = null
      try {
        const { data } = await notesApi.getAll({
          page: this.page,
          limit: this.limit,
          ...this.filters,
          ...params,
        })
        this.items = data.data
        this.total = data.total
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Error al cargar notas'
        useToast().error(this.error ?? 'Error al cargar notas')
      } finally {
        this.loading = false
      }
    },

    async create(dto: CreateNoteDto) {
      try {
        const { data } = await notesApi.create(dto)
        this.items.unshift(data)
        this.total++
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al crear nota')
        throw err
      }
    },

    async update(id: string, dto: UpdateNoteDto) {
      try {
        const { data } = await notesApi.update(id, dto)
        this._replaceItem(data)
        return data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al actualizar nota')
        throw err
      }
    },

    async toggle(id: string) {
      try {
        const { data } = await notesApi.toggle(id)
        this._replaceItem(data)
        return data
      } catch (err: any) {
        useToast().error('Error al cambiar estado de la nota')
        throw err
      }
    },

    async pin(id: string) {
      try {
        const { data } = await notesApi.pin(id)
        this._replaceItem(data)
        return data
      } catch (err: any) {
        useToast().error('Error al fijar nota')
        throw err
      }
    },

    async reorder(items: ReorderItem[]) {
      try {
        await notesApi.reorder(items)
      } catch (err: any) {
        useToast().error('Error al reordenar notas')
        throw err
      }
    },

    async remove(id: string) {
      try {
        await notesApi.remove(id)
        this.items = this.items.filter(n => n._id !== id)
        this.total--
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al eliminar nota')
        throw err
      }
    },

    setFilters(filters: NoteQueryDto) {
      this.filters = filters
      this.page = 1
      this.fetchAll()
    },

    setPage(page: number) {
      this.page = page
      this.fetchAll()
    },

    _replaceItem(updated: Note) {
      const idx = this.items.findIndex(n => n._id === updated._id)
      if (idx !== -1) this.items[idx] = updated
      if (this.selected?._id === updated._id) this.selected = updated
    },
  },
})
