<template>
  <teleport to="body">
    <div
      v-if="show"
      ref="winEl"
      class="setup-checklist-widget w95-window w95-outset"
      :class="{ 'widget--collapsed': !expanded }"
      :style="dragged ? { left: pos.x + 'px', top: pos.y + 'px', right: 'auto', bottom: 'auto' } : {}"
    >
      <!-- Titlebar real Win95: arrastrable, con minimizar y cerrar -->
      <div class="w95-titlebar" @mousedown="startDrag" @dblclick="toggleExpand">
        <win-icon name="programs" :size="16" alt="Setup" />
        <span class="title-text">Setup {{ completedCount }}/{{ totalCount }}</span>
        <div class="w95-titlebar-buttons" @mousedown.stop>
          <button class="w95-title-btn" @click.stop="toggleExpand" :title="expanded ? 'Minimizar' : 'Restaurar'">
            <span v-if="expanded" class="tbtn-min" aria-hidden="true"></span>
            <span v-else class="tbtn-restore" aria-hidden="true"></span>
          </button>
          <button class="w95-title-btn" @click.stop="dismiss" title="Cerrar">
            <span class="tbtn-close" aria-hidden="true">×</span>
          </button>
        </div>
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
            <div class="step-check" aria-hidden="true">
              <span v-if="step.completed" class="w95-check w95-check--done">✓</span>
              <span v-else class="w95-check"></span>
            </div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-why">{{ step.description }}</div>
              <button v-if="!step.completed" class="step-cta" @click.stop="navigate(step.cta.route)">
                {{ step.cta.label }} →
              </button>
            </div>
          </li>
        </ul>

        <!-- Completion celebration -->
        <div v-if="celebrating" class="celebration">
          <div class="celebration-text">¡Orkpad está listo para trabajar contigo!</div>
        </div>

        <!-- Footer: ayuda + omisión permanente -->
        <div class="widget-footer">
          <router-link to="/help" class="widget-help-link">Ver guía de uso</router-link>
          <button class="widget-dismiss" @click="dismiss" title="No volver a mostrar este asistente">
            No mostrar más
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOnboardingStore } from '@/stores/onboarding.store'
import type { OnboardingSteps } from '@/api/onboarding/onboarding.types'
import WinIcon from '@/components/win95/WinIcon.vue'

export default defineComponent({
  name: 'SetupChecklist',
  components: { WinIcon },
  setup() {
    const store = useOnboardingStore()
    const router = useRouter()
    const route = useRoute()
    const expanded = ref(true)
    const celebrating = ref(false)
    const winEl = ref<HTMLElement | null>(null)
    const dragged = ref(false)
    const pos = ref({ x: 0, y: 0 })

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

    function dismiss() {
      store.dismiss()
    }

    function startDrag(e: MouseEvent) {
      if ((e.target as HTMLElement).closest('.w95-titlebar-buttons')) return
      const rect = winEl.value?.getBoundingClientRect()
      if (!rect) return
      const offX = e.clientX - rect.left
      const offY = e.clientY - rect.top
      const onMove = (ev: MouseEvent) => {
        dragged.value = true
        pos.value = {
          x: Math.max(-rect.width + 80, Math.min(window.innerWidth - 80, ev.clientX - offX)),
          y: Math.max(0, Math.min(window.innerHeight - 60, ev.clientY - offY)),
        }
      }
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
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
      dismiss,
      startDrag,
      winEl,
      dragged,
      pos,
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

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .setup-checklist-widget {
position: fixed;
  bottom: calc(var(--w95-taskbar-height) + 8px);
  right: 8px;
  width: 320px;
  background: var(--w95-face);
  border: 2px solid;
  border-color: var(--w95-highlight) var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-highlight);
  border-radius: 0;
  box-shadow: none;
  z-index: 500;
  overflow: hidden;
  font-family: Tahoma, Verdana, sans-serif;
  padding: 2px;
}

html[data-appearance="win95"] .widget--collapsed {
width: 220px;
}

html[data-appearance="win95"] .tbtn-min {
position: absolute;
  left: 3px;
  bottom: 3px;
  width: 8px;
  height: 2px;
  background: #000;
}

html[data-appearance="win95"] .tbtn-restore {
position: absolute;
  left: 3px;
  top: 1px;
  width: 10px;
  height: 11px;
  box-sizing: border-box;
}

html[data-appearance="win95"] .tbtn-restore::before {
content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 7px;
  height: 6px;
  border: 1px solid #000;
  border-top-width: 2px;
  background: var(--w95-face);
  box-sizing: border-box;
}

html[data-appearance="win95"] .tbtn-restore::after {
content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 7px;
  height: 6px;
  border: 1px solid #000;
  border-top-width: 2px;
  background: var(--w95-face);
  box-sizing: border-box;
}

html[data-appearance="win95"] .w95-titlebar .title-text {
overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

html[data-appearance="win95"] .widget-body {
padding: 8px;
  max-height: 480px;
  overflow-y: auto;
  background: var(--w95-face);
}

html[data-appearance="win95"] .progress-track {
height: 16px;
  background: #fff;
  border: 2px solid;
  border-color: var(--w95-shadow) var(--w95-highlight) var(--w95-highlight) var(--w95-shadow);
  border-radius: 0;
  overflow: hidden;
  margin-bottom: 4px;
  padding: 2px;
}

html[data-appearance="win95"] .progress-fill {
height: 100%;
  background: repeating-linear-gradient(
    to right,
    var(--w95-navy) 0 8px,
    #fff 8px 10px
  );
  border-radius: 0;
}

html[data-appearance="win95"] .progress-label {
font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  color: #000;
  margin-bottom: 8px;
  text-transform: none;
}

html[data-appearance="win95"] .step-list {
list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

html[data-appearance="win95"] .step-item {
display: flex;
  gap: 6px;
  padding: 4px;
  border-radius: 0;
  border: 2px solid transparent;
  background: var(--w95-face);
}

html[data-appearance="win95"] .step--current {
border-color: var(--w95-darkshadow);
  background: var(--w95-face-light);
}

html[data-appearance="win95"] .step--done .step-title {
text-decoration: line-through;
  color: #000;
}

html[data-appearance="win95"] .step-check {
flex-shrink: 0;
  padding-top: 1px;
}

html[data-appearance="win95"] .w95-check {
display: inline-block;
  width: 13px;
  height: 13px;
  background: #fff;
  border: 1px solid;
  border-color: var(--w95-shadow) var(--w95-highlight) var(--w95-highlight) var(--w95-shadow);
  box-shadow: inset 1px 1px 0 var(--w95-darkshadow);
  font-size: 10px;
  font-weight: bold;
  line-height: 11px;
  text-align: center;
  color: #000;
}

html[data-appearance="win95"] .w95-check--done {
line-height: 11px;
}

html[data-appearance="win95"] .step-content {
flex: 1;
  min-width: 0;
}

html[data-appearance="win95"] .step-title {
font-family: Tahoma, Verdana, sans-serif;
  font-size: 12px;
  font-weight: normal;
  color: #000;
  margin-bottom: 2px;
  text-transform: none;
}

html[data-appearance="win95"] .step-why {
font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  color: #000;
  margin-bottom: 4px;
}

html[data-appearance="win95"] .step-cta {
display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  font-weight: normal;
  color: #000;
  background: var(--w95-face);
  border: 2px solid;
  border-color: var(--w95-highlight) var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-highlight);
  border-radius: 0;
  cursor: pointer;
  padding: 2px 8px;
  text-decoration: none;
}

html[data-appearance="win95"] .step-cta:active {
border-color: var(--w95-darkshadow) var(--w95-highlight) var(--w95-highlight) var(--w95-darkshadow);
}

html[data-appearance="win95"] .cta-arrow {
font-size: 13px;
}

html[data-appearance="win95"] .celebration {
margin-top: 8px;
  padding: 8px;
  background: var(--w95-face);
  border: 2px solid;
  border-color: var(--w95-highlight) var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-highlight);
  border-radius: 0;
  text-align: center;
}

html[data-appearance="win95"] .celebration-text {
font-family: Tahoma, Verdana, sans-serif;
  font-size: 12px;
  font-weight: bold;
  color: #000;
}

html[data-appearance="win95"] .widget-footer {
display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--w95-shadow);
}

html[data-appearance="win95"] .widget-help-link {
font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  color: var(--w95-navy);
  text-decoration: underline;
}

html[data-appearance="win95"] .widget-dismiss {
background: none;
  border: none;
  padding: 2px 4px;
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  color: #000;
  text-decoration: underline;
  cursor: pointer;
}

html[data-appearance="win95"] .widget-dismiss:hover {
color: var(--w95-error);
}
</style>
