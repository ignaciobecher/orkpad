<template>
  <div class="metrics-tab">
    <add-metric-form :loading="false" @submit="$emit('add', $event)" />

    <div class="metrics-table-wrapper">
      <span class="field-label">Historial</span>
      <table v-if="sortedMetrics.length" class="metrics-table">
        <thead>
          <tr>
            <th>Semana</th>
            <th>Posts</th>
            <th>Mensajes</th>
            <th>Respuestas</th>
            <th>Llamadas</th>
            <th>Clientes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(m, i) in sortedMetrics" :key="i">
            <td>{{ m.weekNumber }}/{{ m.year }}</td>
            <td>{{ m.postsPublished }}</td>
            <td>{{ m.messagesSent }}</td>
            <td>{{ m.responsesReceived }}</td>
            <td>{{ m.callsBooked }}</td>
            <td>{{ m.clientsClosed }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="no-metrics">Todavía no hay métricas registradas</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import AddMetricForm from '@/components/social-identity/AddMetricForm.vue'
import type { SocialAccount } from '@/api/social-identity/social-identity.types'

export default defineComponent({
  name: 'MetricsTab',
  components: { AddMetricForm },
  props: {
    account: { type: Object as PropType<SocialAccount>, required: true },
  },
  emits: ['add'],
  setup(props) {
    const sortedMetrics = computed(() =>
      [...(props.account.weeklyMetrics || [])].sort((a, b) => (a.year - b.year) || (a.weekNumber - b.weekNumber)).reverse()
    )

    return { sortedMetrics }
  },
})
</script>

<style scoped>
.metrics-tab { display: flex; flex-direction: column; gap: 24px; max-width: 720px; }

.metrics-table-wrapper { display: flex; flex-direction: column; gap: 8px; }
.field-label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }

.metrics-table { width: 100%; border-collapse: collapse; }
.metrics-table th, .metrics-table td { padding: 8px 12px; text-align: left; font-size: 12px; border-bottom: 1px solid var(--color-border); }
.metrics-table th { font-family: var(--font-mono); text-transform: uppercase; font-size: 10px; color: var(--color-text-muted); }
.metrics-table td { color: var(--color-text-base); font-family: var(--font-mono); }

.no-metrics { font-size: 13px; color: var(--color-text-muted); }
</style>
