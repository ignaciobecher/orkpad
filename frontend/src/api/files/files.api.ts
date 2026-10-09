import apiClient from '../axios.config'

export interface StoredFile {
  id: string
  originalName: string
  mimeType: string
  size: number
  url: string
}

export const filesApi = {
  upload: (file: File, timeoutMs = 0) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<StoredFile>('/files', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: timeoutMs,
    })
  },
  download: (id: string) =>
    apiClient.get(`/files/${id}`, { responseType: 'blob', timeout: 0 }),
  remove: (id: string) => apiClient.delete(`/files/${id}`),
}
