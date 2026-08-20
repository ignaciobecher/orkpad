import apiClient from '@/api/axios.config'
import type {
  CreateNoteDto,
  UpdateNoteDto,
  NoteQueryDto,
  PaginatedNotes,
  Note,
  ReorderItem,
} from './notes.types'

const BASE = '/notes'

export const notesApi = {
  getAll: (params?: NoteQueryDto) =>
    apiClient.get<PaginatedNotes>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<Note>(`${BASE}/${id}`),

  create: (dto: CreateNoteDto) =>
    apiClient.post<Note>(BASE, dto),

  update: (id: string, dto: UpdateNoteDto) =>
    apiClient.patch<Note>(`${BASE}/${id}`, dto),

  toggle: (id: string) =>
    apiClient.patch<Note>(`${BASE}/${id}/toggle`),

  pin: (id: string) =>
    apiClient.patch<Note>(`${BASE}/${id}/pin`),

  reorder: (items: ReorderItem[]) =>
    apiClient.patch(`${BASE}/reorder`, { items }),

  remove: (id: string) =>
    apiClient.delete<Note>(`${BASE}/${id}`),
}
