<template>
  <div class="w-bar-chart">
    <Bar v-if="labels.length" :data="chartData" :options="chartOptions" />
    <div v-else class="w-bar-chart__empty">Sin datos</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface BarDataset {
  label: string
  data: number[]
  color: string
}

export default defineComponent({
  name: 'WBarChart',
  components: { Bar },
  props: {
    labels: { type: Array as () => string[], required: true },
    datasets: { type: Array as () => BarDataset[], required: true },
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
      datasets: props.datasets.map((d) => ({
        label: d.label,
        data: d.data,
        backgroundColor: resolveColor(d.color),
        borderRadius: 2,
      })),
    }))

    const chartOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { stacked: true, beginAtZero: true, ticks: { font: { size: 10 }, precision: 0 } },
      },
      plugins: {
        legend: { position: 'bottom' as const, labels: { boxWidth: 10, font: { size: 11 } } },
      },
    }))

    return { chartData, chartOptions }
  },
})
</script>

<style scoped>
.w-bar-chart {
  position: relative;
  height: 260px;
}

.w-bar-chart__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
