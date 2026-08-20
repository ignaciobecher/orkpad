import { ref } from 'vue'
import { pushSubscriptionsApi } from '@/api/push-subscriptions/push-subscriptions.api'
import { showToast } from '@/composables/useToast'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

export function usePushNotifications() {
  const isSupported = typeof window !== 'undefined' && 'PushManager' in window && 'serviceWorker' in navigator
  const isSubscribed = ref(false)
  const loading = ref(false)
  const permissionState = ref<NotificationPermission>('default')

  async function checkStatus() {
    if (!isSupported) return
    permissionState.value = Notification.permission
    if (Notification.permission !== 'granted') {
      isSubscribed.value = false
      return
    }
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) return
      const sub = await registration.pushManager.getSubscription()
      isSubscribed.value = !!sub
    } catch {
      isSubscribed.value = false
    }
  }

  async function subscribe() {
    if (!isSupported) {
      showToast('Push notifications not supported', 'error')
      return
    }
    loading.value = true
    try {
      const { data } = await pushSubscriptionsApi.getVapidPublicKey()

      if (!data.publicKey) {
        showToast('Las notificaciones push no están configuradas en el servidor', 'error')
        return
      }

      const permission = await Notification.requestPermission()
      permissionState.value = permission
      if (permission !== 'granted') {
        showToast('Permiso de notificaciones denegado', 'error')
        return
      }

      let registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        showToast('Service worker no encontrado (Intenta en producción o HTTPS)', 'error')
        return
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      })

      const subJson = sub.toJSON()
      await pushSubscriptionsApi.subscribe({
        endpoint: sub.endpoint,
        p256dh: subJson.keys!.p256dh,
        auth: subJson.keys!.auth,
      })

      isSubscribed.value = true
      showToast('Notificaciones activadas', 'success')
    } catch (err: any) {
      console.error('Push subscribe error:', err)
      showToast('Error al activar notificaciones: ' + (err.message || 'Desconocido'), 'error')
    } finally {
      loading.value = false
    }
  }

  async function unsubscribe() {
    if (!isSupported) return
    loading.value = true
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) return
      const sub = await registration.pushManager.getSubscription()
      if (sub) {
        await pushSubscriptionsApi.unsubscribe(sub.endpoint)
        await sub.unsubscribe()
      }
      isSubscribed.value = false
      showToast('Notificaciones desactivadas', 'success')
    } catch (err: any) {
      console.error('Push unsubscribe error:', err)
      showToast('Error al desactivar notificaciones', 'error')
    } finally {
      loading.value = false
    }
  }

  return { isSupported, isSubscribed, loading, permissionState, checkStatus, subscribe, unsubscribe }
}
