export interface TaskColumn {
  _id: string
  projectId: string
  name: string
  color: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateTaskColumnDto {
  projectId: string
  name: string
  color?: string
  order?: number
}

export interface UpdateTaskColumnDto {
  name?: string
  color?: string
  order?: number
}
