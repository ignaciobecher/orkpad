import { defineStore } from 'pinia'
import { io, Socket } from 'socket.io-client'
import { supportApi } from '@/api/support/support.api'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth.store'
import { isAdminUser } from '@/utils/admin'
import type { SupportConversation, SupportMessage } from '@/api/support/support.types'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'

let socket: Socket | null = null

export const useSupportStore = defineStore('support', {
  state: () => ({
    // Cliente
    myConversation: null as SupportConversation | null,
    myMessages: [] as SupportMessage[],
    panelOpen: false,
    hasStartedChat: false,

    // Admin
    conversations: [] as SupportConversation[],
    activeConversationId: null as string | null,
    messagesByConversation: {} as Record<string, SupportMessage[]>,
    adminUnreadTotal: 0,

    // Compartido
    connected: false,
    loadingConversations: false,
    loadingMessages: false,
    sending: false,
  }),

  getters: {
    isAdmin: () => isAdminUser(useAuthStore().user?._id),

    activeConversation: (state): SupportConversation | null =>
      state.conversations.find((c) => c._id === state.activeConversationId) ?? null,

    activeMessages: (state): SupportMessage[] =>
      state.activeConversationId ? (state.messagesByConversation[state.activeConversationId] ?? []) : [],

    myUnreadCount: (state): number => state.myConversation?.unreadCountCustomer ?? 0,
  },

  actions: {
    // ─── Cliente ────────────────────────────────────────────────────────────

    async fetchMyConversation() {
      try {
        const { data } = await supportApi.getMyConversation()
        this.myConversation = data
        this.hasStartedChat = true
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al iniciar la conversación de soporte')
      }
    },

    async fetchMyMessages() {
      this.loadingMessages = true
      try {
        const { data } = await supportApi.getMyMessages({ limit: 100 })
        this.myMessages = [...data.data].reverse()
        if (this.myConversation) this.myConversation.unreadCountCustomer = 0
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al cargar mensajes')
      } finally {
        this.loadingMessages = false
      }
    },

    async startChat() {
      await this.fetchMyConversation()
      await this.fetchMyMessages()
    },

    async sendMyMessage(content: string) {
      if (!content.trim()) return
      this.sending = true
      try {
        if (socket?.connected) {
          socket.emit('customer:send-message', { content }, (message: SupportMessage) => {
            if (message?._id) this._appendMyMessage(message)
          })
        } else {
          const { data } = await supportApi.sendMyMessage({ content })
          this._appendMyMessage(data)
        }
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al enviar mensaje')
      } finally {
        this.sending = false
      }
    },

    togglePanel() {
      this.panelOpen = !this.panelOpen
    },

    // ─── Admin ──────────────────────────────────────────────────────────────

    async fetchConversations() {
      this.loadingConversations = true
      try {
        const { data } = await supportApi.getAllConversationsAdmin({ limit: 50 })
        this.conversations = data.data
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al cargar conversaciones de soporte')
      } finally {
        this.loadingConversations = false
      }
    },

    async fetchAdminUnreadTotal() {
      try {
        const { data } = await supportApi.getUnreadCountAdmin()
        this.adminUnreadTotal = data
      } catch {
        // silencioso
      }
    },

    async selectConversation(conversationId: string) {
      this.activeConversationId = conversationId
      await this.fetchMessagesForConversation(conversationId)
      await this.markRead(conversationId)
      socket?.emit('admin:join-conversation', { conversationId })
    },

    async fetchMessagesForConversation(conversationId: string) {
      this.loadingMessages = true
      try {
        const { data } = await supportApi.getMessagesAdmin(conversationId, { limit: 100 })
        this.messagesByConversation[conversationId] = [...data.data].reverse()
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al cargar mensajes')
      } finally {
        this.loadingMessages = false
      }
    },

    async sendAdminMessage(conversationId: string, content: string) {
      if (!content.trim()) return
      this.sending = true
      try {
        if (socket?.connected) {
          socket.emit('admin:send-message', { conversationId, content }, (message: SupportMessage) => {
            if (message?._id) {
              this._appendAdminMessage(message)
              this._touchConversation(conversationId)
            }
          })
        } else {
          const { data } = await supportApi.sendAdminMessage(conversationId, { content })
          this._appendAdminMessage(data)
          this._touchConversation(conversationId)
        }
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al enviar mensaje')
      } finally {
        this.sending = false
      }
    },

    async markRead(conversationId: string) {
      try {
        await supportApi.markReadAdmin(conversationId)
        const conv = this.conversations.find((c) => c._id === conversationId)
        if (conv) conv.unreadCountAdmin = 0
        await this.fetchAdminUnreadTotal()
      } catch {
        // silencioso
      }
    },

    // ─── Socket (ambos lados) ───────────────────────────────────────────────

    connectSocket() {
      if (socket?.connected) return

      socket = io(`${SOCKET_URL}/support`, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 2000,
      })

      socket.on('connect', () => {
        this.connected = true
        if (this.isAdmin && this.activeConversationId) {
          socket?.emit('admin:join-conversation', { conversationId: this.activeConversationId })
        }
      })

      socket.on('disconnect', () => {
        this.connected = false
      })

      socket.on('new-message', (message: SupportMessage) => {
        if (this.isAdmin) {
          this._appendAdminMessage(message)
          this._touchConversation(message.conversationId)

          if (message.senderType === 'customer') {
            if (message.conversationId === this.activeConversationId) {
              this.markRead(message.conversationId)
            } else {
              const conv = this.conversations.find((c) => c._id === message.conversationId)
              if (conv) conv.unreadCountAdmin = (conv.unreadCountAdmin ?? 0) + 1
              this.fetchAdminUnreadTotal()
            }
          }
        } else {
          this._appendMyMessage(message)
          if (message.senderType === 'admin' && this.panelOpen) {
            this.fetchMyMessages()
          } else if (message.senderType === 'admin' && this.myConversation) {
            this.myConversation.unreadCountCustomer = (this.myConversation.unreadCountCustomer ?? 0) + 1
          }
        }
      })

      socket.on('conversation-updated', (payload: { conversationId: string; lastMessageAt: string }) => {
        const conv = this.conversations.find((c) => c._id === payload.conversationId)
        if (conv) {
          conv.lastMessageAt = payload.lastMessageAt
          this._sortConversations()
        }
      })
    },

    disconnectSocket() {
      socket?.disconnect()
      socket = null
      this.connected = false
    },

    // ─── Internos ───────────────────────────────────────────────────────────

    _appendMyMessage(message: SupportMessage) {
      const exists = this.myMessages.some((m) => m._id === message._id)
      if (!exists) this.myMessages.push(message)
    },

    _appendAdminMessage(message: SupportMessage) {
      const convId = message.conversationId
      if (!this.messagesByConversation[convId]) this.messagesByConversation[convId] = []
      const exists = this.messagesByConversation[convId].some((m) => m._id === message._id)
      if (!exists) this.messagesByConversation[convId].push(message)
    },

    _touchConversation(conversationId: string) {
      const conv = this.conversations.find((c) => c._id === conversationId)
      if (conv) {
        conv.lastMessageAt = new Date().toISOString()
        this._sortConversations()
      }
    },

    _sortConversations() {
      this.conversations.sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
        return bTime - aTime
      })
    },

    reset() {
      this.disconnectSocket()
      this.myConversation = null
      this.myMessages = []
      this.panelOpen = false
      this.hasStartedChat = false
      this.conversations = []
      this.activeConversationId = null
      this.messagesByConversation = {}
      this.adminUnreadTotal = 0
      this.connected = false
    },
  },
})
