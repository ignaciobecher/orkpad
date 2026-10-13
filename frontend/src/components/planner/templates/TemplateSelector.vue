<template>
  <div class="template-selector">
    <div class="template-selector__header">
      <span class="template-selector__title">Plantillas</span>
      <button class="template-selector__save-btn" @click="showSave = true" title="Guardar día actual">
        <win-icon name="check" :size="16" />
      </button>
    </div>

    <!-- Search -->
    <input
      v-model="search"
      class="template-selector__search"
      placeholder="Buscar plantilla..."
      @input="onSearch"
    />

    <!-- Loading -->
    <div v-if="templatesStore.loading" class="template-selector__loading">
      Cargando...
    </div>

    <!-- Empty -->
    <div v-else-if="!templatesStore.items.length" class="template-selector__empty">
      <win-icon name="programs" :size="32" />
      <p>Sin plantillas aún</p>
      <small>Guardá tu día actual como plantilla</small>
    </div>

    <!-- Template list -->
    <div v-else class="template-selector__list">
      <div
        v-for="tpl in filteredTemplates"
        :key="tpl._id"
        class="template-card"
      >
        <div class="template-card__info">
          <span class="template-card__name">{{ tpl.name }}</span>
          <span class="template-card__meta">
            {{ tpl.blocks.length }} bloques · {{ tpl.type }}
          </span>
        </div>
        <div class="template-card__actions">
          <button
            class="template-card__apply"
            :disabled="applying === tpl._id"
            @click="apply(tpl._id)"
            title="Aplicar al día actual"
          >
            <win-icon :name="materialToWinIcon(applying === tpl._id ? 'hourglass_empty' : 'play_arrow')" :size="16" />
          </button>
          <button
            class="template-card__dup"
            @click="duplicate(tpl._id)"
            title="Duplicar"
          >
            <win-icon name="notepad-file" :size="16" />
          </button>
          <button
            class="template-card__del"
            @click="remove(tpl._id)"
            title="Eliminar"
          >
            <win-icon name="recycle" :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Save modal -->
    <TemplateSaveModal
      v-if="showSave"
      :current-date="currentDate"
      @close="showSave = false"
      @saved="onSaved"
    />
    <w-confirm-modal
      :is-open="!!deleteTargetId"
      title="Eliminar plantilla"
      message="¿Eliminar esta plantilla?"
      confirm-text="Eliminar"
      :is-danger="true"
      @confirm="doRemove"
      @cancel="deleteTargetId = null"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { usePlannerTemplatesStore } from '@/stores/planner-templates.store'
import TemplateSaveModal from './TemplateSaveModal.vue'
import WConfirmModal from '@/components/ui/WConfirmModal.vue'
import WinIcon from '../../win95/WinIcon.vue'
import { materialToWinIcon } from '../../win95/icons'

export default defineComponent({
  name: 'TemplateSelector',
  components: { TemplateSaveModal, WConfirmModal, WinIcon },
  props: {
    currentDate: { type: String, required: true },
  },
  emits: ['applied'],
  setup(props, { emit }) {
    const templatesStore = usePlannerTemplatesStore()
    const search = ref('')
    const applying = ref<string | null>(null)
    const showSave = ref(false)

    const filteredTemplates = computed(() => {
      if (!search.value) return templatesStore.items
      const q = search.value.toLowerCase()
      return templatesStore.items.filter(t =>
        t.name.toLowerCase().includes(q) || t.profession.toLowerCase().includes(q),
      )
    })

    function onSearch() {} // reactive via computed

    async function apply(id: string) {
      applying.value = id
      try {
        await templatesStore.applyToDate(id, props.currentDate)
        emit('applied')
      } finally {
        applying.value = null
      }
    }

    async function duplicate(id: string) {
      await templatesStore.duplicate(id)
    }

    const deleteTargetId = ref<string | null>(null)

    function remove(id: string) {
      deleteTargetId.value = id
    }

    async function doRemove() {
      if (!deleteTargetId.value) return
      await templatesStore.remove(deleteTargetId.value)
      deleteTargetId.value = null
    }

    function onSaved() {
      showSave.value = false
    }

    onMounted(() => {
      templatesStore.fetchAll()
    })

    return {
      templatesStore,
      search,
      applying,
      showSave,
      filteredTemplates,
      onSearch,
      apply,
      duplicate,
      remove,
      doRemove,
      deleteTargetId,
      onSaved,
      materialToWinIcon,
    }
  },
})
</script>

<style scoped>
.template-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.template-selector__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.template-selector__title {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: var(--font-mono);
}

.template-selector__save-btn {
  background: var(--color-primary-fixed);
  border: none;
  color: var(--color-primary);
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.template-selector__save-btn:hover { background: var(--color-bg-surface-high); }
.template-selector__save-btn .material-symbols-outlined { font-size: 16px; }

.template-selector__search {
  width: 100%;
  box-sizing: border-box;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  padding: 7px 10px;
  font-size: 12px;
  font-family: var(--font-body);
  color: var(--color-text-base);
  outline: none;
  border-radius: var(--radius);
}

.template-selector__search::placeholder { color: var(--color-text-disabled); }
.template-selector__search:focus { border-color: var(--color-primary); }

.template-selector__loading,
.template-selector__empty {
  text-align: center;
  color: var(--color-text-disabled);
  font-size: 12px;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.template-selector__empty .material-symbols-outlined { font-size: 32px; }
.template-selector__empty small { font-size: 11px; }

.template-selector__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.template-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border);
  transition: background 0.15s;
}

.template-card:hover { background: var(--color-bg-surface-container); }

.template-card__info { flex: 1; min-width: 0; }

.template-card__name {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-base);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-card__meta {
  display: block;
  font-size: 11px;
  color: var(--color-text-disabled);
  font-family: var(--font-mono);
}

.template-card__actions {
  display: flex;
  gap: 2px;
}

.template-card__actions button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-disabled);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.template-card__actions .material-symbols-outlined { font-size: 14px; }

.template-card__apply:hover:not(:disabled) { color: var(--color-success); background: var(--color-success-bg); }
.template-card__dup:hover { color: var(--color-primary); background: var(--color-primary-fixed); }
.template-card__del:hover { color: var(--color-error); background: var(--color-error-bg); }
.template-card__apply:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
