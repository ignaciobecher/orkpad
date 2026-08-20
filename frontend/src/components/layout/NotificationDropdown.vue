<template>
  <div class="notification-dropdown" v-if="isOpen">
    <div class="dropdown-header">
      <h3 class="text-xs font-mono uppercase tracking-wider">{{ $t('notifications.title', 'Notificaciones') }}</h3>
      <button 
        v-if="store.unreadCount > 0"
        @click="store.markAllRead" 
        class="mark-all-btn font-mono"
      >
        {{ $t('notifications.mark_all_read', 'Marcar todas como leídas') }}
      </button>
    </div>

    <div class="dropdown-body custom-scrollbar">
      <div v-if="store.loading && store.items.length === 0" class="empty-state">
        <div class="skeleton-loader"></div>
        <div class="skeleton-loader"></div>
        <div class="skeleton-loader"></div>
      </div>

      <div v-else-if="store.items.length === 0" class="empty-state font-mono">
        <span class="material-symbols-outlined text-3xl mb-2 opacity-20">notifications_off</span>
        <p class="text-[10px] opacity-50">{{ $t('notifications.empty', 'No tienes notificaciones') }}</p>
      </div>

      <div 
        v-for="item in store.items" 
        :key="item._id" 
        class="notification-item"
        :class="{ 'unread': !item.isRead }"
        @click="handleNotificationClick(item)"
      >
        <div class="notification-icon" :class="item.type">
          <span class="material-symbols-outlined text-sm">
            {{ getIcon(item.type) }}
          </span>
        </div>
        <div class="notification-content">
          <div class="notification-title font-mono">{{ item.title }}</div>
          <div class="notification-message">{{ item.message }}</div>
          <div class="notification-time font-mono">{{ formatTime(item.createdAt) }}</div>
        </div>
        <div class="notification-actions">
          <button @click.stop="toggleReadStatus(item)" class="action-btn" :title="item.isRead ? 'Marcar como no leída' : 'Marcar como leída'">
            <span class="material-symbols-outlined text-sm">
              {{ item.isRead ? 'mark_email_unread' : 'mark_email_read' }}
            </span>
          </button>
          <div v-if="!item.isRead" class="unread-dot"></div>
        </div>
      </div>
    </div>

    <div class="dropdown-footer">
      <router-link to="/app/notifications" class="view-all-link font-mono uppercase">
        {{ $t('notifications.view_all', 'Ver todas') }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'NotificationDropdown',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const store = useNotificationsStore()
    const router = useRouter()

    const close = () => {
      emit('close')
    }

    const getIcon = (type: string) => {
      switch (type) {
        case 'success': return 'check_circle'
        case 'warning': return 'warning'
        case 'error': return 'error'
        default: return 'info'
      }
    }

    const formatTime = (dateStr: string) => {
      const date = new Date(dateStr)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      if (isToday) return `hoy · ${time}`
      return date.toLocaleDateString() + ' · ' + time
    }

    const handleNotificationClick = async (item: any) => {
      if (!item.isRead) {
        await store.markAsRead(item._id)
      }
      if (item.link) {
        router.push(item.link)
      }
      close()
    }

    const toggleReadStatus = async (item: any) => {
      if (item.isRead) {
        await store.markAsUnread(item._id)
      } else {
        await store.markAsRead(item._id)
      }
    }

    onMounted(() => {
      console.log('NotificationDropdown mounted, fetching items...')
      store.fetchAll()
    })

    return {
      store,
      close,
      getIcon,
      formatTime,
      handleNotificationClick,
      toggleReadStatus
    }
  }
})
</script>

<style scoped>
.notification-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 320px;
  max-width: calc(100vw - 16px);
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  z-index: 100;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mark-all-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 9px;
  cursor: pointer;
  padding: 0;
}

.mark-all-btn:hover {
  text-decoration: underline;
}

.dropdown-body {
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.notification-item {
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  position: relative;
}

.notification-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.notification-item.unread {
  background-color: rgba(var(--color-primary-rgb), 0.03);
}

.notification-icon {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.notification-icon.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.notification-icon.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.notification-icon.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 2px;
  color: var(--color-text-base);
}

.notification-message {
  font-size: 10px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 8px;
  color: var(--color-text-disabled);
  text-transform: uppercase;
}

.notification-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
}

.notification-item:hover .action-btn {
  opacity: 1;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-base);
}

.unread-dot {
  width: 6px;
  height: 6px;
  background-color: var(--color-primary);
  border-radius: 50%;
  flex-shrink: 0;
}

.dropdown-footer {
  padding: 10px;
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.view-all-link {
  font-size: 10px;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: var(--color-primary);
}

.skeleton-loader {
  width: 100%;
  height: 60px;
  background: linear-gradient(90deg, var(--color-bg-base) 25%, var(--color-border) 50%, var(--color-bg-base) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  margin-bottom: 8px;
  border-radius: 4px;
}

@keyframes loading {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-disabled);
}
</style>
