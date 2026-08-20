<template>
  <div class="w-line-chart">
    <LineChart v-if="labels.length" :data="chartData" :options="chartOptions" />
    <div v-else class="w-line-chart__empty">Sin datos</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

interface LineDataset {
  label: string
  data: number[]
  color: string
}

export default defineComponent({
  name: 'WLineChart',
  components: { LineChart: Line },
  props: {
    labels: { type: Array as () => string[], required: true },
    datasets: { type: Array as () => LineDataset[], required: true },
    suffix: { type: String, default: '' },
  },
  setup(props) {
    const resolveColor = (color: string) => {
      if (!color.startsWith('var(')) return color
      const varName = color.slice(4, -1).trim()
      const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
      return resolved || '#918FA2'
    }

    const chartData = computed(() => ({
      labels: props.labels,
      datasets: props.datasets.map((d) => {
        const color = resolveColor(d.color)
        return {
          label: d.label,
          data: d.data,
          borderColor: color,
          backgroundColor: color,
          pointRadius: 0,
          tension: 0.25,
          borderWidth: 2,
        }
      }),
    }))

    const chartOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxTicksLimit: 8 } },
        y: {
          beginAtZero: true,
          ticks: {
            font: { size: 10 },
            callback: (value: number | string) => `${value}${props.suffix}`,
          },
        },
      },
      plugins: {
        legend: { position: 'bottom' as const, labels: { boxWidth: 10, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: (ctx: any) => `${ctx.dataset.label}: ${ctx.formattedValue}${props.suffix}`,
          },
        },
      },
    }))

    return { chartData, chartOptions }
  },
})
</script>

<style scoped>
.w-line-chart {
  position: relative;
  height: 220px;
}

.w-line-chart__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
