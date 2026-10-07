import apiClient from '../axios.config'

export interface StoredFile {
  id: string
  originalName: string
  mimeType: string
  size: number
  url: string
}

export const filesApi = {
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<StoredFile>('/files', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  remove: (id: string) => apiClient.delete(`/files/${id}`),
}
