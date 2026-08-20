<template>
  <div class="achievements-tab">
    <w-card>
      <template #header>
        <div class="section-header">
          <span class="material-symbols-outlined">military_tech</span>
          Logros
        </div>
      </template>
      <div class="badge-grid">
        <div
          v-for="badge in badges"
          :key="badge.code"
          class="badge-item"
          :class="{ locked: !badge.earned }"
        >
          <span class="material-symbols-outlined badge-icon">{{ badge.icon }}</span>
          <div class="badge-name">{{ badge.name }}</div>
          <div class="badge-description">{{ badge.description }}</div>
        </div>
      </div>
    </w-card>

    <w-card class="no-padding">
      <template #header>
        <div class="section-header">
          <span class="material-symbols-outlined">receipt_long</span>
          Historial de puntos
        </div>
      </template>
      <w-empty-state
        v-if="gamificationStore.events.length === 0"
        title="Sin actividad todavía"
        message="Completá hábitos, recursos de aprendizaje o focos semanales para sumar puntos."
      />
      <div v-else>
        <div v-for="event in gamificationStore.events" :key="event._id" class="ledger-row">
          <span class="ledger-type">{{ eventLabel(event.type) }}</span>
          <span class="ledger-date">{{ formatDate(event.createdAt) }}</span>
          <span class="ledger-points">+{{ event.points }}</span>
        </div>
      </div>
    </w-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useGamificationStore } from '@/stores/gamification.store'
import WCard from '@/components/ui/WCard.vue'
import WEmptyState from '@/components/ui/WEmptyState.vue'
import { BADGES } from './badges.config'

const EVENT_LABELS: Record<string, string> = {
  goal_complete: 'Hábito completado',
  streak_milestone: 'Racha alcanzada',
  learning_entry: 'Progreso de aprendizaje',
  resource_completed: 'Recurso completado',
  skill_focus_completed: 'Foco semanal completado',
  outreach_activity: 'Contacto de prospección',
  outreach_goal_complete: 'Meta de prospección cumplida',
  badge_unlocked: 'Logro desbloqueado',
}

export default defineComponent({
  name: 'AchievementsTab',
  components: { WCard, WEmptyState },
  setup() {
    return { gamificationStore: useGamificationStore() }
  },
  computed: {
    badges() {
      const earned = new Set(this.gamificationStore.profile?.badges ?? [])
      return BADGES.map((b) => ({ ...b, earned: earned.has(b.code) }))
    },
  },
  async mounted() {
    await this.gamificationStore.fetchEvents({ limit: 50 })
  },
  methods: {
    eventLabel(type: string): string {
      return EVENT_LABELS[type] ?? type
    },
    formatDate(iso: string): string {
      return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
    },
  },
})
</script>

<style scoped>
.achievements-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding: 16px 10px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.badge-item.locked {
  opacity: 0.35;
  filter: grayscale(1);
}

.badge-icon {
  font-size: 28px;
  color: var(--color-warning);
}

.badge-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-base);
}

.badge-description {
  font-size: 10px;
  color: var(--color-text-muted);
}

.ledger-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.ledger-row:last-child {
  border-bottom: none;
}

.ledger-type {
  flex: 1;
  font-size: 13px;
  color: var(--color-text-base);
}

.ledger-date {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.ledger-points {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-success);
}
</style>
