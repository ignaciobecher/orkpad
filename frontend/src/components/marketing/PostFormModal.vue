<template>
  <w-drawer v-model="isOpen" :title="isEditing ? 'Editar publicación' : 'Nueva publicación'" width="480px">
    <form class="post-form" @submit.prevent="handleSubmit" novalidate>
      <div class="form-group" :class="{ 'has-error': errors.title }">
        <label>Título <span class="required-mark">*</span></label>
        <input v-model="form.title" type="text" @input="clearError('title')" />
        <span v-if="errors.title" class="field-error">{{ errors.title }}</span>
      </div>

      <div class="form-group">
        <label>Copy / texto de la publicación</label>
        <textarea v-model="form.copyText" rows="4"></textarea>
      </div>

      <div class="form-row">
        <div class="form-group" :class="{ 'has-error': errors.network }">
          <label>Red <span class="required-mark">*</span></label>
          <select v-model="form.network" :disabled="isEditing" @change="clearError('network')">
            <option value="">Seleccionar</option>
            <option v-for="opt in NETWORK_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <span v-if="isEditing" class="field-hint">La red no se puede modificar luego de crear la publicación</span>
          <span v-if="errors.network" class="field-error">{{ errors.network }}</span>
        </div>

        <div class="form-group" :class="{ 'has-error': errors.format }">
          <label>Formato <span class="required-mark">*</span></label>
          <select v-model="form.format" @change="clearError('format')">
            <option value="">Seleccionar</option>
            <option v-for="opt in FORMAT_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <span v-if="errors.format" class="field-error">{{ errors.format }}</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Fecha programada</label>
          <input v-model="form.scheduledDate" type="date" />
        </div>

        <div class="form-group">
          <label>Estado</label>
          <select v-model="form.status">
            <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Idea de origen</label>
        <w-remote-select
          v-model="form.ideaId"
          placeholder="Vincular con una idea (opcional)"
          search-placeholder="Buscar idea..."
          :load-options="loadMarketingIdeaOptions"
          :load-option-by-value="loadMarketingIdeaOptionById"
        />
      </div>

      <div class="form-group" :class="{ 'has-error': errors.attachmentUrl }">
        <label>URL del adjunto</label>
        <input v-model="form.attachmentUrl" type="text" placeholder="https://..." @input="clearError('attachmentUrl')" />
        <span v-if="errors.attachmentUrl" class="field-error">{{ errors.attachmentUrl }}</span>
      </div>

      <div class="form-group">
        <label>Notas de análisis</label>
        <textarea v-model="form.analysisNotes" rows="3" placeholder="Aprendizajes, hipótesis, observaciones..."></textarea>
      </div>
    </form>

    <template #footer>
      <div class="drawer-footer-actions">
        <w-button variant="secondary" block @click="isOpen = false">Cancelar</w-button>
        <w-button variant="primary" block :disabled="loading" @click="handleSubmit">
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </w-button>
      </div>
    </template>
  </w-drawer>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch } from 'vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import WButton from '@/components/ui/WButton.vue'
import WRemoteSelect from '@/components/ui/WRemoteSelect.vue'
import { useToast } from '@/composables/useToast'
import { NETWORK_OPTIONS, STATUS_OPTIONS } from '@/api/marketing/marketing-shared.types'
import { loadMarketingIdeaOptions, loadMarketingIdeaOptionById } from '@/utils/remote-entity-options'
import { toDateInputValue } from '@/utils/date'
import type { MarketingPost, CreateMarketingPostDto, UpdateMarketingPostDto } from '@/api/marketing/marketing-posts.types'

const FORMAT_OPTIONS = [
  { value: 'carousel', label: 'Carrusel' },
  { value: 'reel', label: 'Reel' },
  { value: 'article', label: 'Artículo' },
  { value: 'image', label: 'Imagen' },
  { value: 'video', label: 'Video' },
  { value: 'text', label: 'Texto' },
  { value: 'story', label: 'Historia' },
  { value: 'poll', label: 'Encuesta' },
  { value: 'event', label: 'Evento' },
]

function emptyForm() {
  return {
    title: '',
    copyText: '',
    network: '',
    format: '',
    scheduledDate: '',
    status: 'idea',
    ideaId: '',
    attachmentUrl: '',
    analysisNotes: '',
  }
}

export default defineComponent({
  name: 'PostFormModal',
  components: { WDrawer, WButton, WRemoteSelect },
  props: {
    modelValue: { type: Boolean, required: true },
    post: { type: Object as PropType<MarketingPost | null>, default: null },
    loading: { type: Boolean, default: false },
    initialNetwork: { type: String, default: '' },
    initialDate: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const { warning } = useToast()
    const form = ref(emptyForm())
    const errors = ref<Record<string, string>>({})

    const isOpen = computed({
      get: () => props.modelValue,
      set: (val: boolean) => emit('update:modelValue', val),
    })
    const isEditing = computed(() => !!props.post?._id)

    function resetForm() {
      if (props.post) {
        form.value = {
          title: props.post.title || '',
          copyText: props.post.copyText || '',
          network: props.post.network || '',
          format: props.post.format || '',
          scheduledDate: props.post.scheduledDate ? toDateInputValue(props.post.scheduledDate) : '',
          status: props.post.status || 'idea',
          ideaId: props.post.ideaId || '',
          attachmentUrl: props.post.attachmentUrl || '',
          analysisNotes: props.post.analysisNotes || '',
        }
      } else {
        form.value = {
          ...emptyForm(),
          network: props.initialNetwork || '',
          scheduledDate: props.initialDate || '',
        }
      }
      errors.value = {}
    }

    watch(() => props.modelValue, (val) => { if (val) resetForm() })

    function clearError(field: string) {
      if (errors.value[field]) delete errors.value[field]
    }

    function validate(): boolean {
      const errs: Record<string, string> = {}
      if (!form.value.title.trim()) errs.title = 'El título es obligatorio'
      if (!form.value.network) errs.network = 'Selecciona una red'
      if (!form.value.format) errs.format = 'Selecciona un formato'
      if (form.value.attachmentUrl && !/^https?:\/\/.+/.test(form.value.attachmentUrl)) {
        errs.attachmentUrl = 'Debe ser una URL válida (http/https)'
      }
      errors.value = errs
      if (Object.keys(errs).length) {
        warning('Completa los campos obligatorios antes de guardar')
        return false
      }
      return true
    }

    function handleSubmit() {
      if (!validate()) return

      const base: Record<string, any> = {
        title: form.value.title.trim(),
        copyText: form.value.copyText || undefined,
        format: form.value.format,
        scheduledDate: form.value.scheduledDate || undefined,
        status: form.value.status,
        ideaId: form.value.ideaId || undefined,
        attachmentUrl: form.value.attachmentUrl || undefined,
        analysisNotes: form.value.analysisNotes || undefined,
      }

      if (isEditing.value) {
        emit('save', base as UpdateMarketingPostDto)
      } else {
        emit('save', { ...base, network: form.value.network } as CreateMarketingPostDto)
      }
    }

    return {
      form,
      errors,
      isOpen,
      isEditing,
      clearError,
      handleSubmit,
      NETWORK_OPTIONS,
      STATUS_OPTIONS,
      FORMAT_OPTIONS,
      loadMarketingIdeaOptions,
      loadMarketingIdeaOptionById,
    }
  },
})
</script>

<style scoped>
.post-form { display: flex; flex-direction: column; gap: 16px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label {
  font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--color-text-muted);
}
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

.form-group select:disabled { opacity: 0.6; cursor: not-allowed; }

.field-hint { font-family: var(--font-body); font-size: 11px; color: var(--color-text-disabled); }
.field-error { display: flex; align-items: center; gap: 4px; font-family: var(--font-body); font-size: 11px; color: var(--color-error); }

.has-error input,
.has-error select,
.has-error textarea { border-color: var(--color-error); }

.drawer-footer-actions { display: flex; gap: 12px; }

@media (max-width: 540px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
