import axios from 'axios'
import { baseURL } from '../axios.config'

const KEY = 'orkpad_portal_token'

export function getPortalToken(): string | null {
  try { return sessionStorage.getItem(KEY) } catch { return null }
}

export function setPortalToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(KEY, token)
    else sessionStorage.removeItem(KEY)
  } catch { /* noop */ }
}

const portalClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

portalClient.interceptors.request.use((config) => {
  const token = getPortalToken()
  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as any).Authorization = `Bearer ${token}`
  }
  return config
})

export interface PortalPermissions {
  canCreate: boolean
  canEdit: boolean
  canComment: boolean
  canUpload: boolean
}

export const portalApi = {
  login: (dto: { username: string; password: string }) =>
    portalClient.post<{ token: string; shareId: string; project: any; permissions: PortalPermissions; label: string }>('/portal/login', dto),

  shareInfo: (token: string) =>
    portalClient.get<{ username: string; label: string; projectName: string }>(`/portal/share-info/${token}`),

  getProject: () =>
    portalClient.get('/portal/project'),

  getColumns: () =>
    portalClient.get<any[]>('/portal/columns'),

  getTasks: (archived = false) =>
    portalClient.get<{ data: any[]; total: number }>('/portal/tasks', { params: archived ? { archived: true } : {} }),

  createTask: (dto: any) =>
    portalClient.post('/portal/tasks', dto),

  updateTask: (id: string, dto: any) =>
    portalClient.patch(`/portal/tasks/${id}`, dto),

  moveTask: (id: string, dto: { columnId: string; order?: number }) =>
    portalClient.patch(`/portal/tasks/${id}/move`, dto, { headers: { 'X-Hide-Global-Toast': 'true' } }),

  listComments: (taskId: string) =>
    portalClient.get(`/portal/tasks/${taskId}/comments`, { params: { limit: 100 } }),

  addComment: (taskId: string, dto: { text: string }) =>
    portalClient.post(`/portal/tasks/${taskId}/comments`, dto),

  updateComment: (taskId: string, commentId: string, dto: { text: string }) =>
    portalClient.patch(`/portal/tasks/${taskId}/comments/${commentId}`, dto),

  removeComment: (taskId: string, commentId: string) =>
    portalClient.delete(`/portal/tasks/${taskId}/comments/${commentId}`),

  listActivities: (taskId: string) =>
    portalClient.get(`/portal/tasks/${taskId}/activities`, { params: { limit: 50 } }),

  uploadAttachment: (taskId: string, file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData()
    form.append('file', file)
    return portalClient.post(`/portal/tasks/${taskId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0,
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total))
      },
    })
  },

  removeAttachment: (taskId: string, fileId: string) =>
    portalClient.delete(`/portal/tasks/${taskId}/attachments/${fileId}`),

  fileUrl: (taskId: string, fileId: string) => {
    const token = getPortalToken()
    return `${baseURL}/portal/tasks/${taskId}/files/${fileId}${token ? `?token=${encodeURIComponent(token)}` : ''}`
  },
}
