import type { NavigationGuard } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

export const authGuard: NavigationGuard = async (to) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)

  if (!requiresAuth && !guestOnly) {
    return true
  }

  if (requiresAuth) {
    if (!authStore.initialized) {
      try {
        await authStore.fetchMe()
      } catch {
        // auth check failed silently
      }
    }
    if (!authStore.isAuthenticated) {
      return { name: 'login' }
    }
    return true
  }

  // guestOnly: don't block page render waiting for auth check
  if (!authStore.initialized) {
    authStore.fetchMe().then(async () => {
      if (authStore.isAuthenticated) {
        const { default: router } = await import('@/router')
        router.replace({ name: 'dashboard' })
      }
    }).catch(() => {})
    return true
  }

  if (authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
}
