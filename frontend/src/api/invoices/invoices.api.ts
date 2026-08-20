import apiClient from '../axios.config'
import type { Invoice, CreateInvoiceDto, UpdateInvoiceDto, InvoiceQueryDto, PaginatedResponse } from './invoices.types'

const BASE = '/invoices'

export const invoicesApi = {
  getAll: (params?: InvoiceQueryDto) =>
    apiClient.get<PaginatedResponse<Invoice>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<Invoice>(`${BASE}/${id}`),

  create: (dto: CreateInvoiceDto) =>
    apiClient.post<Invoice>(BASE, dto),

  update: (id: string, dto: UpdateInvoiceDto) =>
    apiClient.patch<Invoice>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
