export interface Client {
  _id: string
  name: string
  email?: string
  phone?: string
  address?: string
  status: 'active' | 'archived'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateClientDto {
  name: string
  email?: string
  phone?: string
  address?: string
  notes?: string
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
  status?: 'active' | 'archived'
}

export interface ClientQueryDto {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'archived'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
