<template>
  <div class="support-inbox">
    <div class="support-inbox__list" :class="{ 'support-inbox__list--hidden-mobile': mobileView === 'thread' }">
      <div v-if="supportStore.loadingConversations" class="support-inbox__empty">Cargando...</div>
      <div v-else-if="supportStore.conversations.length === 0" class="support-inbox__empty">
        No hay conversaciones de soporte todavía
      </div>
      <button
        v-for="conv in supportStore.conversations"
        :key="conv._id"
        class="support-inbox__row"
        :class="{ 'support-inbox__row--active': conv._id === supportStore.activeConversationId }"
        @click="select(conv._id)"
      >
        <div class="support-inbox__row-header">
          <span class="support-inbox__name">{{ conv.userName || conv.userEmail || 'Usuario' }}</span>
          <span v-if="conv.unreadCountAdmin > 0" class="support-inbox__badge">{{ conv.unreadCountAdmin }}</span>
        </div>
        <p class="support-inbox__preview">{{ conv.lastMessagePreview || 'Sin mensajes' }}</p>
        <span class="support-inbox__time">{{ formatTime(conv.lastMessageAt) }}</span>
      </button>
    </div>

    <div class="support-inbox__thread" :class="{ 'support-inbox__thread--hidden-mobile': mobileView === 'list' }">
      <div v-if="!supportStore.activeConversationId" class="support-inbox__empty">
        Seleccioná una conversación
      </div>
      <template v-else>
        <div class="support-inbox__thread-header">
          <button class="support-inbox__back" @click="mobileView = 'list'">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <span class="support-inbox__thread-title">
            {{ supportStore.activeConversation?.userName || supportStore.activeConversation?.userEmail }}
          </span>
        </div>

        <div class="support-inbox__messages">
          <div
            v-for="message in supportStore.activeMessages"
            :key="message._id"
            class="support-inbox__message"
            :class="message.senderType === 'admin' ? 'support-inbox__message--admin' : 'support-inbox__message--customer'"
          >
            {{ message.content }}
          </div>
        </div>

        <form class="support-inbox__input-bar" @submit.prevent="send">
          <input v-model="draft" type="text" placeholder="Escribí tu respuesta..." class="support-inbox__input" />
          <button type="submit" class="support-inbox__send" :disabled="!draft.trim() || supportStore.sending">
            <span class="material-symbols-outlined">send</span>
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useSupportStore } from '@/stores/support.store'

export default defineComponent({
  name: 'SupportAdminInbox',
  setup() {
    const supportStore = useSupportStore()
    const draft = ref('')
    const mobileView = ref<'list' | 'thread'>('list')

    onMounted(() => {
      supportStore.fetchConversations()
      supportStore.fetchAdminUnreadTotal()
      supportStore.connectSocket()
    })

    const select = async (conversationId: string) => {
      mobileView.value = 'thread'
      await supportStore.selectConversation(conversationId)
    }

    const send = async () => {
      if (!supportStore.activeConversationId) return
      const content = draft.value
      draft.value = ''
      await supportStore.sendAdminMessage(supportStore.activeConversationId, content)
    }

    const formatTime = (iso: string | null) => {
      if (!iso) return ''
      return new Date(iso).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    return { supportStore, draft, mobileView, select, send, formatTime }
  },
})
</script>

<style scoped>
.support-inbox {
  display: flex;
  height: 600px;
  border: 1px solid var(--color-border);
}

.support-inbox__list {
  width: 320px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

.support-inbox__row {
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
}

.support-inbox__row:hover {
  background-color: var(--color-bg-surface-low);
}

.support-inbox__row--active {
  background-color: var(--color-bg-surface-container);
}

.support-inbox__row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.support-inbox__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-base);
}

.support-inbox__badge {
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 50%;
  background-color: var(--color-error);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.support-inbox__preview {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.support-inbox__time {
  font-size: 11px;
  color: var(--color-text-disabled);
}

.support-inbox__thread {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.support-inbox__empty {
  padding: 32px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
  margin: auto;
}

.support-inbox__thread-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-surface-low);
}

.support-inbox__back {
  display: none;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
}

.support-inbox__thread-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-base);
}

.support-inbox__messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.support-inbox__message {
  max-width: 70%;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.5;
}

.support-inbox__message--customer {
  align-self: flex-start;
  background-color: var(--color-bg-surface-container);
  color: var(--color-text-base);
}

.support-inbox__message--admin {
  align-self: flex-end;
  background-color: var(--color-primary);
  color: #fff;
}

.support-inbox__input-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-surface-low);
}

.support-inbox__input {
  flex-grow: 1;
  padding: 8px 10px;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-family: var(--font-body);
  font-size: 13px;
}

.support-inbox__input:focus {
  outline: none;
  border-color: var(--color-border-focus);
}

.support-inbox__send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  background-color: var(--color-primary);
  color: #fff;
  border: none;
  cursor: pointer;
}

.support-inbox__send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .support-inbox {
    height: calc(100vh - 240px);
  }

  .support-inbox__list--hidden-mobile {
    display: none;
  }

  .support-inbox__thread--hidden-mobile {
    display: none;
  }

  .support-inbox__list {
    width: 100%;
  }

  .support-inbox__back {
    display: flex;
  }
}
</style>
