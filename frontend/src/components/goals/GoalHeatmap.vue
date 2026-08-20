<template>
  <div class="goal-heatmap">
    <div v-if="weeks.length === 0" class="heatmap-empty">Sin datos para este período todavía</div>
    <div v-else class="heatmap-grid">
      <div v-for="(week, wIdx) in weeks" :key="wIdx" class="heatmap-week">
        <div
          v-for="day in week"
          :key="day.key"
          class="heatmap-cell"
          :class="cellClass(day)"
          :title="cellTitle(day)"
        ></div>
      </div>
    </div>
    <div class="heatmap-legend">
      <span>Menos</span>
      <span class="heatmap-cell heatmap-cell--level-0"></span>
      <span class="heatmap-cell heatmap-cell--level-1"></span>
      <span class="heatmap-cell heatmap-cell--level-2"></span>
      <span class="heatmap-cell heatmap-cell--level-3"></span>
      <span>Más</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import type { GoalEntry } from '@/api/goals/goals.types'

interface HeatDay {
  key: string
  date: Date
  entry?: GoalEntry
}

export default defineComponent({
  name: 'GoalHeatmap',
  props: {
    entries: { type: Array as PropType<GoalEntry[]>, default: () => [] },
    days: { type: Number, default: 90 },
  },
  computed: {
    entryByKey(): Record<string, GoalEntry> {
      const map: Record<string, GoalEntry> = {}
      for (const entry of this.entries) {
        map[entry.periodStart.slice(0, 10)] = entry
      }
      return map
    },
    flatDays(): HeatDay[] {
      const result: HeatDay[] = []
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = this.days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const key = date.toISOString().slice(0, 10)
        result.push({ key, date, entry: this.entryByKey[key] })
      }
      return result
    },
    weeks(): HeatDay[][] {
      const weeks: HeatDay[][] = []
      let current: HeatDay[] = []
      for (const day of this.flatDays) {
        current.push(day)
        if (day.date.getDay() === 6) {
          weeks.push(current)
          current = []
        }
      }
      if (current.length) weeks.push(current)
      return weeks
    },
  },
  methods: {
    level(day: HeatDay): number {
      if (!day.entry) return 0
      if (day.entry.completed) return 3
      if (day.entry.currentCount > 0) {
        const ratio = day.entry.currentCount / day.entry.targetCount
        return ratio >= 0.5 ? 2 : 1
      }
      return 0
    },
    cellClass(day: HeatDay) {
      return `heatmap-cell--level-${this.level(day)}`
    },
    cellTitle(day: HeatDay): string {
      const dateLabel = day.date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
      if (!day.entry) return `${dateLabel}: sin registro`
      return `${dateLabel}: ${day.entry.currentCount}/${day.entry.targetCount}`
    },
  },
})
</script>

<style scoped>
.goal-heatmap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.heatmap-empty {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
  padding: 24px 0;
  text-align: center;
}

.heatmap-grid {
  display: flex;
  gap: 3px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.heatmap-week {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.heatmap-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: var(--color-bg-surface-high);
}

.heatmap-cell--level-0 {
  background: var(--color-bg-surface-high);
}

.heatmap-cell--level-1 {
  background: color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.heatmap-cell--level-2 {
  background: color-mix(in srgb, var(--color-primary) 60%, transparent);
}

.heatmap-cell--level-3 {
  background: var(--color-primary);
}

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
}
</style>
