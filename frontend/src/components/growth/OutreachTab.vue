<template>
  <div class="outreach-tab">
    <div class="tab-actions">
      <w-button variant="primary" @click="showModal = true">
        <span class="material-symbols-outlined mr-2">add</span>
        Registrar contacto
      </w-button>
    </div>

    <w-card v-if="store.currentWeek" class="weekly-goal-card">
      <template #header>
        <div class="section-header">
          <span class="material-symbols-outlined">campaign</span>
          Meta semanal de prospección
        </div>
      </template>
      <div class="weekly-goal-body">
        <div class="progress-bar">
          <div class="progress-bar__fill" :style="{ width: progressPct + '%' }"></div>
        </div>
        <span class="weekly-goal-label">
          {{ store.currentWeek.currentCount }}/{{ store.currentWeek.targetCount }} contactos esta semana
        </span>
        <div class="weekly-goal-actions">
          <input v-model.number="newTarget" type="number" min="1" class="target-input" />
          <w-button variant="secondary" size="md" @click="updateTarget">Actualizar meta</w-button>
        </div>
      </div>
    </w-card>

    <div v-if="store.stats" class="stats-row">
      <w-kpi-card title="Total" :value="store.stats.total" icon="forum" color="var(--color-primary)" />
      <w-kpi-card title="Tasa de respuesta" :value="pct(store.stats.responseRate)" icon="reply" color="var(--color-success)" />
      <w-kpi-card title="Tasa de conversión" :value="pct(store.stats.conversionRate)" icon="handshake" color="var(--color-warning)" />
    </div>

    <w-card class="no-padding">
      <div v-if="store.loading" class="loading-row">
        <span class="material-symbols-outlined spinning">sync</span>
        Cargando actividades...
      </div>
      <w-empty-state
        v-else-if="store.activities.length === 0"
        title="Sin actividad registrada"
        message="Registrá tu primer contacto de prospección."
      >
        <template #action>
          <w-button variant="primary" @click="showModal = true">Registrar contacto</w-button>
        </template>
      </w-empty-state>
      <div v-else>
        <div v-for="activity in store.activities" :key="activity._id" class="activity-row">
          <span class="material-symbols-outlined">{{ typeIcon(activity.type) }}</span>
          <div class="activity-main">
            <div class="activity-title">{{ activity.targetName }}</div>
            <div class="activity-meta">{{ typeLabel(activity.type) }} · {{ activity.date }}</div>
          </div>
          <select
            class="outcome-select"
            :value="activity.outcome"
            @change="onOutcomeChange(activity._id, $event)"
          >
            <option value="pending">Pendiente</option>
            <option value="replied">Respondió</option>
            <option value="converted">Convertido</option>
            <option value="no_response">Sin respuesta</option>
          </select>
        </div>
      </div>
    </w-card>

    <outreach-activity-modal v-model="showModal" :loading="store.loading" @save="onSave" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useOutreachStore } from '@/stores/outreach.store'
import WButton from '@/components/ui/WButton.vue'
import WCard from '@/components/ui/WCard.vue'
import WEmptyState from '@/components/ui/WEmptyState.vue'
import WKpiCard from '@/components/ui/WKpiCard.vue'
import OutreachActivityModal from './OutreachActivityModal.vue'

const TYPE_LABELS: Record<string, string> = {
  cold_email: 'Cold email',
  proposal_sent: 'Propuesta enviada',
  call_booked: 'Llamada agendada',
  follow_up: 'Follow-up',
  linkedin_message: 'Mensaje LinkedIn',
  other: 'Otro',
}

const TYPE_ICONS: Record<string, string> = {
  cold_email: 'mail',
  proposal_sent: 'description',
  call_booked: 'call',
  follow_up: 'undo',
  linkedin_message: 'chat',
  other: 'more_horiz',
}

export default defineComponent({
  name: 'OutreachTab',
  components: { WButton, WCard, WEmptyState, WKpiCard, OutreachActivityModal },
  setup() {
    const store = useOutreachStore()
    return { store }
  },
  data() {
    return { showModal: false, newTarget: 10 }
  },
  computed: {
    progressPct(): number {
      const week = this.store.currentWeek
      if (!week || week.targetCount === 0) return 0
      return Math.min(100, (week.currentCount / week.targetCount) * 100)
    },
  },
  async mounted() {
    await Promise.all([this.store.fetchActivities(), this.store.fetchCurrentWeek(), this.store.fetchStats()])
    if (this.store.currentWeek) this.newTarget = this.store.currentWeek.targetCount
  },
  methods: {
    typeLabel(type: string): string {
      return TYPE_LABELS[type] ?? type
    },
    typeIcon(type: string): string {
      return TYPE_ICONS[type] ?? 'circle'
    },
    pct(value: number): string {
      return `${Math.round(value * 100)}%`
    },
    async onSave(dto: any) {
      await this.store.logActivity(dto)
      this.showModal = false
    },
    async onOutcomeChange(id: string, event: Event) {
      const outcome = (event.target as HTMLSelectElement).value
      await this.store.updateActivity(id, { outcome: outcome as any })
    },
    async updateTarget() {
      if (this.newTarget > 0) await this.store.setWeeklyTarget(this.newTarget)
    },
  },
})
</script>

<style scoped>
.outreach-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tab-actions {
  display: flex;
  justify-content: flex-end;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.weekly-goal-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: var(--color-primary);
}

.weekly-goal-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.weekly-goal-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.target-input {
  width: 70px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  padding: 8px 10px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 12px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.loading-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 32px;
  justify-content: center;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.activity-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
}

.activity-row:last-child {
  border-bottom: none;
}

.activity-row .material-symbols-outlined {
  color: var(--color-text-muted);
}

.activity-main {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  color: var(--color-text-base);
}

.activity-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.outcome-select {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  padding: 6px 10px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
}

.mr-2 {
  margin-right: 8px;
}
</style>
