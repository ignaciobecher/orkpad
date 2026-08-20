<template>
  <div class="growth-page">
    <header class="page-header">
      <h1 class="page-title">Crecimiento</h1>
    </header>

    <nav class="growth-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="growth-tab"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <span class="material-symbols-outlined">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </nav>

    <today-tab v-if="activeTab === 'today'" />
    <goals-tab v-else-if="activeTab === 'goals'" />
    <learning-tab v-else-if="activeTab === 'learning'" />
    <skill-focus-tab v-else-if="activeTab === 'focus'" />
    <outreach-tab v-else-if="activeTab === 'outreach'" />
    <achievements-tab v-else-if="activeTab === 'achievements'" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useGoalsStore } from '@/stores/goals.store'
import { useGamificationStore } from '@/stores/gamification.store'
import { useLearningStore } from '@/stores/learning.store'
import { useOutreachStore } from '@/stores/outreach.store'
import TodayTab from '@/components/growth/TodayTab.vue'
import GoalsTab from '@/components/growth/GoalsTab.vue'
import LearningTab from '@/components/growth/LearningTab.vue'
import SkillFocusTab from '@/components/growth/SkillFocusTab.vue'
import OutreachTab from '@/components/growth/OutreachTab.vue'
import AchievementsTab from '@/components/growth/AchievementsTab.vue'

type TabValue = 'today' | 'goals' | 'learning' | 'focus' | 'outreach' | 'achievements'

export default defineComponent({
  name: 'GrowthPage',
  components: { TodayTab, GoalsTab, LearningTab, SkillFocusTab, OutreachTab, AchievementsTab },
  setup() {
    return {
      goalsStore: useGoalsStore(),
      gamificationStore: useGamificationStore(),
      learningStore: useLearningStore(),
      outreachStore: useOutreachStore(),
    }
  },
  data() {
    return {
      activeTab: 'today' as TabValue,
      tabs: [
        { value: 'today', label: 'Hoy', icon: 'today' },
        { value: 'goals', label: 'Objetivos', icon: 'flag' },
        { value: 'learning', label: 'Aprendizaje', icon: 'menu_book' },
        { value: 'focus', label: 'Foco Semanal', icon: 'target' },
        { value: 'outreach', label: 'Prospección', icon: 'campaign' },
        { value: 'achievements', label: 'Logros', icon: 'military_tech' },
      ] as { value: TabValue; label: string; icon: string }[],
    }
  },
  async mounted() {
    await Promise.all([
      this.goalsStore.fetchAll(),
      this.goalsStore.fetchSummary(),
      this.gamificationStore.fetchProfile(),
      this.learningStore.fetchToday(),
      this.learningStore.fetchCurrentFocus(),
      this.outreachStore.fetchCurrentWeek(),
    ])
  },
})
</script>

<style scoped>
.growth-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-family: var(--font-body);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-base);
}

.growth-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.growth-tab {
  display: flex;
  align-items: center;
  gap: 6px;
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

.growth-tab .material-symbols-outlined {
  font-size: 18px;
}

.growth-tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}
</style>
