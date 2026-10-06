export interface Workspace {
  _id: string
  name: string
  slug: string
  ownerId: string
  status: 'active' | 'suspended'
  createdAt: string
  updatedAt: string
}

export interface UpdateWorkspaceDto {
  name?: string
  slug?: string
}
