export interface ResourceCategory {
  _id: string
  name: string
  slug: string
  icon?: string
  description?: string
  createdAt: string
}

export interface Resource {
  _id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  categoryId?: string | null
  tags: string[]
  coverImageUrl?: string | null
  isPublished: boolean
  publishedAt?: string | null
  readTimeMinutes?: number | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedResources {
  data: Resource[]
  total: number
  page: number
  limit: number
}

export interface QueryResourceDto {
  search?: string
  category?: string
  tag?: string
  page?: number
  limit?: number
}
