<template>
  <div class="posts-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Publicaciones</h1>
        <span class="posts-count">{{ store.posts.total }} publicaciones</span>
      </div>
      <div class="header-right">
        <div class="filter-dropdown" :class="{ open: statusFilterOpen }">
          <button class="filter-btn" @click="statusFilterOpen = !statusFilterOpen">
            <span class="material-symbols-outlined">filter_list</span>
            {{ currentStatusLabel }}
          </button>
          <div v-if="statusFilterOpen" class="filter-menu" @click="statusFilterOpen = false">
            <button class="filter-item" :class="{ 'filter-item--active': !statusFilter }" @click.stop="setStatusFilter('')">Todos los estados</button>
            <button v-for="opt in STATUS_OPTIONS" :key="opt.value" class="filter-item" :class="{ 'filter-item--active': statusFilter === opt.value }" @click.stop="setStatusFilter(opt.value)">
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="filter-dropdown" :class="{ open: networkFilterOpen }">
          <button class="filter-btn" @click="networkFilterOpen = !networkFilterOpen">
            <span class="material-symbols-outlined">share</span>
            {{ currentNetworkLabel }}
          </button>
          <div v-if="networkFilterOpen" class="filter-menu" @click="networkFilterOpen = false">
            <button class="filter-item" :class="{ 'filter-item--active': !networkFilter }" @click.stop="setNetworkFilter('')">Todas las redes</button>
            <button v-for="opt in NETWORK_OPTIONS" :key="opt.value" class="filter-item" :class="{ 'filter-item--active': networkFilter === opt.value }" @click.stop="setNetworkFilter(opt.value)">
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="filter-dropdown" :class="{ open: dateFilterOpen }">
          <button class="filter-btn" @click="dateFilterOpen = !dateFilterOpen">
            <span class="material-symbols-outlined">event</span>
            {{ currentDateLabel }}
          </button>
          <div v-if="dateFilterOpen" class="filter-menu filter-menu--date" @click.stop>
            <div class="date-filter-row">
              <label>Desde</label>
              <input v-model="dateFrom" type="date" :max="dateTo || undefined" @change="applyDateFilter" />
            </div>
            <div class="date-filter-row">
              <label>Hasta</label>
              <input v-model="dateTo" type="date" :min="dateFrom || undefined" @change="applyDateFilter" />
            </div>
            <button v-if="dateFrom || dateTo" class="filter-item filter-item--clear" @click="clearDateFilter">
              Limpiar rango
            </button>
          </div>
        </div>

        <w-button variant="secondary" @click="showImportModal = true">
          <span class="material-symbols-outlined mr-2">upload_file</span>
          Importar
        </w-button>

        <w-button variant="primary" @click="openCreate">
          <span class="material-symbols-outlined mr-2">add</span>
          Nueva publicación
        </w-button>
      </div>
    </header>

    <div v-if="showImportHint" class="import-hint">
      <span class="material-symbols-outlined import-hint__icon">auto_awesome</span>
      <div class="import-hint__body">
        <strong>¿Generaste contenido con IA?</strong>
        Podés importarlo en lote desde un Excel. Descargá la plantilla, pegá tus ideas y cargalas acá para tenerlas en tu calendario.
      </div>
      <div class="import-hint__actions">
        <w-button variant="secondary" @click="showImportModal = true">
          <span class="material-symbols-outlined mr-2">upload_file</span>
          Importar
        </w-button>
        <button class="import-hint__close" title="Cerrar" @click="dismissImportHint">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>

    <main class="page-content">
      <div v-if="store.posts.loading && !store.posts.items.length" class="state-message">
        <span class="material-symbols-outlined spinning">sync</span>
        Cargando publicaciones...
      </div>

      <w-empty-state
        v-else-if="!store.posts.items.length"
        title="Todavía no creaste publicaciones"
        message="Planificá tu próxima publicación para LinkedIn, Instagram o TikTok"
      >
        <template #icon>
          <span class="material-symbols-outlined">campaign</span>
        </template>
        <template #action>
          <w-button variant="primary" @click="openCreate">
            <span class="material-symbols-outlined mr-2">add</span>
            Primera publicación
          </w-button>
        </template>
      </w-empty-state>

      <div v-else class="posts-grid">
        <post-card
          v-for="post in store.posts.items"
          :key="post._id"
          :post="post"
          @click="openEdit"
          @remove="confirmDelete"
        />
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
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
        @edit-post="openEditBaseFields"
      />
    </w-drawer>

    <w-confirm-modal
      :is-open="confirmDeleteOpen"
      title="Eliminar publicación"
      message="¿Estás seguro? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      :is-danger="true"
      @confirm="handleConfirmDelete"
      @cancel="confirmDeleteOpen = false"
    />

    <post-import-modal
      v-model="showImportModal"
      @imported="onImported"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useMarketingStore } from '@/stores/marketing.store'
import WButton from '@/components/ui/WButton.vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import WConfirmModal from '@/components/ui/WConfirmModal.vue'
import WEmptyState from '@/components/ui/WEmptyState.vue'
import PostCard from '@/components/marketing/PostCard.vue'
import PostFormModal from '@/components/marketing/PostFormModal.vue'
import PostMetricsForm from '@/components/marketing/PostMetricsForm.vue'
import PostImportModal from '@/components/marketing/PostImportModal.vue'
import { NETWORK_OPTIONS, STATUS_OPTIONS } from '@/api/marketing/marketing-shared.types'
import type { MarketingPost, CreateMarketingPostDto, UpdateMarketingPostDto, RecordMetricsDto } from '@/api/marketing/marketing-posts.types'

export default defineComponent({
  name: 'MarketingPostsPage',
  components: { WButton, WDrawer, WConfirmModal, WEmptyState, PostCard, PostFormModal, PostMetricsForm, PostImportModal },
  setup() {
    const store = useMarketingStore()
    const statusFilterOpen = ref(false)
    const networkFilterOpen = ref(false)
    const dateFilterOpen = ref(false)
    const statusFilter = ref('')
    const networkFilter = ref('')
    const dateFrom = ref('')
    const dateTo = ref('')

    const showFormModal = ref(false)
    const showMetricsModal = ref(false)
    const editingPost = ref<MarketingPost | null>(null)
    const initialNetwork = ref('')
    const initialDate = ref('')

    const confirmDeleteOpen = ref(false)
    const deletingId = ref<string | null>(null)

    const showImportModal = ref(false)
    const showImportHint = ref(true)

    function dismissImportHint() {
      showImportHint.value = false
    }

    onMounted(() => {
      store.fetchPosts()
    })

    const currentStatusLabel = computed(() => {
      const opt = STATUS_OPTIONS.find(o => o.value === statusFilter.value)
      return opt?.label ?? 'Todos los estados'
    })
    const currentNetworkLabel = computed(() => {
      const opt = NETWORK_OPTIONS.find(o => o.value === networkFilter.value)
      return opt?.label ?? 'Todas las redes'
    })
    const currentDateLabel = computed(() => {
      if (dateFrom.value && dateTo.value) return `${dateFrom.value} → ${dateTo.value}`
      if (dateFrom.value) return `Desde ${dateFrom.value}`
      if (dateTo.value) return `Hasta ${dateTo.value}`
      return 'Todas las fechas'
    })

    const currentPage = computed(() => store.posts.filters.page || 1)
    const totalPages = computed(() => Math.max(1, Math.ceil(store.posts.total / (store.posts.filters.limit || 20))))

    function changePage(p: number) {
      if (p < 1 || p > totalPages.value) return
      store.setPostPage(p)
    }

    function setStatusFilter(value: string) {
      statusFilter.value = value
      statusFilterOpen.value = false
      store.setPostFilters({ status: (value || undefined) as any })
    }

    function setNetworkFilter(value: string) {
      networkFilter.value = value
      networkFilterOpen.value = false
      store.setPostFilters({ network: (value || undefined) as any })
    }

    function applyDateFilter() {
      // Swap automatically instead of silently dropping the filter if the user
      // picks an end date before the start date (overlap/inversion guard).
      if (dateFrom.value && dateTo.value && dateFrom.value > dateTo.value) {
        const swap = dateFrom.value
        dateFrom.value = dateTo.value
        dateTo.value = swap
      }
      store.setPostFilters({
        from: dateFrom.value || undefined,
        to: dateTo.value || undefined,
      })
    }

    function clearDateFilter() {
      dateFrom.value = ''
      dateTo.value = ''
      dateFilterOpen.value = false
      store.setPostFilters({ from: undefined, to: undefined })
    }

    function openCreate() {
      editingPost.value = null
      initialNetwork.value = ''
      initialDate.value = ''
      showFormModal.value = true
    }

    function openEdit(post: MarketingPost) {
      editingPost.value = post
      if (post.status === 'publicado') {
        showMetricsModal.value = true
      } else {
        showFormModal.value = true
      }
    }

    function openEditBaseFields() {
      showMetricsModal.value = false
      showFormModal.value = true
    }

    async function onSaveForm(dto: CreateMarketingPostDto | UpdateMarketingPostDto) {
      try {
        if (editingPost.value) {
          await store.updatePost(editingPost.value._id, dto as UpdateMarketingPostDto)
          editingPost.value = store.posts.items.find(p => p._id === editingPost.value?._id) ?? null
        } else {
          await store.createPost(dto as CreateMarketingPostDto)
        }
        showFormModal.value = false
      } catch {
        // error toast shown by the store
      }
    }

    async function onSubmitMetrics(dto: RecordMetricsDto) {
      if (!editingPost.value) return
      try {
        await store.recordPostMetrics(editingPost.value._id, dto)
        await store.fetchPosts()
        editingPost.value = store.posts.items.find(p => p._id === editingPost.value?._id) ?? null
      } catch {
        // error toast shown by the store
      }
    }

    function confirmDelete(post: MarketingPost) {
      deletingId.value = post._id
      confirmDeleteOpen.value = true
    }

    async function handleConfirmDelete() {
      if (deletingId.value) {
        await store.removePost(deletingId.value)
        deletingId.value = null
      }
      confirmDeleteOpen.value = false
    }

    function onImported() {
      store.fetchPosts()
    }

    return {
      store,
      statusFilterOpen,
      networkFilterOpen,
      dateFilterOpen,
      statusFilter,
      networkFilter,
      dateFrom,
      dateTo,
      showFormModal,
      showMetricsModal,
      editingPost,
      initialNetwork,
      initialDate,
      confirmDeleteOpen,
      showImportModal,
      showImportHint,
      dismissImportHint,
      currentStatusLabel,
      currentNetworkLabel,
      currentDateLabel,
      currentPage,
      totalPages,
      changePage,
      setStatusFilter,
      setNetworkFilter,
      applyDateFilter,
      clearDateFilter,
      openCreate,
      openEdit,
      openEditBaseFields,
      onSaveForm,
      onSubmitMetrics,
      confirmDelete,
      handleConfirmDelete,
      onImported,
      NETWORK_OPTIONS,
      STATUS_OPTIONS,
    }
  },
})
</script>

<style scoped>
.posts-page { padding: 24px 32px; display: flex; flex-direction: column; gap: 24px; min-height: 100%; }

.import-hint {
  display: flex; align-items: center; gap: 16px; padding: 14px 18px;
  background: var(--color-bg-surface-low); border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-primary); border-radius: 4px;
}
.import-hint__icon { font-size: 22px; color: var(--color-primary); flex-shrink: 0; }
.import-hint__body { flex: 1; font-size: 13px; color: var(--color-text-muted); line-height: 1.5; }
.import-hint__body strong { color: var(--color-text-base); font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; letter-spacing: 0.02em; }
.import-hint__actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.import-hint__close {
  background: none; border: none; color: var(--color-text-muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center; padding: 4px; transition: color 0.15s;
}
.import-hint__close:hover { color: var(--color-text-base); }
.import-hint__close .material-symbols-outlined { font-size: 18px; }

@media (max-width: 768px) {
  .import-hint { flex-direction: column; align-items: flex-start; gap: 12px; }
  .import-hint__actions { width: 100%; justify-content: space-between; }
}

.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.header-left { display: flex; align-items: baseline; gap: 12px; }
.page-title { font-family: var(--font-mono); font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: -0.02em; color: var(--color-text-base); margin: 0; }
.posts-count { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); }
.header-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

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
  position: absolute; top: calc(100% + 4px); left: 0; background: var(--color-bg-surface);
  border: 1px solid var(--color-border); z-index: 50; min-width: 160px;
}
.filter-item {
  display: block; width: 100%; padding: 10px 16px; text-align: left; background: none; border: none;
  font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--color-text-muted);
  cursor: pointer; transition: background 0.1s, color 0.1s;
}
.filter-item:hover { background: var(--color-bg-surface-high); color: var(--color-text-base); }
.filter-item--active { color: var(--color-primary); }

.filter-menu--date { padding: 12px; display: flex; flex-direction: column; gap: 10px; min-width: 200px; }
.date-filter-row { display: flex; flex-direction: column; gap: 4px; }
.date-filter-row label {
  font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--color-text-muted);
}
.date-filter-row input {
  background: var(--color-bg-surface-low); border: 1px solid var(--color-border);
  color: var(--color-text-base); font-family: var(--font-body); font-size: 12px;
  padding: 8px 10px; outline: none; border-radius: 4px; width: 100%;
}
.date-filter-row input:focus { border-color: var(--color-border-focus); }
.filter-item--clear { text-align: center; color: var(--color-error); }

.mr-2 { margin-right: 8px; }

.page-content { flex: 1; }

.state-message { display: flex; align-items: center; gap: 10px; color: var(--color-text-muted); font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; padding: 48px 0; }
.spinning { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 24px 0 0; }
.page-btn {
  background: var(--color-bg-surface); border: 1px solid var(--color-border); color: var(--color-text-base);
  cursor: pointer; display: flex; padding: 4px 8px;
}
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); }

@media (max-width: 768px) {
  .posts-page { padding: 16px; }
  .page-header { flex-direction: column; align-items: stretch; }
}
</style>
