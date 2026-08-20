<template>
  <div class="goal-item" :style="{ '--goal-color': goal.color }">
    <span class="goal-icon material-symbols-outlined">{{ goal.icon || defaultIcon }}</span>

    <div class="goal-main">
      <div class="goal-title-row">
        <span class="goal-title">{{ goal.title }}</span>
        <w-badge :color="goal.color">{{ typeLabel }}</w-badge>
        <w-badge v-if="goal.currentStreak > 0" color="var(--color-warning)">
          🔥 {{ goal.currentStreak }}
        </w-badge>
      </div>
      <div v-if="goal.type === 'target'" class="goal-target-progress">
        <div class="progress-bar">
          <div class="progress-bar__fill" :style="{ width: targetProgressPct + '%' }"></div>
        </div>
        <span class="goal-target-meta">
          {{ currentCount }}/{{ goal.targetCount }} {{ goal.unit }}
          <template v-if="goal.dueDate"> · vence {{ formattedDueDate }}</template>
        </span>
      </div>
      <div v-else class="goal-subtitle">
        {{ periodLabel }}<template v-if="goal.unit"> · {{ goal.unit }}</template>
      </div>
    </div>

    <goal-quick-progress
      v-if="goal.status === 'active'"
      :goal="goal"
      @increment="$emit('increment', goal._id)"
      @decrement="$emit('decrement', goal._id)"
      @complete="$emit('complete', goal._id)"
      @uncomplete="$emit('uncomplete', goal._id)"
    />
    <w-badge v-else :color="statusColor">{{ statusLabel }}</w-badge>

    <div class="goal-actions">
      <button class="icon-btn" title="Ver estadísticas" @click="$emit('stats', goal._id)">
        <span class="material-symbols-outlined">bar_chart</span>
      </button>
      <button class="icon-btn" title="Editar" @click="$emit('edit', goal)">
        <span class="material-symbols-outlined">edit</span>
      </button>
      <button class="icon-btn icon-btn--danger" title="Eliminar" @click="$emit('remove', goal._id)">
        <span class="material-symbols-outlined">delete</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import WBadge from '@/components/ui/WBadge.vue'
import GoalQuickProgress from './GoalQuickProgress.vue'
import type { Goal } from '@/api/goals/goals.types'

const TYPE_LABELS: Record<string, string> = {
  habit: 'Hábito',
  target: 'Meta',
  checklist: 'Checklist',
}

const PERIOD_LABELS: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  none: 'Sin período',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  paused: 'Pausado',
  archived: 'Archivado',
  completed: 'Completado',
  failed: 'No cumplido',
}

export default defineComponent({
  name: 'GoalListItem',
  components: { WBadge, GoalQuickProgress },
  props: {
    goal: { type: Object as PropType<Goal>, required: true },
  },
  emits: ['increment', 'decrement', 'complete', 'uncomplete', 'edit', 'remove', 'stats'],
  computed: {
    defaultIcon(): string {
      return this.goal.type === 'target' ? 'flag' : this.goal.type === 'checklist' ? 'checklist' : 'repeat'
    },
    typeLabel(): string {
      return TYPE_LABELS[this.goal.type] ?? this.goal.type
    },
    periodLabel(): string {
      return PERIOD_LABELS[this.goal.period] ?? this.goal.period
    },
    statusLabel(): string {
      return STATUS_LABELS[this.goal.status] ?? this.goal.status
    },
    statusColor(): string {
      if (this.goal.status === 'completed') return 'var(--color-success)'
      if (this.goal.status === 'failed') return 'var(--color-error)'
      return 'var(--color-text-muted)'
    },
    currentCount(): number {
      return this.goal.currentEntry?.currentCount ?? 0
    },
    targetProgressPct(): number {
      if (!this.goal.targetCount) return 0
      return Math.min(100, Math.round((this.currentCount / this.goal.targetCount) * 100))
    },
    formattedDueDate(): string {
      if (!this.goal.dueDate) return ''
      return new Date(this.goal.dueDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },
  },
})
</script>

<style scoped>
.goal-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
}

.goal-item:last-child {
  border-bottom: none;
}

.goal-icon {
  color: var(--goal-color);
  font-size: 22px;
  flex-shrink: 0;
}

.goal-main {
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.goal-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.goal-title {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-base);
}

.goal-subtitle {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.goal-target-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex-grow: 1;
  max-width: 160px;
  height: 6px;
  background: var(--color-bg-surface-high);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: var(--goal-color);
  transition: width 0.2s;
}

.goal-target-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.goal-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.icon-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: 4px;
}

.icon-btn:hover {
  background: var(--color-bg-surface-highest);
  color: var(--color-text-base);
}

.icon-btn--danger:hover {
  color: var(--color-error);
}

.icon-btn .material-symbols-outlined {
  font-size: 18px;
}
</style>
