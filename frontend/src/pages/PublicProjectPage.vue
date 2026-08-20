<template>
  <div class="public-project-page" v-if="project">
    <nav class="public-nav">
      <div class="nav-container">
        <div class="brand">
          <span class="material-symbols-outlined logo-icon">deployed_code</span>
          <span class="brand-name">Orkpad</span>
        </div>
        <div class="nav-actions">
          <w-button variant="secondary" size="sm" @click="openTaskModal">
            <span class="material-symbols-outlined mr-2">add_task</span>
            Nueva Tarea
          </w-button>
        </div>
      </div>
    </nav>

    <main class="content-container">
      <header class="project-header">
        <div class="header-main">
          <div class="badge-row">
            <w-badge :color="getStatusColor(project.status)">{{
              project.status.toUpperCase()
            }}</w-badge>
            <span class="project-id">#{{ project.id?.substring(project.id.length - 6) }}</span>
          </div>
          <h1 class="project-title">{{ project.name }}</h1>
          <p class="project-description">{{ project.description }}</p>
        </div>

        <div class="header-stats">
          <div class="stat-card">
            <span class="stat-label">Progreso</span>
            <div class="progress-wrapper">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
              </div>
              <span class="stat-value">{{ progressPercentage }}%</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-label">Presupuesto</span>
            <span class="stat-value">{{ formatCurrency(project.budget, project.currency) }}</span>
          </div>
        </div>
      </header>

      <div class="grid-layout">
        <!-- Tareas -->
        <section class="grid-section tasks-section">
          <div class="section-header">
            <h2 class="section-title">Tareas y Avances</h2>
            <div class="task-filters">
              <span class="stat-pill">{{ project.taskStats?.done || 0 }} Completadas</span>
              <span class="stat-pill">{{ project.taskStats?.todo || 0 }} Pendientes</span>
            </div>
          </div>

          <w-card class="no-padding overflow-hidden">
            <w-table
              :headers="taskHeaders"
              :items="project.tasks"
              :empty-message="'No hay tareas registradas'"
            >
              <template #item-title="{ item }">
                <span class="task-title-clickable" @click="openTaskDetails(item)">{{
                  item.title
                }}</span>
              </template>
              <template #item-status="{ item }">
                <w-badge :color="getTaskStatusColor(item.status)">{{ item.status }}</w-badge>
              </template>
              <template #item-dueDate="{ item }">
                <span :class="{ 'text-error': isOverdue(item.dueDate) }">
                  {{ formatDate(item.dueDate) }}
                </span>
              </template>
            </w-table>
          </w-card>
        </section>

        <aside class="grid-sidebar">
          <!-- Pagos -->
          <section class="sidebar-section">
            <h3 class="sidebar-title">Estado de Pagos</h3>
            <w-card>
              <div class="invoice-summary">
                <div class="summary-item">
                  <span>Pagado</span>
                  <span class="val-success">{{
                    formatCurrency(project.invoiceStats?.paid, project.currency)
                  }}</span>
                </div>
                <div class="summary-item">
                  <span>Pendiente</span>
                  <span class="val-warning">{{
                    formatCurrency(project.invoiceStats?.pending, project.currency)
                  }}</span>
                </div>
              </div>
              <div class="invoice-list mt-4">
                <div v-for="inv in project.invoices" :key="inv.id" class="invoice-item">
                  <div class="inv-info">
                    <span class="inv-number">{{ inv.number }}</span>
                    <span class="inv-date">{{ formatDate(inv.issueDate) }}</span>
                  </div>
                  <div class="inv-amount">
                    <span>{{ formatCurrency(inv.total, project.currency) }}</span>
                    <w-badge size="sm" :color="getInvoiceStatusColor(inv.status)">{{
                      inv.status
                    }}</w-badge>
                  </div>
                </div>
              </div>
            </w-card>
          </section>

          <!-- Documentos -->
          <section class="sidebar-section">
            <h3 class="sidebar-title">Documentación</h3>
            <w-card>
              <div
                v-if="!project.documents || project.documents.length === 0"
                class="text-muted text-sm"
              >
                No hay documentos compartidos.
              </div>
              <div v-else class="doc-list">
                <div v-for="doc in project.documents" :key="doc.id" class="doc-item">
                  <span class="material-symbols-outlined doc-icon">description</span>
                  <div class="doc-info">
                    <span class="doc-title">{{ doc.title }}</span>
                    <span class="doc-meta">{{ formatDate(doc.createdAt) }}</span>
                  </div>
                  <a v-if="doc.url" :href="doc.url" target="_blank" class="download-link">
                    <span class="material-symbols-outlined download-icon">download</span>
                  </a>
                </div>
              </div>
            </w-card>
          </section>

          <!-- Chat con el equipo -->
          <section class="sidebar-section chat-section">
            <h3 class="sidebar-title">
              <span class="material-symbols-outlined chat-title-icon">chat</span>
              Chat con el equipo
            </h3>
            <div class="inline-chat">
              <!-- Mensajes -->
              <div class="inline-chat__messages" ref="chatMessages">
                <div v-if="chatLoading" class="chat-loading">
                  <div class="chat-spinner"></div>
                </div>
                <template v-else>
                  <div v-if="chatMessageList.length === 0" class="chat-empty">
                    <span class="material-symbols-outlined">waving_hand</span>
                    <p>¡Hola! ¿En qué podemos ayudarte?</p>
                  </div>
                  <div
                    v-for="msg in chatMessageList"
                    :key="msg._id"
                    :class="[
                      'chat-msg',
                      msg.senderType === 'client' ? 'chat-msg--client' : 'chat-msg--admin',
                    ]"
                  >
                    <div class="chat-bubble">{{ msg.content }}</div>
                    <span class="chat-msg-time">{{ formatMsgTime(msg.createdAt) }}</span>
                  </div>
                </template>
              </div>

              <!-- Input -->
              <form class="inline-chat__input" @submit.prevent="sendChatMessage">
                <input
                  v-model="chatInput"
                  class="chat-input"
                  placeholder="Escribí tu mensaje..."
                  :disabled="chatSending"
                  ref="chatInputRef"
                  @keydown.enter.exact.prevent="sendChatMessage"
                />
                <button
                  type="submit"
                  class="chat-send-btn"
                  :disabled="!chatInput.trim() || chatSending"
                >
                  <span class="material-symbols-outlined">send</span>
                </button>
              </form>
            </div>
          </section>
        </aside>
      </div>
    </main>

    <!-- Modal Nueva Tarea -->
    <transition name="fade">
      <div v-if="showTaskModal" class="modal-overlay" @click.self="showTaskModal = false">
        <div class="modal-content">
          <header class="modal-header">
            <h3>Nueva Tarea / Requerimiento</h3>
            <button @click="showTaskModal = false" class="close-btn">
              <span class="material-symbols-outlined">close</span>
            </button>
          </header>
          <form @submit.prevent="submitTask" class="modal-body">
            <div class="form-group">
              <label>Título</label>
              <input
                v-model="newTask.title"
                type="text"
                placeholder="Ej: Revisar diseño de la home"
                required
              />
            </div>
            <div class="form-group">
              <label>Descripción (Opcional)</label>
              <textarea
                v-model="newTask.description"
                rows="4"
                placeholder="Describe los detalles de tu solicitud..."
              ></textarea>
            </div>
            <div class="modal-footer">
              <w-button type="button" variant="secondary" @click="showTaskModal = false"
                >Cancelar</w-button
              >
              <w-button type="submit" variant="primary" :loading="submitting"
                >Enviar Solicitud</w-button
              >
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Modal Detalles Tarea (Readonly) -->
    <transition name="fade">
      <div
        v-if="showTaskDetailsModal"
        class="modal-overlay"
        @click.self="showTaskDetailsModal = false"
      >
        <div class="modal-content">
          <header class="modal-header">
            <h3>Detalles de la Tarea</h3>
            <button @click="showTaskDetailsModal = false" class="close-btn">
              <span class="material-symbols-outlined">close</span>
            </button>
          </header>
          <div class="modal-body" v-if="selectedTask">
            <div class="task-detail-section">
              <label class="detail-label">Título</label>
              <p class="detail-value">{{ selectedTask.title }}</p>
            </div>
            <div class="task-detail-section" v-if="selectedTask.description">
              <label class="detail-label">Descripción</label>
              <p class="detail-value description-text">{{ stripHtml(selectedTask.description) }}</p>
            </div>
            <div class="task-detail-row">
              <div class="task-detail-section">
                <label class="detail-label">Estado</label>
                <w-badge :color="getTaskStatusColor(selectedTask.status)">{{
                  selectedTask.status
                }}</w-badge>
              </div>
              <div class="task-detail-section" v-if="selectedTask.dueDate">
                <label class="detail-label">Fecha Límite</label>
                <p class="detail-value" :class="{ 'text-error': isOverdue(selectedTask.dueDate) }">
                  {{ formatDate(selectedTask.dueDate) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>

  <!-- Private link login screen -->
  <div v-else-if="requiresAuth" class="auth-screen">
    <div class="auth-card">
      <div class="auth-brand">
        <span class="material-symbols-outlined" style="font-size: 32px; color: var(--color-primary)"
          >deployed_code</span
        >
        <span class="auth-brand-name">Orkpad</span>
      </div>
      <div class="auth-lock-icon">
        <span class="material-symbols-outlined">lock</span>
      </div>
      <h1 class="auth-title">Enlace privado</h1>
      <p class="auth-desc">
        Este proyecto requiere autenticación. Ingresá tus credenciales para continuar.
      </p>
      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="auth-field">
          <label>Usuario</label>
          <input
            v-model="loginForm.username"
            type="text"
            placeholder="usuario"
            autocomplete="username"
            required
          />
        </div>
        <div class="auth-field">
          <label>Contraseña</label>
          <input
            v-model="loginForm.password"
            type="password"
            placeholder="contraseña"
            autocomplete="current-password"
            required
          />
        </div>
        <p v-if="loginError" class="auth-error">{{ loginError }}</p>
        <w-button
          type="submit"
          variant="primary"
          :loading="loginLoading"
          style="width: 100%; justify-content: center"
        >
          Ingresar
        </w-button>
      </form>
    </div>
  </div>

  <div v-else-if="loading" class="loading-state">
    <div class="loader"></div>
    <p>Cargando proyecto...</p>
  </div>

  <div v-else-if="linkExpired" class="error-state">
    <span class="material-symbols-outlined error-icon" style="color: var(--color-warning)"
      >schedule</span
    >
    <h1>Enlace expirado</h1>
    <p>Este enlace de seguimiento ha expirado. Por favor, solicita uno nuevo al equipo.</p>
  </div>

  <div v-else class="error-state">
    <span class="material-symbols-outlined error-icon">link_off</span>
    <h1>Enlace Inválido</h1>
    <p>Este enlace de seguimiento ha expirado o no es válido. Por favor, solicita uno nuevo.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue'
import { io, Socket } from 'socket.io-client'
import { projectsApi } from '@/api/projects/projects.api'
import { messagingApi } from '@/api/messaging/messaging.api'
import { useToast } from '@/composables/useToast'
import WButton from '@/components/ui/WButton.vue'
import WCard from '@/components/ui/WCard.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WTable from '@/components/ui/WTable.vue'
import type { Message } from '@/api/messaging/messaging.types'

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'
let chatSocket: Socket | null = null

export default defineComponent({
  name: 'PublicProjectPage',
  components: { WButton, WCard, WBadge, WTable },
  data() {
    return {
      project: null as any,
      loading: true,
      requiresAuth: false,
      linkExpired: false,
      loginLoading: false,
      loginError: '',
      loginForm: { username: '', password: '' },
      showTaskModal: false,
      showTaskDetailsModal: false,
      selectedTask: null,
      submitting: false,
      newTask: {
        title: '',
        description: '',
      },
      taskHeaders: [
        { key: 'title', label: 'Tarea' },
        { key: 'status', label: 'Estado', width: '120px' },
        { key: 'dueDate', label: 'Fecha Límite', width: '150px' },
      ],
      // Chat inline
      chatInput: '',
      chatSending: false,
      chatLoading: false,
      chatMessageList: [] as Message[],
      chatConversationId: null as string | null,
    }
  },
  computed: {
    token() {
      return this.$route.params.token as string
    },
    progressPercentage() {
      if (!this.project || !this.project.taskStats || this.project.taskStats.total === 0) return 0
      return Math.round((this.project.taskStats.done / this.project.taskStats.total) * 100)
    },
  },
  methods: {
    getLinkAccessToken(): string | null {
      return sessionStorage.getItem(`link_token_${this.token}`)
    },
    saveLinkAccessToken(accessToken: string) {
      sessionStorage.setItem(`link_token_${this.token}`, accessToken)
    },
    clearLinkAccessToken() {
      sessionStorage.removeItem(`link_token_${this.token}`)
    },
    async fetchProject() {
      this.loading = true
      this.requiresAuth = false
      this.linkExpired = false
      try {
        const accessToken = this.getLinkAccessToken()
        const { data } = await projectsApi.getPublicView(this.token, accessToken ?? undefined)
        this.project = data
      } catch (err: any) {
        const status = err.response?.status
        if (status === 401) {
          this.clearLinkAccessToken()
          this.requiresAuth = true
        } else if (status === 410) {
          this.linkExpired = true
        } else {
          console.error(err)
        }
      } finally {
        this.loading = false
      }
    },
    async handleLogin() {
      if (!this.loginForm.username || !this.loginForm.password) return
      this.loginLoading = true
      this.loginError = ''
      try {
        const { data } = await projectsApi.authLink(this.token, this.loginForm)
        this.saveLinkAccessToken(data.accessToken)
        this.requiresAuth = false
        this.loginForm = { username: '', password: '' }
        await this.fetchProject()
        await nextTick()
        this.initChat()
      } catch (err: any) {
        const status = err.response?.status
        if (status === 429) {
          this.loginError = err.response?.data?.message || 'Demasiados intentos. Intenta más tarde.'
        } else {
          this.loginError = 'Usuario o contraseña incorrectos'
        }
      } finally {
        this.loginLoading = false
      }
    },
    async submitTask() {
      if (!this.newTask.title) return
      this.submitting = true
      try {
        const accessToken = this.getLinkAccessToken()
        await projectsApi.createPublicTask(this.token, this.newTask, accessToken ?? undefined)
        useToast().success('Tarea enviada correctamente')
        this.showTaskModal = false
        this.newTask = { title: '', description: '' }
        await this.fetchProject()
      } catch {
        useToast().error('Error al enviar la tarea')
      } finally {
        this.submitting = false
      }
    },
    openTaskModal() {
      this.showTaskModal = true
    },
    openTaskDetails(task: any) {
      this.selectedTask = task
      this.showTaskDetailsModal = true
    },
    stripHtml(html: string): string {
      if (!html) return ''
      return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim()
    },
    getStatusColor(status: string) {
      switch (status) {
        case 'active':
          return 'var(--color-primary)'
        case 'completed':
          return 'var(--color-success)'
        case 'on-hold':
          return 'var(--color-warning)'
        default:
          return 'var(--color-text-muted)'
      }
    },
    getTaskStatusColor(status: string) {
      switch (status) {
        case 'done':
          return 'var(--color-success)'
        case 'in-progress':
          return 'var(--color-primary)'
        case 'todo':
          return 'var(--color-text-muted)'
        case 'cancelled':
          return 'var(--color-error)'
        default:
          return 'var(--color-text-muted)'
      }
    },
    getInvoiceStatusColor(status: string) {
      switch (status) {
        case 'paid':
        case 'collected':
          return 'var(--color-success)'
        case 'pending':
        case 'sent':
          return 'var(--color-warning)'
        case 'overdue':
          return 'var(--color-error)'
        default:
          return 'var(--color-text-muted)'
      }
    },
    formatDate(date: string) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString()
    },
    formatCurrency(amount: number, currency: string) {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency || 'USD',
      }).format(amount || 0)
    },
    isOverdue(date: string) {
      if (!date) return false
      return new Date(date) < new Date()
    },

    // ─── Chat inline ──────────────────────────────────────────────────
    async initChat() {
      this.chatLoading = true
      try {
        const { data } = await messagingApi.getOrCreatePublicConversation(this.token)
        this.chatConversationId = data.conversation._id as string
        const msgs = await messagingApi.getPublicMessages(this.token, { limit: 100 })
        this.chatMessageList = [...msgs.data.data].reverse()
        this.connectChatSocket()
        await nextTick()
        this.scrollChat()
      } catch (err) {
        // Si el proyecto no tiene cliente, el chat simplemente no carga
        console.warn('Chat no disponible para este proyecto', err)
      } finally {
        this.chatLoading = false
      }
    },

    connectChatSocket() {
      if (chatSocket?.connected) return
      chatSocket = io(`${SOCKET_URL}/messaging`, {
        auth: { type: 'client', publicToken: this.token },
        transports: ['websocket', 'polling'],
        reconnection: true,
      })
      chatSocket.on('new-message', (msg: Message) => {
        const exists = this.chatMessageList.some((m) => m._id === msg._id)
        if (!exists) {
          this.chatMessageList.push(msg)
          nextTick(() => this.scrollChat())
        }
      })
    },

    async sendChatMessage() {
      const content = this.chatInput.trim()
      if (!content) return
      this.chatInput = ''
      this.chatSending = true
      try {
        if (chatSocket?.connected) {
          chatSocket.emit('client:send-message', { content })
        } else {
          const { data } = await messagingApi.sendClientMessage(this.token, { content })
          const exists = this.chatMessageList.some((m) => m._id === data._id)
          if (!exists) this.chatMessageList.push(data)
        }
        await nextTick()
        this.scrollChat()
      } catch {
        useToast().error('Error al enviar el mensaje')
      } finally {
        this.chatSending = false
      }
    },

    scrollChat() {
      const el = this.$refs.chatMessages as HTMLElement
      if (el) el.scrollTop = el.scrollHeight
    },

    formatMsgTime(dateStr: string): string {
      return new Date(dateStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    },
  },
  async mounted() {
    await this.fetchProject()
    document.title = 'Seguimiento de Proyecto | Orkpad'
    // Chat se inicia solo si el proyecto tiene cliente asignado
    this.initChat()
  },
  beforeUnmount() {
    chatSocket?.disconnect()
    chatSocket = null
  },
})
</script>

<style scoped>
.public-project-page {
  min-height: 100vh;
  background-color: var(--color-bg-base);
  color: var(--color-text-base);
  font-family: var(--font-body);
}

.public-nav {
  height: 64px;
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
  color: var(--color-primary);
}

.brand-name {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.5px;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 48px;
  gap: 32px;
}

.badge-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.project-id {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
}

.project-title {
  font-size: 42px;
  font-weight: 800;
  margin: 0 0 16px 0;
  line-height: 1.1;
}

.project-description {
  font-size: 18px;
  color: var(--color-text-muted);
  max-width: 600px;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 24px;
}

.stat-card {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 20px 24px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.stat-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-text-muted);
  font-weight: 600;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  font-family: var(--font-mono);
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex-grow: 1;
  height: 8px;
  background-color: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), #a855f7);
  transition: width 1s ease-out;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.stat-pill {
  font-size: 12px;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 4px 12px;
  border-radius: 20px;
  color: var(--color-text-muted);
  margin-left: 8px;
}

.grid-sidebar {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.invoice-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.val-success {
  color: var(--color-success);
  font-weight: 700;
}
.val-warning {
  color: var(--color-warning);
  font-weight: 700;
}

.invoice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid var(--color-border);
}

.inv-info {
  display: flex;
  flex-direction: column;
}

.inv-number {
  font-size: 13px;
  font-weight: 600;
}
.inv-date {
  font-size: 11px;
  color: var(--color-text-muted);
}

.inv-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.inv-amount span {
  font-family: var(--font-mono);
  font-size: 13px;
}

.doc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.doc-item:hover {
  border-color: var(--color-primary);
  transform: translateX(4px);
}

.doc-icon {
  color: var(--color-primary);
}

.doc-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.doc-title {
  font-size: 13px;
  font-weight: 600;
}
.doc-meta {
  font-size: 11px;
  color: var(--color-text-muted);
}

.download-icon {
  font-size: 18px;
  color: var(--color-text-muted);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-bg-surface);
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.form-group input,
.form-group textarea {
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-border);
  padding: 12px;
  border-radius: 8px;
  color: var(--color-text-base);
  outline: none;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--color-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.loading-state,
.error-state {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  text-align: center;
  padding: 24px;
}

.error-icon {
  font-size: 64px;
  color: var(--color-error);
}
.loader {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-bottom-color: var(--color-primary);
  border-radius: 50%;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.text-error {
  color: var(--color-error);
}
.task-title-clickable {
  cursor: pointer;
  color: var(--color-primary);
  font-weight: 500;
}
.task-title-clickable:hover {
  text-decoration: underline;
}
.task-detail-section {
  margin-bottom: 20px;
}
.task-detail-row {
  display: flex;
  gap: 24px;
}
.task-detail-row .task-detail-section {
  flex: 1;
}
.detail-label {
  display: block;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
  margin-bottom: 6px;
  font-weight: 600;
}
.detail-value {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
}
.description-text {
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-text-muted);
  background: var(--color-bg-base);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  font-size: 14px;
  line-height: 1.6;
}
.mt-4 {
  margin-top: 16px;
}
.mr-2 {
  margin-right: 8px;
}
.no-padding {
  padding: 0 !important;
}
.overflow-hidden {
  overflow: hidden;
}

@media (max-width: 1024px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
  .project-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .project-title {
    font-size: 32px;
  }
  .header-stats {
    flex-direction: column;
    width: 100%;
  }
  .stat-card {
    width: 100%;
  }
}

/* ─── Chat Inline ──────────────────────────────────────────────── */
.chat-section .sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.chat-title-icon {
  font-size: 18px;
  color: var(--color-primary);
}

.inline-chat {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.inline-chat__messages {
  height: 320px;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scroll-behavior: smooth;
}

.chat-loading,
.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--color-text-muted);
  text-align: center;
  height: 100%;
}
.chat-empty .material-symbols-outlined {
  font-size: 28px;
  opacity: 0.5;
}
.chat-empty p {
  font-size: 13px;
  margin: 0;
}

.chat-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-border);
  border-bottom-color: var(--color-primary);
  border-radius: 50%;
  animation: rotation 0.8s linear infinite;
}

.chat-msg {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.chat-msg--client {
  align-items: flex-end;
}
.chat-msg--admin {
  align-items: flex-start;
}

.chat-bubble {
  max-width: 85%;
  padding: 9px 13px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}
.chat-msg--client .chat-bubble {
  background: var(--color-primary);
  color: white;
  border-bottom-right-radius: 3px;
}
.chat-msg--admin .chat-bubble {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  border-bottom-left-radius: 3px;
}
.chat-msg-time {
  font-size: 10px;
  color: var(--color-text-muted);
  padding: 0 2px;
}

.inline-chat__input {
  padding: 10px 12px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 8px;
  background: var(--color-bg-base);
}
.chat-input {
  flex: 1;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 9px 12px;
  color: var(--color-text-base);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}
.chat-input:focus {
  border-color: var(--color-primary);
}
.chat-input::placeholder {
  color: var(--color-text-muted);
}
.chat-input:disabled {
  opacity: 0.5;
}
.chat-send-btn {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: var(--color-primary);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.15s;
}
.chat-send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.chat-send-btn .material-symbols-outlined {
  font-size: 18px;
}

/* ─── Auth screen ───────────────────────────────────────────────── */
.auth-screen {
  min-height: 100vh;
  background-color: var(--color-bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.auth-brand-name {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 18px;
}

.auth-lock-icon {
  width: 56px;
  height: 56px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0;
}

.auth-lock-icon .material-symbols-outlined {
  font-size: 28px;
  color: var(--color-text-muted);
}

.auth-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  text-align: center;
}

.auth-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  text-align: center;
  margin: 0 0 8px;
  line-height: 1.5;
}

.auth-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 8px;
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auth-field label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.auth-field input {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px 14px;
  color: var(--color-text-base);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.auth-field input:focus {
  border-color: var(--color-primary);
}

.auth-error {
  font-size: 13px;
  color: var(--color-error);
  margin: 0;
  text-align: center;
}
</style>
