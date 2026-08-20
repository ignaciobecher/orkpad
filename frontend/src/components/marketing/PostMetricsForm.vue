<template>
  <div class="metrics-form">
    <div class="post-summary">
      <div class="post-summary__header">
        <span class="post-summary__title">{{ post.title }}</span>
        <button class="edit-link" @click="$emit('edit-post')">
          <span class="material-symbols-outlined">edit</span>
          Editar publicación
        </button>
      </div>
      <div class="post-summary__meta">
        <w-badge :color="NETWORK_COLORS[post.network]">{{ NETWORK_LABELS[post.network] }}</w-badge>
        <span class="format-chip">{{ FORMAT_LABELS[post.format] || post.format }}</span>
        <span v-if="post.scheduledDate" class="post-summary__date">
          <span class="material-symbols-outlined">event</span>
          {{ formatCalendarDate(post.scheduledDate) }}
        </span>
      </div>
      <p v-if="post.copyText" class="post-summary__copy">{{ post.copyText }}</p>
    </div>

    <div v-if="post.status !== 'publicado'" class="metrics-locked">
      <span class="material-symbols-outlined">lock</span>
      Las métricas solo se pueden cargar cuando la publicación está en estado <strong>Publicado</strong>
    </div>

    <template v-else>
      <div class="metrics-grid">
        <div v-for="field in fields" :key="field.key" class="form-group">
          <label>{{ field.label }}</label>
          <input v-model.number="form[field.key]" type="number" min="0" step="1" />
        </div>
      </div>

      <div class="form-group">
        <label>Notas de análisis</label>
        <textarea v-model="form.analysisNotes" rows="3" placeholder="¿Qué funcionó? ¿Qué repetirías?"></textarea>
      </div>

      <div v-if="post.metrics?.recordedAt" class="metrics-recorded">
        Última actualización: {{ formatDate(post.metrics.recordedAt) }}
      </div>

      <w-button variant="primary" :disabled="loading" @click="handleSubmit">
        {{ loading ? 'Guardando métricas...' : 'Guardar métricas' }}
      </w-button>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch } from 'vue'
import WButton from '@/components/ui/WButton.vue'
import WBadge from '@/components/ui/WBadge.vue'
import { NETWORK_LABELS, NETWORK_COLORS } from '@/api/marketing/marketing-shared.types'
import { formatCalendarDate } from '@/utils/date'
import type { MarketingPost, RecordMetricsDto } from '@/api/marketing/marketing-posts.types'

const FORMAT_LABELS: Record<string, string> = {
  carousel: 'Carrusel',
  reel: 'Reel',
  article: 'Artículo',
  image: 'Imagen',
  video: 'Video',
  text: 'Texto',
  story: 'Historia',
  poll: 'Encuesta',
  event: 'Evento',
}

const NETWORK_METRIC_FIELDS: Record<string, { key: string; label: string }[]> = {
  linkedin: [
    { key: 'impressions', label: 'Impresiones' },
    { key: 'reactions', label: 'Reacciones' },
    { key: 'comments', label: 'Comentarios' },
    { key: 'reposts', label: 'Reposteos' },
    { key: 'clicks', label: 'Clicks' },
    { key: 'newFollowers', label: 'Nuevos seguidores' },
  ],
  instagram: [
    { key: 'impressions', label: 'Impresiones' },
    { key: 'reach', label: 'Alcance' },
    { key: 'likes', label: 'Me gusta' },
    { key: 'comments', label: 'Comentarios' },
    { key: 'saves', label: 'Guardados' },
    { key: 'shares', label: 'Compartidos' },
    { key: 'profileVisits', label: 'Visitas al perfil' },
  ],
  tiktok: [
    { key: 'views', label: 'Reproducciones' },
    { key: 'likes', label: 'Me gusta' },
    { key: 'comments', label: 'Comentarios' },
    { key: 'shares', label: 'Compartidos' },
    { key: 'saves', label: 'Guardados' },
    { key: 'newFollowers', label: 'Nuevos seguidores' },
    { key: 'avgWatchTimeSeconds', label: 'Tiempo prom. de vista (s)' },
  ],
}

function emptyForm() {
  return {
    impressions: undefined,
    views: undefined,
    reach: undefined,
    likes: undefined,
    reactions: undefined,
    comments: undefined,
    shares: undefined,
    reposts: undefined,
    saves: undefined,
    clicks: undefined,
    profileVisits: undefined,
    newFollowers: undefined,
    avgWatchTimeSeconds: undefined,
    analysisNotes: '',
  } as Record<string, any>
}

export default defineComponent({
  name: 'PostMetricsForm',
  components: { WButton, WBadge },
  props: {
    post: { type: Object as PropType<MarketingPost>, required: true },
    loading: { type: Boolean, default: false },
  },
  emits: ['submit', 'edit-post'],
  setup(props, { emit }) {
    const form = ref(emptyForm())

    function resetForm() {
      const next = emptyForm()
      if (props.post.metrics) {
        for (const key of Object.keys(next)) {
          if (key === 'analysisNotes') continue
          const value = (props.post.metrics as any)[key]
          if (value !== undefined && value !== null) next[key] = value
        }
      }
      next.analysisNotes = props.post.analysisNotes || ''
      form.value = next
    }

    watch(() => [props.post._id, props.post.metrics], resetForm, { immediate: true })

    const fields = computed(() => NETWORK_METRIC_FIELDS[props.post.network] || [])

    function formatDate(dateStr?: string) {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleString()
    }

    function handleSubmit() {
      const dto: RecordMetricsDto = { analysisNotes: form.value.analysisNotes || undefined }
      for (const field of fields.value) {
        const value = form.value[field.key]
        if (value !== undefined && value !== null && value !== '') {
          ;(dto as any)[field.key] = Number(value)
        }
      }
      emit('submit', dto)
    }

    return { form, fields, formatDate, handleSubmit, NETWORK_LABELS, NETWORK_COLORS, FORMAT_LABELS, formatCalendarDate }
  },
})
</script>

<style scoped>
.metrics-form { display: flex; flex-direction: column; gap: 16px; }

.post-summary {
  display: flex; flex-direction: column; gap: 8px; padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}
.post-summary__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.post-summary__title { font-family: var(--font-body); font-size: 14px; font-weight: 600; color: var(--color-text-base); line-height: 1.4; }
.edit-link {
  display: flex; align-items: center; gap: 4px; background: none; border: none; cursor: pointer;
  color: var(--color-text-muted); font-family: var(--font-mono); font-size: 10px; text-transform: uppercase;
  white-space: nowrap; flex-shrink: 0; padding: 2px;
}
.edit-link:hover { color: var(--color-primary); }
.edit-link .material-symbols-outlined { font-size: 14px; }

.post-summary__meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.format-chip {
  font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--color-text-muted);
  background: var(--color-bg-surface-high); padding: 2px 8px;
}
.post-summary__date { display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 10px; color: var(--color-text-muted); }
.post-summary__date .material-symbols-outlined { font-size: 12px; }

.post-summary__copy { font-family: var(--font-body); font-size: 12px; color: var(--color-text-muted); line-height: 1.5; margin: 0; white-space: pre-wrap; }

.metrics-locked {
  display: flex; align-items: center; gap: 10px; padding: 16px;
  background: var(--color-bg-surface-low); border: 1px dashed var(--color-border);
  font-family: var(--font-body); font-size: 13px; color: var(--color-text-muted); line-height: 1.5;
}
.metrics-locked .material-symbols-outlined { font-size: 20px; flex-shrink: 0; }

.metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label {
  font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--color-text-muted);
}
.form-group input,
.form-group textarea {
  background: var(--color-bg-surface-low); border: 1px solid var(--color-border);
  color: var(--color-text-base); font-family: var(--font-body); font-size: 13px;
  padding: 10px 12px; outline: none; border-radius: 4px; width: 100%;
}
.form-group input:focus,
.form-group textarea:focus { border-color: var(--color-border-focus); }

.metrics-recorded { font-family: var(--font-mono); font-size: 10px; color: var(--color-text-disabled); text-transform: uppercase; }

@media (max-width: 480px) {
  .metrics-grid { grid-template-columns: 1fr; }
}
</style>
