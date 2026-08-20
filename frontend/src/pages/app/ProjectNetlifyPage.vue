<template>
  <div class="netlify-page">
    <header class="page-header">
      <button class="back-btn" @click="$router.push({ name: 'project-detail', params: { id: projectId } })">
        <span class="material-symbols-outlined">arrow_back</span>
        <span>Volver al proyecto</span>
      </button>
      <div v-if="siteName" class="header-info">
        <span class="material-symbols-outlined" style="font-size:18px;color:#00c7b7">language</span>
        <span class="project-name-label">{{ siteName }}</span>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <span class="material-symbols-outlined loading-icon">progress_activity</span>
    </div>

    <div v-else-if="!netlifySiteId" class="empty-state">
      <span class="material-symbols-outlined" style="font-size:48px;color:var(--color-text-muted)">link_off</span>
      <p>Este proyecto no tiene un site de Netlify vinculado.</p>
      <w-button variant="ghost" @click="$router.push({ name: 'project-detail', params: { id: projectId } })">
        Vincular desde el detalle del proyecto
      </w-button>
    </div>

    <template v-else>
      <div class="netlify-content">
        <!-- Deploys recientes -->
        <section class="feed-section">
          <div class="feed-header">
            <h2 class="feed-title">Deploys recientes</h2>
            <span class="feed-count">{{ netlifyStore.deployments.length }}</span>
          </div>
          <w-card class="no-padding">
            <div v-if="netlifyStore.deploymentsLoading" class="feed-loading">Cargando deploys...</div>
            <div v-else-if="!netlifyStore.deployments.length" class="feed-empty">Sin deploys</div>
            <div v-for="deploy in netlifyStore.deployments" :key="deploy.id" class="deploy-row">
              <div class="deploy-status-wrap">
                <span
                  class="deploy-status-dot"
                  :style="{ background: getStatusColor(deploy.state) }"
                  :title="deploy.state"
                ></span>
              </div>
              <div class="row-info">
                <span class="row-primary">{{ deploy.branch || 'main' }} · {{ deploy.id.slice(0, 12) }}</span>
                <span class="row-meta">
                  {{ formatDate(deploy.createdAt) }}
                  <template v-if="deploy.deployTime"> · {{ deploy.deployTime }}s</template>
                  <template v-if="deploy.errorMessage"> · {{ deploy.errorMessage }}</template>
                </span>
              </div>
              <w-badge :color="getStatusColor(deploy.state)" class="deploy-badge">
                {{ formatStatus(deploy.state) }}
              </w-badge>
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
import { useNetlifyStore } from '@/stores/netlify.store'
import { mapActions } from 'pinia'
import WButton from '@/components/ui/WButton.vue'
import WCard from '@/components/ui/WCard.vue'
import WBadge from '@/components/ui/WBadge.vue'

export default defineComponent({
  name: 'ProjectNetlifyPage',
  components: { WButton, WCard, WBadge },
  data() {
    return {
      loading: false,
      netlifyStore: useNetlifyStore(),
      projectsStore: useProjectsStore(),
    }
  },
  computed: {
    projectId(): string {
      return this.$route.params.id as string
    },
    netlifySiteId(): string | null {
      return (this.projectsStore.selected as any)?.netlifySiteId ?? null
    },
    siteName(): string | null {
      if (!this.netlifySiteId) return null
      const found = this.netlifyStore.sites.find((s) => s.id === this.netlifySiteId)
      return found?.name ?? this.netlifySiteId
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
    formatStatus(state: string) {
      const map: Record<string, string> = {
        ready: 'OK',
        error: 'Error',
        building: 'Build...',
        enqueued: 'En cola',
        processing: 'Procesando',
        uploading: 'Subiendo',
        new: 'Nuevo',
        canceled: 'Cancelado',
      }
      return map[state] ?? state
    },
    getStatusColor(state: string) {
      const map: Record<string, string> = {
        ready: 'var(--color-success)',
        error: 'var(--color-error)',
        building: 'var(--color-warning)',
        enqueued: 'var(--color-warning)',
        processing: 'var(--color-warning)',
        uploading: 'var(--color-warning)',
      }
      return map[state] ?? 'var(--color-text-muted)'
    },
    async loadData() {
      this.loading = true
      await this.fetchById(this.projectId)
      this.loading = false

      if (!this.netlifySiteId) return

      await Promise.all([
        this.netlifyStore.fetchDeployments(this.netlifySiteId),
        this.netlifyStore.fetchSites(),
      ])
    },
  },
  mounted() {
    this.loadData()
  },
})
</script>

<style scoped>
.netlify-page {
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
  color: #00c7b7;
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

.netlify-content {
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

.deploy-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  min-width: 0;
}
.deploy-row:last-child { border-bottom: none; }

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
</style>
