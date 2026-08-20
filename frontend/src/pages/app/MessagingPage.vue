<template>
  <div :class="['messaging-page', { 'chat-open': activeConversationId }]">
    <!-- Panel izquierdo: Lista de conversaciones -->
    <aside class="conversations-panel">
      <div class="panel-header">
        <h2 class="panel-title">Mensajes</h2>
        <button class="new-conv-btn" @click="showNewConvModal = true" title="Nueva conversación">
          <span class="material-symbols-outlined">edit</span>
        </button>
      </div>

      <div class="search-wrapper">
        <span class="material-symbols-outlined search-icon">search</span>
        <input
          v-model="search"
          class="search-input"
          placeholder="Buscar conversación..."
        />
      </div>

      <div class="conv-list" v-if="!loadingConversations">
        <div
          v-for="conv in filteredConversations"
          :key="conv._id"
          :class="['conv-item', { 'conv-item--active': activeConversationId === conv._id }]"
          @click="selectConversation(conv._id)"
        >
          <div class="conv-avatar">
            <span class="conv-avatar-letter">{{ getClientLetter(conv.clientId) }}</span>
          </div>
          <div class="conv-info">
            <div class="conv-name">{{ getClientName(conv.clientId) }}</div>
            <div class="conv-preview">{{ formatLastMessage(conv) }}</div>
          </div>
          <div class="conv-meta">
            <span v-if="conv.unreadCount > 0" class="unread-badge">{{ conv.unreadCount }}</span>
            <span class="conv-time">{{ formatTime(conv.lastMessageAt) }}</span>
          </div>
        </div>

        <div v-if="filteredConversations.length === 0" class="empty-list">
          <span class="material-symbols-outlined">chat_bubble_outline</span>
          <p>Sin conversaciones</p>
        </div>
      </div>

      <div v-else class="loading-list">
        <div class="spinner"></div>
      </div>
    </aside>

    <!-- Panel derecho: Chat activo -->
    <section class="chat-panel">
      <template v-if="activeConversationId && activeConversation">
        <!-- Header del chat -->
        <div class="chat-header">
          <div class="chat-header-info">
            <button class="back-btn" @click="goBackToList" title="Volver">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <div class="chat-avatar">
              <span class="chat-avatar-letter">{{ getClientLetter(activeConversation.clientId) }}</span>
            </div>
            <div>
              <div class="chat-client-name">{{ getClientName(activeConversation.clientId) }}</div>
              <div class="chat-status">
                <span :class="['status-dot', connected ? 'status-dot--online' : 'status-dot--offline']"></span>
                {{ connected ? 'En línea' : 'Sin conexión' }}
              </div>
            </div>
          </div>
          <div class="chat-header-actions">
            <router-link
              v-if="getClientId(activeConversation.clientId)"
              :to="`/app/clients`"
              class="header-action-btn"
              title="Ver cliente"
            >
              <span class="material-symbols-outlined">person</span>
            </router-link>
          </div>
        </div>

        <!-- Mensajes -->
        <div class="messages-area" ref="messagesArea">
          <div v-if="loadingMessages" class="messages-loading">
            <div class="spinner"></div>
          </div>

          <template v-else>
            <div v-if="activeMessages.length === 0" class="messages-empty">
              <span class="material-symbols-outlined">chat</span>
              <p>No hay mensajes aún. ¡Iniciá la conversación!</p>
            </div>

            <div
              v-for="msg in activeMessages"
              :key="msg._id"
              :class="['message-row', msg.senderType === 'admin' ? 'message-row--admin' : 'message-row--client']"
            >
              <div v-if="msg.senderType === 'client'" class="msg-avatar">
                <span class="msg-avatar-letter">{{ getClientLetter(activeConversation.clientId) }}</span>
              </div>

              <div :class="['message-bubble', msg.senderType === 'admin' ? 'bubble--admin' : 'bubble--client']">
                <p class="bubble-content">{{ msg.content }}</p>
                <span class="bubble-time">
                  {{ formatMessageTime(msg.createdAt) }}
                  <span v-if="msg.senderType === 'admin'" class="material-symbols-outlined read-icon">
                    {{ msg.isRead ? 'done_all' : 'done' }}
                  </span>
                </span>
              </div>
            </div>
          </template>
        </div>

        <!-- Input de mensaje -->
        <div class="message-input-area">
          <textarea
            v-model="newMessage"
            class="message-input"
            placeholder="Escribí un mensaje..."
            rows="1"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.enter.shift.exact="newMessage += '\n'"
            @input="autoResize"
            ref="messageInput"
          ></textarea>
          <button
            class="send-btn"
            :disabled="!newMessage.trim() || sendingMessage"
            @click="sendMessage"
          >
            <span class="material-symbols-outlined">send</span>
          </button>
        </div>
      </template>

      <!-- Estado vacío: ninguna conversación seleccionada -->
      <div v-else class="chat-empty-state">
        <span class="material-symbols-outlined chat-empty-icon">forum</span>
        <h3>Mensajería de Clientes</h3>
        <p>Seleccioná una conversación o iniciá una nueva para comunicarte con tus clientes en tiempo real.</p>
        <button class="btn-primary" @click="showNewConvModal = true">
          <span class="material-symbols-outlined">add</span>
          Nueva conversación
        </button>
      </div>
    </section>

    <!-- Modal: Nueva conversación -->
    <transition name="fade">
      <div v-if="showNewConvModal" class="modal-overlay" @click.self="showNewConvModal = false">
        <div class="modal-box">
          <div class="modal-head">
            <h3>Nueva Conversación</h3>
            <button class="close-btn" @click="showNewConvModal = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-field">
              <label>Cliente</label>
              <select v-model="newConvClientId" class="field-select">
                <option value="">Seleccioná un cliente...</option>
                <option v-for="c in clients" :key="c._id" :value="c._id">{{ c.name }}</option>
              </select>
            </div>
          </div>
          <div class="modal-foot">
            <button class="btn-secondary" @click="showNewConvModal = false">Cancelar</button>
            <button
              class="btn-primary"
              :disabled="!newConvClientId || creatingConversation"
              @click="createNewConversation"
            >
              {{ creatingConversation ? 'Creando...' : 'Iniciar Chat' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useMessagingStore } from '@/stores/messaging.store'
import { useClientsStore } from '@/stores/clients.store'


export default defineComponent({
  name: 'MessagingPage',

  data() {
    return {
      search: '',
      newMessage: '',
      showNewConvModal: false,
      newConvClientId: '',
      creatingConversation: false,
      clientsMap: {} as Record<string, string>, // clientId → name
    }
  },

  computed: {
    ...mapState(useMessagingStore, [
      'conversations',
      'activeConversationId',
      'activeConversation',
      'activeMessages',
      'loadingConversations',
      'loadingMessages',
      'sendingMessage',
      'connected',
    ]),
    ...mapState(useClientsStore, { clients: 'items' }),

    filteredConversations() {
      if (!this.search.trim()) return this.conversations
      const q = this.search.toLowerCase()
      return this.conversations.filter((c) => {
        const name = this.clientsMap[c.clientId] ?? ''
        return name.toLowerCase().includes(q)
      })
    },
  },

  methods: {
    ...mapActions(useMessagingStore, [
      'fetchConversations',
      'selectConversation',
      'sendMessage',
      'createConversation',
      'connectSocket',
    ]),
    ...mapActions(useClientsStore, { fetchClients: 'fetchAll' }),

    getClientName(clientId: string): string {
      return this.clientsMap[clientId] ?? 'Cliente'
    },

    getClientLetter(clientId: string): string {
      return (this.clientsMap[clientId] ?? 'C').charAt(0).toUpperCase()
    },

    getClientId(clientId: string): string {
      return clientId
    },

    formatLastMessage(conv: any): string {
      if (!conv.lastMessageAt) return 'Sin mensajes aún'
      return this.formatTime(conv.lastMessageAt) ?? ''
    },

    formatTime(dateStr: string | null): string {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      const now = new Date()
      const isToday = d.toDateString() === now.toDateString()
      if (isToday) {
        return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      }
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
    },

    formatMessageTime(dateStr: string): string {
      return new Date(dateStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    },

    async sendMessage() {
      const content = this.newMessage.trim()
      if (!content || !this.activeConversationId) return
      this.newMessage = ''
      const ta = this.$refs.messageInput as HTMLTextAreaElement
      if (ta) ta.style.height = 'auto'
      await useMessagingStore().sendMessage(this.activeConversationId, content)
      await nextTick()
      this.scrollToBottom()
    },

    scrollToBottom() {
      const el = this.$refs.messagesArea as HTMLElement
      if (el) el.scrollTop = el.scrollHeight
    },

    autoResize(e: Event) {
      const ta = e.target as HTMLTextAreaElement
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
    },

    async createNewConversation() {
      if (!this.newConvClientId) return
      this.creatingConversation = true
      try {
        await (this as any).createConversation(this.newConvClientId)
        this.showNewConvModal = false
        this.newConvClientId = ''
      } finally {
        this.creatingConversation = false
      }
    },

    goBackToList() {
      useMessagingStore().$patch({ activeConversationId: null })
    },

    buildClientsMap() {
      this.clientsMap = {}
      for (const c of this.clients) {
        this.clientsMap[c._id] = c.name
      }
    },
  },

  watch: {
    clients() {
      this.buildClientsMap()
    },

    activeMessages() {
      nextTick(() => this.scrollToBottom())
    },
  },

  async mounted() {
    await Promise.all([
      this.fetchConversations(),
      this.fetchClients(),
    ])
    this.buildClientsMap()
    this.connectSocket()
  },
})
</script>

<style scoped>
.messaging-page {
  display: flex;
  height: calc(100vh - 64px); /* resta el topbar */
  overflow: hidden;
}

/* ─── Panel izquierdo ─────────────────────────────────────────── */
.conversations-panel {
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-base);
}

.panel-header {
  padding: 20px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: var(--color-text-base);
}

.new-conv-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
}
.new-conv-btn:hover {
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}
.new-conv-btn .material-symbols-outlined { font-size: 20px; }

.search-wrapper {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--color-border);
}
.search-icon { font-size: 18px; color: var(--color-text-muted); }
.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text-base);
  font-size: 13px;
  font-family: var(--font-body);
}
.search-input::placeholder { color: var(--color-text-muted); }

.conv-list {
  flex: 1;
  overflow-y: auto;
}

.conv-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  transition: background 0.15s;
}
.conv-item:hover { background: var(--color-bg-surface); }
.conv-item--active { background: color-mix(in srgb, var(--color-primary) 12%, transparent); }
.conv-item--active .conv-name { color: var(--color-primary); }

.conv-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.conv-avatar-letter {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-primary);
  font-family: var(--font-mono);
}

.conv-info { flex: 1; min-width: 0; }
.conv-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.conv-preview {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.conv-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.conv-time {
  font-size: 10px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  white-space: nowrap;
}
.unread-badge {
  background: var(--color-primary);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  font-family: var(--font-mono);
}

.empty-list {
  padding: 48px 16px;
  text-align: center;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.empty-list .material-symbols-outlined { font-size: 36px; }
.empty-list p { font-size: 13px; margin: 0; }

.loading-list {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ─── Panel derecho: Chat ─────────────────────────────────────── */
.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--color-bg-surface);
}

.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg-base);
  flex-shrink: 0;
}
.chat-header-info { display: flex; align-items: center; gap: 12px; }
.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-avatar-letter {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
  font-family: var(--font-mono);
}
.chat-client-name { font-size: 15px; font-weight: 600; }
.chat-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.status-dot--online { background: var(--color-success); }
.status-dot--offline { background: var(--color-text-muted); }

.chat-header-actions { display: flex; gap: 4px; }
.header-action-btn {
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 4px;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}
.header-action-btn:hover {
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}
.header-action-btn .material-symbols-outlined { font-size: 20px; }

/* ─── Botón volver (solo mobile) ─────────────────────────────── */
.back-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
}
.back-btn:hover {
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}
.back-btn .material-symbols-outlined { font-size: 22px; }

/* ─── Área de mensajes ───────────────────────────────────────── */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.messages-loading, .messages-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--color-text-muted);
}
.messages-empty .material-symbols-outlined { font-size: 40px; }
.messages-empty p { font-size: 14px; margin: 0; }

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.message-row--admin { flex-direction: row-reverse; }

.msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.msg-avatar-letter {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary);
}

.message-bubble {
  max-width: 65%;
  padding: 10px 14px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.bubble--client {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-bottom-left-radius: 2px;
}
.bubble--admin {
  background: var(--color-primary);
  border-bottom-right-radius: 2px;
}
.bubble-content {
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-text-base);
}
.bubble--admin .bubble-content { color: white; }
.bubble-time {
  font-size: 10px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 3px;
  align-self: flex-end;
}
.bubble--admin .bubble-time { color: rgba(255,255,255,0.65); justify-content: flex-end; }
.read-icon { font-size: 13px; }

/* ─── Input de mensaje ───────────────────────────────────────── */
.message-input-area {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: flex-end;
  gap: 10px;
  background: var(--color-bg-base);
  flex-shrink: 0;
}
.message-input {
  flex: 1;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px 14px;
  color: var(--color-text-base);
  font-size: 14px;
  font-family: var(--font-body);
  outline: none;
  resize: none;
  line-height: 1.5;
  min-height: 42px;
  max-height: 120px;
  transition: border-color 0.15s;
}
.message-input:focus { border-color: var(--color-primary); }
.message-input::placeholder { color: var(--color-text-muted); }

.send-btn {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: var(--color-primary);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  transition: opacity 0.15s;
}
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.send-btn .material-symbols-outlined { font-size: 20px; }

/* ─── Estado vacío del chat ──────────────────────────────────── */
.chat-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px;
  text-align: center;
  color: var(--color-text-muted);
}
.chat-empty-icon { font-size: 56px; color: var(--color-primary); opacity: 0.5; }
.chat-empty-state h3 { font-size: 22px; font-weight: 700; color: var(--color-text-base); margin: 0; }
.chat-empty-state p { font-size: 14px; max-width: 360px; margin: 0; line-height: 1.6; }

/* ─── Modal ──────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-box {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0,0,0,0.4);
}
.modal-head {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-head h3 { margin: 0; font-size: 16px; font-weight: 700; }
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  padding: 2px;
}
.modal-body { padding: 24px; }
.modal-foot {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-field { display: flex; flex-direction: column; gap: 8px; }
.form-field label { font-size: 12px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.field-select {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 10px 12px;
  color: var(--color-text-base);
  font-size: 14px;
  font-family: var(--font-body);
  outline: none;
  cursor: pointer;
}
.field-select:focus { border-color: var(--color-primary); }

/* ─── Botones compartidos ────────────────────────────────────── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-body);
  transition: opacity 0.15s;
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary .material-symbols-outlined { font-size: 18px; }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-body);
  transition: background 0.15s, color 0.15s;
}
.btn-secondary:hover { background: var(--color-bg-base); color: var(--color-text-base); }

/* ─── Spinner ────────────────────────────────────────────────── */
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-bottom-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Transición ─────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ─── Responsive ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .conversations-panel { width: 100%; border-right: none; }
  .chat-panel { display: none; }
  .messaging-page.chat-open .conversations-panel { display: none; }
  .messaging-page.chat-open .chat-panel { display: flex; width: 100%; }
  .back-btn { display: flex; }
}
</style>
