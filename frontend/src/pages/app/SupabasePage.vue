<template>
  <div class="supabase-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Supabase</h1>
        <p class="page-subtitle">Proyectos vinculados · métricas de base de datos</p>
      </div>
      <div class="header-right">
        <w-button variant="ghost" :loading="store.metricsSummaryLoading" @click="reload">
          <span class="material-symbols-outlined mr-1">refresh</span>
          Actualizar
        </w-button>
        <router-link to="/app/integrations">
          <w-button variant="ghost">
            <span class="material-symbols-outlined mr-1">settings</span>
            Conexiones
          </w-button>
        </router-link>
      </div>
    </header>

    <!-- Cargando estado inicial -->
    <div v-if="initializing" class="loading-state">
      <span class="material-symbols-outlined loading-icon">progress_activity</span>
    </div>

    <!-- Not connected -->
    <div v-else-if="!store.isConnected" class="empty-state">
      <span class="material-symbols-outlined empty-icon">database</span>
      <p>Supabase no está conectado en este workspace.</p>
      <router-link to="/app/integrations">
        <w-button variant="primary">Conectar Supabase</w-button>
      </router-link>
    </div>

    <template v-else>
      <!-- Cargando summary -->
      <div v-if="store.metricsSummaryLoading" class="loading-state">
        <span class="material-symbols-outlined loading-icon">progress_activity</span>
      </div>

      <!-- No linked projects -->
      <div v-else-if="!store.metricsSummary.length" class="empty-state">
        <span class="material-symbols-outlined empty-icon">link_off</span>
        <p>No hay proyectos de Orkpad vinculados a Supabase.</p>
        <p class="empty-hint">Andá al detalle de un proyecto y vinculalo desde la sección Supabase.</p>
        <router-link to="/app/projects">
          <w-button variant="ghost">Ir a Proyectos</w-button>
        </router-link>
      </div>

      <!-- Projects grid -->
      <div v-else class="projects-grid">
        <div
          v-for="proj in store.metricsSummary"
          :key="proj.orkpadProjectId"
          class="project-card"
        >
          <div class="card-header">
            <div class="card-header-left">
              <div class="card-icon-wrap">
                <span class="material-symbols-outlined card-icon">database</span>
              </div>
              <div class="card-titles">
                <div class="card-title">{{ proj.orkpadProjectName }}</div>
                <div class="card-subtitle mono">{{ proj.supabaseProjectRef }}</div>
              </div>
            </div>
          </div>

          <div class="metrics-grid">
            <div class="metric-tile">
              <span class="metric-label">CPU</span>
              <span class="metric-value">{{ formatCpu(proj.latest) }}</span>
            </div>
            <div class="metric-tile">
              <span class="metric-label">RAM libre</span>
              <span class="metric-value">{{ formatMemAvail(proj.latest) }}</span>
            </div>
            <div class="metric-tile">
              <span class="metric-label">Disco libre</span>
              <span class="metric-value">{{ formatDiskAvail(proj.latest) }}</span>
            </div>
            <div class="metric-tile">
              <span class="metric-label">Conexiones PG</span>
              <span class="metric-value">{{ formatPgConns(proj.latest) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useSupabaseStore } from '@/stores/supabase.store'
import WButton from '@/components/ui/WButton.vue'

export default defineComponent({
  name: 'SupabasePage',
  components: { WButton },
  setup() {
    const store = useSupabaseStore()
    const initializing = ref(true)
    return { store, initializing }
  },
  methods: {
    async reload() {
      await this.store.fetchMetricsSummary()
    },
    formatBytes(bytes: number): string {
      if (bytes === 0 || isNaN(bytes)) return '—'
      const gb = bytes / 1_073_741_824
      if (gb >= 1) return `${gb.toFixed(1)} GB`
      const mb = bytes / 1_048_576
      return `${mb.toFixed(0)} MB`
    },
    formatCpu(metrics: Record<string, number>): string {
      const usage = metrics['node_cpu_usage_seconds_total']
      if (usage === undefined) return '—'
      // Prometheus counter — express as a ratio relative to total if available
      return `${(usage % 100).toFixed(1)}%`
    },
    formatMemAvail(metrics: Record<string, number>): string {
      return this.formatBytes(metrics['node_memory_MemAvailable_bytes'] ?? 0)
    },
    formatDiskAvail(metrics: Record<string, number>): string {
      return this.formatBytes(metrics['node_filesystem_avail_bytes'] ?? 0)
    },
    formatPgConns(metrics: Record<string, number>): string {
      const conns = metrics['pg_stat_activity_count'] ?? metrics['pg_stat_database_numbackends']
      if (conns === undefined) return '—'
      return String(Math.round(conns))
    },
  },
  async mounted() {
    await this.store.fetchConnection()
    if (this.store.isConnected) {
      await this.store.fetchMetricsSummary()
    }
    this.initializing = false
  },
})
</script>

<style scoped>
.supabase-page {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-right {
  display: flex;
  gap: 8px;
}

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

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--color-text-muted);
}

.loading-icon {
  animation: spin 1s linear infinite;
  font-size: 28px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 0;
  color: var(--color-text-muted);
  font-size: 14px;
  text-align: center;
}

.empty-icon {
  font-size: 40px;
  color: var(--color-text-disabled);
}

.empty-hint {
  font-size: 12px;
  color: var(--color-text-disabled);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.project-card {
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.card-icon-wrap {
  width: 36px;
  height: 36px;
  background-color: color-mix(in srgb, #3ecf8e 12%, transparent);
  color: #3ecf8e;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon {
  font-size: 20px;
}

.card-titles {
  min-width: 0;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-subtitle {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background-color: var(--color-border);
}

.metric-tile {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  background-color: var(--color-bg-surface);
}

.metric-label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.metric-value {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-base);
  letter-spacing: -0.02em;
}

.mr-1 {
  margin-right: 4px;
}

.mono {
  font-family: var(--font-mono);
}
</style>
