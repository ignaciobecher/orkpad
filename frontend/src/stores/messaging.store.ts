import { defineStore } from 'pinia'
import { io, Socket } from 'socket.io-client'
import { messagingApi } from '@/api/messaging/messaging.api'
import { useToast } from '@/composables/useToast'
import type { Conversation, Message } from '@/api/messaging/messaging.types'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'

let socket: Socket | null = null

export const useMessagingStore = defineStore('messaging', {
  state: () => ({
    conversations: [] as Conversation[],
    activeConversationId: null as string | null,
    messages: {} as Record<string, Message[]>,
    loadingConversations: false,
    loadingMessages: false,
    sendingMessage: false,
    connected: false,
    totalConversations: 0,
  }),

  getters: {
    activeConversation: (state): Conversation | null =>
      state.conversations.find((c) => c._id === state.activeConversationId) ?? null,

    activeMessages: (state): Message[] =>
      state.activeConversationId ? (state.messages[state.activeConversationId] ?? []) : [],

    totalUnread: (state): number =>
      state.conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
  },

  actions: {
    // ─── REST ────────────────────────────────────────────────────────────────

    async fetchConversations() {
      this.loadingConversations = true
      try {
        const { data } = await messagingApi.getConversations({ limit: 50 })
        this.conversations = data.data
        this.totalConversations = data.total
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al cargar conversaciones')
      } finally {
        this.loadingConversations = false
      }
    },

    async selectConversation(conversationId: string) {
      this.activeConversationId = conversationId
      await this.fetchMessages(conversationId)
      await this.markRead(conversationId)
      // Unirse al room de la conversación para recibir eventos directos
      socket?.emit('admin:join-conversation', { conversationId })
    },

    async fetchMessages(conversationId: string) {
      this.loadingMessages = true
      try {
        const { data } = await messagingApi.getMessages(conversationId, { limit: 100 })
        // API devuelve newest-first, invertimos para oldest-first
        this.messages[conversationId] = [...data.data].reverse()
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al cargar mensajes')
      } finally {
        this.loadingMessages = false
      }
    },

    async sendMessage(conversationId: string, content: string) {
      if (!content.trim()) return
      this.sendingMessage = true
      try {
        if (socket?.connected) {
          // Envío por socket con callback para agregar el mensaje devuelto por el server
          socket.emit('admin:send-message', { conversationId, content }, (message: Message) => {
            if (message?._id) {
              this._appendMessage(message)
              this._touchConversation(conversationId)
            }
          })
        } else {
          // Fallback REST
          const { data } = await messagingApi.sendAdminMessage(conversationId, { content })
          this._appendMessage(data)
          this._touchConversation(conversationId)
        }
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al enviar mensaje')
      } finally {
        this.sendingMessage = false
      }
    },

    async markRead(conversationId: string) {
      try {
        await messagingApi.markRead(conversationId)
        const conv = this.conversations.find((c) => c._id === conversationId)
        if (conv) conv.unreadCount = 0
      } catch {
        // silencioso
      }
    },

    async createConversation(clientId: string, projectId?: string) {
      try {
        const { data } = await messagingApi.createConversation({ clientId, projectId })
        const exists = this.conversations.find((c) => c._id === data._id)
        if (!exists) this.conversations.unshift(data)
        this.activeConversationId = data._id
        await this.fetchMessages(data._id)
        socket?.emit('admin:join-conversation', { conversationId: data._id })
        return data
      } catch (err: any) {
        useToast().error(err.response?.data?.message || 'Error al crear conversación')
        throw err
      }
    },

    // ─── Socket ──────────────────────────────────────────────────────────────

    connectSocket() {
      if (socket?.connected) return

      socket = io(`${SOCKET_URL}/messaging`, {
        auth: { type: 'admin' },
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 2000,
      })

      socket.on('connect', () => {
        this.connected = true
        // Reconexión: re-unirse al room de la conversación activa
        if (this.activeConversationId) {
          socket?.emit('admin:join-conversation', { conversationId: this.activeConversationId })
        }
      })

      socket.on('disconnect', () => {
        this.connected = false
      })

      socket.on('new-message', (message: Message) => {
        this._appendMessage(message)
        this._touchConversation(message.conversationId)

        if (message.senderType === 'client') {
          if (message.conversationId === this.activeConversationId) {
            this.markRead(message.conversationId)
          } else {
            const conv = this.conversations.find((c) => c._id === message.conversationId)
            if (conv) conv.unreadCount = (conv.unreadCount ?? 0) + 1
          }
        }
      })

      socket.on('conversation-updated', (payload: { conversationId: string; lastMessageAt: string }) => {
        const conv = this.conversations.find((c) => c._id === payload.conversationId)
        if (conv) {
          conv.lastMessageAt = payload.lastMessageAt
          this.conversations.sort((a, b) => {
            const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
            const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
            return bTime - aTime
          })
        }
      })
    },

    disconnectSocket() {
      socket?.disconnect()
      socket = null
      this.connected = false
    },

    // ─── Internos ────────────────────────────────────────────────────────────

    _appendMessage(message: Message) {
      const convId = message.conversationId
      if (!this.messages[convId]) this.messages[convId] = []
      const exists = this.messages[convId].some((m) => m._id === message._id)
      if (!exists) this.messages[convId].push(message)
    },

    _touchConversation(conversationId: string) {
      const conv = this.conversations.find((c) => c._id === conversationId)
      if (conv) {
        conv.lastMessageAt = new Date().toISOString()
        this.conversations.sort((a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
          return bTime - aTime
        })
      }
    },

    reset() {
      this.disconnectSocket()
      this.conversations = []
      this.activeConversationId = null
      this.messages = {}
      this.connected = false
      this.totalConversations = 0
    },
  },
})
