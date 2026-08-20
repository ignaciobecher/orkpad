export interface Testimonial {
  _id: string
  clientName: string
  clientRole?: string
  clientAvatarUrl?: string
  content: string
  rating?: number
  projectId?: string | null
  isPublic: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateTestimonialDto {
  clientName: string
  clientRole?: string
  clientAvatarUrl?: string
  content: string
  rating?: number
  projectId?: string
  isPublic?: boolean
  order?: number
}

export type UpdateTestimonialDto = Partial<CreateTestimonialDto>

export interface QueryTestimonialDto {
  search?: string
  isPublic?: boolean
  projectId?: string
  page?: number
  limit?: number
}
