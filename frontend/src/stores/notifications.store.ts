import { defineStore } from 'pinia'
import { notificationsApi } from '../api/notifications/notifications.api'
import type { Notification, NotificationQueryDto } from '../api/notifications/notifications.types'

export const useNotificationsStore = defineStore('notificationsStore', {
  state: () => ({
    items: [] as Notification[],
    total: 0,
    unreadCount: 0,
    loading: false,
    error: null as string | null,
    filters: {
      page: 1,
      limit: 10,
    } as NotificationQueryDto
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const [listRes, countRes] = await Promise.all([
          notificationsApi.getAll(this.filters),
          notificationsApi.getUnreadCount(),
        ])
        this.items = listRes.data.data
        this.total = listRes.data.total
        this.unreadCount = countRes.data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async fetchUnreadCount() {
      try {
        const { data } = await notificationsApi.getUnreadCount()
        this.unreadCount = data
      } catch (err: any) {
        console.error('Error fetching unread count:', err)
      }
    },
    async markAsRead(id: string) {
      try {
        await notificationsApi.markAsRead(id)
        const item = this.items.find(i => i._id === id)
        if (item && !item.isRead) {
          item.isRead = true
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
      } catch (err: any) {
        console.error('Error marking as read:', err)
      }
    },
    async markAsUnread(id: string) {
      try {
        await notificationsApi.markAsUnread(id)
        const item = this.items.find(i => i._id === id)
        if (item && item.isRead) {
          item.isRead = false
          this.unreadCount += 1
        }
      } catch (err: any) {
        console.error('Error marking as unread:', err)
      }
    },
    async markAllRead() {
      try {
        await notificationsApi.markAllRead()
        this.items.forEach(item => {
          item.isRead = true
        })
        this.unreadCount = 0
      } catch (err: any) {
        console.error('Error marking all as read:', err)
      }
    },
    async remove(id: string) {
      try {
        await notificationsApi.remove(id)
        this.items = this.items.filter(i => i._id !== id)
        await this.fetchUnreadCount()
      } catch (err: any) {
        console.error('Error removing notification:', err)
      }
    }
  }
})
