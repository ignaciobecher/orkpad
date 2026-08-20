import apiClient from '../axios.config'
import type { GoogleConnection, GoogleCalendarEvent } from './google.types'

const BASE = '/google-integration'

export const googleApi = {
  getStatus: () =>
    apiClient.get<GoogleConnection>(`${BASE}/status`),

  disconnect: () =>
    apiClient.delete(`${BASE}/disconnect`),

  getCalendarEvents: (maxResults?: number) =>
    apiClient.get<GoogleCalendarEvent[]>(`${BASE}/calendar/events`, {
      params: maxResults ? { maxResults } : undefined,
    }),

  syncCalendar: () =>
    apiClient.post<{ synced: number; events: GoogleCalendarEvent[] }>(`${BASE}/calendar/sync`),
}
