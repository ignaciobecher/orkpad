<template>
  <section class="goals-summary-bar">
    <w-kpi-card
      title="Hábitos hoy"
      :value="habitsTodayValue"
      icon="task_alt"
      color="var(--color-success)"
    />
    <w-kpi-card
      title="Metas activas"
      :value="summary?.activeTargets ?? '—'"
      icon="flag"
      color="var(--color-primary)"
    />
    <w-kpi-card
      title="Mejor racha"
      :value="bestStreakValue"
      icon="local_fire_department"
      color="var(--color-warning)"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import WKpiCard from '@/components/ui/WKpiCard.vue'
import type { GoalsSummary } from '@/api/goals/goals.types'

export default defineComponent({
  name: 'GoalsSummaryBar',
  components: { WKpiCard },
  props: {
    summary: { type: Object as PropType<GoalsSummary | null>, default: null },
  },
  computed: {
    habitsTodayValue(): string {
      if (!this.summary) return '—'
      return `${this.summary.habitsToday.completed}/${this.summary.habitsToday.total}`
    },
    bestStreakValue(): string {
      if (!this.summary) return '—'
      return `${this.summary.bestStreakOverall} días`
    },
  },
})
</script>

<style scoped>
.goals-summary-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
</style>
