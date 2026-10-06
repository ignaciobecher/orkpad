<template>
  <teleport to="body">
    <div v-if="show" class="setup-checklist-widget" :class="{ 'widget--collapsed': !expanded }">
      <!-- Header -->
      <div class="widget-header" @click="toggleExpand">
        <div class="widget-header-left">
          <span class="material-symbols-outlined widget-icon">rocket_launch</span>
          <span class="widget-title">Setup</span>
          <span class="widget-progress-badge">{{ completedCount }}/{{ totalCount }}</span>
        </div>
        <span class="material-symbols-outlined widget-toggle">
          {{ expanded ? 'expand_more' : 'expand_less' }}
        </span>
      </div>

      <!-- Body -->
      <div v-if="expanded" class="widget-body">
        <!-- Progress bar -->
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <p class="progress-label">{{ completedCount }} de {{ totalCount }} completados</p>

        <!-- Steps -->
        <ul class="step-list">
          <li
            v-for="step in checklist"
            :key="step.id"
            class="step-item"
            :class="{
              'step--done': step.completed,
              'step--current': isCurrent(step.id),
            }"
          >
            <div class="step-check">
              <span v-if="step.completed" class="material-symbols-outlined check-icon">check_circle</span>
              <span v-else class="material-symbols-outlined pending-icon">radio_button_unchecked</span>
            </div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-why">{{ step.description }}</div>
              <button v-if="!step.completed" class="step-cta" @click.stop="navigate(step.cta.route)">
                {{ step.cta.label }}
                <span class="material-symbols-outlined cta-arrow">arrow_forward</span>
              </button>
            </div>
          </li>
        </ul>

        <!-- Completion celebration -->
        <div v-if="celebrating" class="celebration">
          <div class="celebration-text">¡Orkpad está listo para trabajar contigo! 🚀</div>
        </div>

        <!-- Help link -->
        <router-link to="/help" class="widget-help-link">
          <span class="material-symbols-outlined">menu_book</span>
          Ver guía de uso
        </router-link>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOnboardingStore } from '@/stores/onboarding.store'
import type { OnboardingSteps } from '@/api/onboarding/onboarding.types'

export default defineComponent({
  name: 'SetupChecklist',
  setup() {
    const store = useOnboardingStore()
    const router = useRouter()
    const route = useRoute()
    const expanded = ref(true)
    const celebrating = ref(false)

    const show = computed(() => store.visible && !store.isComplete)

    const checklist = computed(() => store.checklist)
    const completedCount = computed(() => store.completedCount)
    const totalCount = computed(() => store.totalCount)
    const progressPercent = computed(() => Math.round((completedCount.value / totalCount.value) * 100))

    const firstIncompleteId = computed<keyof OnboardingSteps | null>(() => {
      const found = checklist.value.find((step) => !step.completed)
      return found ? found.id : null
    })

    function isCurrent(id: keyof OnboardingSteps): boolean {
      return id === firstIncompleteId.value
    }

    function toggleExpand() {
      expanded.value = !expanded.value
    }

    function navigate(routePath: string) {
      router.push(routePath)
    }

    // Refresh status on every route change
    watch(() => route.path, () => {
      store.fetchStatus()
    })

    // Watch for completion to show celebration then hide
    watch(() => store.isComplete, (done) => {
      if (done) {
        celebrating.value = true
        expanded.value = true
        setTimeout(() => {
          celebrating.value = false
          store.markVisible(false)
        }, 3000)
      }
    })

    return {
      checklist,
      show,
      expanded,
      celebrating,
      completedCount,
      totalCount,
      progressPercent,
      isCurrent,
      toggleExpand,
      navigate,
    }
  },
})
</script>

<style scoped>
.setup-checklist-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 320px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 500;
  overflow: hidden;
  transition: height 0.2s ease;
}

.widget--collapsed {
  width: 200px;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
}

.widget-header:hover {
  background: var(--color-bg-muted);
}

.widget-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.widget-icon {
  font-size: 18px;
  color: var(--color-primary);
}

.widget-title {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-base);
}

.widget-progress-badge {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  padding: 2px 7px;
  border-radius: 20px;
}

.widget-toggle {
  font-size: 18px;
  color: var(--color-text-muted);
}

.widget-body {
  padding: 16px;
  max-height: 480px;
  overflow-y: auto;
}

.progress-track {
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  transition: width 0.4s ease;
}

.progress-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

.step-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: border-color 0.15s;
}

.step--current {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
}

.step--done .step-title {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.step-check {
  flex-shrink: 0;
  padding-top: 1px;
}

.check-icon {
  font-size: 18px;
  color: var(--color-success);
}

.pending-icon {
  font-size: 18px;
  color: var(--color-text-muted);
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-base);
  margin-bottom: 2px;
}

.step-why {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

.step-cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.step-cta:hover {
  opacity: 0.75;
}

.cta-arrow {
  font-size: 13px;
}

.celebration {
  margin-top: 16px;
  padding: 12px;
  background: color-mix(in srgb, var(--color-success) 10%, transparent);
  border: 1px solid var(--color-success);
  border-radius: 8px;
  text-align: center;
}

.celebration-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-success);
}

.widget-help-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.widget-help-link:hover {
  color: var(--color-primary);
}

.widget-help-link .material-symbols-outlined {
  font-size: 14px;
}
</style>
