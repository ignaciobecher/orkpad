<template>
  <div class="day-view">
    <div class="day-view__header">
      <span class="day-view__date-label">{{ dateLabel }}</span>
      <div class="day-view__header-right">
        <span class="day-view__block-count">{{ blocks.length }} bloques</span>
        <button class="day-view__add-btn-top" @click="$emit('new-block', date)">
          <span class="material-symbols-outlined">add</span>
          Nuevo bloque
        </button>
      </div>
    </div>

    <div class="day-view__scroll" ref="scrollRef">
      <div class="day-view__timeline">

        <!-- Columna de horas -->
        <div class="day-view__hours">
          <div
            v-for="h in visibleHours"
            :key="h"
            class="day-view__hour-slot"
            :style="{ height: HOUR_PX + 'px' }"
          >
            <span class="day-view__hour-label">{{ formatHour(h) }}</span>
          </div>
        </div>

        <!-- Área de bloques con posicionamiento absoluto -->
        <div
          class="day-view__blocks-area"
          :style="{ height: totalHeight + 'px' }"
          @click="onAreaClick"
        >
          <!-- Gridlines por hora -->
          <div
            v-for="h in visibleHours"
            :key="'g-' + h"
            class="day-view__gridline"
            :style="{ top: (h - START_HOUR) * HOUR_PX + 'px' }"
          />

          <!-- Indicador hora actual -->
          <div v-if="isToday" class="day-view__now" :style="{ top: nowTop + 'px' }">
            <span class="day-view__now-dot" />
          </div>

          <!-- Bloques posicionados absolutamente -->
          <div
            v-for="block in blocks"
            :key="block._id"
            class="day-view__block-item"
            :style="blockStyle(block)"
            @click.stop="$emit('edit-block', block)"
          >
            <TimeBlockCard
              :block="block"
              :height-px="blockHeightPx(block)"
              @edit="$emit('edit-block', block)"
              @duplicate="onDuplicate(block)"
              @delete="onDelete(block)"
              @complete="onComplete(block)"
            />
          </div>

          <!-- Quick add -->
          <div
            v-if="quickAddTime"
            class="day-view__quick-add-wrapper"
            :style="{ top: quickAddTop + 'px' }"
            @click.stop
          >
            <QuickAddBlock
              :date="date"
              :time="quickAddTime"
              @cancel="quickAddTime = null"
              @created="onQuickAdded"
            />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { usePlannerBlocksStore } from '@/stores/planner-blocks.store'
import TimeBlockCard from '../blocks/TimeBlockCard.vue'
import QuickAddBlock from '../blocks/QuickAddBlock.vue'
import type { PlannerBlock } from '@/api/planner/planner.types'

const HOUR_PX = 64   // píxeles por hora
const START_HOUR = 6
const END_HOUR = 23

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export default defineComponent({
  name: 'PlannerDayView',
  components: { TimeBlockCard, QuickAddBlock },
  props: {
    date: { type: String, required: true },
  },
  emits: ['new-block', 'edit-block'],
  setup(props) {
    const blocksStore = usePlannerBlocksStore()
    const scrollRef = ref<HTMLElement | null>(null)
    const quickAddTime = ref<string | null>(null)
    const quickAddTop = ref(0)

    const visibleHours = computed(() =>
      Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR),
    )

    const totalHeight = computed(() => (END_HOUR - START_HOUR + 1) * HOUR_PX)

    const blocks = computed(() => blocksStore.blocksForDate(props.date))

    const isToday = computed(() => props.date === format(new Date(), 'yyyy-MM-dd'))

    const nowTop = computed(() => {
      const now = new Date()
      const mins = now.getHours() * 60 + now.getMinutes() - START_HOUR * 60
      return (mins / 60) * HOUR_PX
    })

    const dateLabel = computed(() =>
      format(new Date(props.date + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es }),
    )

    // Calcula posición y altura de cada bloque en el timeline
    function blockStyle(block: PlannerBlock) {
      const startMins = timeToMinutes(block.startTime) - START_HOUR * 60
      const endMins = timeToMinutes(block.endTime) - START_HOUR * 60
      const top = (startMins / 60) * HOUR_PX
      const height = Math.max(((endMins - startMins) / 60) * HOUR_PX, 28)
      return {
        top: top + 'px',
        height: height + 'px',
      }
    }

    function blockHeightPx(block: PlannerBlock): number {
      const startMins = timeToMinutes(block.startTime)
      const endMins = timeToMinutes(block.endTime)
      return Math.max(((endMins - startMins) / 60) * HOUR_PX, 28)
    }

    function formatHour(h: number) {
      return `${String(h).padStart(2, '0')}:00`
    }

    function onAreaClick(e: MouseEvent) {
      if (quickAddTime.value) {
        quickAddTime.value = null
        return
      }
      const area = e.currentTarget as HTMLElement
      const rect = area.getBoundingClientRect()
      const y = e.clientY - rect.top
      const minutes = (y / HOUR_PX) * 60 + START_HOUR * 60
      const snapped = Math.round(minutes / 15) * 15
      const h = Math.floor(snapped / 60)
      const m = snapped % 60
      quickAddTime.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      quickAddTop.value = y
    }

    function onQuickAdded() {
      quickAddTime.value = null
    }

    async function onDuplicate(block: PlannerBlock) {
      await blocksStore.duplicate(block._id)
    }

    async function onDelete(block: PlannerBlock) {
      if (confirm(`¿Eliminar "${block.title}"?`)) {
        await blocksStore.remove(block._id)
      }
    }

    async function onComplete(block: PlannerBlock) {
      const newStatus = block.status === 'completed' ? 'pending' : 'completed'
      await blocksStore.updateStatus(block._id, { status: newStatus })
    }

    watch(() => props.date, () => blocksStore.fetchForDate(props.date))

    onMounted(() => {
      blocksStore.fetchForDate(props.date)
      setTimeout(() => {
        if (scrollRef.value) {
          const offset = Math.max((8 - START_HOUR) * HOUR_PX - 40, 0)
          scrollRef.value.scrollTop = offset
        }
      }, 100)
    })

    return {
      scrollRef,
      HOUR_PX,
      START_HOUR,
      totalHeight,
      visibleHours,
      blocks,
      isToday,
      nowTop,
      dateLabel,
      quickAddTime,
      quickAddTop,
      blockStyle,
      blockHeightPx,
      formatHour,
      onAreaClick,
      onQuickAdded,
      onDuplicate,
      onDelete,
      onComplete,
    }
  },
})
</script>

<style scoped>
.day-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--color-bg-base);
}

.day-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  flex-shrink: 0;
  gap: 8px;
  flex-wrap: wrap;
}

.day-view__header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.day-view__date-label {
  font-size: 14px;
  font-weight: 500;
  text-transform: capitalize;
  color: var(--color-text-base);
}

.day-view__block-count {
  font-size: 12px;
  color: var(--color-text-disabled);
  font-family: var(--font-mono);
}

.day-view__add-btn-top {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  padding: 5px 12px;
  cursor: pointer;
  font-size: 12px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: background 0.15s;
}

.day-view__add-btn-top:hover { background: var(--color-primary-hover); }
.day-view__add-btn-top .material-symbols-outlined { font-size: 16px; }

@media (max-width: 640px) {
  .day-view__header {
    padding: 8px 10px;
  }

  .day-view__date-label {
    font-size: 13px;
  }

  .day-view__hours {
    width: 44px;
  }

  .day-view__hour-label {
    font-size: 9px;
    padding: 2px 4px 0;
  }
}

.day-view__scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.day-view__timeline {
  display: flex;
}

/* Columna de horas */
.day-view__hours {
  width: 56px;
  flex-shrink: 0;
  position: relative;
}

.day-view__hour-slot {
  display: flex;
  align-items: flex-start;
  padding-top: 0;
}

.day-view__hour-label {
  font-size: 10px;
  color: var(--color-text-disabled);
  padding: 2px 8px 0;
  user-select: none;
  font-family: var(--font-mono);
  /* Alinear la etiqueta con la gridline: desplazar -6px arriba */
  margin-top: -6px;
}

/* Área de bloques */
.day-view__blocks-area {
  flex: 1;
  position: relative;
  cursor: crosshair;
  border-left: 1px solid var(--color-border-subtle);
}

.day-view__gridline {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-border-subtle);
  pointer-events: none;
  z-index: 0;
}


/* Indicador hora actual */
.day-view__now {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-error);
  z-index: 10;
  pointer-events: none;
  display: flex;
  align-items: center;
}

.day-view__now-dot {
  width: 10px;
  height: 10px;
  background: var(--color-error);
  border-radius: 50%;
  margin-left: -5px;
  flex-shrink: 0;
}

/* Bloque posicionado absolutamente */
.day-view__block-item {
  position: absolute;
  left: 4px;
  right: 4px;
  z-index: 2;
  cursor: pointer;
}

/* Quick add posicionado */
.day-view__quick-add-wrapper {
  position: absolute;
  left: 4px;
  right: 4px;
  z-index: 20;
}
</style>
