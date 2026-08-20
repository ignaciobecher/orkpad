<script setup lang="ts">
import { ref, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { testimonialsApi } from '@/api/testimonials/testimonials.api'
import { useToast } from '@/composables/useToast'
import type { Testimonial } from '@/api/testimonials/testimonials.types'

defineProps<{ content: Record<string, any>; settings: Record<string, any> }>()
const emit = defineEmits<{
  'update-content': [v: Record<string, any>]
  'update-settings': [v: Record<string, any>]
}>()
const c = (k: string, v: any) => emit('update-content', { [k]: v })
const s = (k: string, v: any) => emit('update-settings', { [k]: v })

const testimonials = ref<Testimonial[]>([])
const reordering = ref(false)

async function fetchTestimonials() {
  try {
    const res = await testimonialsApi.getAll({ limit: 100 })
    testimonials.value = res.data.data.sort((a, b) => a.order - b.order)
  } catch {
    // silently fail, not critical
  }
}

async function onReorder() {
  reordering.value = true
  try {
    await testimonialsApi.reorder(testimonials.value.map((t, i) => ({ id: t._id, order: i })))
  } catch {
    useToast().error('Error al reordenar testimonios')
    await fetchTestimonials()
  } finally {
    reordering.value = false
  }
}

onMounted(fetchTestimonials)
</script>

<template>
  <div class="ed">
    <p class="ed__info">Los testimonios se obtienen automáticamente del workspace (marcados como públicos).</p>
    <div class="ed__group">
      <label class="ed__label">Título</label>
      <input class="ed__input" :value="content.title" @input="c('title', ($event.target as HTMLInputElement).value)" placeholder="Lo que dicen mis clientes" />
    </div>
    <div class="ed__divider"></div>
    <div class="ed__group">
      <label class="ed__toggle">
        <input type="checkbox" :checked="settings.showRating" @change="s('showRating', ($event.target as HTMLInputElement).checked)" />
        <span>Mostrar calificación con estrellas</span>
      </label>
    </div>
    <div class="ed__divider"></div>
    <label class="ed__label">Orden de testimonios</label>
    <p class="ed__hint">Arrastrá para reordenar. Los cambios se guardan automáticamente.</p>
    <div v-if="testimonials.length === 0" class="ed__empty">No hay testimonios públicos todavía.</div>
    <draggable
      v-else
      v-model="testimonials"
      item-key="_id"
      animation="150"
      handle=".t-grip"
      @end="onReorder"
    >
      <template #item="{ element }">
        <div class="t-item">
          <span class="t-grip mdi mdi-drag-vertical"></span>
          <span class="t-name">{{ element.clientName }}</span>
          <span v-if="reordering" class="mdi mdi-loading mdi-spin t-spin"></span>
        </div>
      </template>
    </draggable>
  </div>
</template>

<style scoped src="./editor.css"></style>
<style scoped>
.ed__hint { font-size: 11px; color: var(--color-text-muted); margin: 2px 0 8px; }
.ed__empty { font-size: 12px; color: var(--color-text-muted); padding: 8px 0; }
.t-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border);
  margin-bottom: 4px;
  font-size: 12px;
}
.t-grip { color: var(--color-text-disabled); cursor: grab; font-size: 16px; flex-shrink: 0; }
.t-grip:active { cursor: grabbing; }
.t-name { flex: 1; color: var(--color-text-base); }
.t-spin { font-size: 14px; color: var(--color-text-muted); }
</style>
