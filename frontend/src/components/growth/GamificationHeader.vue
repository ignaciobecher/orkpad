<template>
  <w-card class="gamification-header">
    <div class="gh-main">
      <div class="gh-level">
        <span class="material-symbols-outlined gh-level-icon">military_tech</span>
        <div>
          <div class="gh-level-label">Nivel {{ profile?.level ?? 1 }}</div>
          <div class="gh-points">{{ profile?.totalPoints ?? 0 }} puntos</div>
        </div>
      </div>

      <div class="gh-progress">
        <div class="progress-bar">
          <div class="progress-bar__fill" :style="{ width: progressPct + '%' }"></div>
        </div>
        <span class="gh-progress-label">
          {{ profile?.nextLevel?.current ?? 0 }}/{{ profile?.nextLevel?.next ?? 500 }} para el próximo nivel
        </span>
      </div>

      <div class="gh-streak">
        <span class="material-symbols-outlined gh-streak-icon">local_fire_department</span>
        <div>
          <div class="gh-streak-value">{{ profile?.currentStreakDays ?? 0 }} días</div>
          <div class="gh-streak-label">Racha actual</div>
        </div>
      </div>
    </div>

    <div v-if="recentBadges.length > 0" class="gh-badges">
      <w-badge v-for="code in recentBadges" :key="code" color="var(--color-warning)">
        {{ badgeName(code) }}
      </w-badge>
    </div>
  </w-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import WCard from '@/components/ui/WCard.vue'
import WBadge from '@/components/ui/WBadge.vue'
import type { GamificationProfile } from '@/api/gamification/gamification.types'

const BADGE_NAMES: Record<string, string> = {
  streak_7: 'Racha 7 días',
  streak_30: 'Racha 30 días',
  streak_100: 'Racha 100 días',
  first_book: 'Primer recurso',
  bookworm_5: 'Devorador de contenido',
  first_skill_focus: 'Primer foco semanal',
  skill_focus_5: 'Aprendiz constante',
  level_5: 'Nivel 5',
  level_10: 'Nivel 10',
  points_1000: '1000 puntos',
  points_5000: '5000 puntos',
}

export default defineComponent({
  name: 'GamificationHeader',
  components: { WCard, WBadge },
  props: {
    profile: { type: Object as PropType<GamificationProfile | null>, default: null },
  },
  computed: {
    progressPct(): number {
      const pct = (this.profile?.nextLevel?.progress ?? 0) * 100
      return Math.min(100, Math.max(0, pct))
    },
    recentBadges(): string[] {
      return [...(this.profile?.badges ?? [])].slice(-4).reverse()
    },
  },
  methods: {
    badgeName(code: string): string {
      return BADGE_NAMES[code] ?? code
    },
  },
})
</script>

<style scoped>
.gamification-header {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gh-main {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 24px;
}

.gh-level,
.gh-streak {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gh-level-icon {
  color: var(--color-primary);
  font-size: 28px;
}

.gh-streak-icon {
  color: var(--color-warning);
  font-size: 28px;
}

.gh-level-label,
.gh-streak-value {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-base);
}

.gh-points,
.gh-streak-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.gh-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.gh-progress-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  text-align: center;
}

.gh-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
}
</style>
