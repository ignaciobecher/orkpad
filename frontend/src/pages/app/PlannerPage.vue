<template>
  <div class="planner-page" :class="{ 'focus-mode': uiStore.focusMode }">
    <!-- Topbar -->
    <div class="planner-topbar">
      <div class="planner-topbar__left">
        <span class="planner-topbar__title">Planner</span>

        <!-- Date navigation -->
        <div class="planner-nav">
          <button class="planner-nav__btn" @click="handlePrev">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <button class="planner-nav__today" @click="uiStore.goToToday()">Hoy</button>
          <button class="planner-nav__btn" @click="handleNext">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
          <span class="planner-nav__label">{{ currentLabel }}</span>
        </div>
      </div>

      <div class="planner-topbar__right">
        <!-- View switcher -->
        <div class="planner-view-tabs">
          <button
            v-for="v in views"
            :key="v.value"
            class="planner-view-tabs__btn"
            :class="{ active: uiStore.view === v.value }"
            @click="uiStore.setView(v.value)"
          >
            <span class="material-symbols-outlined">{{ v.icon }}</span>
            {{ v.label }}
          </button>
        </div>

        <!-- Focus mode -->
        <button
          class="planner-icon-btn"
          :class="{ active: uiStore.focusMode }"
          title="Modo foco (F)"
          @click="uiStore.toggleFocusMode()"
        >
          <span class="material-symbols-outlined">center_focus_strong</span>
        </button>

        <!-- New block -->
        <button class="planner-btn-primary" @click="openCreateBlock()">
          <span class="material-symbols-outlined">add</span>
          Nuevo bloque
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="planner-body">
      <!-- Main view -->
      <div class="planner-main">
        <div v-if="blocksStore.loading" class="planner-loading">
          <span class="material-symbols-outlined spinning">sync</span>
          Cargando planner...
        </div>
        <PlannerDayView
          v-else-if="uiStore.view === 'day'"
          :date="uiStore.selectedDate"
          @new-block="openCreateBlock"
          @edit-block="openEditBlock"
        />
        <PlannerWeekView
          v-else-if="uiStore.view === 'week'"
          :week-start="uiStore.selectedWeek"
          @day-click="(d) => uiStore.setDate(d)"
          @edit-block="openEditBlock"
        />
        <div v-else class="planner-coming-soon">
          <span class="material-symbols-outlined">construction</span>
          <p>Vista en construcción</p>
        </div>
      </div>

      <!-- Sidebar panel -->
      <div v-if="uiStore.sidebarOpen && !uiStore.focusMode" class="planner-sidebar">
        <div class="planner-sidebar__tabs">
          <button
            v-for="tab in sidebarTabs"
            :key="tab.value"
            class="planner-sidebar__tab"
            :class="{ active: uiStore.sidebarTab === tab.value }"
            :title="tab.label"
            @click="uiStore.setSidebarTab(tab.value)"
          >
            <span class="material-symbols-outlined">{{ tab.icon }}</span>
            <span class="planner-sidebar__tab-label">{{ tab.label }}</span>
          </button>
        </div>

        <div class="planner-sidebar__content">
          <TemplateSelector
            v-if="uiStore.sidebarTab === 'templates'"
            :current-date="uiStore.selectedDate"
            @applied="onTemplateApplied"
          />
          <div v-else-if="uiStore.sidebarTab === 'goals'" class="planner-coming-soon">
            <span class="material-symbols-outlined">flag</span>
            <p>Objetivos</p>
            <small>Define metas diarias, semanales y mensuales. Próximamente en Fase 3.</small>
          </div>
          <div v-else-if="uiStore.sidebarTab === 'habits'" class="planner-coming-soon">
            <span class="material-symbols-outlined">fitness_center</span>
            <p>Hábitos</p>
            <small>Rastreá tus hábitos y rachas diarias. Próximamente en Fase 2.</small>
          </div>
          <div v-else-if="uiStore.sidebarTab === 'analytics'" class="planner-coming-soon">
            <span class="material-symbols-outlined">bar_chart</span>
            <p>Analíticas</p>
            <small>Horas trabajadas, productividad y estadísticas. Próximamente en Fase 3.</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Block editor modal -->
    <BlockEditorModal
      v-if="editorOpen"
      :block="editingBlock"
      :default-date="uiStore.selectedDate"
      @close="editorOpen = false"
      @saved="onBlockSaved"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { usePlannerUIStore } from '@/stores/planner-ui.store'
import { usePlannerBlocksStore } from '@/stores/planner-blocks.store'
import PlannerDayView from '@/components/planner/views/PlannerDayView.vue'
import PlannerWeekView from '@/components/planner/views/PlannerWeekView.vue'
import BlockEditorModal from '@/components/planner/blocks/BlockEditorModal.vue'
import TemplateSelector from '@/components/planner/templates/TemplateSelector.vue'
import type { PlannerBlock } from '@/api/planner/planner.types'

export default defineComponent({
  name: 'PlannerPage',
  components: { PlannerDayView, PlannerWeekView, BlockEditorModal, TemplateSelector },

  setup() {
    const uiStore = usePlannerUIStore()
    const blocksStore = usePlannerBlocksStore()

    const editorOpen = ref(false)
    const editingBlock = ref<PlannerBlock | null>(null)

    const views = [
      { value: 'day' as const, label: 'Día', icon: 'view_day' },
      { value: 'week' as const, label: 'Semana', icon: 'view_week' },
      { value: 'month' as const, label: 'Mes', icon: 'calendar_month' },
    ]

    const sidebarTabs = [
      { value: 'templates' as const, icon: 'dashboard_customize', label: 'Plantillas' },
      { value: 'goals' as const, icon: 'flag', label: 'Objetivos' },
      { value: 'habits' as const, icon: 'fitness_center', label: 'Hábitos' },
      { value: 'analytics' as const, icon: 'bar_chart', label: 'Analíticas' },
    ]

    const currentLabel = computed(() => {
      if (uiStore.view === 'day') {
        return format(new Date(uiStore.selectedDate + 'T00:00:00'), "EEEE d 'de' MMMM yyyy", { locale: es })
      }
      if (uiStore.view === 'week') {
        const start = new Date(uiStore.selectedWeek + 'T00:00:00')
        const end = new Date(start)
        end.setDate(end.getDate() + 6)
        return `${format(start, 'd MMM', { locale: es })} – ${format(end, 'd MMM yyyy', { locale: es })}`
      }
      return format(new Date(uiStore.selectedMonth + '-01'), 'MMMM yyyy', { locale: es })
    })

    function handlePrev() {
      if (uiStore.view === 'day') uiStore.prevDay()
      else if (uiStore.view === 'week') uiStore.prevWeek()
    }

    function handleNext() {
      if (uiStore.view === 'day') uiStore.nextDay()
      else if (uiStore.view === 'week') uiStore.nextWeek()
    }

    function openCreateBlock() {
      editingBlock.value = null
      editorOpen.value = true
    }

    function openEditBlock(block: PlannerBlock) {
      editingBlock.value = block
      editorOpen.value = true
    }

    function onBlockSaved() {
      editorOpen.value = false
      if (uiStore.view === 'week') {
        blocksStore.fetchForWeek(uiStore.selectedWeek)
      } else {
        blocksStore.fetchForDate(uiStore.selectedDate)
      }
    }

    function onTemplateApplied() {
      blocksStore.fetchForDate(uiStore.selectedDate)
    }

    // Keyboard shortcuts
    function onKeydown(e: KeyboardEvent) {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return
      if (e.key === 't' || e.key === 'T') uiStore.goToToday()
      if (e.key === 'd' || e.key === 'D') uiStore.setView('day')
      if (e.key === 'w' || e.key === 'W') uiStore.setView('week')
      if (e.key === 'm' || e.key === 'M') uiStore.setView('month')
      if (e.key === 'f' || e.key === 'F') uiStore.toggleFocusMode()
      if (e.key === 'n' || e.key === 'N') openCreateBlock()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }

    onMounted(() => {
      window.addEventListener('keydown', onKeydown)
      blocksStore.fetchForDate(uiStore.selectedDate)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', onKeydown)
    })

    return {
      uiStore,
      blocksStore,
      views,
      sidebarTabs,
      currentLabel,
      editorOpen,
      editingBlock,
      handlePrev,
      handleNext,
      openCreateBlock,
      openEditBlock,
      onBlockSaved,
      onTemplateApplied,
    }
  },
})
</script>

<style scoped>
.planner-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-base);
  color: var(--color-text-base);
  overflow: hidden;
}

.planner-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  gap: 16px;
  background: var(--color-bg-surface);
  flex-wrap: wrap;
}

.planner-topbar__left,
.planner-topbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.planner-topbar__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-base);
}

.planner-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.planner-nav__btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-base);
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: background 0.15s;
}

.planner-nav__btn:hover { background: var(--color-bg-surface-high); }

.planner-nav__today {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s;
}

.planner-nav__today:hover { background: var(--color-bg-surface-high); }

.planner-nav__label {
  font-size: 14px;
  color: var(--color-text-muted);
  min-width: 0;
  text-transform: capitalize;
}

.planner-view-tabs {
  display: flex;
  gap: 2px;
  background: var(--color-bg-surface-low);
  border-radius: 8px;
  padding: 3px;
}

.planner-view-tabs__btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-muted);
  transition: all 0.15s;
}

.planner-view-tabs__btn.active {
  background: var(--color-bg-surface-high);
  color: var(--color-text-base);
}

.planner-view-tabs__btn .material-symbols-outlined { font-size: 16px; }

.planner-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: all 0.15s;
}

.planner-icon-btn:hover,
.planner-icon-btn.active { color: var(--color-text-base); background: var(--color-bg-surface-high); }

.planner-btn-primary {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  padding: 7px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.15s;
}

.planner-btn-primary:hover { background: var(--color-primary-hover); }
.planner-btn-primary .material-symbols-outlined { font-size: 18px; }

.planner-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.planner-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.planner-sidebar {
  width: 280px;
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: var(--color-bg-surface);
}

.planner-sidebar__tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}

.planner-sidebar__tab {
  flex: 1;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 4px;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: all 0.15s;
  border-bottom: 2px solid transparent;
}

.planner-sidebar__tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.planner-sidebar__tab .material-symbols-outlined { font-size: 18px; }

.planner-sidebar__tab-label {
  font-size: 9px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.planner-sidebar__content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.planner-coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: var(--color-text-disabled);
  text-align: center;
  padding: 20px;
}

.planner-coming-soon .material-symbols-outlined { font-size: 36px; }
.planner-coming-soon p { margin: 0; font-size: 13px; font-weight: 600; color: var(--color-text-muted); }
.planner-coming-soon small { font-size: 11px; color: var(--color-text-disabled); line-height: 1.5; }

.focus-mode .planner-topbar { opacity: 0.3; transition: opacity 0.3s; }
.focus-mode .planner-topbar:hover { opacity: 1; }

/* ── Mobile ────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .planner-topbar {
    padding: 10px 12px;
    gap: 8px;
  }

  .planner-topbar__left {
    gap: 8px;
    width: 100%;
  }

  .planner-topbar__right {
    gap: 8px;
    width: 100%;
    justify-content: space-between;
  }

  .planner-topbar__title {
    font-size: 16px;
  }

  .planner-nav__label {
    display: none;
  }

  .planner-view-tabs__btn span:last-child {
    display: none;
  }

  .planner-view-tabs__btn {
    padding: 5px 8px;
  }

  .planner-btn-primary span:last-child {
    display: none;
  }

  .planner-btn-primary {
    padding: 7px 10px;
  }

  .planner-body {
    flex-direction: column;
  }

  .planner-sidebar {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--color-border);
    max-height: 40vh;
  }
}

.planner-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 64px 0;
  color: var(--color-text-muted);
  font-size: 13px;
}

.planner-loading .material-symbols-outlined {
  animation: planner-spin 0.8s linear infinite;
}

@keyframes planner-spin {
  to { transform: rotate(360deg); }
}
</style>
