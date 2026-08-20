<template>
  <div class="block-editor-overlay" @mousedown.self="$emit('close')">
    <div class="block-editor">
      <div class="block-editor__header">
        <h3>{{ block ? 'Editar bloque' : 'Nuevo bloque' }}</h3>
        <button class="block-editor__close" @click="$emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="block-editor__body">
        <!-- Title -->
        <div class="block-editor__field">
          <label>Nombre *</label>
          <input v-model="form.title" class="block-editor__input" placeholder="Ej. Deep Work" />
        </div>

        <!-- Date & Times -->
        <div class="block-editor__row">
          <div class="block-editor__field">
            <label>Fecha</label>
            <input v-model="form.date" type="date" class="block-editor__input" />
          </div>
          <div class="block-editor__field">
            <label>Inicio</label>
            <input v-model="form.startTime" type="time" class="block-editor__input" />
          </div>
          <div class="block-editor__field">
            <label>Fin</label>
            <input v-model="form.endTime" type="time" class="block-editor__input" />
          </div>
        </div>

        <!-- Category & Priority -->
        <div class="block-editor__row">
          <div class="block-editor__field">
            <label>Categoría</label>
            <select v-model="form.category" class="block-editor__input">
              <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
          </div>
          <div class="block-editor__field">
            <label>Prioridad</label>
            <select v-model="form.priority" class="block-editor__input">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>

        <!-- Color & Icon -->
        <div class="block-editor__row">
          <div class="block-editor__field">
            <label>Color</label>
            <div class="block-editor__colors">
              <button
                v-for="c in colorPresets"
                :key="c"
                class="block-editor__color-btn"
                :style="{ background: c }"
                :class="{ selected: form.color === c }"
                @click="form.color = c"
              />
              <input v-model="form.color" type="color" class="block-editor__color-picker" />
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="block-editor__field">
          <label>Descripción</label>
          <textarea
            v-model="form.description"
            class="block-editor__input block-editor__textarea"
            placeholder="Opcional..."
            rows="2"
          />
        </div>

        <!-- Tags -->
        <div class="block-editor__field">
          <label>Tags</label>
          <div class="block-editor__tags">
            <span v-for="tag in form.tags" :key="tag" class="block-editor__tag">
              {{ tag }}
              <button @click="removeTag(tag)">×</button>
            </span>
            <input
              v-model="tagInput"
              class="block-editor__tag-input"
              placeholder="Agregar tag..."
              @keydown="handleTagKeydown"
            />
          </div>
        </div>

        <!-- Status -->
        <div v-if="block" class="block-editor__field">
          <label>Estado</label>
          <select v-model="form.status" class="block-editor__input">
            <option value="pending">Pendiente</option>
            <option value="in-progress">En curso</option>
            <option value="completed">Completado</option>
            <option value="skipped">Omitido</option>
          </select>
        </div>

        <!-- Focus block -->
        <div class="block-editor__field block-editor__checkbox-row">
          <input id="focus-check" v-model="form.isFocusBlock" type="checkbox" />
          <label for="focus-check">Bloque de foco profundo</label>
        </div>
      </div>

      <div class="block-editor__footer">
        <button class="block-editor__btn-cancel" @click="$emit('close')">Cancelar</button>
        <button class="block-editor__btn-save" :disabled="saving || !form.title" @click="save">
          {{ saving ? 'Guardando...' : block ? 'Guardar cambios' : 'Crear bloque' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from 'vue'
import { usePlannerBlocksStore } from '@/stores/planner-blocks.store'
import type { PlannerBlock } from '@/api/planner/planner.types'

const CATEGORIES = [
  { value: 'trabajo', label: '💼 Trabajo' },
  { value: 'foco-profundo', label: '🧠 Foco profundo' },
  { value: 'administracion', label: '📋 Administración' },
  { value: 'estudio', label: '📚 Estudio' },
  { value: 'gimnasio', label: '💪 Gimnasio' },
  { value: 'descanso', label: '😴 Descanso' },
  { value: 'personal', label: '🏠 Personal' },
  { value: 'reunion', label: '🤝 Reunión' },
  { value: 'creativo', label: '🎨 Creativo' },
  { value: 'habitos', label: '✅ Hábitos' },
]

const COLOR_PRESETS = [
  '#2563eb', '#7c3aed', '#db2777', '#dc2626',
  '#d97706', '#16a34a', '#0891b2', '#64748b',
]

export default defineComponent({
  name: 'BlockEditorModal',
  props: {
    block: { type: Object as () => PlannerBlock | null, default: null },
    defaultDate: { type: String, default: '' },
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const blocksStore = usePlannerBlocksStore()
    const saving = ref(false)
    const tagInput = ref('')

    const form = reactive({
      title: '',
      date: props.defaultDate,
      startTime: '09:00',
      endTime: '10:00',
      category: 'trabajo',
      priority: 'medium' as 'low' | 'medium' | 'high',
      status: 'pending' as 'pending' | 'in-progress' | 'completed' | 'skipped',
      color: '#2563eb',
      description: '',
      isFocusBlock: false,
      tags: [] as string[],
    })

    watch(() => props.block, (b) => {
      if (b) {
        Object.assign(form, {
          title: b.title,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
          category: b.category,
          priority: b.priority,
          status: b.status,
          color: b.color,
          description: b.description ?? '',
          isFocusBlock: b.isFocusBlock,
          tags: [...b.tags],
        })
      }
    }, { immediate: true })

    function addTag() {
      const t = tagInput.value.trim().replace(',', '')
      if (t && !form.tags.includes(t)) form.tags.push(t)
      tagInput.value = ''
    }

    function handleTagKeydown(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        addTag()
      }
    }

    function removeTag(tag: string) {
      form.tags = form.tags.filter(t => t !== tag)
    }

    async function save() {
      if (!form.title.trim()) return
      saving.value = true
      try {
        if (props.block) {
          await blocksStore.update(props.block._id, { ...form })
        } else {
          await blocksStore.create({ ...form })
        }
        emit('saved')
      } finally {
        saving.value = false
      }
    }

    return {
      form,
      saving,
      tagInput,
      categories: CATEGORIES,
      colorPresets: COLOR_PRESETS,
      addTag,
      handleTagKeydown,
      removeTag,
      save,
    }
  },
})
</script>

<style scoped>
.block-editor-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  padding: 16px;
  box-sizing: border-box;
}

.block-editor {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  width: 520px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0,0,0,0.4);
}

.block-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.block-editor__header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-base);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: var(--font-mono);
}

.block-editor__close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  padding: 4px;
}

.block-editor__close:hover { color: var(--color-text-base); }

.block-editor__body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.block-editor__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.block-editor__field label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
}

.block-editor__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.block-editor__input {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  padding: 8px 10px;
  color: var(--color-text-base);
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
  border-radius: var(--radius);
}

.block-editor__input:focus { border-color: var(--color-primary); }
.block-editor__textarea { resize: none; }
select.block-editor__input option { background: var(--color-bg-surface); }

.block-editor__colors {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.block-editor__color-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s;
}

.block-editor__color-btn.selected { border-color: var(--color-text-base); transform: scale(1.15); }
.block-editor__color-btn:hover { transform: scale(1.1); }

.block-editor__color-picker {
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 50%;
}

.block-editor__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 10px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  min-height: 36px;
}

.block-editor__tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--color-primary-fixed);
  color: var(--color-primary);
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 12px;
}

.block-editor__tag button {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  font-size: 14px;
}

.block-editor__tag-input {
  background: none;
  border: none;
  outline: none;
  color: var(--color-text-base);
  font-size: 12px;
  flex: 1;
  min-width: 100px;
}

.block-editor__tag-input::placeholder { color: var(--color-text-disabled); }

.block-editor__checkbox-row {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.block-editor__checkbox-row label {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-subtle);
  text-transform: none;
  letter-spacing: 0;
  font-family: var(--font-body);
}

.block-editor__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-surface-low);
}

.block-editor__btn-cancel {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 8px 16px;
  cursor: pointer;
  font-size: 11px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;
}

.block-editor__btn-cancel:hover {
  border-color: var(--color-text-muted);
  color: var(--color-text-base);
}

.block-editor__btn-save {
  background: var(--color-primary);
  border: none;
  color: #fff;
  padding: 8px 18px;
  cursor: pointer;
  font-size: 11px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: background 0.2s;
}

.block-editor__btn-save:hover:not(:disabled) { background: var(--color-primary-hover); }
.block-editor__btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 640px) {
  .block-editor-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .block-editor {
    width: 100%;
    max-height: 92vh;
    border-bottom: none;
    border-radius: 16px 16px 0 0;
  }

  .block-editor__body {
    padding: 16px;
    gap: 12px;
  }

  .block-editor__footer {
    padding: 12px 16px;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }

  .block-editor__row {
    grid-template-columns: 1fr 1fr;
  }

  .block-editor__btn-cancel,
  .block-editor__btn-save {
    flex: 1;
    text-align: center;
    justify-content: center;
  }

  .block-editor__footer {
    gap: 8px;
  }
}
</style>
