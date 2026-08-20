<template>
  <div class="dashboard-page">
    <header class="page-header">
      <h1 class="page-title">Dashboard de Marketing</h1>
    </header>

    <div v-if="store.dashboard.loading && !stats" class="state-message">
      <span class="material-symbols-outlined spinning">sync</span>
      Cargando estadísticas...
    </div>

    <w-empty-state
      v-else-if="stats && totalPosts === 0"
      title="Todavía no armaste tu estrategia de contenido"
      message="Empezá creando una idea, un prompt o programando tu primera publicación para LinkedIn, Instagram o TikTok."
    >
      <template #icon>
        <span class="material-symbols-outlined">insights</span>
      </template>
      <template #action>
        <div class="empty-actions">
          <w-button variant="secondary" @click="$router.push('/app/marketing/ideas')">
            <span class="material-symbols-outlined mr-2">lightbulb</span>
            Crear primera idea
          </w-button>
          <w-button variant="secondary" @click="$router.push('/app/marketing/prompts')">
            <span class="material-symbols-outlined mr-2">auto_awesome</span>
            Crear primer prompt
          </w-button>
          <w-button variant="primary" @click="$router.push('/app/marketing/posts')">
            <span class="material-symbols-outlined mr-2">campaign</span>
            Crear primera publicación
          </w-button>
        </div>
      </template>
    </w-empty-state>

    <template v-else-if="stats">
      <!-- KPI Section -->
      <section class="kpi-section">
        <w-kpi-card
          v-for="opt in STATUS_OPTIONS"
          :key="opt.value"
          :title="opt.label.toUpperCase()"
          :value="(stats.postCountsByStatus?.[opt.value] ?? 0).toString()"
          icon="campaign"
          :color="STATUS_COLORS[opt.value]"
        />
      </section>

      <div class="dashboard-grid">
        <!-- Upcoming this week -->
        <w-card class="dashboard-card">
          <div class="card-title">
            <span class="material-symbols-outlined">event_upcoming</span>
            Próximas publicaciones de la semana
          </div>
          <w-empty-state
            v-if="!stats.upcomingThisWeek?.length"
            title="Nada programado para esta semana"
            message="Programá una publicación para verla reflejada acá."
          >
            <template #icon><span class="material-symbols-outlined">event_upcoming</span></template>
            <template #action>
              <w-button variant="secondary" @click="$router.push('/app/marketing/calendar')">
                <span class="material-symbols-outlined mr-2">calendar_month</span>
                Programar publicación
              </w-button>
            </template>
          </w-empty-state>
          <div v-else class="upcoming-list">
            <div v-for="post in stats.upcomingThisWeek" :key="post._id" class="upcoming-item">
              <w-badge :color="NETWORK_COLORS[post.network]">{{
                NETWORK_LABELS[post.network]
              }}</w-badge>
              <span class="upcoming-title">{{ post.title }}</span>
              <span class="upcoming-date">{{ formatDate(post.scheduledDate) }}</span>
            </div>
          </div>
        </w-card>

        <!-- Counts by network -->
        <w-card class="dashboard-card">
          <div class="card-title">
            <span class="material-symbols-outlined">share</span>
            Publicaciones por red
          </div>
          <div class="network-bars">
            <div v-for="opt in NETWORK_OPTIONS" :key="opt.value" class="network-bar-row">
              <span class="network-bar-label" :style="{ color: NETWORK_COLORS[opt.value] }">{{
                opt.label
              }}</span>
              <div class="network-bar-track">
                <div
                  class="network-bar-fill"
                  :style="{
                    width: networkBarWidth(opt.value) + '%',
                    background: NETWORK_COLORS[opt.value],
                  }"
                ></div>
              </div>
              <span class="network-bar-value">{{
                stats.postCountsByNetwork?.[opt.value] ?? 0
              }}</span>
            </div>
          </div>
        </w-card>
      </div>

      <!-- Best performing -->
      <section class="best-section">
        <div class="section-label">
          <span class="material-symbols-outlined section-icon">trophy</span>
          Mejor publicación por red
        </div>
        <div class="best-grid">
          <div v-for="opt in NETWORK_OPTIONS" :key="opt.value" class="best-slot">
            <div class="best-slot__network" :style="{ color: NETWORK_COLORS[opt.value] }">
              {{ opt.label }}
            </div>
            <post-card
              v-if="bestPost(opt.value)"
              :post="bestPost(opt.value)!"
              @click="() => {}"
              @remove="() => {}"
            />
            <w-empty-state
              v-else
              title="Sin publicaciones publicadas"
              :message="`Todavía no hay publicaciones publicadas en ${opt.label} con métricas cargadas.`"
            >
              <template #icon><span class="material-symbols-outlined">trophy</span></template>
              <template #action>
                <w-button variant="secondary" @click="$router.push('/app/marketing/posts')">
                  <span class="material-symbols-outlined mr-2">add</span>
                  Crear publicación
                </w-button>
              </template>
            </w-empty-state>
          </div>
        </div>
      </section>

      <div class="dashboard-grid">
        <!-- Monthly averages -->
        <w-card class="dashboard-card">
          <div class="card-title">
            <span class="material-symbols-outlined">bar_chart</span>
            Promedios mensuales (últimos 6 meses)
          </div>
          <w-empty-state
            v-if="!stats.monthlyAverages?.length"
            title="Sin métricas registradas"
            message="Marcá publicaciones como publicadas y cargá sus métricas para ver promedios mensuales acá."
          >
            <template #icon><span class="material-symbols-outlined">bar_chart</span></template>
            <template #action>
              <w-button variant="secondary" @click="$router.push('/app/marketing/posts')">
                <span class="material-symbols-outlined mr-2">monitoring</span>
                Cargar métricas
              </w-button>
            </template>
          </w-empty-state>
          <table v-else class="stats-table">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Red</th>
                <th>Impresiones</th>
                <th>Alcance</th>
                <th>Interacciones</th>
                <th>Posts</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in stats.monthlyAverages" :key="idx">
                <td>{{ row.year }}-{{ String(row.month).padStart(2, '0') }}</td>
                <td>
                  <w-badge :color="NETWORK_COLORS[row.network]">{{
                    NETWORK_LABELS[row.network]
                  }}</w-badge>
                </td>
                <td>{{ formatNumber(row.avgImpressions ?? row.avgViews) }}</td>
                <td>{{ formatNumber(row.avgReach) }}</td>
                <td>{{ formatNumber(row.avgLikes ?? row.avgComments) }}</td>
                <td>{{ row.count }}</td>
              </tr>
            </tbody>
          </table>
        </w-card>

        <!-- Weekly evolution -->
        <w-card class="dashboard-card">
          <div class="card-title">
            <span class="material-symbols-outlined">trending_up</span>
            Evolución semanal (últimas 8 semanas)
          </div>
          <w-empty-state
            v-if="!stats.weeklyEvolution?.length"
            title="Sin evolución para mostrar"
            message="A medida que publiques y cargues métricas, vas a ver acá la evolución semana a semana."
          >
            <template #icon><span class="material-symbols-outlined">trending_up</span></template>
            <template #action>
              <w-button variant="secondary" @click="$router.push('/app/marketing/posts')">
                <span class="material-symbols-outlined mr-2">monitoring</span>
                Cargar métricas
              </w-button>
            </template>
          </w-empty-state>
          <div v-else class="weekly-bars">
            <div v-for="(point, idx) in stats.weeklyEvolution" :key="idx" class="weekly-bar-row">
              <span class="weekly-bar-label">S{{ point.week }}</span>
              <div class="weekly-bar-track">
                <div class="weekly-bar-fill" :style="{ width: weeklyBarWidth(point) + '%' }"></div>
              </div>
              <span class="weekly-bar-value">{{
                formatNumber(point.impressions || point.views || point.reach)
              }}</span>
            </div>
          </div>
        </w-card>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useMarketingStore } from '@/stores/marketing.store'
import WCard from '@/components/ui/WCard.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WButton from '@/components/ui/WButton.vue'
import WKpiCard from '@/components/ui/WKpiCard.vue'
import WEmptyState from '@/components/ui/WEmptyState.vue'
import PostCard from '@/components/marketing/PostCard.vue'
import {
  NETWORK_LABELS,
  NETWORK_COLORS,
  STATUS_COLORS,
  NETWORK_OPTIONS,
  STATUS_OPTIONS,
  type MarketingNetwork,
} from '@/api/marketing/marketing-shared.types'
import type { WeeklyEvolutionPoint } from '@/api/marketing/marketing-dashboard.types'

export default defineComponent({
  name: 'MarketingDashboardPage',
  components: { WCard, WBadge, WButton, WKpiCard, WEmptyState, PostCard },
  setup() {
    const store = useMarketingStore()

    onMounted(() => store.fetchDashboard())

    const stats = computed(() => store.dashboard.stats)

    const totalPosts = computed(() => {
      const counts = stats.value?.postCountsByStatus
      if (!counts) return 0
      return Object.values(counts).reduce((sum, count) => sum + (count ?? 0), 0)
    })

    const maxNetworkCount = computed(() => {
      if (!stats.value) return 0
      return Math.max(1, ...Object.values(stats.value.postCountsByNetwork || {}))
    })

    const maxWeeklyValue = computed(() => {
      if (!stats.value?.weeklyEvolution?.length) return 1
      return Math.max(
        1,
        ...stats.value.weeklyEvolution.map((p) => p.impressions || p.views || p.reach || 0),
      )
    })

    function networkBarWidth(network: MarketingNetwork) {
      const count = stats.value?.postCountsByNetwork?.[network] ?? 0
      return Math.round((count / maxNetworkCount.value) * 100)
    }

    function weeklyBarWidth(point: WeeklyEvolutionPoint) {
      const value = point.impressions || point.views || point.reach || 0
      return Math.round((value / maxWeeklyValue.value) * 100)
    }

    function bestPost(network: MarketingNetwork) {
      return stats.value?.bestPerformingByNetwork?.[network] || null
    }

    function formatDate(dateStr?: string | null) {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString()
    }

    function formatNumber(value?: number) {
      if (value === undefined || value === null) return '—'
      return Math.round(value).toLocaleString()
    }

    return {
      store,
      stats,
      totalPosts,
      networkBarWidth,
      weeklyBarWidth,
      bestPost,
      formatDate,
      formatNumber,
      NETWORK_LABELS,
      NETWORK_COLORS,
      STATUS_COLORS,
      NETWORK_OPTIONS,
      STATUS_OPTIONS,
    }
  },
})
</script>

<style scoped>
.dashboard-page {
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-title {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: var(--color-text-base);
  margin: 0;
}

.state-message {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
  padding: 48px 0;
}
.spinning {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.kpi-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.dashboard-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}
.card-title .material-symbols-outlined {
  font-size: 16px;
}
.mr-2 {
  margin-right: 8px;
}
.empty-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.upcoming-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-subtle);
}
.upcoming-item:last-child {
  border-bottom: none;
}
.upcoming-title {
  flex: 1;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.upcoming-date {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
}

.network-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.network-bar-row {
  display: grid;
  grid-template-columns: 90px 1fr 36px;
  align-items: center;
  gap: 12px;
}
.network-bar-label {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
}
.network-bar-track {
  height: 8px;
  background: var(--color-bg-surface-high);
  border-radius: 4px;
  overflow: hidden;
}
.network-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}
.network-bar-value {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: right;
}

.best-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}
.section-icon {
  font-size: 14px;
}
.best-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.best-slot {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.best-slot__network {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-mono);
  font-size: 11px;
}
.stats-table th {
  text-align: left;
  padding: 8px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  font-size: 10px;
  border-bottom: 1px solid var(--color-border);
}
.stats-table td {
  padding: 8px;
  color: var(--color-text-base);
  border-bottom: 1px solid var(--color-border-subtle);
}

.weekly-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.weekly-bar-row {
  display: grid;
  grid-template-columns: 36px 1fr 60px;
  align-items: center;
  gap: 12px;
}
.weekly-bar-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
}
.weekly-bar-track {
  height: 8px;
  background: var(--color-bg-surface-high);
  border-radius: 4px;
  overflow: hidden;
}
.weekly-bar-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 4px;
  transition: width 0.3s;
}
.weekly-bar-value {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-align: right;
}

@media (max-width: 1400px) {
  .kpi-section {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .best-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .dashboard-page {
    padding: 16px;
  }
  .kpi-section {
    grid-template-columns: 1fr;
  }
}
</style>
