import apiClient from '@/api/axios.config'
import type {
  Resource,
  ResourceCategory,
  PaginatedResources,
  QueryResourceDto,
} from './resources.types'

const BASE = '/resources'

export const resourcesApi = {
  getAll: (params?: QueryResourceDto) =>
    apiClient.get<PaginatedResources>(BASE, { params }),

  getCategories: () =>
    apiClient.get<ResourceCategory[]>(`${BASE}/categories`),

  getBySlug: (slug: string) =>
    apiClient.get<Resource>(`${BASE}/${slug}`),
}
