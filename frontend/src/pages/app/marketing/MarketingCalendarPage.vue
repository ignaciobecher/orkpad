<template>
  <div class="calendar-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Calendario de Contenido</h1>
        <span class="legend">
          <span v-for="opt in NETWORK_OPTIONS" :key="opt.value" class="legend-item">
            <span class="legend-dot" :style="{ background: NETWORK_COLORS[opt.value] }"></span>
            {{ opt.label }}
          </span>
        </span>
      </div>
      <div class="header-right">
        <div class="filter-dropdown" :class="{ open: networkFilterOpen }">
          <button class="filter-btn" @click="networkFilterOpen = !networkFilterOpen">
            <span class="material-symbols-outlined">filter_list</span>
            {{ currentNetworkLabel }}
          </button>
          <div v-if="networkFilterOpen" class="filter-menu" @click="networkFilterOpen = false">
            <button class="filter-item" :class="{ 'filter-item--active': !networkFilter }" @click.stop="setNetworkFilter('')">Todas las redes</button>
            <button v-for="opt in NETWORK_OPTIONS" :key="opt.value" class="filter-item" :class="{ 'filter-item--active': networkFilter === opt.value }" @click.stop="setNetworkFilter(opt.value)">
              {{ opt.label }}
            </button>
          </div>
        </div>

        <w-button variant="primary" @click="openCreate">
          <span class="material-symbols-outlined mr-2">add</span>
          Nueva publicación
        </w-button>
      </div>
    </header>

    <main class="calendar-wrap">
      <marketing-calendar
        :posts="store.posts.calendarEvents"
        :network="networkFilter"
        :view="currentView"
        @event-click="openEdit"
        @date-click="openDayDetail"
        @view-change="onViewChange"
        @range-change="onRangeChange"
      />
    </main>

    <post-form-modal
      v-model="showFormModal"
      :post="editingPost"
      :loading="store.posts.loading"
      :initial-network="initialNetwork"
      :initial-date="initialDate"
      @save="onSaveForm"
    />

    <w-drawer v-model="showMetricsModal" title="Métricas de la publicación" width="440px">
      <post-metrics-form
        v-if="editingPost"
        :post="editingPost"
        :loading="store.posts.loading"
        @submit="onSubmitMetrics"
      />
    </w-drawer>

    <w-drawer v-model="showDayDrawer" :title="dayDrawerTitle" width="480px">
      <div class="day-detail">
        <div class="day-detail__head">
          <div class="day-detail__count">
            {{ dayPosts.length }} publicación<span v-if="dayPosts.length !== 1">es</span>
          </div>
          <w-button variant="primary" class="day-create-btn" @click="createFromDayDetail">
            <span class="material-symbols-outlined mr-2">add</span>
            Nueva en este día
          </w-button>
        </div>

        <div v-if="dayPosts.length === 0" class="day-detail__empty">
          <span class="material-symbols-outlined">event_busy</span>
          <p>No hay publicaciones programadas para este día.</p>
        </div>

        <ul v-else class="day-detail__list">
          <li
            v-for="post in dayPosts"
            :key="post._id"
            class="day-post"
            @click="openEditFromDayDetail(post)"
          >
            <span class="day-post__bar" :style="{ background: NETWORK_COLORS[post.network] }"></span>
            <div class="day-post__body">
              <div class="day-post__title">{{ post.title }}</div>
              <div class="day-post__meta">
                <span class="day-post__net">{{ NETWORK_LABELS[post.network] }}</span>
                <span class="day-post__dot">·</span>
                <span class="day-post__status" :style="{ color: STATUS_COLORS[post.status] }">{{ STATUS_LABELS[post.status] }}</span>
              </div>
            </div>
            <span class="material-symbols-outlined day-post__chev">chevron_right</span>
          </li>
        </ul>
      </div>
    </w-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMarketingStore } from '@/stores/marketing.store'
import WButton from '@/components/ui/WButton.vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import PostFormModal from '@/components/marketing/PostFormModal.vue'
import PostMetricsForm from '@/components/marketing/PostMetricsForm.vue'
import MarketingCalendar from '@/components/marketing/MarketingCalendar.vue'
import type { CalendarView } from '@/components/ui/WCalendar.vue'
import { NETWORK_OPTIONS, NETWORK_COLORS, NETWORK_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/api/marketing/marketing-shared.types'
import type { MarketingPost, CreateMarketingPostDto, UpdateMarketingPostDto, RecordMetricsDto } from '@/api/marketing/marketing-posts.types'

export default defineComponent({
  name: 'MarketingCalendarPage',
  components: { WButton, WDrawer, PostFormModal, PostMetricsForm, MarketingCalendar },
  setup() {
    const store = useMarketingStore()
    const networkFilterOpen = ref(false)
    const networkFilter = ref('')
    const currentView = ref<CalendarView>('month')
    const currentDate = ref(new Date())

    const showFormModal = ref(false)
    const showMetricsModal = ref(false)
    const showDayDrawer = ref(false)
    const editingPost = ref<MarketingPost | null>(null)
    const initialNetwork = ref('')
    const initialDate = ref('')
    const selectedDay = ref<Date | null>(null)

    onMounted(() => fetchRange(new Date(), currentView.value))

    function fetchRange(date: Date, view: CalendarView) {
      let start: Date
      let end: Date
      if (view === 'month') {
        start = startOfMonth(date)
        end = endOfMonth(date)
      } else if (view === 'week') {
        start = startOfWeek(date, { weekStartsOn: 1 })
        end = endOfWeek(date, { weekStartsOn: 1 })
      } else {
        start = date
        end = date
      }
      store.fetchPostsCalendar(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'), networkFilter.value || undefined)
    }

    const currentNetworkLabel = computed(() => {
      const opt = NETWORK_OPTIONS.find(o => o.value === networkFilter.value)
      return opt?.label ?? 'Todas las redes'
    })

    function setNetworkFilter(value: string) {
      networkFilter.value = value
      networkFilterOpen.value = false
      fetchRange(currentDate.value, currentView.value)
    }

    function onRangeChange(payload: { start: string; end: string; view: CalendarView; date: Date }) {
      currentDate.value = payload.date
      fetchRange(payload.date, payload.view)
    }

    function onViewChange(v: CalendarView) {
      currentView.value = v
      fetchRange(currentDate.value, v)
    }

    function openCreate() {
      editingPost.value = null
      initialNetwork.value = networkFilter.value
      initialDate.value = ''
      showFormModal.value = true
    }

    function openDayDetail(date: Date) {
      selectedDay.value = date
      showDayDrawer.value = true
    }

    const dayPosts = computed(() => {
      if (!selectedDay.value) return []
      return store.posts.calendarEvents
        .filter(p => !networkFilter.value || p.network === networkFilter.value)
        .filter(p => !!p.scheduledDate && isSameDay(new Date(p.scheduledDate), selectedDay.value!))
    })

    const dayDrawerTitle = computed(() => {
      if (!selectedDay.value) return ''
      const name = format(selectedDay.value, 'EEEE d MMMM yyyy', { locale: es })
      return name.charAt(0).toUpperCase() + name.slice(1)
    })

    function createFromDayDetail() {
      if (!selectedDay.value) return
      editingPost.value = null
      initialNetwork.value = networkFilter.value
      initialDate.value = format(selectedDay.value, 'yyyy-MM-dd')
      showDayDrawer.value = false
      showFormModal.value = true
    }

    function openEditFromDayDetail(post: MarketingPost) {
      showDayDrawer.value = false
      openEdit(post)
    }

    function openEdit(post: MarketingPost) {
      editingPost.value = post
      if (post.status === 'publicado') {
        showMetricsModal.value = true
      } else {
        showFormModal.value = true
      }
    }

    async function onSaveForm(dto: CreateMarketingPostDto | UpdateMarketingPostDto) {
      try {
        if (editingPost.value) {
          await store.updatePost(editingPost.value._id, dto as UpdateMarketingPostDto)
        } else {
          await store.createPost(dto as CreateMarketingPostDto)
        }
        showFormModal.value = false
        fetchRange(currentDate.value, currentView.value)
      } catch {
        // error toast shown by the store
      }
    }

    async function onSubmitMetrics(dto: RecordMetricsDto) {
      if (!editingPost.value) return
      try {
        await store.recordPostMetrics(editingPost.value._id, dto)
        fetchRange(currentDate.value, currentView.value)
      } catch {
        // error toast shown by the store
      }
    }

    return {
      store,
      networkFilterOpen,
      networkFilter,
      currentView,
      showFormModal,
      showMetricsModal,
      showDayDrawer,
      editingPost,
      initialNetwork,
      initialDate,
      selectedDay,
      dayPosts,
      dayDrawerTitle,
      currentNetworkLabel,
      setNetworkFilter,
      onViewChange,
      onRangeChange,
      openCreate,
      openDayDetail,
      createFromDayDetail,
      openEditFromDayDetail,
      openEdit,
      onSaveForm,
      onSubmitMetrics,
      NETWORK_OPTIONS,
      NETWORK_COLORS,
      NETWORK_LABELS,
      STATUS_LABELS,
      STATUS_COLORS,
    }
  },
})
</script>

<style scoped>
.calendar-page {
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: calc(100vh - var(--topbar-height));
  overflow: hidden;
}

.page-header { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; flex-wrap: wrap; gap: 16px; }
.header-left { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.page-title { font-family: var(--font-mono); font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: -0.02em; color: var(--color-text-base); margin: 0; }

.legend { display: flex; gap: 16px; flex-wrap: wrap; }
.legend-item { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--color-text-muted); }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

.header-right { display: flex; align-items: center; gap: 12px; }

.filter-dropdown { position: relative; }
.filter-btn {
  display: flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px;
  background: var(--color-bg-surface-low); border: 1px solid var(--color-border);
  color: var(--color-text-muted); font-family: var(--font-mono); font-size: 11px;
  text-transform: uppercase; cursor: pointer; transition: all 0.15s;
}
.filter-btn:hover, .filter-dropdown.open .filter-btn { border-color: var(--color-border-focus); color: var(--color-text-base); }
.filter-btn .material-symbols-outlined { font-size: 16px; }
.filter-menu {
  position: absolute; top: calc(100% + 4px); right: 0; background: var(--color-bg-surface);
  border: 1px solid var(--color-border); z-index: 50; min-width: 160px;
}
.filter-item {
  display: block; width: 100%; padding: 10px 16px; text-align: left; background: none; border: none;
  font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--color-text-muted);
  cursor: pointer; transition: background 0.1s, color 0.1s;
}
.filter-item:hover { background: var(--color-bg-surface-high); color: var(--color-text-base); }
.filter-item--active { color: var(--color-primary); }

.mr-2 { margin-right: 8px; }

.calendar-wrap { flex: 1; min-height: 0; }

/* ===== Day detail drawer ===== */
.day-detail { display: flex; flex-direction: column; gap: 16px; padding: 4px; }

.day-detail__head {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}

.day-detail__count {
  font-family: var(--font-mono); font-size: 11px; text-transform: uppercase;
  color: var(--color-text-muted); letter-spacing: 0.04em;
}

.day-detail__empty {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 40px 16px; color: var(--color-text-muted);
  font-family: var(--font-body); font-size: 13px; text-align: center;
}
.day-detail__empty .material-symbols-outlined { font-size: 36px; opacity: 0.5; }

.day-detail__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }

.day-post {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border); border-radius: 8px;
  cursor: pointer; transition: border-color 0.15s, background 0.15s;
}
.day-post:hover { border-color: var(--color-border-focus); background: var(--color-bg-surface-high); }

.day-post__bar { width: 4px; align-self: stretch; border-radius: 4px; flex-shrink: 0; }

.day-post__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }

.day-post__title {
  font-family: var(--font-body); font-size: 14px; font-weight: 600;
  color: var(--color-text-base);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.day-post__meta {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 10px; text-transform: uppercase;
  color: var(--color-text-muted);
}
.day-post__dot { opacity: 0.5; }

.day-post__chev { color: var(--color-text-muted); font-size: 20px; flex-shrink: 0; }

.day-create-btn { font-size: 11px; padding: 6px 12px; }

@media (max-width: 768px) {
  .calendar-page { padding: 16px; height: auto; overflow: visible; }
  .page-header { flex-direction: column; align-items: stretch; }
  .calendar-wrap { height: 600px; }
}

@media (max-width: 480px) {
  .calendar-page { padding: 12px; gap: 16px; }
  .page-title { font-size: 16px; }
  .legend { gap: 10px; }
  .header-right { flex-direction: column; align-items: stretch; gap: 8px; }
  .filter-btn { justify-content: center; }
  .calendar-wrap { height: calc(100vh - 220px); min-height: 420px; }

  .day-detail__head { flex-direction: column; align-items: stretch; gap: 8px; }
  .day-post__title { font-size: 13px; }
}
</style>
