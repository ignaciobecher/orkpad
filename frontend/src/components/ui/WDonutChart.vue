<template>
  <div class="w-donut-chart">
    <Doughnut v-if="data.length" :data="chartData" :options="chartOptions" />
    <div v-else class="w-donut-chart__empty">Sin datos</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default defineComponent({
  name: 'WDonutChart',
  components: { Doughnut },
  props: {
    labels: { type: Array as () => string[], required: true },
    data: { type: Array as () => number[], required: true },
    colors: { type: Array as () => string[], default: () => [] },
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
      datasets: [
        {
          data: props.data,
          backgroundColor: props.colors.map(resolveColor),
          borderWidth: 0,
        },
      ],
    }))

    const chartOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: { boxWidth: 10, font: { size: 11 } },
        },
      },
    }))

    return { chartData, chartOptions }
  },
})
</script>

<style scoped>
.w-donut-chart {
  position: relative;
  height: 220px;
}

.w-donut-chart__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
