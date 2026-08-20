<template>
  <div class="w-calendar" :class="`view-${view}`">
    <div class="calendar-header">
      <div class="header-left">
        <div class="current-period">{{ periodLabel }}</div>
      </div>

      <div class="header-right">
        <div class="view-switcher" role="tablist">
          <button
            v-for="opt in VIEW_OPTIONS"
            :key="opt"
            class="view-tab"
            :class="{ active: view === opt }"
            role="tab"
            :aria-selected="view === opt"
            @click="setView(opt)"
          >
            <span class="view-tab-label">{{ $t(`common.${opt}`) }}</span>
          </button>
        </div>

        <div class="calendar-nav">
          <button @click="prev" class="nav-btn" :aria-label="$t('common.week')">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <button @click="setToday" class="nav-btn today-btn">{{ $t('common.today') }}</button>
          <button @click="next" class="nav-btn" :aria-label="$t('common.week')">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MONTH VIEW -->
    <div v-if="view === 'month'" class="calendar-grid month-grid">
      <div v-for="day in weekDays" :key="day" class="weekday-label">
        {{ day }}
      </div>

      <div
        v-for="(date, index) in monthDays"
        :key="'m-' + index"
        class="calendar-day"
        :class="{
          'is-today': isToday(date),
          'not-current-month': !isSameMonthDate(date),
          'has-events': getEventsForDate(date).length > 0
        }"
        @click="$emit('date-click', date)"
      >
        <div class="day-number">{{ formatDay(date) }}</div>
        <div class="day-events">
          <div
            v-for="event in getEventsForDate(date).slice(0, 3)"
            :key="event._id"
            class="event-pill"
            :style="{ backgroundColor: event.color || 'var(--color-primary)' }"
            @click.stop="$emit('event-click', event)"
          >
            {{ event.title }}
          </div>
          <div v-if="getEventsForDate(date).length > 3" class="more-events">
            {{ $t('common.moreEvents', { count: getEventsForDate(date).length - 3 }) }}
          </div>
        </div>
      </div>
    </div>

    <!-- WEEK VIEW -->
    <div v-else-if="view === 'week'" class="calendar-grid week-grid">
      <div v-for="d in weekDaysFull" :key="'w-h-' + d.iso" class="weekday-label week-day-header" :class="{ 'is-today': d.isToday }" @click="$emit('date-click', d.date)">
        <span class="wd-name">{{ d.short }}</span>
        <span class="wd-num" :class="{ 'is-today': d.isToday }">{{ d.dayNum }}</span>
      </div>

      <div
        v-for="d in weekDaysFull"
        :key="'w-c-' + d.iso"
        class="week-col"
        :class="{ 'is-today': d.isToday }"
        @click="$emit('date-click', d.date)"
      >
        <div v-if="getEventsForDate(d.date).length === 0" class="empty-cell">—</div>
        <div
          v-for="event in getEventsForDate(d.date)"
          :key="event._id"
          class="event-pill week-pill"
          :style="{ backgroundColor: event.color || 'var(--color-primary)' }"
          @click.stop="$emit('event-click', event)"
        >
          {{ event.title }}
        </div>
      </div>
    </div>

    <!-- DAY VIEW -->
    <div v-else class="day-view">
      <div class="day-view-date">
        <span class="dv-name">{{ dayLabelLong }}</span>
        <span class="dv-num" :class="{ 'is-today': isToday(currentDate) }">{{ formatDay(currentDate) }}</span>
      </div>
      <div class="day-view-list">
        <template v-if="dayEvents.length > 0">
          <div
            v-for="event in dayEvents"
            :key="event._id"
            class="event-pill day-pill"
            :style="{ backgroundColor: event.color || 'var(--color-primary)' }"
            @click.stop="$emit('event-click', event)"
          >
            <span class="day-pill-dot" />
            {{ event.title }}
          </div>
        </template>
        <div v-else class="empty-day">{{ $t('common.noEvents') }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  formatISO,
} from 'date-fns'
import { es, enUS } from 'date-fns/locale'

export type CalendarView = 'month' | 'week' | 'day'

const VIEW_OPTIONS: CalendarView[] = ['month', 'week', 'day']

export default defineComponent({
  name: 'WCalendar',
  props: {
    events: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    view: {
      type: String as PropType<CalendarView>,
      default: 'month',
      validator: (v: string) => VIEW_OPTIONS.includes(v as CalendarView)
    },
  },
  emits: ['date-click', 'event-click', 'month-change', 'view-change', 'range-change'],
  data() {
    return {
      currentDate: new Date(),
      VIEW_OPTIONS,
    }
  },
  computed: {
    locale() {
      return this.$i18n.locale === 'es' ? es : enUS
    },
    periodLabel(): string {
      if (this.view === 'month') {
        const name = format(this.currentDate, 'MMMM', { locale: this.locale })
        return (name.charAt(0).toUpperCase() + name.slice(1)) + ' ' + format(this.currentDate, 'yyyy')
      }
      if (this.view === 'week') {
        const start = startOfWeek(this.currentDate, { weekStartsOn: 1 })
        const end = endOfWeek(this.currentDate, { weekStartsOn: 1 })
        const sameMonth = isSameMonth(start, end)
        const s = sameMonth
          ? format(start, 'd', { locale: this.locale })
          : format(start, 'd MMM', { locale: this.locale })
        const e = format(end, 'd MMM yyyy', { locale: this.locale })
        return `${s} – ${e}`
      }
      const name = format(this.currentDate, 'EEEE', { locale: this.locale })
      return (name.charAt(0).toUpperCase() + name.slice(1)) + ' ' + format(this.currentDate, 'd MMM yyyy')
    },
    weekDays() {
      const start = startOfWeek(new Date(), { weekStartsOn: 1 })
      return Array.from({ length: 7 }).map((_, i) =>
        format(eachDayOfInterval({ start, end: endOfWeek(start, { weekStartsOn: 1 }) })[i], 'eee', { locale: this.locale }).toUpperCase()
      )
    },
    monthDays() {
      const start = startOfWeek(startOfMonth(this.currentDate), { weekStartsOn: 1 })
      const end = endOfWeek(endOfMonth(this.currentDate), { weekStartsOn: 1 })
      return eachDayOfInterval({ start, end })
    },
    weekDaysFull() {
      const start = startOfWeek(this.currentDate, { weekStartsOn: 1 })
      const today = new Date()
      return Array.from({ length: 7 }, (_, i) => {
        const d = addDays(start, i)
        return {
          date: d,
          iso: formatISO(d, { representation: 'date' }),
          short: format(d, 'EEE', { locale: this.locale }),
          dayNum: format(d, 'd'),
          isToday: isSameDay(d, today),
        }
      })
    },
    dayLabelLong() {
      const name = format(this.currentDate, 'EEEE', { locale: this.locale })
      return name.charAt(0).toUpperCase() + name.slice(1)
    },
    dayEvents() {
      return this.getEventsForDate(this.currentDate)
    },
  },
  watch: {
    view() {
      this.emitRange()
    },
  },
  mounted() {
    this.emitRange()
  },
  methods: {
    formatDay(date: Date) {
      return format(date, 'd')
    },
    isToday(date: Date) {
      return isSameDay(date, new Date())
    },
    isSameMonthDate(date: Date) {
      return isSameMonth(date, this.currentDate)
    },
    getEventsForDate(date: Date) {
      const dateStr = format(date, 'yyyy-MM-dd')
      return this.events.filter(event => {
        if (!event.startTime) return false
        const eventDate = new Date(event.startTime)
        const eventStr = format(eventDate, 'yyyy-MM-dd')
        return eventStr === dateStr
      })
    },
    setView(v: CalendarView) {
      this.$emit('view-change', v)
    },
    prev() {
      if (this.view === 'month') {
        this.currentDate = subMonths(this.currentDate, 1)
      } else if (this.view === 'week') {
        this.currentDate = subWeeks(this.currentDate, 1)
      } else {
        this.currentDate = subDays(this.currentDate, 1)
      }
      this.emitRange()
    },
    next() {
      if (this.view === 'month') {
        this.currentDate = addMonths(this.currentDate, 1)
      } else if (this.view === 'week') {
        this.currentDate = addWeeks(this.currentDate, 1)
      } else {
        this.currentDate = addDays(this.currentDate, 1)
      }
      this.emitRange()
    },
    setToday() {
      this.currentDate = new Date()
      this.emitRange()
    },
    emitRange() {
      let start: Date
      let end: Date
      if (this.view === 'month') {
        start = startOfMonth(this.currentDate)
        end = endOfMonth(this.currentDate)
      } else if (this.view === 'week') {
        start = startOfWeek(this.currentDate, { weekStartsOn: 1 })
        end = endOfWeek(this.currentDate, { weekStartsOn: 1 })
      } else {
        start = this.currentDate
        end = this.currentDate
      }
      const payload = {
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd'),
        view: this.view,
        date: this.currentDate,
      }
      this.$emit('range-change', payload)
      this.$emit('month-change', this.currentDate)
    },
  }
})
</script>

<style scoped>
.w-calendar {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  min-height: 0;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
  gap: 16px;
  flex-wrap: wrap;
}

.header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }

.current-period {
  font-family: var(--font-body);
  font-size: 20px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.view-switcher {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-bg-surface-low);
}

.view-tab {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 8px 14px;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition: background 0.15s, color 0.15s;
  min-height: 36px;
}

.view-tab:hover { color: var(--color-text-base); background: var(--color-bg-surface-high); }

.view-tab.active {
  background: var(--color-primary);
  color: #fff;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  min-width: 36px;
  min-height: 36px;
}

.nav-btn:hover {
  background-color: var(--color-bg-base);
  border-color: var(--color-primary);
}

.nav-btn .material-symbols-outlined { font-size: 20px; }

.today-btn {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 8px 16px;
  text-transform: uppercase;
}

/* ===== Shared grid ===== */
.calendar-grid {
  flex-grow: 1;
  min-height: 0;
  display: grid;
}

.weekday-label {
  padding: 12px 8px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  background-color: rgba(255,255,255,0.02);
  text-transform: uppercase;
}

/* ===== MONTH ===== */
.month-grid {
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(0, 1fr);
}

.calendar-day {
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 120px;
  overflow: hidden;
}

.calendar-day:nth-child(7n) { border-right: none; }
.calendar-day:hover { background-color: rgba(255,255,255,0.03); }
.calendar-day.not-current-month { opacity: 0.3; }
.calendar-day.is-today { background-color: rgba(91, 78, 255, 0.05); }
.calendar-day.is-today .day-number {
  color: var(--color-primary);
  font-weight: 700;
  background-color: rgba(91, 78, 255, 0.1);
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
}

.day-number {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.event-pill {
  font-family: var(--font-body);
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  transition: filter 0.2s;
  cursor: pointer;
}

.event-pill:hover { filter: brightness(1.2); }

.more-events {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  padding-left: 4px;
}

/* ===== WEEK ===== */
.week-grid {
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(0, 1fr);
}

.week-day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

.week-day-header.is-today { color: var(--color-primary); }

.wd-name { text-transform: capitalize; }
.wd-num {
  font-size: 14px;
  font-weight: 600;
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  color: var(--color-text-base);
}
.wd-num.is-today { background: var(--color-primary); color: #fff; }

.week-col {
  border-right: 1px solid var(--color-border);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  overflow: hidden;
  min-height: 0;
}

.week-col:last-child { border-right: none; }
.week-col:hover { background-color: rgba(255,255,255,0.03); }
.week-col.is-today { background-color: rgba(91, 78, 255, 0.05); }

.week-pill {
  white-space: normal;
  line-height: 1.2;
}

.empty-cell {
  color: var(--color-text-disabled);
  font-family: var(--font-mono);
  font-size: 12px;
  text-align: center;
  margin-top: 8px;
}

/* ===== DAY ===== */
.day-view {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.day-view-date {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.dv-name {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-base);
  text-transform: capitalize;
}

.dv-num {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  color: var(--color-text-base);
}

.dv-num.is-today {
  background: var(--color-primary);
  color: #fff;
}

.day-view-list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.day-pill {
  white-space: normal;
  line-height: 1.3;
  padding: 10px 14px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.day-pill-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  flex-shrink: 0;
}

.empty-day {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  text-align: center;
  padding: 32px;
}

/* ===== RESPONSIVE: <=1024px ===== */
@media (max-width: 1024px) {
  .calendar-header { padding: 16px 18px; }
  .current-period { font-size: 17px; }
  .calendar-day { min-height: 100px; padding: 6px; }
  .day-number { font-size: 13px; }
  .event-pill { font-size: 10px; padding: 3px 6px; }
}

/* ===== RESPONSIVE: <=768px ===== */
@media (max-width: 768px) {
  .calendar-header {
    padding: 12px 14px;
    gap: 10px;
  }
  .current-period { font-size: 15px; }
  .header-right { gap: 8px; width: 100%; justify-content: space-between; }

  .view-tab { padding: 6px 10px; font-size: 10px; min-height: 32px; }
  .nav-btn { padding: 6px; min-width: 32px; min-height: 32px; }
  .nav-btn .material-symbols-outlined { font-size: 18px; }
  .today-btn { padding: 6px 12px; font-size: 10px; }

  .weekday-label { padding: 8px 4px; font-size: 10px; }

  .calendar-day { min-height: 80px; padding: 4px; }
  .day-number { font-size: 12px; margin-bottom: 2px; }
  .event-pill { font-size: 9px; padding: 2px 4px; }
  .more-events { font-size: 9px; }

  .wd-num { width: 22px; height: 22px; font-size: 12px; }
  .week-col { padding: 6px; gap: 4px; }

  .day-view-date { padding: 12px 16px; }
  .dv-name { font-size: 14px; }
  .dv-num { width: 28px; height: 28px; font-size: 14px; }
  .day-view-list { padding: 12px 16px; }
  .day-pill { padding: 8px 12px; font-size: 12px; }
}

/* ===== RESPONSIVE: <=480px (auto-switch month -> agenda) ===== */
@media (max-width: 480px) {
  .calendar-header {
    padding: 10px 12px;
    flex-direction: column;
    align-items: stretch;
  }
  .header-left { justify-content: center; }
  .current-period { font-size: 14px; text-align: center; }
  .header-right { justify-content: center; gap: 8px; }

  .view-switcher { flex: 1; }
  .view-tab { flex: 1; padding: 8px 4px; font-size: 10px; min-height: 40px; }
  .calendar-nav { flex: 0 0 auto; }

  /* Month view becomes a vertical agenda */
  .view-month .month-grid {
    display: flex;
    flex-direction: column;
  }
  .view-month .weekday-label { display: none; }

  .view-month .calendar-day {
    min-height: auto;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding: 10px 14px;
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
  }
  .view-month .calendar-day.not-current-month { display: none; }
  .view-month .calendar-day.is-today { background-color: rgba(91, 78, 255, 0.08); }

  .view-month .day-number {
    font-size: 15px;
    font-weight: 700;
    width: 36px; height: 36px;
    margin-bottom: 0;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%;
    background: var(--color-bg-surface-low);
    color: var(--color-text-base);
  }
  .view-month .calendar-day.is-today .day-number {
    background: var(--color-primary);
    color: #fff;
  }
  .view-month .day-events { flex: 1; gap: 6px; }
  .view-month .event-pill {
    font-size: 12px;
    padding: 6px 10px;
    white-space: normal;
    line-height: 1.3;
  }
  .view-month .more-events { font-size: 11px; padding-left: 0; }

  /* Week view stacks days vertically */
  .view-week .week-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }
  .view-week .week-day-header {
    flex-direction: row;
    justify-content: flex-start;
    padding: 10px 14px;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-surface-low);
  }
  .view-week .week-day-header .wd-num { margin-left: 8px; }
  .view-week .week-col {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding: 10px 14px;
    min-height: auto;
  }
  .view-week .empty-cell { text-align: left; margin-top: 0; }

  .day-view-list { padding: 10px 12px; }
  .day-pill { padding: 10px 12px; font-size: 13px; }
}
</style>
