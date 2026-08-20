<template>
  <div class="monitoring-overview-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Monitoreo infra</h1>
        <p class="page-subtitle">Resumen · últimos {{ days }} días</p>
      </div>
      <div class="header-right">
        <w-button variant="ghost" :loading="reloading" @click="reload">
          <span class="material-symbols-outlined mr-1">refresh</span>
          Actualizar
        </w-button>
        <router-link :to="{ name: 'railway' }">
          <w-button variant="ghost">
            <span class="material-symbols-outlined mr-1">rocket_launch</span>
            Railway
          </w-button>
        </router-link>
        <router-link :to="{ name: 'netlify' }">
          <w-button variant="ghost">
            <span class="material-symbols-outlined mr-1">language</span>
            Netlify
          </w-button>
        </router-link>
      </div>
    </header>

    <div v-if="initializing" class="loading-state">
      <span class="material-symbols-outlined loading-icon">progress_activity</span>
    </div>

    <template v-else>
      <!-- ────────────────── RAILWAY ────────────────── -->
      <section class="service-section">
        <div class="section-header">
          <span class="material-symbols-outlined section-icon railway-color">rocket_launch</span>
          <h2 class="section-title">Railway</h2>
          <w-badge v-if="railwayStore.isConnected" color="var(--color-success)">Conectado</w-badge>
          <w-badge v-else color="var(--color-text-muted)">Sin conectar</w-badge>
        </div>

        <template v-if="railwayStore.isConnected">
          <div v-if="railwayStore.connection?.tokenInvalid" class="warning-banner">
            <span class="material-symbols-outlined">warning</span>
            Tu conexión a Railway necesita renovarse.
            <router-link :to="{ name: 'integrations' }">Revisar conexión</router-link>
          </div>

          <div class="kpi-row">
            <w-kpi-card title="Proyectos vinculados" :value="railwayStats?.linkedProjectsCount ?? 0" icon="link" />
            <w-kpi-card title="% éxito deploys" :value="`${railwayStats?.successRatePct ?? 0}%`" icon="check_circle" color="var(--color-success)" />
            <w-kpi-card title="Fallidos (24h)" :value="railwayStats?.failedLast24h ?? 0" icon="error" color="var(--color-error)" />
            <w-kpi-card title="Servicios activos" :value="railwayStats?.activeServicesCount ?? 0" icon="deployed_code" />
          </div>

          <div class="charts-row">
            <w-card>
              <template #header><span class="chart-title">Distribución por estado</span></template>
              <w-donut-chart :labels="railwayStatusLabels" :data="railwayStatusData" :colors="railwayStatusColors" />
            </w-card>
            <w-card>
              <template #header><span class="chart-title">Deploys por día</span></template>
              <w-bar-chart :labels="railwayDayLabels" :datasets="railwayDayDatasets" />
            </w-card>
          </div>

          <div class="resource-kpi-row">
            <w-kpi-card title="CPU total" :value="`${totalCpu}%`" icon="memory" color="var(--color-warning)" />
            <w-kpi-card title="RAM total" :value="`${totalMemory} GB`" icon="dns" color="var(--color-primary)" />
            <w-kpi-card title="Disco total" :value="`${totalDisk} GB`" icon="storage" />
            <w-kpi-card title="Red (24h)" :value="`${totalNetwork} GB`" icon="swap_horiz" />
          </div>

          <div v-if="railwayStore.metricsSummaryLoading" class="loading-state-inline">
            <span class="material-symbols-outlined loading-icon">progress_activity</span>
          </div>
          <div v-else class="charts-row">
            <w-card>
              <template #header><span class="chart-title">Uso de CPU (todos los servicios)</span></template>
              <w-line-chart :labels="cpuTimeLabels" :datasets="cpuDatasets" suffix="%" />
            </w-card>
            <w-card>
              <template #header><span class="chart-title">Uso de RAM (todos los servicios)</span></template>
              <w-line-chart :labels="memoryTimeLabels" :datasets="memoryDatasets" suffix=" GB" />
            </w-card>
          </div>
        </template>

        <div v-else class="not-connected-hint">
          Railway no está conectado.
          <router-link :to="{ name: 'integrations' }">Conectar Railway →</router-link>
        </div>
      </section>

      <!-- ────────────────── NETLIFY ────────────────── -->
      <section class="service-section">
        <div class="section-header">
          <span class="material-symbols-outlined section-icon netlify-color">language</span>
          <h2 class="section-title">Netlify</h2>
          <w-badge v-if="netlifyStore.isConnected" color="var(--color-success)">Conectado</w-badge>
          <w-badge v-else color="var(--color-text-muted)">Sin conectar</w-badge>
        </div>

        <template v-if="netlifyStore.isConnected">
          <div v-if="netlifyStore.connection?.tokenInvalid" class="warning-banner">
            <span class="material-symbols-outlined">warning</span>
            Tu conexión a Netlify necesita renovarse.
            <router-link :to="{ name: 'integrations' }">Revisar conexión</router-link>
          </div>

          <div class="kpi-row">
            <w-kpi-card title="Sites vinculados" :value="netlifyStats?.linkedSitesCount ?? 0" icon="link" />
            <w-kpi-card title="% éxito builds" :value="`${netlifyStats?.successRatePct ?? 0}%`" icon="check_circle" color="var(--color-success)" />
            <w-kpi-card title="Fallidos (24h)" :value="netlifyStats?.failedLast24h ?? 0" icon="error" color="var(--color-error)" />
            <w-kpi-card title="Sites activos" :value="netlifyStats?.activeSitesCount ?? 0" icon="deployed_code" />
          </div>

          <div class="charts-row">
            <w-card>
              <template #header><span class="chart-title">Distribución por estado</span></template>
              <w-donut-chart :labels="netlifyStatusLabels" :data="netlifyStatusData" :colors="netlifyStatusColors" />
            </w-card>
            <w-card>
              <template #header><span class="chart-title">Builds por día</span></template>
              <w-bar-chart :labels="netlifyDayLabels" :datasets="netlifyDayDatasets" />
            </w-card>
          </div>
        </template>

        <div v-else class="not-connected-hint">
          Netlify no está conectado.
          <router-link :to="{ name: 'integrations' }">Conectar Netlify →</router-link>
        </div>
      </section>

      <!-- ────────────────── SUPABASE (hidden for now) ────────────────── -->
      <section v-if="false" class="service-section">
        <div class="section-header">
          <span class="material-symbols-outlined section-icon supabase-color">storage</span>
          <h2 class="section-title">Supabase</h2>
          <w-badge v-if="supabaseStore.isConnected" color="var(--color-success)">Conectado</w-badge>
          <w-badge v-else color="var(--color-text-muted)">Sin conectar</w-badge>
        </div>

        <template v-if="supabaseStore.isConnected">
          <div class="kpi-row">
            <w-kpi-card title="Proyectos vinculados" :value="supabaseStore.supabaseProjects.length" icon="link" />
            <w-kpi-card title="CPU total" :value="`${supabaseTotalCpu}%`" icon="memory" color="var(--color-warning)" />
            <w-kpi-card title="RAM total" :value="`${supabaseTotalMemory} MB`" icon="dns" color="var(--color-primary)" />
          </div>

          <div v-if="supabaseStore.metricsSummaryLoading" class="loading-state-inline">
            <span class="material-symbols-outlined loading-icon">progress_activity</span>
          </div>
        </template>

        <div v-else class="not-connected-hint">
          Supabase no está conectado.
          <router-link :to="{ name: 'integrations' }">Conectar Supabase →</router-link>
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useRailwayStore } from '@/stores/railway.store'
import { useNetlifyStore } from '@/stores/netlify.store'
import { useSupabaseStore } from '@/stores/supabase.store'
import WButton from '@/components/ui/WButton.vue'
import WCard from '@/components/ui/WCard.vue'
import WKpiCard from '@/components/ui/WKpiCard.vue'
import WDonutChart from '@/components/ui/WDonutChart.vue'
import WBarChart from '@/components/ui/WBarChart.vue'
import WLineChart from '@/components/ui/WLineChart.vue'
import WBadge from '@/components/ui/WBadge.vue'

const RAILWAY_STATUS_COLORS: Record<string, string> = {
  SUCCESS: 'var(--color-success)',
  FAILED: 'var(--color-error)',
  CRASHED: 'var(--color-error)',
  DEPLOYING: 'var(--color-warning)',
  BUILDING: 'var(--color-warning)',
  INITIALIZING: 'var(--color-warning)',
}

const NETLIFY_STATUS_COLORS: Record<string, string> = {
  ready: 'var(--color-success)',
  error: 'var(--color-error)',
  building: 'var(--color-warning)',
  enqueued: 'var(--color-warning)',
  processing: 'var(--color-warning)',
  uploading: 'var(--color-warning)',
}

function sumSeriesAcrossServices(
  summary: { services: { series: Record<string, { ts: number; value: number }[]> } }[],
  measurement: string,
) {
  const byTs = new Map<number, number>()
  for (const project of summary) {
    for (const service of project.services) {
      const points = service.series[measurement] ?? []
      for (const point of points) {
        byTs.set(point.ts, (byTs.get(point.ts) ?? 0) + point.value)
      }
    }
  }
  return Array.from(byTs.entries())
    .sort(([a], [b]) => a - b)
    .map(([ts, value]) => ({ ts, value }))
}

function sumLatest(
  summary: { services: { latest: Record<string, number> } }[],
  measurement: string,
) {
  let total = 0
  for (const project of summary) {
    for (const service of project.services) {
      total += service.latest[measurement] ?? 0
    }
  }
  return Math.round(total * 100) / 100
}

export default defineComponent({
  name: 'MonitoringOverviewPage',
  components: { WButton, WCard, WKpiCard, WDonutChart, WBarChart, WLineChart, WBadge },
  setup() {
    const railwayStore = useRailwayStore()
    const netlifyStore = useNetlifyStore()
    const supabaseStore = useSupabaseStore()
    const initializing = ref(true)
    const reloading = ref(false)
    const days = ref(30)

    // Railway
    const railwayStats = computed(() => railwayStore.stats)
    const metricsSummary = computed(() => railwayStore.metricsSummary)

    const railwayStatusLabels = computed(() => railwayStats.value?.byStatus.map((s) => s.status) ?? [])
    const railwayStatusData = computed(() => railwayStats.value?.byStatus.map((s) => s.count) ?? [])
    const railwayStatusColors = computed(() =>
      railwayStatusLabels.value.map((s) => RAILWAY_STATUS_COLORS[s] ?? 'var(--color-text-muted)'),
    )
    const railwayDayLabels = computed(() => railwayStats.value?.byDay.map((d) => d.date.slice(5)) ?? [])
    const railwayDayDatasets = computed(() => [
      { label: 'Éxito', data: railwayStats.value?.byDay.map((d) => d.success) ?? [], color: 'var(--color-success)' },
      { label: 'Fallidos', data: railwayStats.value?.byDay.map((d) => d.failed) ?? [], color: 'var(--color-error)' },
      { label: 'Otros', data: railwayStats.value?.byDay.map((d) => d.other) ?? [], color: 'var(--color-text-muted)' },
    ])

    const totalCpu = computed(() => sumLatest(metricsSummary.value, 'CPU_USAGE'))
    const totalMemory = computed(() => sumLatest(metricsSummary.value, 'MEMORY_USAGE_GB'))
    const totalDisk = computed(() => sumLatest(metricsSummary.value, 'DISK_USAGE_GB'))
    const totalNetwork = computed(
      () => sumLatest(metricsSummary.value, 'NETWORK_RX_GB') + sumLatest(metricsSummary.value, 'NETWORK_TX_GB'),
    )
    const cpuSeries = computed(() => sumSeriesAcrossServices(metricsSummary.value, 'CPU_USAGE'))
    const memorySeries = computed(() => sumSeriesAcrossServices(metricsSummary.value, 'MEMORY_USAGE_GB'))
    const formatTs = (ts: number) =>
      new Date(ts * 1000).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    const cpuTimeLabels = computed(() => cpuSeries.value.map((p) => formatTs(p.ts)))
    const cpuDatasets = computed(() => [
      { label: 'CPU total', data: cpuSeries.value.map((p) => Math.round(p.value * 100) / 100), color: 'var(--color-warning)' },
    ])
    const memoryTimeLabels = computed(() => memorySeries.value.map((p) => formatTs(p.ts)))
    const memoryDatasets = computed(() => [
      { label: 'RAM total', data: memorySeries.value.map((p) => Math.round(p.value * 100) / 100), color: 'var(--color-primary)' },
    ])

    // Netlify
    const netlifyStats = computed(() => netlifyStore.stats)
    const netlifyStatusLabels = computed(() => netlifyStats.value?.byStatus.map((s) => s.status) ?? [])
    const netlifyStatusData = computed(() => netlifyStats.value?.byStatus.map((s) => s.count) ?? [])
    const netlifyStatusColors = computed(() =>
      netlifyStatusLabels.value.map((s) => NETLIFY_STATUS_COLORS[s] ?? 'var(--color-text-muted)'),
    )
    const netlifyDayLabels = computed(() => netlifyStats.value?.byDay.map((d) => d.date.slice(5)) ?? [])
    const netlifyDayDatasets = computed(() => [
      { label: 'Éxito', data: netlifyStats.value?.byDay.map((d) => d.success) ?? [], color: 'var(--color-success)' },
      { label: 'Fallidos', data: netlifyStats.value?.byDay.map((d) => d.failed) ?? [], color: 'var(--color-error)' },
      { label: 'Otros', data: netlifyStats.value?.byDay.map((d) => d.other) ?? [], color: 'var(--color-text-muted)' },
    ])

    // Supabase
    const supabaseTotalCpu = computed(() => {
      const items = supabaseStore.metricsSummary
      if (!items?.length) return 0
      return Math.round(items.reduce((acc, p) => acc + (p.latest['cpu_usage'] ?? 0), 0) * 100) / 100
    })
    const supabaseTotalMemory = computed(() => {
      const items = supabaseStore.metricsSummary
      if (!items?.length) return 0
      return Math.round(items.reduce((acc, p) => acc + (p.latest['memory_usage_mb'] ?? 0), 0) * 100) / 100
    })

    return {
      railwayStore,
      netlifyStore,
      supabaseStore,
      initializing,
      reloading,
      days,
      railwayStats,
      railwayStatusLabels,
      railwayStatusData,
      railwayStatusColors,
      railwayDayLabels,
      railwayDayDatasets,
      totalCpu,
      totalMemory,
      totalDisk,
      totalNetwork,
      cpuTimeLabels,
      cpuDatasets,
      memoryTimeLabels,
      memoryDatasets,
      netlifyStats,
      netlifyStatusLabels,
      netlifyStatusData,
      netlifyStatusColors,
      netlifyDayLabels,
      netlifyDayDatasets,
      supabaseTotalCpu,
      supabaseTotalMemory,
    }
  },
  methods: {
    async reload() {
      this.reloading = true
      await Promise.all([
        this.railwayStore.isConnected
          ? Promise.all([this.railwayStore.fetchStats(this.days), this.railwayStore.fetchMetricsSummary(24)])
          : Promise.resolve(),
        this.netlifyStore.isConnected ? this.netlifyStore.fetchStats(this.days) : Promise.resolve(),
      ])
      this.reloading = false
    },
  },
  async mounted() {
    await Promise.all([
      this.railwayStore.fetchConnection(),
      this.netlifyStore.fetchConnection(),
      this.supabaseStore.fetchConnection(),
    ])
    await Promise.all([
      this.railwayStore.isConnected
        ? Promise.all([this.railwayStore.fetchStats(this.days), this.railwayStore.fetchMetricsSummary(24)])
        : Promise.resolve(),
      this.netlifyStore.isConnected ? this.netlifyStore.fetchStats(this.days) : Promise.resolve(),
    ])
    this.initializing = false
  },
})
</script>

<style scoped>
.monitoring-overview-page {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  min-height: 100%;
}

.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.header-left { display: flex; flex-direction: column; gap: 4px; }

.page-title {
  font-family: var(--font-body);
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-base);
}

.page-subtitle {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-right { display: flex; gap: 8px; align-items: center; }

.loading-state { display: flex; justify-content: center; padding: 80px; }
.loading-state-inline { display: flex; justify-content: center; padding: 24px; }
.loading-icon { animation: spin 1s linear infinite; font-size: 32px; color: var(--color-text-muted); }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Service sections */
.service-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.section-icon { font-size: 20px; }
.section-title {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-base);
  flex: 1;
}

.railway-color { color: #9b59b6; }
.netlify-color { color: #00c7b7; }
.supabase-color { color: #3ecf8e; }

.warning-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  color: var(--color-error);
  font-size: 13px;
  border: 1px solid var(--color-error);
}
.warning-banner a { color: var(--color-error); text-decoration: underline; margin-left: auto; }

.not-connected-hint {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
  padding: 16px 0;
  display: flex;
  gap: 8px;
  align-items: center;
}
.not-connected-hint a { color: var(--color-primary); text-decoration: none; }
.not-connected-hint a:hover { text-decoration: underline; }

.kpi-row,
.resource-kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 16px;
}

.chart-title {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.mr-1 { margin-right: 4px; }
</style>
