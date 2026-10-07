export type NoteType = 'note' | 'checklist'
export type NoteStatus = 'active' | 'done'

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface Note {
  _id: string
  workspaceId: string
  title: string | null
  content: string
  type: NoteType
  status: NoteStatus
  isPinned: boolean
  color: string | null
  tags: string[]
  projectId: string | null
  clientId: string | null
  checklist: ChecklistItem[]
  order: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateNoteDto {
  title?: string
  content?: string
  type?: NoteType
  color?: string
  tags?: string[]
  projectId?: string
  clientId?: string
  checklist?: Omit<ChecklistItem, 'id'>[]
  order?: number
}

export interface UpdateNoteDto extends Partial<CreateNoteDto> {
  status?: NoteStatus
  isPinned?: boolean
  checklist?: ChecklistItem[]
}

export interface NoteQueryDto {
  search?: string
  status?: NoteStatus
  tags?: string[]
  projectId?: string
  clientId?: string
  unassigned?: boolean
  page?: number
  limit?: number
}

export interface PaginatedNotes {
  data: Note[]
  total: number
  page: number
  limit: number
}

export interface ReorderItem {
  id: string
  order: number
}
