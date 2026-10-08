import apiClient from '../axios.config'

export interface AiSettings {
  enabled: boolean
  ollamaBaseUrl: string
  chatModel: string
  embedModel: string
  temperature: number
  systemPrompt: string | null
  indexTypes: string[]
  index: { chunks: number; lastIndexedAt: string | null }
}

export interface AiConversation {
  _id: string
  title: string
  projectId: string | null
  updatedAt: string
}

export interface AiMessage {
  _id: string
  role: 'user' | 'assistant'
  content: string
  sources?: { refType: string; refId: string; title?: string }[]
}

export const aiApi = {
  settings: () => apiClient.get<AiSettings>('/ai/settings'),
  saveSettings: (dto: Partial<AiSettings>) => apiClient.patch<AiSettings>('/ai/settings', dto),
  test: (baseUrl?: string) => apiClient.post<{ ok: boolean; url: string; models: number }>('/ai/test', { baseUrl }),
  models: (baseUrl?: string) => apiClient.get<{ name: string; size: number }[]>('/ai/models', { params: { baseUrl } }),
  reindex: () => apiClient.post<{ id: string; status: string }>('/ai/reindex'),
  reindexStatus: (jobId: string) =>
    apiClient.get<{ id: string; status: 'running' | 'done' | 'failed'; total: number; done: number; documents: number; error?: string }>(`/ai/reindex/${jobId}`),
  conversations: () => apiClient.get<AiConversation[]>('/ai/conversations'),
  messages: (id: string) => apiClient.get<AiMessage[]>(`/ai/conversations/${id}/messages`),
  removeConversation: (id: string) => apiClient.delete(`/ai/conversations/${id}`),

  chat(
    dto: { message: string; conversationId?: string; projectId?: string },
    onEvent: (e: { type: string; data: any }) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      fetch(`${apiClient.defaults.baseURL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dto),
      }).then(async (res) => {
        if (!res.ok || !res.body) {
          reject(new Error(`Error ${res.status}`))
          return
        }
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buf = ''
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const parts = buf.split('\n\n')
          buf = parts.pop() ?? ''
          for (const part of parts) {
            const lines = part.split('\n')
            const type = lines.find((l) => l.startsWith('event:'))?.slice(7).trim() ?? 'message'
            const dataLine = lines.filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('\n')
            if (!dataLine) continue
            try {
              onEvent({ type, data: JSON.parse(dataLine) })
            } catch {
              // evento parcial
            }
          }
        }
        resolve()
      }).catch(reject)
    })
  },
}
