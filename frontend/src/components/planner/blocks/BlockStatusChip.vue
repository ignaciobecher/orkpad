<template>
  <span class="block-status-chip" :class="`status-${status}`">
    <win-icon v-if="icon" :name="icon" :size="13" alt="" />
    <span v-else class="chip-glyph" aria-hidden="true">{{ textIcon }}</span>
    {{ label }}
  </span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import type { BlockStatus } from '@/api/planner/planner.types'
import WinIcon from '@/components/win95/WinIcon.vue'

const STATUS_MAP: Record<string, { label: string; icon: string; textIcon?: string }> = {
  pending: { label: 'Pendiente', icon: '', textIcon: '○' },
  'in-progress': { label: 'En curso', icon: '', textIcon: '►' },
  completed: { label: 'Completado', icon: 'check' },
  skipped: { label: 'Omitido', icon: '', textIcon: '×' },
}

export default defineComponent({
  name: 'BlockStatusChip',
  components: { WinIcon },
  props: {
    status: { type: String as () => BlockStatus, required: true },
  },
  setup(props) {
    const icon = computed(() => STATUS_MAP[props.status]?.icon ?? 'help')
    const textIcon = computed(() => STATUS_MAP[props.status]?.textIcon ?? '')
    const label = computed(() => STATUS_MAP[props.status]?.label ?? props.status)
    return { icon, textIcon, label }
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

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .block-status-chip {
display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  padding: 2px 6px;
  white-space: nowrap;
  flex-shrink: 0;
  font-family: var(--font-mono);
}

html[data-appearance="win95"] .block-status-chip .material-symbols-outlined {
font-size: 13px;
}

html[data-appearance="win95"] .chip-glyph {
font-size: 11px;
  font-weight: bold;
  line-height: 1;
}

html[data-appearance="win95"] .status-pending {
background: var(--color-bg-surface-high); color: var(--color-text-muted);
}

html[data-appearance="win95"] .status-in-progress {
background: var(--color-primary-fixed); color: var(--color-primary);
}

html[data-appearance="win95"] .status-completed {
background: var(--color-success-bg); color: var(--color-success);
}

html[data-appearance="win95"] .status-skipped {
background: var(--color-bg-surface-low); color: var(--color-text-disabled);
}
</style>
