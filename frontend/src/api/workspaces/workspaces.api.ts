import apiClient from '../axios.config'
import type { Workspace, UpdateWorkspaceDto } from './workspaces.types'

export const workspacesApi = {
  getMe: () => apiClient.get<Workspace>('/workspaces/me'),
  updateMe: (dto: UpdateWorkspaceDto) => apiClient.patch<Workspace>('/workspaces/me', dto),
}
