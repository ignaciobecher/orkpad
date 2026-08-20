<template>
  <div class="prompts-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Banco de Prompts</h1>
        <span class="prompts-count">{{ store.prompts.total }} prompts</span>
      </div>
      <div class="header-right">
        <div class="search-wrap">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            v-model="searchQuery"
            class="search-input"
            placeholder="Buscar prompts..."
            @input="onSearch"
          />
        </div>

        <div class="filter-dropdown" :class="{ open: networkFilterOpen }">
          <button class="filter-btn" @click="networkFilterOpen = !networkFilterOpen">
            <span class="material-symbols-outlined">filter_list</span>
            {{ currentNetworkLabel }}
          </button>
          <div v-if="networkFilterOpen" class="filter-menu" @click="networkFilterOpen = false">
            <button class="filter-item" :class="{ 'filter-item--active': !networkFilter }" @click.stop="setNetworkFilter('')">
              Todas las redes
            </button>
            <button class="filter-item" :class="{ 'filter-item--active': networkFilter === 'general' }" @click.stop="setNetworkFilter('general')">
              General
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
          Nuevo prompt
        </w-button>
      </div>
    </header>

    <main class="page-content">
      <div v-if="store.prompts.loading && !store.prompts.items.length" class="state-message">
        <span class="material-symbols-outlined spinning">sync</span>
        Cargando prompts...
      </div>

      <w-empty-state
        v-else-if="!store.prompts.items.length"
        title="Todavía no tenés prompts guardados"
        message="Guardá tus mejores prompts de IA para reutilizarlos en tu contenido"
      >
        <template #icon>
          <span class="material-symbols-outlined">auto_awesome</span>
        </template>
        <template #action>
          <w-button variant="primary" @click="openCreate">
            <span class="material-symbols-outlined mr-2">add</span>
            Primer prompt
          </w-button>
        </template>
      </w-empty-state>

      <div v-else class="prompts-grid">
        <prompt-card
          v-for="prompt in store.prompts.items"
          :key="prompt._id"
          :prompt="prompt"
          @edit="openEdit"
          @remove="confirmDelete"
        />
      </div>
    </main>

    <w-crud-modal
      v-model="showCrudModal"
      :schema="crudSchema"
      :initial-data="crudData"
      :loading="store.prompts.loading"
      @save="onSaveCrud"
    />

    <w-confirm-modal
      :is-open="confirmDeleteOpen"
      title="Eliminar prompt"
      message="¿Estás seguro? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      :is-danger="true"
      @confirm="handleConfirmDelete"
      @cancel="confirmDeleteOpen = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useMarketingStore } from '@/stores/marketing.store'
import WButton from '@/components/ui/WButton.vue'
import WCrudModal from '@/components/ui/WCrudModal.vue'
import WConfirmModal from '@/components/ui/WConfirmModal.vue'
import WEmptyState from '@/components/ui/WEmptyState.vue'
import PromptCard from '@/components/marketing/PromptCard.vue'
import { NETWORK_OPTIONS } from '@/api/marketing/marketing-shared.types'
import type { MarketingPrompt } from '@/api/marketing/marketing-prompts.types'

const PROMPT_NETWORK_OPTIONS = [...NETWORK_OPTIONS, { value: 'general', label: 'General' }]

export default defineComponent({
  name: 'MarketingPromptsPage',
  components: { WButton, WCrudModal, WConfirmModal, WEmptyState, PromptCard },
  setup() {
    const store = useMarketingStore()
    const searchQuery = ref('')
    const networkFilterOpen = ref(false)
    const networkFilter = ref('')
    const showCrudModal = ref(false)
    const crudData = ref<any>({})
    const confirmDeleteOpen = ref(false)
    const deletingId = ref<string | null>(null)
    let searchTimeout: ReturnType<typeof setTimeout>

    onMounted(() => store.fetchPrompts())

    const currentNetworkLabel = computed(() => {
      if (!networkFilter.value) return 'Todas las redes'
      const opt = PROMPT_NETWORK_OPTIONS.find(o => o.value === networkFilter.value)
      return opt?.label ?? 'Todas las redes'
    })

    function onSearch() {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        store.setPromptFilters({ search: searchQuery.value || undefined })
      }, 300)
    }

    function setNetworkFilter(value: string) {
      networkFilter.value = value
      networkFilterOpen.value = false
      store.setPromptFilters({ network: (value || undefined) as any })
    }

    function openCreate() {
      crudData.value = { network: 'general', tags: '' }
      showCrudModal.value = true
    }

    function openEdit(prompt: MarketingPrompt) {
      crudData.value = { ...prompt, tags: (prompt.tags || []).join(', ') }
      showCrudModal.value = true
    }

    async function onSaveCrud(data: any) {
      const { _id, ...rest } = data
      const dto = {
        ...rest,
        tags: typeof rest.tags === 'string'
          ? rest.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : (rest.tags || []),
      }
      try {
        if (_id) {
          await store.updatePrompt(_id, dto)
        } else {
          await store.createPrompt(dto)
        }
        showCrudModal.value = false
      } catch {
        // error toast shown by the store
      }
    }

    function confirmDelete(prompt: MarketingPrompt) {
      deletingId.value = prompt._id
      confirmDeleteOpen.value = true
    }

    async function handleConfirmDelete() {
      if (deletingId.value) {
        await store.removePrompt(deletingId.value)
        deletingId.value = null
      }
      confirmDeleteOpen.value = false
    }

    const crudSchema = computed(() => [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'promptText', label: 'Prompt', type: 'textarea', required: true },
      { name: 'network', label: 'Red objetivo', type: 'select', options: PROMPT_NETWORK_OPTIONS },
      { name: 'category', label: 'Categoría', type: 'text', placeholder: 'Copywriting, Ideación, Hooks...' },
      { name: 'tags', label: 'Tags (separados por coma)', type: 'text', placeholder: 'hooks, viral, storytelling' },
    ])

    return {
      store,
      searchQuery,
      networkFilterOpen,
      networkFilter,
      showCrudModal,
      crudData,
      confirmDeleteOpen,
      currentNetworkLabel,
      onSearch,
      setNetworkFilter,
      openCreate,
      openEdit,
      onSaveCrud,
      confirmDelete,
      handleConfirmDelete,
      crudSchema,
      NETWORK_OPTIONS,
    }
  },
})
</script>

<style scoped>
.prompts-page { padding: 32px; max-width: 1400px; margin: 0 auto; min-height: 100%; }

.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
.header-left { display: flex; align-items: baseline; gap: 12px; }
.page-title { font-family: var(--font-mono); font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: -0.02em; color: var(--color-text-base); margin: 0; }
.prompts-count { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); }
.header-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.search-wrap {
  display: flex; align-items: center; gap: 8px; background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border); padding: 0 12px; height: 36px; min-width: 200px;
}
.search-icon { font-size: 16px; color: var(--color-text-muted); }
.search-input { background: none; border: none; outline: none; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-base); width: 100%; }
.search-input::placeholder { color: var(--color-text-disabled); }

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

.state-message {
  display: flex; align-items: center; gap: 10px; color: var(--color-text-muted);
  font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; padding: 48px 0;
}
.spinning { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.prompts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

@media (max-width: 640px) {
  .prompts-page { padding: 16px; }
  .page-header { flex-direction: column; align-items: stretch; }
  .prompts-grid { grid-template-columns: 1fr; }
}
</style>
