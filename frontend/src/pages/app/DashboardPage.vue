<template>
  <div class="dashboard-page">
    <div class="dashboard-main">
      <header class="dashboard-header">
        <h1 class="greeting">{{ $t('dashboard.greeting') }}, {{ userName }}.</h1>
        <p class="current-date">{{ currentDate }}</p>
      </header>

      <!-- Onboarding: prominent first-steps checklist for new workspaces -->
      <section v-if="showOnboardingChecklist" class="onboarding-section">
        <w-card class="onboarding-card">
          <div class="onboarding-header">
            <div>
              <h2 class="onboarding-title">Configura Orkpad en minutos</h2>
              <p class="onboarding-subtitle">
                Completa estos pasos básicos y empieza a usar la app al instante.
              </p>
            </div>
            <span class="onboarding-progress-badge">
              {{ onboardingStore.completedCount }}/{{ onboardingStore.totalCount }}
            </span>
          </div>

          <div class="onboarding-progress-track">
            <div
              class="onboarding-progress-fill"
              :style="{ width: onboardingProgressPercent + '%' }"
            ></div>
          </div>

          <ul class="onboarding-step-list">
            <li
              v-for="step in onboardingStore.checklist"
              :key="step.id"
              class="onboarding-step"
              :class="{ 'onboarding-step--done': step.completed }"
            >
              <span
                class="material-symbols-outlined onboarding-step-icon"
                :class="step.completed ? 'onboarding-step-icon--done' : ''"
              >
                {{ step.completed ? 'check_circle' : stepIcon(step.id) }}
              </span>
              <div class="onboarding-step-text">
                <span class="onboarding-step-title">{{ step.title }}</span>
                <span class="onboarding-step-why">{{ step.description }}</span>
              </div>
              <w-button
                v-if="!step.completed"
                variant="secondary"
                @click="$router.push(step.cta.route)"
              >
                {{ step.cta.label }}
              </w-button>
              <span v-else class="onboarding-step-done-label">Listo</span>
            </li>
          </ul>
        </w-card>
      </section>

      <!-- KPI Strip -->
      <section class="kpi-strip">
        <w-kpi-card :title="$t('dashboard.kpis.revenue')" :value="formattedRevenue" />
        <w-kpi-card :title="$t('dashboard.kpis.tasks')" :value="stats?.totalTasks ?? '—'" />
        <w-kpi-card :title="$t('dashboard.kpis.clients')" :value="stats?.totalClients ?? '—'" />
        <w-kpi-card :title="$t('dashboard.kpis.projects')" :value="stats?.totalProjects ?? '—'" />
      </section>

      <!-- Quick Access -->
      <section class="quick-access">
        <router-link to="/app/notes" class="quick-access-card">
          <span class="material-symbols-outlined quick-access-icon">edit_note</span>
          <div class="quick-access-text">
            <span class="quick-access-title">Pizarra</span>
            <span class="quick-access-sub">Notas, ideas y pendientes</span>
          </div>
          <span class="material-symbols-outlined quick-access-arrow">arrow_forward</span>
        </router-link>
      </section>

      <section class="dashboard-section">
        <workload-constellation-preview @open="showConstellation = true" />
      </section>

      <workload-constellation
        v-if="showConstellation"
        @close="showConstellation = false"
      />

      <!-- Recent Tasks -->
      <section class="dashboard-section">
        <div class="section-header">
          <h2 class="section-title">{{ $t('dashboard.recentTasks.title') }}</h2>
          <w-button variant="ghost">{{ $t('dashboard.recentTasks.viewAll') }}</w-button>
        </div>
        <w-card class="no-padding">
          <w-table :headers="taskHeaders" :items="recentTasks">
            <template #item-status="{ item }">
              <w-badge :color="getStatusColor(item.status)">{{ item.status }}</w-badge>
            </template>
            <template #item-priority="{ item }">
              <w-badge :color="getPriorityColor(item.priority)">{{ item.priority }}</w-badge>
            </template>
          </w-table>
        </w-card>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue'
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { ONBOARDING_STEP_ICONS } from '@/components/onboarding/onboarding-steps'
import type { OnboardingSteps } from '@/api/onboarding/onboarding.types'
import { dashboardApi } from '@/api/dashboard/dashboard.api'
import type { DashboardStats } from '@/api/dashboard/dashboard.types'
import { formatDate } from '@/utils/date'
import WKpiCard from '@/components/ui/WKpiCard.vue'
import WTable from '@/components/ui/WTable.vue'
import WCard from '@/components/ui/WCard.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WButton from '@/components/ui/WButton.vue'

const WorkloadConstellation = defineAsyncComponent(
  () => import('@/components/dashboard/WorkloadConstellation.vue'),
)
const WorkloadConstellationPreview = defineAsyncComponent(
  () => import('@/components/dashboard/WorkloadConstellationPreview.vue'),
)

export default defineComponent({
  name: 'DashboardPage',
  components: { WKpiCard, WTable, WCard, WBadge, WButton, WorkloadConstellation, WorkloadConstellationPreview },
  setup() {
    return { onboardingStore: useOnboardingStore() }
  },
  data() {
    return {
      currentDate: formatDate(new Date()),
      stats: null as DashboardStats | null,
      statsLoading: false,
      showConstellation: false,
    }
  },
  computed: {
    ...mapState(useAuthStore, ['user']),
    showOnboardingChecklist(): boolean {
      return !this.onboardingStore.isComplete
    },
    onboardingProgressPercent(): number {
      return Math.round(
        (this.onboardingStore.completedCount / this.onboardingStore.totalCount) * 100,
      )
    },
    userName(): string {
      return this.user?.name?.split(' ')[0] ?? ''
    },
    formattedRevenue(): string {
      if (!this.stats) return '—'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(this.stats.totalRevenue)
    },
    taskHeaders() {
      return [
        { key: 'title', label: this.$t('dashboard.recentTasks.headers.task') },
        { key: 'projectName', label: this.$t('dashboard.recentTasks.headers.project') },
        { key: 'status', label: this.$t('dashboard.recentTasks.headers.status') },
        { key: 'priority', label: this.$t('dashboard.recentTasks.headers.priority') },
        { key: 'dueDateFormatted', label: this.$t('dashboard.recentTasks.headers.due') },
      ]
    },
    recentTasks() {
      return (this.stats?.recentTasks ?? []).map((t) => ({
        ...t,
        projectName: t.projectName ?? '—',
        dueDateFormatted: t.dueDate
          ? new Date(t.dueDate).toLocaleDateString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '—',
      }))
    },
  },
  methods: {
    stepIcon(key: keyof OnboardingSteps): string {
      return ONBOARDING_STEP_ICONS[key] ?? 'radio_button_unchecked'
    },
    async fetchStats() {
      this.statsLoading = true
      try {
        const { data } = await dashboardApi.getStats()
        this.stats = data
      } finally {
        this.statsLoading = false
      }
    },
    getStatusColor(status: string) {
      if (status === 'in-progress') return 'var(--color-primary)'
      if (status === 'done') return 'var(--color-success)'
      if (status === 'cancelled') return 'var(--color-error)'
      return 'var(--color-text-muted)'
    },
    getPriorityColor(priority: string) {
      if (priority === 'urgent') return 'var(--color-error)'
      if (priority === 'high') return 'var(--color-error)'
      if (priority === 'medium') return 'var(--color-warning)'
      if (priority === 'low') return 'var(--color-success)'
      return 'var(--color-text-muted)'
    },
  },
  mounted() {
    this.fetchStats()
    this.onboardingStore.fetchStatus()
  },
})
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-grow: 1;
}

.dashboard-main {
  flex-grow: 1;
  min-width: 0;
  overflow-x: hidden;
  padding: 32px;
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: 16px;
  }
}

.dashboard-header {
  margin-bottom: 32px;
}

.greeting {
  font-family: var(--font-body);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
  margin-bottom: 4px;
}

.current-date {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.kpi-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

@media (max-width: 1024px) {
  .kpi-strip {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .kpi-strip {
    grid-template-columns: 1fr;
  }
  .dashboard-header {
    margin-bottom: 24px;
  }
  .greeting {
    font-size: 20px;
  }
}

/* Quick Access */
.quick-access {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.quick-access-card {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 16px;
  padding: 16px 20px;
  background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border);
  text-decoration: none;
  font: inherit;
  text-align: left;
  transition:
    background 0.15s,
    border-color 0.15s;
  cursor: pointer;
}

.quick-access-card:hover {
  background: var(--color-bg-surface-container);
  border-color: var(--color-primary);
}

.quick-access-icon {
  font-size: 24px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.quick-access-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.quick-access-title {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-base);
}

.quick-access-sub {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
}

.quick-access-arrow {
  font-size: 18px;
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform 0.15s;
}

.quick-access-card:hover .quick-access-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}

.dashboard-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}

.no-padding {
  padding: 0 !important;
}

/* Onboarding checklist */
.onboarding-section {
  margin-bottom: 32px;
}

.onboarding-card {
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
  background: color-mix(in srgb, var(--color-primary) 4%, var(--color-bg-surface));
}

.onboarding-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.onboarding-title {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-base);
  margin-bottom: 4px;
}

.onboarding-subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
}

.onboarding-progress-badge {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  border-radius: 999px;
  padding: 4px 12px;
}

.onboarding-progress-track {
  height: 6px;
  background: var(--color-bg-muted);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 20px;
}

.onboarding-progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.onboarding-step-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.onboarding-step {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: opacity 0.2s ease;
}

.onboarding-step--done {
  opacity: 0.6;
}

.onboarding-step-icon {
  font-size: 22px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.onboarding-step-icon--done {
  color: var(--color-success);
}

.onboarding-step-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.onboarding-step-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-base);
}

.onboarding-step--done .onboarding-step-title {
  text-decoration: line-through;
}

.onboarding-step-why {
  font-size: 12px;
  color: var(--color-text-muted);
}

.onboarding-step-done-label {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-success);
}

@media (max-width: 640px) {
  .onboarding-step {
    flex-wrap: wrap;
  }
}
</style>
