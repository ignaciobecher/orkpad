import apiClient from '../axios.config'
import type { Product, CreateProductDto, UpdateProductDto, ProductQueryDto, PaginatedResponse } from './products.types'

const BASE = '/products'

export const productsApi = {
  getAll: (params?: ProductQueryDto) =>
    apiClient.get<PaginatedResponse<Product>>(BASE, { params }),

  getById: (id: string) =>
    apiClient.get<Product>(`${BASE}/${id}`),

  create: (dto: CreateProductDto) =>
    apiClient.post<Product>(BASE, dto),

  update: (id: string, dto: UpdateProductDto) =>
    apiClient.patch<Product>(`${BASE}/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
