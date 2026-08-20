<template>
  <Teleport to="body">
    <div v-if="supportStore.panelOpen" class="support-panel">
      <div class="support-panel__header">
        <h2 class="support-panel__title">Soporte Orkpad</h2>
        <button class="support-panel__close" @click="supportStore.togglePanel()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="support-panel__body">
        <div v-if="!supportStore.hasStartedChat" class="support-panel__faq">
          <p class="support-panel__intro">¿En qué te podemos ayudar?</p>
          <support-faq-list />
          <button class="support-panel__start" @click="startChat" :disabled="starting">
            Hablar con soporte
          </button>
        </div>

        <div v-else class="support-panel__chat">
          <div ref="messageList" class="support-panel__messages">
            <div v-if="supportStore.loadingMessages" class="support-panel__loading">Cargando...</div>
            <div
              v-for="message in supportStore.myMessages"
              :key="message._id"
              class="support-message"
              :class="message.senderType === 'admin' ? 'support-message--admin' : 'support-message--customer'"
            >
              {{ message.content }}
            </div>
          </div>

          <form class="support-panel__input-bar" @submit.prevent="send">
            <input
              v-model="draft"
              type="text"
              placeholder="Escribí tu mensaje..."
              class="support-panel__input"
            />
            <button type="submit" class="support-panel__send" :disabled="!draft.trim() || supportStore.sending">
              <span class="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick, watch } from 'vue'
import { useSupportStore } from '@/stores/support.store'
import SupportFaqList from './SupportFaqList.vue'

export default defineComponent({
  name: 'SupportChatPanel',
  components: { SupportFaqList },
  setup() {
    const supportStore = useSupportStore()
    const draft = ref('')
    const starting = ref(false)
    const messageList = ref<HTMLElement | null>(null)

    const scrollToBottom = () => {
      nextTick(() => {
        if (messageList.value) messageList.value.scrollTop = messageList.value.scrollHeight
      })
    }

    const startChat = async () => {
      starting.value = true
      try {
        await supportStore.startChat()
        scrollToBottom()
      } finally {
        starting.value = false
      }
    }

    const send = async () => {
      const content = draft.value
      draft.value = ''
      await supportStore.sendMyMessage(content)
      scrollToBottom()
    }

    watch(() => supportStore.myMessages.length, scrollToBottom)

    return { supportStore, draft, starting, messageList, startChat, send }
  },
})
</script>

<style scoped>
.support-panel {
  position: fixed;
  bottom: 88px;
  right: 24px;
  width: 380px;
  height: 560px;
  z-index: 9997;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  animation: support-panel-in 0.2s ease-out;
}

@keyframes support-panel-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .support-panel {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  }
}

.support-panel__header {
  height: var(--topbar-height);
  padding: 0 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-bg-surface-low);
  flex-shrink: 0;
}

.support-panel__title {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-base);
}

.support-panel__close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
}

.support-panel__body {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.support-panel__faq {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.support-panel__intro {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

.support-panel__start {
  padding: 12px;
  background-color: var(--color-primary);
  color: #fff;
  border: none;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.support-panel__start:hover {
  background-color: var(--color-primary-hover);
}

.support-panel__start:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.support-panel__chat {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
}

.support-panel__messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.support-panel__loading {
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;
}

.support-message {
  max-width: 80%;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.5;
  word-wrap: break-word;
}

.support-message--customer {
  align-self: flex-end;
  background-color: var(--color-primary);
  color: #fff;
}

.support-message--admin {
  align-self: flex-start;
  background-color: var(--color-bg-surface-container);
  color: var(--color-text-base);
}

.support-panel__input-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-surface-low);
  flex-shrink: 0;
}

.support-panel__input {
  flex-grow: 1;
  padding: 8px 10px;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-family: var(--font-body);
  font-size: 13px;
}

.support-panel__input:focus {
  outline: none;
  border-color: var(--color-border-focus);
}

.support-panel__send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  background-color: var(--color-primary);
  color: #fff;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

.support-panel__send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
