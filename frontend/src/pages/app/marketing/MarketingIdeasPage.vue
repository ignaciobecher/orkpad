<template>
  <div class="ideas-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Banco de Ideas</h1>
        <span class="ideas-count">{{ totalIdeas }} ideas</span>
      </div>
      <div class="header-right">
        <div class="filter-dropdown" :class="{ open: networkFilterOpen }">
          <button class="filter-btn" @click="networkFilterOpen = !networkFilterOpen">
            <span class="material-symbols-outlined">filter_list</span>
            {{ currentNetworkLabel }}
          </button>
          <div v-if="networkFilterOpen" class="filter-menu" @click="networkFilterOpen = false">
            <button class="filter-item" :class="{ 'filter-item--active': !networkFilter }" @click.stop="setNetworkFilter('')">
              Todas las redes
            </button>
            <button
              v-for="opt in NETWORK_OPTIONS"
              :key="opt.value"
              class="filter-item"
              :class="{ 'filter-item--active': networkFilter === opt.value }"
              @click.stop="setNetworkFilter(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <w-button variant="primary" @click="openCreate">
          <span class="material-symbols-outlined mr-2">add</span>
          Nueva idea
        </w-button>
      </div>
    </header>

    <main class="page-content">
      <div class="kanban-container">
        <div class="kanban-board">
          <div v-for="col in columns" :key="col.status" class="kanban-column">
            <div class="column-header">
              <span class="column-name" :style="{ color: STATUS_COLORS[col.status] }">{{ col.label }}</span>
              <span class="column-count">{{ ideasByStatus[col.status]?.length || 0 }}</span>
            </div>

            <draggable
              v-model="ideasByStatus[col.status]"
              group="ideas"
              item-key="_id"
              class="column-cards"
              :delay="150"
              :delay-on-touch-only="true"
              @change="onIdeaMove($event, col.status)"
            >
              <template #item="{ element: idea }">
                <div class="idea-card" @click="openEdit(idea)">
                  <div class="idea-card__title">{{ idea.title }}</div>
                  <p v-if="idea.description" class="idea-card__desc">{{ idea.description }}</p>
                  <div v-if="idea.networks?.length" class="idea-card__networks">
                    <w-badge v-for="net in idea.networks" :key="net" :color="NETWORK_COLORS[net]">
                      {{ NETWORK_LABELS[net] }}
                    </w-badge>
                  </div>
                  <div v-if="idea.tags?.length" class="idea-card__tags">
                    <span v-for="tag in idea.tags" :key="tag" class="idea-tag">#{{ tag }}</span>
                  </div>
                  <div class="idea-card__footer">
                    <span v-if="idea.estimatedDate" class="idea-date">
                      <span class="material-symbols-outlined">event</span>
                      {{ formatDate(idea.estimatedDate) }}
                    </span>
                    <button class="mini-action" @click.stop="confirmDelete(idea)">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </main>

    <w-crud-modal
      v-model="showCrudModal"
      :schema="crudSchema"
      :initial-data="crudData"
      :loading="store.ideas.loading"
      @save="onSaveCrud"
    />

    <w-confirm-modal
      :is-open="confirmDeleteOpen"
      title="Eliminar idea"
      message="¿Estás seguro? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      :is-danger="true"
      @confirm="handleConfirmDelete"
      @cancel="confirmDeleteOpen = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import { useMarketingStore } from '@/stores/marketing.store'
import WButton from '@/components/ui/WButton.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WCrudModal from '@/components/ui/WCrudModal.vue'
import WConfirmModal from '@/components/ui/WConfirmModal.vue'
import {
  NETWORK_LABELS,
  NETWORK_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  NETWORK_OPTIONS,
  STATUS_OPTIONS,
  type MarketingStatus,
} from '@/api/marketing/marketing-shared.types'
import type { MarketingIdea } from '@/api/marketing/marketing-ideas.types'

export default defineComponent({
  name: 'MarketingIdeasPage',
  components: { WButton, WBadge, WCrudModal, WConfirmModal, draggable },
  setup() {
    const store = useMarketingStore()
    const networkFilterOpen = ref(false)
    const networkFilter = ref('')
    const showCrudModal = ref(false)
    const crudData = ref<any>({})
    const confirmDeleteOpen = ref(false)
    const deletingId = ref<string | null>(null)
    const ideasByStatus = ref<Record<string, MarketingIdea[]>>({})

    const columns = STATUS_OPTIONS.map(opt => ({ status: opt.value, label: opt.label }))

    const initializeKanban = () => {
      const groups: Record<string, MarketingIdea[]> = { idea: [], borrador: [], listo: [], publicado: [] }
      const kanban = store.ideas.kanban
      if (kanban) {
        groups.idea = [...(kanban.idea || [])]
        groups.borrador = [...(kanban.borrador || [])]
        groups.listo = [...(kanban.listo || [])]
        groups.publicado = [...(kanban.publicado || [])]
      }
      ideasByStatus.value = groups
    }

    watch(() => store.ideas.kanban, initializeKanban, { immediate: true, deep: true })

    const totalIdeas = computed(() =>
      Object.values(ideasByStatus.value).reduce((sum, items) => sum + items.length, 0),
    )

    const currentNetworkLabel = computed(() => {
      const opt = NETWORK_OPTIONS.find(o => o.value === networkFilter.value)
      return opt?.label ?? 'Todas las redes'
    })

    function setNetworkFilter(value: string) {
      networkFilter.value = value
      networkFilterOpen.value = false
      store.setIdeaFilters({ network: (value || undefined) as any })
    }

    function formatDate(dateStr?: string | null) {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString()
    }

    async function onIdeaMove(evt: any, newStatus: MarketingStatus) {
      if (evt.added) {
        const idea = evt.added.element as MarketingIdea
        try {
          await store.updateIdea(idea._id, { status: newStatus })
        } catch {
          initializeKanban()
        }
      }
    }

    function openCreate() {
      crudData.value = { status: 'idea', networks: '', tags: '' }
      showCrudModal.value = true
    }

    function openEdit(idea: MarketingIdea) {
      crudData.value = {
        ...idea,
        estimatedDate: idea.estimatedDate ? new Date(idea.estimatedDate).toISOString().split('T')[0] : '',
        networks: (idea.networks || []).join(', '),
        tags: (idea.tags || []).join(', '),
      }
      showCrudModal.value = true
    }

    async function onSaveCrud(data: any) {
      const { _id, ...rest } = data
      const splitList = (val: any) =>
        typeof val === 'string'
          ? val.split(',').map((t: string) => t.trim()).filter(Boolean)
          : (val || [])
      const dto = {
        ...rest,
        networks: splitList(rest.networks),
        tags: splitList(rest.tags),
      }
      try {
        if (_id) {
          await store.updateIdea(_id, dto)
        } else {
          await store.createIdea(dto)
        }
        showCrudModal.value = false
      } catch {
        // error toast shown by the store
      }
    }

    function confirmDelete(idea: MarketingIdea) {
      deletingId.value = idea._id
      confirmDeleteOpen.value = true
    }

    async function handleConfirmDelete() {
      if (deletingId.value) {
        await store.removeIdea(deletingId.value)
        deletingId.value = null
      }
      confirmDeleteOpen.value = false
    }

    const crudSchema = computed(() => [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'description', label: 'Descripción', type: 'textarea' },
      { name: 'networks', label: 'Redes (linkedin, instagram, tiktok)', type: 'text', placeholder: 'linkedin, instagram' },
      { name: 'tags', label: 'Tags (separados por coma)', type: 'text', placeholder: 'tip, lanzamiento, detrás-de-escena' },
      { name: 'estimatedDate', label: 'Fecha estimada', type: 'date' },
      { name: 'status', label: 'Estado', type: 'select', options: STATUS_OPTIONS },
    ])

    return {
      store,
      networkFilterOpen,
      networkFilter,
      showCrudModal,
      crudData,
      confirmDeleteOpen,
      ideasByStatus,
      columns,
      totalIdeas,
      currentNetworkLabel,
      setNetworkFilter,
      formatDate,
      onIdeaMove,
      openCreate,
      openEdit,
      onSaveCrud,
      confirmDelete,
      handleConfirmDelete,
      crudSchema,
      NETWORK_LABELS,
      NETWORK_COLORS,
      STATUS_LABELS,
      STATUS_COLORS,
      NETWORK_OPTIONS,
    }
  },
  mounted() {
    this.store.fetchIdeasKanban()
  },
})
</script>

<style scoped>
.ideas-page {
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: calc(100vh - var(--topbar-height));
  overflow: hidden;
}

.page-header { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; flex-wrap: wrap; gap: 16px; }
.header-left { display: flex; align-items: baseline; gap: 12px; }
.page-title { font-family: var(--font-mono); font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: -0.02em; color: var(--color-text-base); margin: 0; }
.ideas-count { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); }
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

.mr-2 { margin-right: 8px; }

.page-content { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.kanban-container { flex: 1; overflow-x: auto; overflow-y: hidden; padding-bottom: 16px; }
.kanban-board { display: flex; gap: 20px; height: 100%; align-items: flex-start; }

.kanban-column {
  flex-shrink: 0; width: 280px; background: var(--color-bg-surface);
  border: 1px solid var(--color-border); border-radius: 12px; display: flex; flex-direction: column; max-height: 100%;
}
.column-header {
  padding: 16px; border-bottom: 1px solid var(--color-border); background: rgba(255,255,255,0.02);
  display: flex; align-items: center; justify-content: space-between;
}
.column-name { font-family: var(--font-mono); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.column-count { font-family: var(--font-mono); font-size: 10px; background: var(--color-bg-surface-highest); padding: 1px 6px; border-radius: 10px; color: var(--color-text-muted); }

.column-cards { padding: 12px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 12px; min-height: 50px; }

.idea-card {
  background: var(--color-bg-surface-highest); border: 1px solid var(--color-border); border-radius: 8px;
  padding: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex; flex-direction: column; gap: 8px;
}
.idea-card:hover { border-color: var(--color-primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.idea-card__title { font-family: var(--font-body); font-size: 13px; font-weight: 600; color: var(--color-text-base); line-height: 1.4; }
.idea-card__desc { font-family: var(--font-body); font-size: 12px; color: var(--color-text-muted); margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.idea-card__networks { display: flex; flex-wrap: wrap; gap: 6px; }
.idea-card__tags { display: flex; flex-wrap: wrap; gap: 4px; }
.idea-tag { font-family: var(--font-mono); font-size: 10px; color: var(--color-text-muted); background: var(--color-bg-surface-high); padding: 1px 6px; }
.idea-card__footer { display: flex; justify-content: space-between; align-items: center; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.05); }
.idea-date { display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 10px; color: var(--color-text-muted); }
.idea-date .material-symbols-outlined { font-size: 12px; }

.mini-action { background: none; border: none; color: var(--color-error); padding: 2px; cursor: pointer; border-radius: 4px; opacity: 0; transition: opacity 0.2s; }
.idea-card:hover .mini-action { opacity: 1; }
.mini-action:hover { background: rgba(239, 68, 68, 0.1); }
.mini-action .material-symbols-outlined { font-size: 16px; }

@media (max-width: 768px) {
  .ideas-page { padding: 16px; height: auto; overflow: visible; }
  .page-header { flex-direction: column; align-items: stretch; }
}
</style>
