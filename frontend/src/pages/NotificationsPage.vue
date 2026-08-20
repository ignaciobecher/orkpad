<template>
  <div class="notifications-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ $t('notifications.page_title', 'Notificaciones') }}</h1>
        <p class="page-subtitle">{{ $t('notifications.page_subtitle', 'Gestiona tus alertas y actividad del sistema') }}</p>
      </div>
      <div class="header-right">
        <button
          v-if="store.unreadCount > 0"
          @click="store.markAllRead"
          class="btn-secondary"
        >
          {{ $t('notifications.mark_all_read', 'Marcar todo como leído') }}
        </button>
      </div>
    </header>

    <main class="page-content">
      <div class="notifications-card">
        <div v-if="store.loading && store.items.length === 0" class="empty-state">
          <div class="loading-spinner"></div>
          <p class="empty-label">Cargando notificaciones...</p>
        </div>

        <div v-else-if="store.items.length === 0" class="empty-state">
          <span class="material-symbols-outlined empty-icon">notifications_active</span>
          <h3 class="empty-title">Bandeja de entrada limpia</h3>
          <p class="empty-text">No tienes notificaciones por el momento.</p>
        </div>

        <div v-else class="notifications-list">
          <div
            v-for="item in store.items"
            :key="item._id"
            class="notification-row"
            :class="{ 'unread': !item.isRead }"
          >
            <div class="notification-icon-wrap" :class="item.type">
              <span class="material-symbols-outlined">{{ getIcon(item.type) }}</span>
            </div>

            <div class="notification-body">
              <div class="notification-meta">
                <h4 class="notification-title">{{ item.title }}</h4>
                <span class="notification-date">{{ formatFullDate(item.createdAt) }}</span>
              </div>
              <p class="notification-message">{{ item.message }}</p>
              <div class="notification-actions">
                <button
                  v-if="item.link"
                  @click="goToLink(item.link)"
                  class="action-link"
                >
                  Ver detalle
                </button>
                <button
                  v-if="!item.isRead"
                  @click="store.markAsRead(item._id)"
                  class="action-muted"
                >
                  Marcar como leída
                </button>
                <button
                  @click="store.remove(item._id)"
                  class="action-danger"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div v-if="!item.isRead" class="unread-dot"></div>
          </div>
        </div>

        <div v-if="store.total > store.items.length" class="load-more">
          <button @click="loadMore" class="load-more-btn">
            Cargar más
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'NotificationsPage',
  setup() {
    const store = useNotificationsStore()
    const router = useRouter()

    const getIcon = (type: string) => {
      switch (type) {
        case 'success': return 'check_circle'
        case 'warning': return 'warning'
        case 'error': return 'error'
        default: return 'info'
      }
    }

    const formatFullDate = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString() + ' · ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const goToLink = (link: string) => {
      router.push(link)
    }

    const loadMore = () => {
      store.filters.page = (store.filters.page || 1) + 1
      store.fetchAll()
    }

    onMounted(() => {
      store.fetchAll()
    })

    return { store, getIcon, formatFullDate, goToLink, loadMore }
  }
})
</script>

<style scoped>
.notifications-page {
  padding: 32px;
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .notifications-page {
    padding: 16px;
  }
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-shrink: 0;
  gap: 16px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 24px;
  }
}

.page-title {
  font-family: var(--font-body);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
}

.btn-secondary {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-secondary:hover {
  background: var(--color-bg-surface-highest);
  border-color: var(--color-text-disabled);
}

.page-content {
  flex-grow: 1;
  min-width: 0;
}

.notifications-card {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.empty-state {
  padding: 80px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
}

.empty-icon {
  font-size: 48px;
  color: var(--color-text-base);
  opacity: 0.1;
  margin-bottom: 8px;
}

.empty-title {
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-base);
}

.empty-text {
  font-size: 12px;
  color: var(--color-text-muted);
}

.empty-label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  color: var(--color-text-disabled);
}

.notifications-list {
  divide-y: var(--color-border);
}

.notification-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background-color 0.15s ease;
  position: relative;
}

.notification-row:last-child {
  border-bottom: none;
}

.notification-row:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.notification-row:hover .action-danger {
  opacity: 1;
}

.notification-row.unread {
  background-color: rgba(var(--color-primary-rgb), 0.03);
}

.notification-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.notification-icon-wrap.info    { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.notification-icon-wrap.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.notification-icon-wrap.warning { background: rgba(245, 158, 11, 0.1);  color: #f59e0b; }
.notification-icon-wrap.error   { background: rgba(239, 68, 68, 0.1);   color: #ef4444; }

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.notification-title {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-date {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-text-disabled);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  flex-shrink: 0;
}

.notification-message {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-bottom: 10px;
}

.notification-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-link {
  font-family: var(--font-mono);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s ease;
}

.action-link:hover {
  text-decoration: underline;
}

.action-muted {
  font-family: var(--font-mono);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s ease;
}

.action-muted:hover {
  color: var(--color-text-base);
}

.action-danger {
  font-family: var(--font-mono);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-error);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.action-danger:hover {
  opacity: 1 !important;
  text-decoration: underline;
}

.unread-dot {
  width: 7px;
  height: 7px;
  background-color: var(--color-primary);
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

.load-more {
  padding: 14px;
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.load-more-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.load-more-btn:hover {
  color: var(--color-text-base);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
