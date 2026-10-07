<template>
  <div class="assistant-page">
    <aside class="assistant-side">
      <button class="btn-primary" @click="newChat">
        <span class="material-symbols-outlined">add</span>
        Nuevo chat
      </button>
      <div class="assistant-project">
        <label>Proyecto</label>
        <select v-model="activeProjectId" @change="newChat">
          <option value="">Todo el workspace</option>
          <option v-for="p in projects" :key="p._id" :value="p._id">{{ p.name }}</option>
        </select>
      </div>
      <div class="assistant-convs">
        <button
          v-for="c in conversations"
          :key="c._id"
          :class="['conv-item', { 'conv-item--active': c._id === activeId }]"
          @click="openConversation(c._id)"
        >
          <span class="conv-title">{{ c.title }}</span>
          <span class="conv-del material-symbols-outlined" @click.stop="deleteConversation(c._id)">delete</span>
        </button>
        <p v-if="!conversations.length" class="conv-empty">Sin conversaciones todavía</p>
      </div>
    </aside>

    <section class="assistant-main">
      <div v-if="!messages.length && !streaming" class="assistant-welcome">
        <span class="material-symbols-outlined assistant-welcome__icon">smart_toy</span>
        <h2>Asistente IA</h2>
        <p>Preguntá por proyectos, cuotas, tareas o documentación. Responde con tus datos locales.</p>
      </div>
      <div v-else class="assistant-messages" ref="msgBox">
        <div v-for="m in messages" :key="m._id || m.tempId" :class="['msg', `msg--${m.role}`]">
          <div class="msg-body">{{ m.content }}</div>
          <div v-if="m.role === 'assistant' && m.sources?.length" class="msg-sources">
            <span class="msg-sources-label">Fuentes:</span>
            <span v-for="(s, i) in m.sources" :key="i" class="msg-source">[{{ i + 1 }}] {{ s.title }} ({{ s.refType }})</span>
          </div>
        </div>
        <div v-if="streaming && !streamText" class="msg msg--assistant">
          <div class="msg-body"><span class="material-symbols-outlined spinning">sync</span></div>
        </div>
      </div>

      <div class="assistant-input-row">
        <input
          v-model="draft"
          placeholder="Escribí tu pregunta..."
          :disabled="streaming"
          @keydown.enter.prevent="send"
        />
        <button class="btn-primary" :disabled="streaming || !draft.trim()" @click="send">
          <span class="material-symbols-outlined">send</span>
        </button>
      </div>
      <p v-if="chatError" class="assistant-error">{{ chatError }}</p>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick } from 'vue'
import { aiApi, type AiConversation, type AiMessage } from '@/api/ai/ai.api'
import { useProjectsStore } from '@/stores/projects.store'

interface ChatMsg extends Partial<AiMessage> {
  tempId?: string
  content: string
  role: 'user' | 'assistant'
  sources?: { refType: string; refId: string; title?: string }[]
}

export default defineComponent({
  name: 'AssistantPage',
  setup() {
    const projectsStore = useProjectsStore()
    const conversations = ref<AiConversation[]>([])
    const projects = ref<{ _id: string; name: string }[]>([])
    const messages = ref<ChatMsg[]>([])
    const draft = ref('')
    const streaming = ref(false)
    const streamText = ref('')
    const activeId = ref('')
    const activeProjectId = ref('')
    const chatError = ref('')
    const msgBox = ref<HTMLElement | null>(null)

    onMounted(async () => {
      await projectsStore.fetchAll().catch(() => {})
      projects.value = projectsStore.items.map((p: any) => ({ _id: p._id, name: p.name }))
      await reloadConversations()
    })

    async function reloadConversations() {
      try {
        const { data } = await aiApi.conversations()
        conversations.value = data
      } catch {
        conversations.value = []
      }
    }

    function scrollDown() {
      nextTick(() => {
        if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight
      })
    }

    function newChat() {
      activeId.value = ''
      messages.value = []
      streamText.value = ''
      chatError.value = ''
    }

    async function openConversation(id: string) {
      activeId.value = id
      chatError.value = ''
      try {
        const { data } = await aiApi.messages(id)
        messages.value = data
      } catch {
        messages.value = []
      }
      scrollDown()
    }

    async function deleteConversation(id: string) {
      await aiApi.removeConversation(id).catch(() => {})
      if (activeId.value === id) newChat()
      await reloadConversations()
    }

    async function send() {
      const text = draft.value.trim()
      if (!text || streaming.value) return
      chatError.value = ''
      draft.value = ''
      const userMsg: ChatMsg = { tempId: `u-${Date.now()}`, role: 'user', content: text }
      messages.value.push(userMsg)
      const assistantMsg: ChatMsg = { tempId: `a-${Date.now()}`, role: 'assistant', content: '' }
      messages.value.push(assistantMsg)
      streaming.value = true
      streamText.value = ''
      scrollDown()
      try {
        await aiApi.chat(
          {
            message: text,
            conversationId: activeId.value || undefined,
            projectId: activeProjectId.value || undefined,
          },
          (e) => {
            if (e.type === 'meta') {
              activeId.value = e.data.conversationId
            } else if (e.type === 'message') {
              streamText.value += e.data.token ?? ''
              assistantMsg.content = streamText.value
              scrollDown()
            } else if (e.type === 'done') {
              assistantMsg.sources = e.data.sources ?? []
            } else if (e.type === 'error') {
              chatError.value = e.data.message ?? 'Error del asistente'
            }
          },
        )
      } catch {
        chatError.value = 'No se pudo conectar con el asistente. Revisá la configuración de IA.'
      } finally {
        streaming.value = false
        scrollDown()
        await reloadConversations()
      }
    }

    return {
      conversations, projects, messages, draft, streaming, streamText,
      activeId, activeProjectId, chatError, msgBox,
      newChat, openConversation, deleteConversation, send,
    }
  },
})
</script>

<style scoped>
.assistant-page { display: flex; height: 100%; min-height: 0; }
.assistant-side { width: 280px; flex-shrink: 0; border-right: 1px solid var(--color-border); padding: 16px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
.btn-primary { display: flex; align-items: center; justify-content: center; gap: 6px; height: 36px; padding: 0 14px; background: var(--color-primary); border: none; color: #fff; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; cursor: pointer; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }
.assistant-project label { display: block; font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 4px; }
.assistant-project select { width: 100%; height: 36px; background: var(--color-bg-surface); border: 1px solid var(--color-border); color: var(--color-text-base); font-size: 13px; }
.assistant-convs { display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
.conv-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: none; border: 1px solid transparent; color: var(--color-text-base); font-size: 13px; cursor: pointer; text-align: left; }
.conv-item:hover { background: var(--color-bg-surface-low); }
.conv-item--active { border-color: var(--color-primary); }
.conv-title { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.conv-del { font-size: 16px; color: var(--color-text-muted); cursor: pointer; }
.conv-del:hover { color: var(--color-error); }
.conv-empty { font-size: 12px; color: var(--color-text-muted); }
.assistant-main { flex: 1; display: flex; flex-direction: column; min-width: 0; padding: 24px; gap: 16px; }
.assistant-welcome { margin: auto; text-align: center; color: var(--color-text-muted); max-width: 420px; }
.assistant-welcome__icon { font-size: 48px; }
.assistant-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
.msg { max-width: 80%; padding: 10px 14px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; }
.msg--user { align-self: flex-end; background: var(--color-primary); color: #fff; }
.msg--assistant { align-self: flex-start; background: var(--color-bg-surface); border: 1px solid var(--color-border); }
.msg-sources { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; font-size: 11px; color: var(--color-text-muted); }
.msg-source { background: var(--color-bg-surface-high); padding: 1px 6px; }
.assistant-input-row { display: flex; gap: 8px; }
.assistant-input-row input { flex: 1; height: 40px; background: var(--color-bg-surface); border: 1px solid var(--color-border); color: var(--color-text-base); padding: 0 12px; font-size: 14px; outline: none; }
.assistant-error { color: var(--color-error); font-size: 12px; margin: 0; }
.spinning { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
