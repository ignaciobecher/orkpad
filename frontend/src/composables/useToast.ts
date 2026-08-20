import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: number
  message: string
  type: ToastType
}

const toasts = ref<ToastMessage[]>([])
let nextId = 0

export const showToast = (message: string, type: ToastType = 'success', duration = 4000) => {
  const id = nextId++
  toasts.value.push({ id, message, type })
  setTimeout(() => removeToast(id), duration)
}

export const success = (message: string) => showToast(message, 'success')
export const error = (message: string) => showToast(message, 'error', 6000)
export const warning = (message: string) => showToast(message, 'warning')
export const info = (message: string) => showToast(message, 'info')

export const removeToast = (id: number) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) toasts.value.splice(index, 1)
}

export function useToast() {
  return { toasts, showToast, success, error, warning, info, removeToast }
}
