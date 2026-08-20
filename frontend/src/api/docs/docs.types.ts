export interface Document {
  _id: string
  title: string
  content?: string
  folderId?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateDocumentDto {
  title: string
  content?: string
  folderId?: string
  tags?: string[]
}

export interface UpdateDocumentDto extends Partial<CreateDocumentDto> {}

export interface DocumentQueryDto {
  page?: number
  limit?: number
  search?: string
  folderId?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
