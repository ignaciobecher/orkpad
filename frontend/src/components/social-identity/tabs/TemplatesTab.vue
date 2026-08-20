<template>
  <div class="templates-tab">
    <div class="templates-list">
      <div v-for="template in account.messageTemplates" :key="template._id" class="template-card">
        <button class="template-card__header" @click="toggle(template._id)">
          <div class="template-card__title">
            <span class="template-card__name">{{ template.name }}</span>
            <span class="template-card__type">{{ template.type }}</span>
          </div>
          <span class="material-symbols-outlined">{{ expanded === template._id ? 'expand_less' : 'expand_more' }}</span>
        </button>

        <div v-if="expanded === template._id" class="template-card__body">
          <p v-if="template.useCase" class="template-use-case">{{ template.useCase }}</p>
          <p v-if="template.subject" class="template-subject"><strong>Asunto:</strong> {{ template.subject }}</p>

          <div class="template-body" v-html="highlight(template.body)"></div>

          <div class="template-actions">
            <w-button variant="secondary" @click="copy(template.body)">
              <span class="material-symbols-outlined mr-2">content_copy</span>
              Copiar template
            </w-button>
            <button class="remove-btn" @click="$emit('remove', template._id)">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <w-button variant="primary" @click="showForm = true">
      <span class="material-symbols-outlined mr-2">add</span>
      Agregar template
    </w-button>

    <w-drawer v-model="showForm" title="Nuevo template de mensaje" width="480px">
      <form class="template-form" @submit.prevent>
        <div class="form-group">
          <label>Nombre <span class="required-mark">*</span></label>
          <input v-model="form.name" type="text" />
        </div>
        <div class="form-group">
          <label>Tipo <span class="required-mark">*</span></label>
          <select v-model="form.type">
            <option value="">Seleccionar</option>
            <option v-for="opt in TYPE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div v-if="form.type === 'cold_email' || form.type === 'cold_email_followup'" class="form-group">
          <label>Asunto</label>
          <input v-model="form.subject" type="text" />
        </div>
        <div class="form-group">
          <label>Cuerpo <span class="required-mark">*</span></label>
          <textarea v-model="form.body" rows="5" placeholder="Usa [variable] para marcar partes a reemplazar"></textarea>
        </div>
        <div class="form-group">
          <label>Caso de uso</label>
          <input v-model="form.useCase" type="text" />
        </div>
      </form>

      <template #footer>
        <div class="drawer-footer-actions">
          <w-button variant="secondary" block @click="showForm = false">Cancelar</w-button>
          <w-button variant="primary" block @click="handleAdd">Agregar</w-button>
        </div>
      </template>
    </w-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import WButton from '@/components/ui/WButton.vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import { useToast } from '@/composables/useToast'
import { copyToClipboard } from '@/utils/clipboard'
import type { SocialAccount, MessageTemplate } from '@/api/social-identity/social-identity.types'

const TYPE_OPTIONS = [
  { value: 'dm_connection', label: 'DM de conexión' },
  { value: 'dm_followup', label: 'DM de seguimiento' },
  { value: 'cold_email', label: 'Email frío' },
  { value: 'cold_email_followup', label: 'Email frío - seguimiento' },
  { value: 'comment', label: 'Comentario' },
  { value: 'story_reply', label: 'Respuesta a story' },
]

function emptyForm(): MessageTemplate {
  return { name: '', type: '', subject: '', body: '', useCase: '', variables: [] }
}

function extractVariables(body: string): string[] {
  const matches = body.match(/\[[^\]]+\]/g) || []
  return [...new Set(matches.map((m) => m.slice(1, -1)))]
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default defineComponent({
  name: 'TemplatesTab',
  components: { WButton, WDrawer },
  props: {
    account: { type: Object as PropType<SocialAccount>, required: true },
  },
  emits: ['add', 'remove'],
  setup(_props, { emit }) {
    const { success, warning } = useToast()
    const expanded = ref<string | null>(null)
    const showForm = ref(false)
    const form = ref(emptyForm())

    function toggle(id?: string) {
      if (!id) return
      expanded.value = expanded.value === id ? null : id
    }

    function highlight(body: string): string {
      return escapeHtml(body).replace(/\[[^\]]+\]/g, (match) => `<span class="template-variable">${match}</span>`)
    }

    function handleAdd() {
      if (!form.value.name.trim() || !form.value.type || !form.value.body.trim()) {
        warning('Completa nombre, tipo y cuerpo del template')
        return
      }
      emit('add', { ...form.value, variables: extractVariables(form.value.body) })
      form.value = emptyForm()
      showForm.value = false
    }

    async function copy(text: string) {
      await copyToClipboard(text)
      success('Template copiado al portapapeles')
    }

    return { expanded, showForm, form, toggle, highlight, handleAdd, copy, TYPE_OPTIONS }
  },
})
</script>

<style scoped>
.templates-tab { display: flex; flex-direction: column; gap: 20px; }

.templates-list { display: flex; flex-direction: column; gap: 8px; }
.template-card { background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }

.template-card__header {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  background: none; border: none; padding: 12px 16px; cursor: pointer; color: var(--color-text-base);
}
.template-card__title { display: flex; align-items: center; gap: 10px; }
.template-card__name { font-family: var(--font-body); font-size: 13px; font-weight: 600; }
.template-card__type { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--color-text-muted); background: var(--color-bg-surface-high); padding: 2px 8px; }

.template-card__body { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--color-border); padding-top: 12px; }
.template-use-case { font-size: 12px; color: var(--color-text-muted); margin: 0; }
.template-subject { font-size: 13px; margin: 0; }

.template-body {
  font-family: var(--font-body); font-size: 13px; color: var(--color-text-base); white-space: pre-wrap;
  background: var(--color-bg-surface-low); padding: 12px; border-radius: 4px; line-height: 1.6;
}
.template-body :deep(.template-variable) { color: #d4af37; font-weight: 600; }

.template-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; }

.remove-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; display: flex; padding: 4px; }
.remove-btn:hover { color: var(--color-error); }
.remove-btn .material-symbols-outlined { font-size: 18px; }

.template-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
.required-mark { color: var(--color-error); }
.form-group input,
.form-group select,
.form-group textarea {
  background: var(--color-bg-surface-low); border: 1px solid var(--color-border);
  color: var(--color-text-base); font-family: var(--font-body); font-size: 13px;
  padding: 10px 12px; outline: none; border-radius: 4px; width: 100%;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { border-color: var(--color-border-focus); }

.drawer-footer-actions { display: flex; gap: 12px; }
</style>
