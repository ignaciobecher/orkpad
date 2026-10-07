<template>
  <div class="admin-users-page">
    <header class="page-header">
      <h1 class="page-title">Usuarios del Sistema</h1>
      <span class="user-count">{{ usersData.total }} usuarios</span>
      <div class="header-actions">
        <button class="header-btn" @click="openAnnouncementModal">
          <span class="material-symbols-outlined btn-icon">notifications_active</span>
          Nuevo Anuncio
        </button>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <span class="material-symbols-outlined spinning">sync</span>
      Cargando...
    </div>

    <div v-else-if="usersData.data.length === 0" class="empty-state">
      <span class="material-symbols-outlined empty-icon">group_remove</span>
      <p>No hay usuarios registrados</p>
    </div>

    <div v-else class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Workspace</th>
            <th>Rol</th>
            <th>Último Login</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usersData.data" :key="user._id">
            <td class="user-name">{{ user.name }}</td>
            <td class="user-email">{{ user.email }}</td>
            <td class="user-workspace">
              <span v-if="user.workspaceId" class="workspace-badge">
                {{ user.workspaceId.slice(-8) }}
              </span>
              <span v-else class="no-workspace">-</span>
            </td>
            <td>
              <span class="role-badge" :class="getRoleClass(user)">
                {{ getRoleLabel(user) }}
              </span>
            </td>
            <td class="user-date">{{ formatDateTime(user.lastLogin) }}</td>
            <td class="user-date">{{ formatDate(user.createdAt) }}</td>
            <td>
              <button
                class="followup-btn"
                :class="{ 'followup-btn--sent': sentIds.has(user._id), 'followup-btn--loading': sendingId === user._id }"
                :disabled="sendingId === user._id || sentIds.has(user._id)"
                @click="sendFollowUp(user._id)"
              >
                <span v-if="sendingId === user._id" class="material-symbols-outlined spinning btn-icon">sync</span>
                <span v-else-if="sentIds.has(user._id)" class="material-symbols-outlined btn-icon">check</span>
                <span v-else class="material-symbols-outlined btn-icon">forward_to_inbox</span>
                {{ sentIds.has(user._id) ? 'Enviado' : 'Seguimiento' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AnnouncementComposerModal
      v-if="announcementModalOpen"
      :total-users="usersData.total"
      @close="closeAnnouncementModal"
    />

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usersApi } from '@/api/users/users.api'
import { useAuthStore } from '@/stores/auth.store'
import { isAdminUser } from '@/utils/admin'
import AnnouncementComposerModal from '@/components/notifications/AnnouncementComposerModal.vue'
import type { User, PaginatedResponse } from '@/api/users/users.types'

export default defineComponent({
  name: 'AdminUsersPage',
  components: { AnnouncementComposerModal },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const loading = ref(true)
    const usersData = ref<PaginatedResponse<User>>({ data: [], total: 0, page: 1, limit: 20 })
    const sendingId = ref<string | null>(null)
    const sentIds = ref<Set<string>>(new Set())
    const announcementModalOpen = ref(false)


    const isAdmin = () => isAdminUser(authStore.user?._id)

    const loadUsers = async () => {
      if (!authStore.user) {
        setTimeout(loadUsers, 500)
        return
      }
      if (!isAdmin()) {
        router.push('/app/dashboard')
        return
      }
      loading.value = true
      try {
        const { data } = await usersApi.getAllAdmin({ limit: 100 })
        usersData.value = data
      } catch (err) {
        console.error('Error loading users:', err)
        router.push('/app/dashboard')
      } finally {
        loading.value = false
      }
    }

    const getRoleClass = (user: User) => {
      if (isAdminUser(user._id)) return 'role-admin'
      if (user.role === 'owner') return 'role-owner'
      return 'role-member'
    }

    const getRoleLabel = (user: User) => {
      if (isAdminUser(user._id)) return 'Admin'
      if (user.role === 'owner') return 'Owner'
      return 'Member'
    }

    const formatDate = (iso: string) => {
      return new Date(iso).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      })
    }

    const formatDateTime = (iso?: string) => {
      if (!iso) return 'Nunca';
      return new Date(iso).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      watch(
        () => authStore.user,
        (user) => {
          if (user) {
            loadUsers()
          }
        },
        { immediate: true }
      )
    })

    const sendFollowUp = async (userId: string) => {
      sendingId.value = userId
      try {
        await usersApi.sendFollowUp(userId)
        sentIds.value = new Set([...sentIds.value, userId])
      } catch (err) {
        console.error('Error sending follow-up:', err)
      } finally {
        sendingId.value = null
      }
    }

    const openAnnouncementModal = () => {
      announcementModalOpen.value = true
    }

    const closeAnnouncementModal = () => {
      announcementModalOpen.value = false
    }

    return {
      loading,
      usersData,
      sendingId,
      sentIds,
      sendFollowUp,
      getRoleClass,
      getRoleLabel,
      formatDate,
      formatDateTime,
      authStore,
      announcementModalOpen,
      openAnnouncementModal,
      closeAnnouncementModal,
    }
  },
})
</script>

<style scoped>
.admin-users-page {
  padding: 24px 32px;
  max-width: 1200px;
}


.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
}

.user-count {
  font-size: 14px;
  color: var(--color-text-muted);
  background: var(--color-bg-surface-highest);
  padding: 4px 12px;
  border-radius: 12px;
}

.header-actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.header-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 12px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid var(--color-primary);
  background: rgba(91, 78, 255, 0.1);
  color: var(--color-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.header-btn:hover {
  background: var(--color-primary);
  color: #fff;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px;
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 48px;
  opacity: 0.3;
}

.spinning {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.users-table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.users-table th,
.users-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.users-table th {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  background: var(--color-bg-surface);
}

.users-table td {
  color: var(--color-text-base);
}

.user-name {
  font-weight: 500;
}

.user-email {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 13px;
}

.workspace-badge {
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 2px 8px;
  background: var(--color-bg-surface-highest);
  border-radius: 4px;
  color: var(--color-text-muted);
}

.no-workspace {
  color: var(--color-text-muted);
}

.role-badge {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.role-admin {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-error);
}

.role-owner {
  background: rgba(91, 78, 255, 0.15);
  color: var(--color-primary);
}

.role-member {
  background: var(--color-bg-surface-highest);
  color: var(--color-text-muted);
}

.user-date {
  color: var(--color-text-muted);
  font-size: 13px;
}

.followup-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, opacity 0.15s;
  white-space: nowrap;
}

.followup-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: #fff;
}

.followup-btn--sent {
  border-color: var(--color-text-muted);
  color: var(--color-text-muted);
  cursor: default;
}

.followup-btn--loading {
  opacity: 0.6;
  cursor: default;
}

.btn-icon {
  font-size: 16px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 28px 28px 0;
}

.modal-label {
  margin: 0 0 4px 0;
  font-size: 10px;
  color: var(--color-primary);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-base);
}

.modal-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.modal-close:hover {
  color: var(--color-text-base);
}

.modal-body {
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-label {
  margin: 0 0 10px 0;
  font-size: 10px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.template-item {
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.template-item:hover {
  border-color: var(--color-primary);
}

.template-item--selected {
  border-color: var(--color-primary);
  background: rgba(91, 78, 255, 0.06);
}

.template-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-base);
}

.template-check {
  font-size: 18px;
  color: var(--color-primary);
}

.template-desc {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.template-subject {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

/* Preview */
.preview-box {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.preview-meta {
  padding: 12px 16px;
  background: var(--color-bg-surface-highest);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-meta-row {
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.preview-meta-key {
  color: var(--color-text-base);
  margin-right: 6px;
}

.preview-content {
  padding: 20px;
  background: #11111a;
}

.preview-label-tag {
  font-size: 10px;
  color: #5b4eff;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  margin-bottom: 8px;
}

.preview-headline {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 700;
  color: #e2e2f0;
  line-height: 1.3;
}

.preview-body {
  margin: 0 0 14px 0;
  font-size: 13px;
  color: #7b7b99;
  line-height: 1.65;
}

.preview-bullets {
  background: #0d0d16;
  border: 1px solid #1d1d2e;
  padding: 14px 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-bullet {
  margin: 0;
  font-size: 12px;
  color: #e2e2f0;
  line-height: 1.5;
}

.bullet-arrow {
  color: #5b4eff;
  font-family: 'Courier New', monospace;
  margin-right: 8px;
}

.preview-cta {
  display: inline-block;
  background: #5b4eff;
  color: #fff;
  padding: 10px 22px;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}

/* Footer */
.modal-footer {
  padding: 16px 28px 24px;
  border-top: 1px solid var(--color-border);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  padding: 9px 18px;
  font-size: 13px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.cancel-btn:hover:not(:disabled) {
  border-color: var(--color-text-muted);
  color: var(--color-text-base);
}

.send-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  font-size: 13px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.send-result {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-success, #10b981);
  font-weight: 500;
}

.result-icon {
  font-size: 20px;
}
</style>
