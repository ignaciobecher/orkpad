export interface GoogleConnection {
  connected: boolean
  email?: string
}

export interface GoogleCalendarEvent {
  id: string
  summary?: string
  description?: string
  location?: string
  start: { dateTime?: string; date?: string; timeZone?: string }
  end: { dateTime?: string; date?: string; timeZone?: string }
  htmlLink?: string
  status?: string
}
