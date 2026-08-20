<template>
  <div class="goal-quick-progress">
    <label v-if="goal.type === 'checklist'" class="checklist-toggle">
      <w-checkbox :model-value="isCompleted" @update:model-value="onToggleChecklist" />
    </label>

    <div v-else class="counter">
      <button
        class="counter-btn"
        :disabled="currentCount <= 0"
        @click="$emit('decrement')"
      >
        <span class="material-symbols-outlined">remove</span>
      </button>
      <span class="counter-value" :class="{ 'is-completed': isCompleted }">
        {{ currentCount }}<span class="counter-target">/{{ targetCount }}</span>
      </span>
      <button class="counter-btn counter-btn--primary" @click="$emit('increment')">
        <span class="material-symbols-outlined">add</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import WCheckbox from '@/components/ui/WCheckbox.vue'
import type { Goal } from '@/api/goals/goals.types'

export default defineComponent({
  name: 'GoalQuickProgress',
  components: { WCheckbox },
  props: {
    goal: { type: Object as PropType<Goal>, required: true },
  },
  emits: ['increment', 'decrement', 'complete', 'uncomplete'],
  computed: {
    currentCount(): number {
      return this.goal.currentEntry?.currentCount ?? 0
    },
    targetCount(): number {
      return this.goal.currentEntry?.targetCount ?? this.goal.targetCount
    },
    isCompleted(): boolean {
      return this.goal.currentEntry?.completed ?? false
    },
  },
  methods: {
    onToggleChecklist(value: boolean) {
      this.$emit(value ? 'complete' : 'uncomplete')
    },
  },
})
</script>

<style scoped>
.goal-quick-progress {
  display: flex;
  align-items: center;
}

.counter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.counter-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
}

.counter-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.counter-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.counter-btn--primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.counter-btn--primary:hover {
  background: var(--color-primary-hover);
  color: white;
}

.counter-value {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-base);
  min-width: 48px;
  text-align: center;
}

.counter-value.is-completed {
  color: var(--color-success);
}

.counter-target {
  font-weight: 400;
  color: var(--color-text-muted);
}
</style>
