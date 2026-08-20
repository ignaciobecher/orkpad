<template>
  <div class="skill-focus-tab">
    <w-card v-if="store.currentFocus" class="focus-card">
      <template #header>
        <div class="section-header">
          <span class="material-symbols-outlined">target</span>
          Foco de esta semana
        </div>
      </template>
      <div class="focus-body">
        <div class="focus-title">{{ store.currentFocus.title }}</div>
        <div v-if="store.currentFocus.category" class="focus-category">{{ store.currentFocus.category }}</div>
        <textarea
          v-model="outcomeNotes"
          class="focus-notes"
          rows="3"
          placeholder="Notas / aprendizajes de la semana (opcional)"
        ></textarea>
        <div class="focus-actions">
          <w-button variant="primary" @click="completeFocus">Marcar como completado</w-button>
        </div>
      </div>
    </w-card>

    <w-empty-state
      v-else
      title="Sin foco definido"
      message="Elegí en qué te vas a enfocar aprender esta semana."
    >
      <template #action>
        <w-button variant="primary" @click="showModal = true">Definir foco de la semana</w-button>
      </template>
    </w-empty-state>

    <w-card v-if="store.focusHistory.length > 0">
      <template #header>
        <div class="section-header">
          <span class="material-symbols-outlined">history</span>
          Historial
        </div>
      </template>
      <div class="focus-history">
        <div v-for="focus in store.focusHistory" :key="focus._id" class="focus-history-row">
          <w-badge :color="statusColor(focus.status)">{{ statusLabel(focus.status) }}</w-badge>
          <span class="focus-history-title">{{ focus.title }}</span>
          <span v-if="focus.category" class="focus-history-category">{{ focus.category }}</span>
        </div>
      </div>
    </w-card>

    <skill-focus-modal v-model="showModal" :loading="store.loading" @save="onSave" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useLearningStore } from '@/stores/learning.store'
import WCard from '@/components/ui/WCard.vue'
import WButton from '@/components/ui/WButton.vue'
import WEmptyState from '@/components/ui/WEmptyState.vue'
import WBadge from '@/components/ui/WBadge.vue'
import SkillFocusModal from './SkillFocusModal.vue'

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  completed: 'Completado',
  abandoned: 'Abandonado',
}

export default defineComponent({
  name: 'SkillFocusTab',
  components: { WCard, WButton, WEmptyState, WBadge, SkillFocusModal },
  setup() {
    const store = useLearningStore()
    return { store }
  },
  data() {
    return { showModal: false, outcomeNotes: '' }
  },
  async mounted() {
    await Promise.all([this.store.fetchCurrentFocus(), this.store.fetchFocusHistory()])
    this.outcomeNotes = this.store.currentFocus?.outcomeNotes ?? ''
  },
  methods: {
    statusLabel(status: string): string {
      return STATUS_LABELS[status] ?? status
    },
    statusColor(status: string): string {
      if (status === 'completed') return 'var(--color-success)'
      if (status === 'abandoned') return 'var(--color-error)'
      return 'var(--color-primary)'
    },
    async onSave(dto: { title: string; category?: string }) {
      await this.store.setWeeklyFocus(dto)
      this.showModal = false
    },
    async completeFocus() {
      if (!this.store.currentFocus) return
      await this.store.updateFocus(this.store.currentFocus._id, {
        status: 'completed',
        outcomeNotes: this.outcomeNotes || undefined,
      })
    },
  },
})
</script>

<style scoped>
.skill-focus-tab {
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

.focus-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.focus-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-base);
}

.focus-category {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.focus-notes {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  padding: 10px 12px;
  border-radius: 4px;
  font-family: var(--font-body);
  font-size: 14px;
  resize: vertical;
}

.focus-actions {
  display: flex;
  justify-content: flex-end;
}

.focus-history {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}

.focus-history-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.focus-history-title {
  font-size: 14px;
  color: var(--color-text-base);
}

.focus-history-category {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
