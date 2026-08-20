/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

// Activate the new SW immediately without waiting for old SW to release clients.
// This is required with injectManifest strategy — unlike generateSW, VitePWA does
// not inject these automatically. Without them, the old SW stays active and serves
// stale cached HTML for the new hashed JS assets, causing MIME-type errors.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload: { title?: string; message?: string; link?: string } = {}
  try {
    payload = event.data.json()
  } catch {
    return
  }

  const { title = 'Orkpad', message = '', link } = payload

  event.waitUntil(
    self.registration.showNotification(title, {
      body: message,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: { link },
      tag: link ?? 'orkpad-notification',
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const link = event.notification.data?.link
  if (!link) return

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const target = new URL(link, self.location.origin).href
        const existing = clients.find((c) => c.url.startsWith(self.location.origin))
        if (existing) {
          existing.navigate(target)
          return existing.focus()
        }
        return self.clients.openWindow(target)
      }),
  )
})
