import apiClient from '../axios.config'
import type { Quote, CreateQuoteDto, UpdateQuoteDto, QuoteQueryDto, PaginatedResponse } from './quotes.types'

const BASE = '/quotes'

export const quotesApi = {
  getAll: (params?: QuoteQueryDto) =>
    apiClient.get<PaginatedResponse<Quote>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<Quote>(`${BASE}/${id}`),

  create: (dto: CreateQuoteDto) =>
    apiClient.post<Quote>(BASE, dto),

  update: (id: string, dto: UpdateQuoteDto) =>
    apiClient.patch<Quote>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),

  downloadPdf: (id: string) =>
    apiClient.get(`${BASE}/${id}/pdf`, { responseType: 'blob' }),

  convertToInvoice: (id: string) =>
    apiClient.post(`${BASE}/${id}/convert-to-invoice`),
}
