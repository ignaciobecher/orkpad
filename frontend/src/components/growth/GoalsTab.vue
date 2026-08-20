<template>
  <div class="goals-tab-content">
    <div class="tab-actions">
      <w-button variant="primary" @click="openCreateModal">
        <span class="material-symbols-outlined mr-2">add</span>
        Nuevo objetivo
      </w-button>
    </div>

    <goals-summary-bar :summary="store.summary" />

    <nav class="goals-subtabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="goals-subtab"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </nav>

    <w-card v-if="activeTab !== 'calendar'" class="no-padding">
      <div v-if="store.loading" class="goals-loading">
        <span class="material-symbols-outlined spinning">sync</span>
        Cargando objetivos...
      </div>
      <w-empty-state
        v-else-if="filteredGoals.length === 0"
        title="Sin objetivos"
        message="Todavía no creaste objetivos en esta sección."
      >
        <template #action>
          <w-button variant="primary" @click="openCreateModal">Crear objetivo</w-button>
        </template>
      </w-empty-state>
      <div v-else>
        <goal-list-item
          v-for="goal in filteredGoals"
          :key="goal._id"
          :goal="goal"
          @increment="onIncrement"
          @decrement="onDecrement"
          @complete="onComplete"
          @uncomplete="onUncomplete"
          @edit="openEditModal"
          @remove="confirmRemove"
          @stats="openStats"
        />
      </div>
    </w-card>

    <div v-else class="calendar-tab">
      <div class="calendar-goal-select">
        <label class="form-label">Objetivo</label>
        <select v-model="calendarGoalId" class="form-select">
          <option v-for="goal in store.items" :key="goal._id" :value="goal._id">{{ goal.title }}</option>
        </select>
      </div>
      <w-card v-if="calendarGoalId">
        <goal-heatmap :entries="calendarEntries" />
      </w-card>
    </div>

    <goal-modal
      v-model="showModal"
      :initial-data="editingGoal"
      :loading="store.loading"
      @save="onSave"
    />

    <w-drawer v-model="showStats" title="Estadísticas del objetivo" width="480px">
      <goal-stats-panel :stats="statsData" :entries="statsEntries" />
    </w-drawer>

    <w-confirm-modal
      :is-open="showConfirmRemove"
      title="Eliminar objetivo"
      message="¿Seguro que querés eliminar este objetivo? Se perderá su historial de progreso."
      is-danger
      @confirm="doRemove"
      @cancel="showConfirmRemove = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useGoalsStore } from '@/stores/goals.store'
import WButton from '@/components/ui/WButton.vue'
import WCard from '@/components/ui/WCard.vue'
import WEmptyState from '@/components/ui/WEmptyState.vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import WConfirmModal from '@/components/ui/WConfirmModal.vue'
import GoalsSummaryBar from '@/components/goals/GoalsSummaryBar.vue'
import GoalListItem from '@/components/goals/GoalListItem.vue'
import GoalModal from '@/components/goals/GoalModal.vue'
import GoalHeatmap from '@/components/goals/GoalHeatmap.vue'
import GoalStatsPanel from '@/components/goals/GoalStatsPanel.vue'
import { goalsApi } from '@/api/goals/goals.api'
import type { Goal, GoalStats, GoalEntry } from '@/api/goals/goals.types'

type TabValue = 'today' | 'periodic' | 'targets' | 'calendar'

export default defineComponent({
  name: 'GoalsTab',
  components: {
    WButton,
    WCard,
    WEmptyState,
    WDrawer,
    WConfirmModal,
    GoalsSummaryBar,
    GoalListItem,
    GoalModal,
    GoalHeatmap,
    GoalStatsPanel,
  },
  setup() {
    const store = useGoalsStore()
    return { store }
  },
  data() {
    return {
      activeTab: 'today' as TabValue,
      tabs: [
        { value: 'today', label: 'Hoy' },
        { value: 'periodic', label: 'Semana / Mes' },
        { value: 'targets', label: 'Metas' },
        { value: 'calendar', label: 'Calendario' },
      ] as { value: TabValue; label: string }[],
      showModal: false,
      editingGoal: null as Goal | null,
      showConfirmRemove: false,
      removeTargetId: null as string | null,
      showStats: false,
      statsData: null as GoalStats | null,
      statsEntries: [] as GoalEntry[],
      calendarGoalId: '',
      calendarEntries: [] as GoalEntry[],
    }
  },
  computed: {
    filteredGoals(): Goal[] {
      if (this.activeTab === 'today') {
        return this.store.items.filter((g) => g.period === 'daily')
      }
      if (this.activeTab === 'periodic') {
        return this.store.items.filter((g) => g.period === 'weekly' || g.period === 'monthly')
      }
      if (this.activeTab === 'targets') {
        return this.store.items.filter((g) => g.type === 'target')
      }
      return this.store.items
    },
  },
  watch: {
    async calendarGoalId(id: string) {
      if (!id) {
        this.calendarEntries = []
        return
      }
      this.calendarEntries = await this.store.fetchEntries(id, { limit: 90 })
    },
  },
  async mounted() {
    await Promise.all([this.store.fetchAll(), this.store.fetchSummary()])
    if (this.store.items.length > 0) {
      this.calendarGoalId = this.store.items[0]._id
    }
  },
  methods: {
    openCreateModal() {
      this.editingGoal = null
      this.showModal = true
    },
    openEditModal(goal: Goal) {
      this.editingGoal = goal
      this.showModal = true
    },
    async onSave(payload: any) {
      if (payload._id) {
        const { _id, ...dto } = payload
        await this.store.update(_id, dto)
      } else {
        await this.store.create(payload)
      }
      this.showModal = false
    },
    async onIncrement(goalId: string) {
      await this.store.incrementProgress(goalId, 1)
    },
    async onDecrement(goalId: string) {
      await this.store.incrementProgress(goalId, -1)
    },
    async onComplete(goalId: string) {
      await this.store.complete(goalId)
    },
    async onUncomplete(goalId: string) {
      await this.store.uncomplete(goalId)
    },
    confirmRemove(goalId: string) {
      this.removeTargetId = goalId
      this.showConfirmRemove = true
    },
    async doRemove() {
      if (this.removeTargetId) await this.store.remove(this.removeTargetId)
      this.showConfirmRemove = false
      this.removeTargetId = null
    },
    async openStats(goalId: string) {
      this.showStats = true
      const [statsRes, entries] = await Promise.all([
        goalsApi.getGoalStats(goalId),
        this.store.fetchEntries(goalId, { limit: 90 }),
      ])
      this.statsData = statsRes.data
      this.statsEntries = entries
    },
  },
})
</script>

<style scoped>
.goals-tab-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tab-actions {
  display: flex;
  justify-content: flex-end;
}

.goals-subtabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--color-border);
}

.goals-subtab {
  padding: 10px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
  cursor: pointer;
}

.goals-subtab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.goals-loading {
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

.calendar-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.calendar-goal-select {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 320px;
}

.form-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.form-select {
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 12px;
  outline: none;
  border-radius: 4px;
}

.mr-2 {
  margin-right: 8px;
}
</style>
