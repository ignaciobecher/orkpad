<template>
  <span class="block-status-chip" :class="`status-${status}`">
    <span class="material-symbols-outlined">{{ icon }}</span>
    {{ label }}
  </span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import type { BlockStatus } from '@/api/planner/planner.types'

const STATUS_MAP: Record<string, { label: string; icon: string }> = {
  pending: { label: 'Pendiente', icon: 'radio_button_unchecked' },
  'in-progress': { label: 'En curso', icon: 'play_circle' },
  completed: { label: 'Completado', icon: 'check_circle' },
  skipped: { label: 'Omitido', icon: 'cancel' },
}

export default defineComponent({
  name: 'BlockStatusChip',
  props: {
    status: { type: String as () => BlockStatus, required: true },
  },
  setup(props) {
    const icon = computed(() => STATUS_MAP[props.status]?.icon ?? 'help')
    const label = computed(() => STATUS_MAP[props.status]?.label ?? props.status)
    return { icon, label }
  },
})
</script>

<style scoped>
.block-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  padding: 2px 6px;
  white-space: nowrap;
  flex-shrink: 0;
  font-family: var(--font-mono);
}

.block-status-chip .material-symbols-outlined { font-size: 13px; }

.status-pending { background: var(--color-bg-surface-high); color: var(--color-text-muted); }
.status-in-progress { background: var(--color-primary-fixed); color: var(--color-primary); }
.status-completed { background: var(--color-success-bg); color: var(--color-success); }
.status-skipped { background: var(--color-bg-surface-low); color: var(--color-text-disabled); }
</style>
