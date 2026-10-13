<template>
  <div class="task-item" :class="{ 'is-completed': task.completed }">
    <button class="task-item__check" @click.stop="$emit('toggle', task._id)">
      <win-icon :name="materialToWinIcon(task.completed ? 'check_circle' : 'radio_button_unchecked')" :size="16" />
    </button>

    <span class="task-item__title">{{ task.title }}</span>

    <span v-if="task.estimatedMinutes" class="task-item__time">
      {{ task.estimatedMinutes }}m
    </span>

    <div class="task-item__actions">
      <button @click.stop="$emit('delete', task._id)" title="Eliminar">
        <span aria-hidden="true">×</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PlannerTask } from '@/api/planner/planner.types'
import WinIcon from '../../win95/WinIcon.vue'
import { materialToWinIcon } from '../../win95/icons'

export default defineComponent({
  name: 'TaskItem',
  components: { WinIcon },
  props: {
    task: { type: Object as () => PlannerTask, required: true },
  },
  emits: ['toggle', 'delete'],
  setup() {
    return { materialToWinIcon }
  },
})
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 4px;
  transition: background 0.1s;
}

.task-item:hover { background: var(--color-bg-surface-low); }

.task-item__check {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-disabled);
  display: flex;
  align-items: center;
  padding: 0;
  flex-shrink: 0;
}

.task-item__check:hover { color: var(--color-success); }
.task-item__check .material-symbols-outlined { font-size: 18px; }

.task-item.is-completed .task-item__check { color: var(--color-success); }

.task-item__title {
  flex: 1;
  font-size: 12px;
  color: var(--color-text-base);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-item.is-completed .task-item__title {
  text-decoration: line-through;
  color: var(--color-text-disabled);
}

.task-item__time {
  font-size: 11px;
  color: var(--color-text-disabled);
  flex-shrink: 0;
  font-family: var(--font-mono);
}

.task-item__actions { display: none; }

.task-item:hover .task-item__actions { display: flex; }

.task-item__actions button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-disabled);
  display: flex;
  align-items: center;
  padding: 2px;
}

.task-item__actions button:hover { color: var(--color-error); }
.task-item__actions .material-symbols-outlined { font-size: 14px; }
</style>
