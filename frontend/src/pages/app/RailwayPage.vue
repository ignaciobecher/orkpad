<template>
  <div class="railway-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Railway</h1>
        <p class="page-subtitle">Proyectos vinculados · deployments en tiempo real</p>
      </div>
      <div class="header-right">
        <w-button variant="ghost" :loading="store.overviewLoading" @click="reload">
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
      <span class="material-symbols-outlined empty-icon">rocket_launch</span>
      <p>Railway no está conectado en este workspace.</p>
      <router-link to="/app/integrations">
        <w-button variant="primary">Conectar Railway</w-button>
      </router-link>
    </div>

    <template v-else>
      <!-- Cargando overview -->
      <div v-if="store.overviewLoading" class="loading-state">
        <span class="material-symbols-outlined loading-icon">progress_activity</span>
      </div>

      <!-- No linked projects -->
      <div v-else-if="!store.overview.length" class="empty-state">
        <span class="material-symbols-outlined empty-icon">link_off</span>
        <p>No hay proyectos de Orkpad vinculados a Railway.</p>
        <p class="empty-hint">Andá al detalle de un proyecto y vinculalo desde la sección Railway.</p>
        <router-link to="/app/projects">
          <w-button variant="ghost">Ir a Proyectos</w-button>
        </router-link>
      </div>

      <!-- Projects grid -->
      <div v-else class="projects-grid">
        <div
          v-for="proj in store.overview"
          :key="proj.orkpadProjectId"
          class="project-card"
        >
          <!-- Card header -->
          <div class="card-header">
            <div class="card-header-left">
              <span class="material-symbols-outlined card-icon">rocket_launch</span>
              <div class="card-titles">
                <div class="card-title">{{ proj.orkpadProjectName }}</div>
                <div class="card-subtitle">{{ proj.railwayProjectId }}</div>
              </div>
            </div>
            <div class="card-header-right">
              <span
                v-if="proj.latestDeployment"
                class="status-dot"
                :style="{ background: getStatusColor(proj.latestDeployment.status) }"
              ></span>
              <w-badge
                v-if="proj.latestDeployment"
                :color="getStatusColor(proj.latestDeployment.status)"
              >
                {{ formatStatus(proj.latestDeployment.status) }}
              </w-badge>
              <w-badge v-else color="var(--color-text-muted)">Sin deploy</w-badge>
            </div>
          </div>

          <!-- Services -->
          <div class="card-section">
            <div class="section-label">Servicios</div>
            <div v-if="!proj.services.length" class="section-empty">Sin servicios</div>
            <div class="services-list">
              <span v-for="svc in proj.services" :key="svc.id" class="service-chip">
                <span class="material-symbols-outlined" style="font-size:12px">deployed_code</span>
                {{ svc.name }}
              </span>
            </div>
          </div>

          <!-- Latest deployment -->
          <div v-if="proj.latestDeployment" class="card-section">
            <div class="section-label">Último deploy</div>
            <div class="deploy-row">
              <div class="deploy-info">
                <span class="deploy-msg">
                  {{ proj.latestDeployment.meta?.commitMessage || proj.latestDeployment.id.slice(0, 12) }}
                </span>
                <span class="deploy-meta">
                  {{ proj.latestDeployment.service?.name }} ·
                  {{ formatDate(proj.latestDeployment.createdAt) }}
                </span>
              </div>
              <a
                v-if="proj.latestDeployment.url"
                :href="proj.latestDeployment.url"
                target="_blank"
                class="deploy-link"
                title="Ver en Railway"
              >
                <span class="material-symbols-outlined">open_in_new</span>
              </a>
            </div>
          </div>

          <!-- Recent deployments history -->
          <div v-if="proj.recentDeployments.length > 1" class="card-section">
            <div class="section-label">Historial reciente</div>
            <div class="deploy-history">
              <div
                v-for="d in proj.recentDeployments.slice(0, 5)"
                :key="d.id"
                class="history-row"
              >
                <span class="history-dot" :style="{ background: getStatusColor(d.status) }"></span>
                <span class="history-service">{{ d.service?.name }}</span>
                <span class="history-msg">{{ d.meta?.commitMessage?.split('\n')[0] || d.id.slice(0, 8) }}</span>
                <span class="history-date">{{ formatDate(d.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Card footer -->
          <div class="card-footer">
            <router-link :to="{ name: 'project-detail', params: { id: proj.orkpadProjectId } }">
              <w-button variant="ghost">
                <span class="material-symbols-outlined mr-1">assignment</span>
                Proyecto
              </w-button>
            </router-link>
            <router-link :to="{ name: 'project-railway', params: { id: proj.orkpadProjectId } }">
              <w-button variant="ghost">
                <span class="material-symbols-outlined mr-1">history</span>
                Ver deployments
              </w-button>
            </router-link>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRailwayStore } from '@/stores/railway.store'
import WButton from '@/components/ui/WButton.vue'
import WBadge from '@/components/ui/WBadge.vue'

export default defineComponent({
  name: 'RailwayPage',
  components: { WButton, WBadge },
  setup() {
    const store = useRailwayStore()
    const initializing = ref(true)
    return { store, initializing }
  },
  methods: {
    formatDate(iso: string) {
      const d = new Date(iso)
      const now = new Date()
      const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000)
      if (diffMin < 1) return 'ahora'
      if (diffMin < 60) return `hace ${diffMin}m`
      const diffH = Math.floor(diffMin / 60)
      if (diffH < 24) return `hace ${diffH}h`
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
    },
    formatStatus(status: string) {
      const map: Record<string, string> = {
        SUCCESS: 'OK', FAILED: 'Falló', CRASHED: 'Caído',
        DEPLOYING: 'Deploy...', BUILDING: 'Build...', INITIALIZING: 'Init...',
        WAITING: 'Esperando', SLEEPING: 'Sleeping', REMOVED: 'Removido', SKIPPED: 'Omitido',
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
      }
      return map[status] ?? 'var(--color-text-muted)'
    },
    async reload() {
      await this.store.fetchOverview()
    },
  },
  async mounted() {
    await this.store.fetchConnection()
    if (this.store.isConnected) {
      await this.store.fetchOverview()
    }
    this.initializing = false
  },
})
</script>

<style scoped>
.railway-page {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100%;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

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
  gap: 12px;
  padding: 80px 32px;
  color: var(--color-text-muted);
  font-size: 14px;
  text-align: center;
}
.empty-icon { font-size: 48px; color: var(--color-text-muted); }
.empty-hint { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-disabled); }

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
}

.project-card {
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.card-header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.card-icon { font-size: 20px; color: var(--color-primary); flex-shrink: 0; }
.card-titles { min-width: 0; }

.card-title {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-base);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-subtitle {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.card-header-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.card-section {
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.section-empty { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-disabled); }

.services-list { display: flex; flex-wrap: wrap; gap: 6px; }

.service-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  padding: 3px 8px;
  background: var(--color-bg-surface-high);
}

.deploy-row { display: flex; align-items: center; gap: 10px; min-width: 0; }

.deploy-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }

.deploy-msg {
  font-size: 12px;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.deploy-meta { font-family: var(--font-mono); font-size: 10px; color: var(--color-text-muted); }

.deploy-link { color: var(--color-text-muted); display: flex; flex-shrink: 0; }
.deploy-link:hover { color: var(--color-primary); }
.deploy-link .material-symbols-outlined { font-size: 15px; }

.deploy-history { display: flex; flex-direction: column; gap: 6px; }

.history-row { display: flex; align-items: center; gap: 8px; min-width: 0; }

.history-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

.history-service {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  flex-shrink: 0;
  min-width: 64px;
}

.history-msg {
  font-size: 11px;
  color: var(--color-text-base);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.history-date {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.card-footer { display: flex; gap: 4px; padding: 10px 12px; }

.mr-1 { margin-right: 4px; }
</style>
