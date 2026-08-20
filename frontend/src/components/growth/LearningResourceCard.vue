<template>
  <div class="resource-card" :style="{ '--resource-color': resource.color }">
    <span class="resource-icon material-symbols-outlined">{{ typeIcon }}</span>

    <div class="resource-main">
      <div class="resource-title-row">
        <span class="resource-title">{{ resource.title }}</span>
        <w-badge :color="resource.color">{{ typeLabel }}</w-badge>
        <w-badge v-if="resource.status === 'completed'" color="var(--color-success)">Completado</w-badge>
      </div>
      <div v-if="resource.author" class="resource-subtitle">{{ resource.author }}</div>

      <div v-if="resource.totalUnits" class="resource-progress">
        <div class="progress-bar">
          <div class="progress-bar__fill" :style="{ width: progressPct + '%' }"></div>
        </div>
        <span class="resource-progress-label">
          {{ resource.currentProgress }}/{{ resource.totalUnits }} {{ resource.unit }}
        </span>
      </div>
      <div v-if="resource.dailyGoalUnits" class="resource-daily-goal">
        Mínimo diario: {{ resource.dailyGoalUnits }} {{ resource.unit }}
      </div>
    </div>

    <div v-if="resource.status !== 'completed' && resource.status !== 'abandoned'" class="resource-log">
      <input v-model.number="unitsToLog" type="number" min="1" class="log-input" />
      <button class="icon-btn" title="Registrar progreso" @click="$emit('log', resource._id, unitsToLog)">
        <span class="material-symbols-outlined">add_task</span>
      </button>
    </div>

    <div class="resource-actions">
      <button class="icon-btn" title="Editar" @click="$emit('edit', resource)">
        <span class="material-symbols-outlined">edit</span>
      </button>
      <button class="icon-btn icon-btn--danger" title="Eliminar" @click="$emit('remove', resource._id)">
        <span class="material-symbols-outlined">delete</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import WBadge from '@/components/ui/WBadge.vue'
import type { LearningResource } from '@/api/learning/learning.types'

const TYPE_LABELS: Record<string, string> = {
  book: 'Libro',
  video: 'Video',
  course: 'Curso',
  article: 'Artículo',
  podcast: 'Podcast',
}

const TYPE_ICONS: Record<string, string> = {
  book: 'menu_book',
  video: 'smart_display',
  course: 'school',
  article: 'article',
  podcast: 'podcasts',
}

export default defineComponent({
  name: 'LearningResourceCard',
  components: { WBadge },
  props: {
    resource: { type: Object as PropType<LearningResource>, required: true },
  },
  emits: ['log', 'edit', 'remove'],
  data() {
    return { unitsToLog: this.resource.dailyGoalUnits ?? 1 }
  },
  computed: {
    typeLabel(): string {
      return TYPE_LABELS[this.resource.type] ?? this.resource.type
    },
    typeIcon(): string {
      return TYPE_ICONS[this.resource.type] ?? 'auto_stories'
    },
    progressPct(): number {
      if (!this.resource.totalUnits) return 0
      return Math.min(100, (this.resource.currentProgress / this.resource.totalUnits) * 100)
    },
  },
})
</script>

<style scoped>
.resource-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.resource-card:last-child {
  border-bottom: none;
}

.resource-icon {
  color: var(--resource-color, var(--color-primary));
  font-size: 24px;
}

.resource-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.resource-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.resource-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-base);
}

.resource-subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
}

.resource-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  max-width: 200px;
  height: 6px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: var(--resource-color, var(--color-primary));
}

.resource-progress-label,
.resource-daily-goal {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.resource-log {
  display: flex;
  align-items: center;
  gap: 6px;
}

.log-input {
  width: 56px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  padding: 6px 8px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 12px;
}

.resource-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
}

.icon-btn:hover {
  background: var(--color-bg-base);
  color: var(--color-text-base);
}

.icon-btn--danger:hover {
  color: var(--color-error);
}
</style>
