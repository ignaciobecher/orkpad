<template>
  <div class="w-kpi-card" :style="{ '--accent-color': color }">
    <div class="w-kpi-card__header">
      <div class="w-kpi-card__title">{{ title }}</div>
      <div v-if="icon" class="w-kpi-card__icon">
        <span class="material-symbols-outlined">{{ icon }}</span>
      </div>
    </div>
    <div class="w-kpi-card__body">
      <div class="w-kpi-card__value">{{ value }}</div>
      <div v-if="trend" class="w-kpi-card__trend" :class="trendClass">
        {{ trend }}
      </div>
    </div>
    <div v-if="subValue" class="w-kpi-card__subvalue">
      {{ subValue }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WKpiCard',
  props: {
    title: { type: String, required: true },
    value: { type: [String, Number], required: true },
    icon: { type: String },
    trend: { type: String },
    subValue: { type: String },
    color: { type: String, default: 'var(--color-primary)' },
  },
  computed: {
    trendClass() {
      if (!this.trend) return ''
      return this.trend.startsWith('+') ? 'positive' : 'negative'
    },
  },
})
</script>

<style scoped>
.w-kpi-card {
  padding: 24px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.15s;
}

.w-kpi-card:hover {
  border-color: var(--accent-color);
}

.w-kpi-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.w-kpi-card__title {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.w-kpi-card__icon {
  color: var(--accent-color);
  opacity: 0.8;
}

.w-kpi-card__icon span {
  font-size: 20px;
}

.w-kpi-card__body {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.w-kpi-card__value {
  font-family: var(--font-body);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-base);
}

.w-kpi-card__trend {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.w-kpi-card__trend.positive {
  color: var(--color-success);
  background: rgba(16, 185, 129, 0.1);
}
.w-kpi-card__trend.negative {
  color: var(--color-error);
  background: rgba(239, 68, 68, 0.1);
}

.w-kpi-card__subvalue {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
