<template>
  <div class="goal-stats-panel">
    <div class="stats-kpis">
      <w-kpi-card title="Cumplimiento" :value="completionRateLabel" icon="percent" color="var(--color-primary)" />
      <w-kpi-card title="Racha actual" :value="`${stats?.currentStreak ?? 0} días`" icon="local_fire_department" color="var(--color-warning)" />
      <w-kpi-card title="Mejor racha" :value="`${stats?.bestStreak ?? 0} días`" icon="emoji_events" color="var(--color-success)" />
    </div>

    <w-card class="stats-chart-card">
      <template #header>
        <span class="stats-chart-title">Completados vs pendientes</span>
      </template>
      <w-donut-chart
        :labels="['Completados', 'Pendientes']"
        :data="[stats?.completedEntries ?? 0, pendingEntries]"
        :colors="['var(--color-success)', 'var(--color-border)']"
      />
    </w-card>

    <w-card class="stats-heatmap-card">
      <template #header>
        <span class="stats-chart-title">Historial (últimos 90 días)</span>
      </template>
      <goal-heatmap :entries="entries" />
    </w-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import WKpiCard from '@/components/ui/WKpiCard.vue'
import WCard from '@/components/ui/WCard.vue'
import WDonutChart from '@/components/ui/WDonutChart.vue'
import GoalHeatmap from './GoalHeatmap.vue'
import type { GoalStats, GoalEntry } from '@/api/goals/goals.types'

export default defineComponent({
  name: 'GoalStatsPanel',
  components: { WKpiCard, WCard, WDonutChart, GoalHeatmap },
  props: {
    stats: { type: Object as PropType<GoalStats | null>, default: null },
    entries: { type: Array as PropType<GoalEntry[]>, default: () => [] },
  },
  computed: {
    completionRateLabel(): string {
      if (!this.stats) return '—'
      return `${Math.round(this.stats.completionRate * 100)}%`
    },
    pendingEntries(): number {
      if (!this.stats) return 0
      return Math.max(0, this.stats.totalEntries - this.stats.completedEntries)
    },
  },
})
</script>

<style scoped>
.goal-stats-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.stats-chart-title {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
</style>
