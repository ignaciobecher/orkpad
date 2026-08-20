import apiClient from '../axios.config'
import type { Testimonial, CreateTestimonialDto, UpdateTestimonialDto, QueryTestimonialDto } from './testimonials.types'

export const testimonialsApi = {
  getAll: (params?: QueryTestimonialDto) =>
    apiClient.get<{ data: Testimonial[]; total: number; page: number; limit: number }>('/testimonials', { params }),

  getById: (id: string) =>
    apiClient.get<Testimonial>(`/testimonials/${id}`),

  create: (dto: CreateTestimonialDto) =>
    apiClient.post<Testimonial>('/testimonials', dto),

  update: (id: string, dto: UpdateTestimonialDto) =>
    apiClient.patch<Testimonial>(`/testimonials/${id}`, dto),

  remove: (id: string) =>
    apiClient.delete(`/testimonials/${id}`),

  reorder: (items: { id: string; order: number }[]) =>
    apiClient.patch('/testimonials/reorder', { items }),
}
