import { ref, onUnmounted } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { baseURL } from '@/api/axios.config'

let socket: Socket | null = null
let currentProjectId: string | null = null
const listeners = new Set<(event: string, payload: any) => void>()

function getSocket(): Socket {
  if (socket) return socket
  socket = io(`${baseURL}/boards`, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  })
  socket.onAny((event: string, payload: any) => {
    listeners.forEach((fn) => {
      try { fn(event, payload) } catch { /* noop */ }
    })
  })
  return socket
}

export function useBoardSocket() {
  const connected = ref(false)

  const ensure = () => {
    const s = getSocket()
    connected.value = s.connected
    s.off('connect')
    s.off('disconnect')
    s.on('connect', () => { connected.value = true })
    s.on('disconnect', () => { connected.value = false })
    if (!s.connected) s.connect()
    return s
  }

  const joinProject = (projectId: string) => {
    const s = ensure()
    if (currentProjectId && currentProjectId !== projectId) {
      s.emit('project:leave', { projectId: currentProjectId })
    }
    currentProjectId = projectId
    s.emit('project:join', { projectId })
  }

  const leaveProject = () => {
    if (socket && currentProjectId) {
      socket.emit('project:leave', { projectId: currentProjectId })
      currentProjectId = null
    }
  }

  const onBoardEvent = (fn: (event: string, payload: any) => void) => {
    listeners.add(fn)
    return () => { listeners.delete(fn) }
  }

  onUnmounted(() => {
    // No desconectamos global para reutilizar entre vistas
  })

  return { ensure, joinProject, leaveProject, onBoardEvent, connected }
}
