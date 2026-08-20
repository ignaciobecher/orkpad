import apiClient from '../axios.config'
import type { Document, CreateDocumentDto, UpdateDocumentDto, DocumentQueryDto, PaginatedResponse } from './docs.types'

const BASE = '/docs'

export const docsApi = {
  getAll: (params?: DocumentQueryDto) =>
    apiClient.get<PaginatedResponse<Document>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<Document>(`${BASE}/${id}`),

  create: (dto: CreateDocumentDto) =>
    apiClient.post<Document>(BASE, dto),

  update: (id: string, dto: UpdateDocumentDto) =>
    apiClient.patch<Document>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
