export interface InfrastructureResource {
  _id: string
  name: string
  provider?: string
  type?: string
  status: 'RUNNING' | 'STOPPED' | 'ERROR'
  cost: number
  currency: string
  createdAt: string
  updatedAt: string
}

export interface CreateInfrastructureResourceDto {
  name: string
  provider?: string
  type?: string
  status?: 'RUNNING' | 'STOPPED' | 'ERROR'
  cost?: number
  currency?: string
}

export interface UpdateInfrastructureResourceDto extends Partial<CreateInfrastructureResourceDto> {}

export interface InfrastructureResourceQueryDto {
  page?: number
  limit?: number
  search?: string
  status?: 'RUNNING' | 'STOPPED' | 'ERROR'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
