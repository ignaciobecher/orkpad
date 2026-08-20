<template>
  <div class="post-card" @click="$emit('click', post)">
    <img v-if="post.attachmentUrl" :src="post.attachmentUrl" class="post-card__thumb" alt="" />

    <div class="post-card__body">
      <div class="post-card__header">
        <span class="post-card__title">{{ post.title }}</span>
        <w-badge :color="STATUS_COLORS[post.status]">{{ STATUS_LABELS[post.status] }}</w-badge>
      </div>

      <div class="post-card__meta">
        <w-badge :color="NETWORK_COLORS[post.network]">{{ NETWORK_LABELS[post.network] }}</w-badge>
        <span class="format-chip">{{ formatLabel }}</span>
      </div>

      <div class="post-card__footer">
        <span v-if="post.scheduledDate" class="post-date">
          <span class="material-symbols-outlined">event</span>
          {{ formatDate(post.scheduledDate) }}
        </span>
        <button class="mini-action" @click.stop="$emit('remove', post)">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import WBadge from '@/components/ui/WBadge.vue'
import { NETWORK_LABELS, NETWORK_COLORS, STATUS_LABELS, STATUS_COLORS } from '@/api/marketing/marketing-shared.types'
import { formatCalendarDate } from '@/utils/date'
import type { MarketingPost } from '@/api/marketing/marketing-posts.types'

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

export default defineComponent({
  name: 'PostCard',
  components: { WBadge },
  props: {
    post: { type: Object as PropType<MarketingPost>, required: true },
  },
  emits: ['click', 'remove'],
  setup(props) {
    const formatLabel = computed(() => FORMAT_LABELS[props.post.format] || props.post.format)

    function formatDate(dateStr?: string | null) {
      if (!dateStr) return ''
      return formatCalendarDate(dateStr)
    }

    return { formatLabel, formatDate, NETWORK_LABELS, NETWORK_COLORS, STATUS_LABELS, STATUS_COLORS }
  },
})
</script>

<style scoped>
.post-card {
  background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: 8px;
  overflow: hidden; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column;
}
.post-card:hover { border-color: var(--color-primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }

.post-card__thumb { width: 100%; height: 140px; object-fit: cover; display: block; background: var(--color-bg-surface-low); }

.post-card__body { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.post-card__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.post-card__title { font-family: var(--font-body); font-size: 13px; font-weight: 600; color: var(--color-text-base); line-height: 1.4; }

.post-card__meta { display: flex; align-items: center; gap: 8px; }
.format-chip {
  font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--color-text-muted);
  background: var(--color-bg-surface-high); padding: 2px 8px;
}

.post-card__footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); }
.post-date { display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 10px; color: var(--color-text-muted); }
.post-date .material-symbols-outlined { font-size: 12px; }

.mini-action { background: none; border: none; color: var(--color-error); padding: 2px; cursor: pointer; border-radius: 4px; opacity: 0; transition: opacity 0.2s; }
.post-card:hover .mini-action { opacity: 1; }
.mini-action:hover { background: rgba(239, 68, 68, 0.1); }
.mini-action .material-symbols-outlined { font-size: 16px; }
</style>
