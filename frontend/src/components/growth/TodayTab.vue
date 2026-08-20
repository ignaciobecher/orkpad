<template>
  <div class="today-tab">
    <gamification-header :profile="gamificationStore.profile" />

    <div class="today-grid">
      <w-card class="today-section">
        <template #header>
          <div class="section-header">
            <span class="material-symbols-outlined">repeat</span>
            Hábitos de hoy
          </div>
        </template>
        <w-empty-state
          v-if="dailyGoals.length === 0"
          title="Sin hábitos diarios"
          message="Creá un hábito en la pestaña Objetivos para verlo aquí."
        />
        <goal-list-item
          v-for="goal in dailyGoals"
          :key="goal._id"
          :goal="goal"
          @increment="onIncrement"
          @decrement="onDecrement"
          @complete="onComplete"
          @uncomplete="onUncomplete"
          @edit="() => {}"
          @remove="() => {}"
          @stats="() => {}"
        />
      </w-card>

      <w-card class="today-section">
        <template #header>
          <div class="section-header">
            <span class="material-symbols-outlined">menu_book</span>
            Mínimo diario de aprendizaje
          </div>
        </template>
        <w-empty-state
          v-if="learningStore.today.length === 0"
          title="Sin recursos con mínimo diario"
          message="Definí un mínimo diario en la pestaña Aprendizaje."
        />
        <div v-else class="today-learning-list">
          <div v-for="item in learningStore.today" :key="item.resource._id" class="today-learning-row">
            <span class="material-symbols-outlined" :class="{ done: item.metMinimum }">
              {{ item.metMinimum ? 'check_circle' : 'radio_button_unchecked' }}
            </span>
            <div class="today-learning-info">
              <div class="today-learning-title">{{ item.resource.title }}</div>
              <div class="today-learning-meta">
                {{ item.unitsLoggedToday }}/{{ item.resource.dailyGoalUnits }} {{ item.resource.unit }} hoy
              </div>
            </div>
          </div>
        </div>
      </w-card>

      <w-card class="today-section">
        <template #header>
          <div class="section-header">
            <span class="material-symbols-outlined">campaign</span>
            Prospección de la semana
          </div>
        </template>
        <div v-if="outreachStore.currentWeek" class="outreach-today">
          <div class="progress-bar">
            <div
              class="progress-bar__fill"
              :style="{ width: outreachProgressPct + '%' }"
            ></div>
          </div>
          <span class="outreach-today-label">
            {{ outreachStore.currentWeek.currentCount }}/{{ outreachStore.currentWeek.targetCount }} contactos esta semana
          </span>
        </div>
      </w-card>

      <w-card v-if="learningStore.currentFocus" class="today-section">
        <template #header>
          <div class="section-header">
            <span class="material-symbols-outlined">target</span>
            Foco de la semana
          </div>
        </template>
        <div class="focus-today">
          <div class="focus-today-title">{{ learningStore.currentFocus.title }}</div>
          <div v-if="learningStore.currentFocus.category" class="focus-today-category">
            {{ learningStore.currentFocus.category }}
          </div>
        </div>
      </w-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useGoalsStore } from '@/stores/goals.store'
import { useGamificationStore } from '@/stores/gamification.store'
import { useLearningStore } from '@/stores/learning.store'
import { useOutreachStore } from '@/stores/outreach.store'
import WCard from '@/components/ui/WCard.vue'
import WEmptyState from '@/components/ui/WEmptyState.vue'
import GamificationHeader from './GamificationHeader.vue'
import GoalListItem from '@/components/goals/GoalListItem.vue'
import type { Goal } from '@/api/goals/goals.types'

export default defineComponent({
  name: 'TodayTab',
  components: { WCard, WEmptyState, GamificationHeader, GoalListItem },
  setup() {
    return {
      goalsStore: useGoalsStore(),
      gamificationStore: useGamificationStore(),
      learningStore: useLearningStore(),
      outreachStore: useOutreachStore(),
    }
  },
  computed: {
    dailyGoals(): Goal[] {
      return this.goalsStore.items.filter((g) => g.period === 'daily' && g.status === 'active')
    },
    outreachProgressPct(): number {
      const week = this.outreachStore.currentWeek
      if (!week || week.targetCount === 0) return 0
      return Math.min(100, (week.currentCount / week.targetCount) * 100)
    },
  },
  methods: {
    async onIncrement(goalId: string) {
      await this.goalsStore.incrementProgress(goalId, 1)
    },
    async onDecrement(goalId: string) {
      await this.goalsStore.incrementProgress(goalId, -1)
    },
    async onComplete(goalId: string) {
      await this.goalsStore.complete(goalId)
      await this.gamificationStore.fetchProfile()
    },
    async onUncomplete(goalId: string) {
      await this.goalsStore.uncomplete(goalId)
      await this.gamificationStore.fetchProfile()
    },
  },
})
</script>

<style scoped>
.today-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.today-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
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

.today-learning-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.today-learning-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.today-learning-row .material-symbols-outlined {
  color: var(--color-text-muted);
}

.today-learning-row .material-symbols-outlined.done {
  color: var(--color-success);
}

.today-learning-title {
  font-size: 14px;
  color: var(--color-text-base);
}

.today-learning-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.outreach-today,
.progress-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  transition: width 0.3s ease;
}

.outreach-today-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.focus-today-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-base);
}

.focus-today-category {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
}
</style>
