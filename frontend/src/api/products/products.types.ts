export interface Product {
  _id: string
  name: string
  description?: string
  price: number
  currency: string
  status: 'active' | 'archived'
  type: 'service' | 'digital' | 'physical'
  createdAt: string
  updatedAt: string
}

export interface CreateProductDto {
  name: string
  description?: string
  price?: number
  currency?: string
  status?: 'active' | 'archived'
  type?: 'service' | 'digital' | 'physical'
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductQueryDto {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'archived'
  type?: 'service' | 'digital' | 'physical'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
