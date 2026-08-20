<template>
  <div class="railway-page">
    <header class="page-header">
      <button class="back-btn" @click="$router.push({ name: 'project-detail', params: { id: projectId } })">
        <span class="material-symbols-outlined">arrow_back</span>
        <span>Volver al proyecto</span>
      </button>
      <div v-if="railwayProjectName" class="header-info">
        <span class="material-symbols-outlined" style="font-size:18px;color:var(--color-text-muted)">rocket_launch</span>
        <span class="project-name-label">{{ railwayProjectName }}</span>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <span class="material-symbols-outlined loading-icon">progress_activity</span>
    </div>

    <div v-else-if="!railwayProjectId" class="empty-state">
      <span class="material-symbols-outlined" style="font-size:48px;color:var(--color-text-muted)">link_off</span>
      <p>Este proyecto no tiene un proyecto de Railway vinculado.</p>
      <w-button variant="ghost" @click="$router.push({ name: 'project-detail', params: { id: projectId } })">
        Vincular desde el detalle del proyecto
      </w-button>
    </div>

    <template v-else>
      <div class="railway-content">
        <!-- Services -->
        <section class="feed-section">
          <div class="feed-header">
            <h2 class="feed-title">Servicios</h2>
            <span class="feed-count">{{ railwayStore.services.length }}</span>
          </div>
          <w-card class="no-padding">
            <div v-if="servicesLoading" class="feed-loading">Cargando servicios...</div>
            <div v-else-if="!railwayStore.services.length" class="feed-empty">Sin servicios</div>
            <div v-for="service in railwayStore.services" :key="service.id" class="service-row">
              <span class="material-symbols-outlined service-icon">deployed_code</span>
              <div class="row-info">
                <span class="row-primary">{{ service.name }}</span>
                <span class="row-meta">{{ service.id }}</span>
              </div>
              <div class="service-metrics-inline">
                <span class="metric-pill" title="CPU">
                  <span class="material-symbols-outlined">memory</span>
                  {{ formatLatest(service.id, 'CPU_USAGE') }}%
                </span>
                <span class="metric-pill" title="RAM">
                  <span class="material-symbols-outlined">dns</span>
                  {{ formatLatest(service.id, 'MEMORY_USAGE_GB') }} GB
                </span>
              </div>
            </div>
          </w-card>
        </section>

        <!-- Resource metrics -->
        <section v-if="railwayStore.services.length" class="feed-section">
          <div class="feed-header">
            <h2 class="feed-title">Recursos · últimas 24h</h2>
          </div>
          <div class="metrics-charts-row">
            <w-card v-for="service in railwayStore.services" :key="service.id">
              <template #header>
                <span class="chart-title">{{ service.name }}</span>
              </template>
              <div v-if="metricsLoading[service.id]" class="feed-loading">Cargando métricas...</div>
              <template v-else>
                <w-line-chart
                  :labels="metricLabels(service.id)"
                  :datasets="cpuMemoryDatasets(service.id)"
                />
              </template>
            </w-card>
          </div>
        </section>

        <!-- Deployments -->
        <section class="feed-section">
          <div class="feed-header">
            <h2 class="feed-title">Deployments recientes</h2>
            <span class="feed-count">{{ railwayStore.deployments.length }}</span>
          </div>
          <w-card class="no-padding">
            <div v-if="railwayStore.deploymentsLoading" class="feed-loading">Cargando deployments...</div>
            <div v-else-if="!railwayStore.deployments.length" class="feed-empty">Sin deployments</div>
            <div v-for="deploy in railwayStore.deployments" :key="deploy.id" class="deploy-row">
              <div class="deploy-status-wrap">
                <span
                  class="deploy-status-dot"
                  :style="{ background: getStatusColor(deploy.status) }"
                  :title="deploy.status"
                ></span>
              </div>
              <div class="row-info">
                <span class="row-primary">
                  {{ deploy.meta?.commitMessage || deploy.id.slice(0, 12) }}
                </span>
                <span class="row-meta">
                  {{ deploy.service?.name }} ·
                  {{ deploy.meta?.commitAuthor ? `${deploy.meta.commitAuthor} · ` : '' }}
                  {{ formatDate(deploy.createdAt) }}
                </span>
              </div>
              <w-badge :color="getStatusColor(deploy.status)" class="deploy-badge">
                {{ formatStatus(deploy.status) }}
              </w-badge>
              <a v-if="deploy.url" :href="deploy.url" target="_blank" class="row-link" title="Ver deployment">
                <span class="material-symbols-outlined">open_in_new</span>
              </a>
            </div>
          </w-card>
        </section>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useProjectsStore } from '@/stores/projects.store'
import { useRailwayStore } from '@/stores/railway.store'
import { mapActions } from 'pinia'
import WButton from '@/components/ui/WButton.vue'
import WCard from '@/components/ui/WCard.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WLineChart from '@/components/ui/WLineChart.vue'

export default defineComponent({
  name: 'ProjectRailwayPage',
  components: { WButton, WCard, WBadge, WLineChart },
  data() {
    return {
      loading: false,
      servicesLoading: false,
      metricsLoading: {} as Record<string, boolean>,
      railwayStore: useRailwayStore(),
      projectsStore: useProjectsStore(),
    }
  },
  computed: {
    projectId(): string {
      return this.$route.params.id as string
    },
    railwayProjectId(): string | null {
      return (this.projectsStore.selected as any)?.railwayProjectId ?? null
    },
    railwayProjectName(): string | null {
      if (!this.railwayProjectId) return null
      const found = this.railwayStore.railwayProjects.find((p) => p.id === this.railwayProjectId)
      return found?.name ?? this.railwayProjectId
    },
  },
  methods: {
    ...mapActions(useProjectsStore, ['fetchById']),
    formatDate(iso: string) {
      return new Date(iso).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    formatStatus(status: string) {
      const map: Record<string, string> = {
        SUCCESS: 'OK',
        FAILED: 'Error',
        DEPLOYING: 'Deploy...',
        CRASHED: 'Caído',
        REMOVED: 'Removido',
        SLEEPING: 'Sleeping',
        SKIPPED: 'Omitido',
        WAITING: 'Esperando',
        BUILDING: 'Build...',
        INITIALIZING: 'Init...',
      }
      return map[status] ?? status
    },
    getStatusColor(status: string) {
      const map: Record<string, string> = {
        SUCCESS: 'var(--color-success)',
        FAILED: 'var(--color-error)',
        CRASHED: 'var(--color-error)',
        DEPLOYING: 'var(--color-warning)',
        BUILDING: 'var(--color-warning)',
        INITIALIZING: 'var(--color-warning)',
        WAITING: 'var(--color-text-muted)',
        SLEEPING: 'var(--color-text-muted)',
        REMOVED: 'var(--color-text-muted)',
        SKIPPED: 'var(--color-text-muted)',
      }
      return map[status] ?? 'var(--color-text-muted)'
    },
    formatLatest(serviceId: string, measurement: string): string {
      const m = this.railwayStore.serviceMetrics[serviceId]
      const v = m?.latest?.[measurement as keyof typeof m.latest] ?? 0
      return (Math.round(v * 100) / 100).toString()
    },
    metricLabels(serviceId: string): string[] {
      const m = this.railwayStore.serviceMetrics[serviceId]
      const series = m?.series?.['CPU_USAGE'] ?? m?.series?.['MEMORY_USAGE_GB'] ?? []
      return series.map((p) =>
        new Date(p.ts * 1000).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      )
    },
    cpuMemoryDatasets(serviceId: string) {
      const m = this.railwayStore.serviceMetrics[serviceId]
      return [
        {
          label: 'CPU',
          data: (m?.series?.['CPU_USAGE'] ?? []).map((p) => Math.round(p.value * 100) / 100),
          color: 'var(--color-warning)',
        },
        {
          label: 'RAM (GB)',
          data: (m?.series?.['MEMORY_USAGE_GB'] ?? []).map((p) => Math.round(p.value * 100) / 100),
          color: 'var(--color-primary)',
        },
      ]
    },
    async loadData() {
      this.loading = true
      await this.fetchById(this.projectId)
      this.loading = false

      if (!this.railwayProjectId) return

      this.servicesLoading = true
      await Promise.all([
        this.railwayStore.fetchServices(this.railwayProjectId).finally(() => { this.servicesLoading = false }),
        this.railwayStore.fetchDeployments(this.railwayProjectId),
      ])

      for (const service of this.railwayStore.services) {
        this.metricsLoading = { ...this.metricsLoading, [service.id]: true }
        this.railwayStore
          .fetchServiceMetrics(this.railwayProjectId!, service.id, 24)
          .finally(() => {
            this.metricsLoading = { ...this.metricsLoading, [service.id]: false }
          })
      }
    },
  },
  mounted() {
    this.loadData()
  },
})
</script>

<style scoped>
.railway-page {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex-grow: 1;
  min-width: 0;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
  letter-spacing: 0.05em;
}
.back-btn:hover { color: var(--color-text-base); }
.back-btn .material-symbols-outlined { font-size: 16px; }

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-name-label {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-primary);
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 64px;
}
.loading-icon {
  animation: spin 1s linear infinite;
  font-size: 32px;
  color: var(--color-text-muted);
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.railway-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feed-section { display: flex; flex-direction: column; gap: 12px; }

.feed-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.feed-title {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}
.feed-count {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 1px 6px;
}

.no-padding :deep(.w-card__body) { padding: 0 !important; }

.feed-loading, .feed-empty {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 20px 16px;
}

.service-row, .deploy-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  min-width: 0;
}
.service-row:last-child, .deploy-row:last-child { border-bottom: none; }

.service-icon {
  font-size: 16px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.row-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.row-primary {
  font-size: 13px;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-meta {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.deploy-status-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.deploy-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: block;
}

.deploy-badge {
  flex-shrink: 0;
  font-size: 10px;
}

.row-link {
  color: var(--color-text-muted);
  display: flex;
  flex-shrink: 0;
}
.row-link:hover { color: var(--color-primary); }
.row-link .material-symbols-outlined { font-size: 16px; }

.service-metrics-inline {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.metric-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  padding: 2px 6px;
  background: var(--color-bg-surface-high);
}
.metric-pill .material-symbols-outlined { font-size: 12px; }

.metrics-charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
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
</style>
