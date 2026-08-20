<template>
  <div class="week-view">
    <!-- Day columns header -->
    <div class="week-view__header">
      <div class="week-view__hour-gutter" />
      <div
        v-for="day in weekDays"
        :key="day.date"
        class="week-view__day-header"
        :class="{ 'is-today': day.isToday }"
        @click="$emit('day-click', day.date)"
      >
        <span class="week-view__day-name">{{ day.name }}</span>
        <span class="week-view__day-number" :class="{ 'is-today': day.isToday }">
          {{ day.number }}
        </span>
        <span class="week-view__block-count">{{ blocksStore.blocksForDate(day.date).length }}</span>
      </div>
    </div>

    <!-- Scrollable body -->
    <div class="week-view__scroll">
      <div class="week-view__body">
        <!-- Hour labels -->
        <div class="week-view__hours">
          <div
            v-for="h in visibleHours"
            :key="h"
            class="week-view__hour"
            :style="{ height: HOUR_PX + 'px' }"
          >
            <span class="week-view__hour-label">{{ String(h).padStart(2,'0') }}:00</span>
          </div>
        </div>

        <!-- Day columns -->
        <div
          v-for="day in weekDays"
          :key="'col-' + day.date"
          class="week-view__day-col"
          :class="{ 'is-today': day.isToday }"
          @click="$emit('day-click', day.date)"
        >
          <!-- Gridlines -->
          <div
            v-for="h in visibleHours"
            :key="'g-' + h"
            class="week-view__gridline"
            :style="{ top: (h - START_HOUR) * HOUR_PX + 'px' }"
          />

          <!-- Current time bar -->
          <div
            v-if="day.isToday"
            class="week-view__now"
            :style="{ top: nowTop + 'px' }"
          />

          <!-- Block pills -->
          <div
            v-for="block in blocksStore.blocksForDate(day.date)"
            :key="block._id"
            class="week-view__block-pill"
            :style="{
              borderLeftColor: block.color,
              background: block.color + '22',
              top: blockTop(block.startTime) + 'px',
              height: blockHeight(block.startTime, block.endTime) + 'px',
            }"
            :class="`status-${block.status}`"
            @click.stop="$emit('edit-block', block)"
          >
            <span class="week-view__pill-title">{{ block.title }}</span>
            <span class="week-view__pill-time">{{ block.startTime }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, watch } from 'vue'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { usePlannerBlocksStore } from '@/stores/planner-blocks.store'

const HOUR_PX = 48
const START_HOUR = 6
const END_HOUR = 23

export default defineComponent({
  name: 'PlannerWeekView',
  props: {
    weekStart: { type: String, required: true },
  },
  emits: ['day-click', 'edit-block'],
  setup(props) {
    const blocksStore = usePlannerBlocksStore()

    const visibleHours = computed(() =>
      Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR),
    )

    const today = format(new Date(), 'yyyy-MM-dd')

    const weekDays = computed(() => {
      const start = new Date(props.weekStart + 'T00:00:00')
      return Array.from({ length: 7 }, (_, i) => {
        const d = addDays(start, i)
        const date = format(d, 'yyyy-MM-dd')
        return {
          date,
          name: format(d, 'EEE', { locale: es }),
          number: format(d, 'd'),
          isToday: date === today,
        }
      })
    })

    const nowTop = computed(() => {
      const now = new Date()
      const minutes = now.getHours() * 60 + now.getMinutes()
      return ((minutes - START_HOUR * 60) / 60) * HOUR_PX
    })

    watch(() => props.weekStart, () => {
      blocksStore.fetchForWeek(props.weekStart)
    })

    onMounted(() => {
      blocksStore.fetchForWeek(props.weekStart)
    })

    function timeToMinutes(time: string): number {
      const [h, m] = time.split(':').map(Number)
      return h * 60 + m
    }

    function blockTop(startTime: string): number {
      return ((timeToMinutes(startTime) - START_HOUR * 60) / 60) * HOUR_PX
    }

    function blockHeight(startTime: string, endTime: string): number {
      const duration = timeToMinutes(endTime) - timeToMinutes(startTime)
      return Math.max((duration / 60) * HOUR_PX, 20)
    }

    return {
      blocksStore,
      HOUR_PX,
      START_HOUR,
      visibleHours,
      weekDays,
      nowTop,
      blockTop,
      blockHeight,
    }
  },
})
</script>

<style scoped>
.week-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--color-bg-base);
}

.week-view__header {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  background: var(--color-bg-surface);
}

.week-view__hour-gutter { width: 54px; flex-shrink: 0; }

.week-view__day-header {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  cursor: pointer;
  transition: background 0.15s;
}

.week-view__day-header:hover { background: var(--color-bg-surface-low); }

.week-view__day-name {
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: capitalize;
  font-family: var(--font-mono);
}

.week-view__day-number {
  font-size: 18px;
  font-weight: 600;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-base);
}

.week-view__day-number.is-today {
  background: var(--color-primary);
  color: #fff;
  border-radius: 50%;
}

.week-view__block-count {
  font-size: 10px;
  color: var(--color-text-disabled);
  font-family: var(--font-mono);
}

.week-view__scroll {
  flex: 1;
  overflow-y: auto;
}

.week-view__body {
  display: flex;
  min-height: 100%;
}

.week-view__hours {
  width: 54px;
  flex-shrink: 0;
}

.week-view__hour {
  display: flex;
  align-items: flex-start;
}

.week-view__hour-label {
  font-size: 10px;
  color: var(--color-text-disabled);
  padding: 3px 6px;
  user-select: none;
  font-family: var(--font-mono);
}

.week-view__day-col {
  flex: 1;
  position: relative;
  border-left: 1px solid var(--color-border-subtle);
  cursor: pointer;
  min-height: calc((23 - 6 + 1) * 48px);
}

.week-view__day-col.is-today { background: rgba(var(--color-primary-rgb), 0.03); }

.week-view__gridline {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-border-subtle);
  pointer-events: none;
}

.week-view__now {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-error);
  z-index: 5;
  pointer-events: none;
}

.week-view__block-pill {
  position: absolute;
  left: 3px;
  right: 3px;
  padding: 4px 6px;
  border-left: 3px solid;
  overflow: hidden;
  cursor: pointer;
  transition: opacity 0.15s;
  box-sizing: border-box;
}

.week-view__block-pill:hover { opacity: 0.8; }

.week-view__pill-title {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-base);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.week-view__pill-time {
  display: block;
  font-size: 10px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.status-completed .week-view__pill-title { text-decoration: line-through; opacity: 0.6; }
.status-skipped { opacity: 0.4; }

@media (max-width: 640px) {
  .week-view__hour-gutter { width: 36px; }

  .week-view__hours { width: 36px; }

  .week-view__hour-label {
    font-size: 8px;
    padding: 2px 3px;
  }

  .week-view__day-name {
    font-size: 9px;
  }

  .week-view__day-number {
    font-size: 14px;
    width: 26px;
    height: 26px;
  }

  .week-view__block-count {
    font-size: 9px;
  }

  .week-view__pill-title {
    font-size: 9px;
  }

  .week-view__pill-time {
    display: none;
  }

  .week-view__block-pill {
    margin: 1px 2px;
    padding: 2px 3px;
  }
}
</style>
