<template>
  <div v-if="modelValue" class="task-modal-overlay" @click.self="close">
    <div class="task-modal-box">
      <!-- Header -->
      <div class="task-modal-header">
        <div class="header-left">
          <span class="material-symbols-outlined header-icon">web_asset</span>
          <input
            v-model="form.title"
            type="text"
            class="task-title-input"
            placeholder="Título de la tarea"
          />
        </div>
        <div class="header-right">
          <button v-if="!viewMode" class="icon-btn icon-btn--save" title="Guardar" :disabled="loading" @click="save">
            <span class="material-symbols-outlined">save</span>
          </button>
          <button class="icon-btn" @click="close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <!-- Draft banner -->
      <div v-if="hasDraft" class="draft-banner">
        <span class="material-symbols-outlined" style="font-size:15px">history</span>
        Borrador restaurado
        <button class="draft-discard" @click="discardDraft">Descartar</button>
      </div>

      <div class="task-modal-body custom-scrollbar">
        <div class="task-main-col">

          <!-- Labels -->
          <div class="task-section">
            <h3 class="section-title">
              <span class="material-symbols-outlined">sell</span> Etiquetas
            </h3>
            <div class="labels-list">
              <span
                v-for="(label, i) in form.labels"
                :key="i"
                class="task-label"
                :style="{ backgroundColor: label.color + '22', color: label.color, borderColor: label.color + '44' }"
              >
                {{ label.name }}
                <button v-if="!viewMode" class="remove-label" @click="removeLabel(i)">
                  <span class="material-symbols-outlined">close</span>
                </button>
              </span>
              <button v-if="!viewMode" class="add-btn add-label-btn" @click.stop.prevent="showLabelPopover = !showLabelPopover">
                <span class="material-symbols-outlined">add</span> Agregar
              </button>
            </div>

            <div v-if="showLabelPopover" class="label-popover">
              <input v-model="newLabelName" type="text" placeholder="Nombre" class="popover-input" @click.stop />
              <div class="color-picker">
                <button
                  v-for="c in colors"
                  :key="c"
                  class="color-swatch"
                  :style="{ background: c }"
                  :class="{ active: newLabelColor === c }"
                  @click.stop.prevent="newLabelColor = c"
                ></button>
              </div>
              <button class="btn-primary" style="width:100%;margin-top:8px" @click.stop.prevent="addLabel">Guardar</button>
            </div>
          </div>

          <!-- Description -->
          <div class="task-section">
            <h3 class="section-title">
              <span class="material-symbols-outlined">subject</span> Descripción
            </h3>
            <div v-if="!viewMode || editingDescription" class="editor-container">
              <QuillEditor
                v-model:content="form.description"
                content-type="html"
                theme="snow"
                placeholder="Añadir una descripción más detallada..."
              />
              <div v-if="viewMode && editingDescription" class="description-edit-actions">
                <button class="btn-primary" style="padding:6px 14px;font-size:12px" @click="saveInViewMode">Listo</button>
                <button class="btn-secondary" style="padding:6px 14px;font-size:12px" @click="cancelDescriptionEdit">Cancelar</button>
              </div>
            </div>
            <div
              v-else
              class="description-view description-view--clickable"
              @click="startEditingDescription"
            >
              <div
                v-if="form.description && form.description !== '<p><br></p>'"
                class="ql-content"
                v-html="form.description"
              ></div>
              <p v-else class="description-placeholder">Agregar una descripción más detallada...</p>
            </div>
          </div>

          <!-- Checklist -->
          <div class="task-section">
            <div class="section-title-row">
              <h3 class="section-title">
                <span class="material-symbols-outlined">checklist</span> Checklist
              </h3>
              <span v-if="form.checklist && form.checklist.length" class="checklist-pct">
                {{ checklistProgress }}%
              </span>
            </div>

            <div v-if="form.checklist && form.checklist.length" class="checklist-progress-container">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :class="{ 'progress-fill--done': checklistProgress === 100 }"
                  :style="{ width: checklistProgress + '%' }"
                ></div>
              </div>
            </div>

            <div class="checklist-items">
              <div
                v-for="(item, idx) in form.checklist"
                :key="idx"
                class="checklist-item"
                :class="{ completed: item.completed }"
              >
                <input
                  type="checkbox"
                  v-model="item.completed"
                  :disabled="viewMode"
                  class="checklist-checkbox"
                />
                <input
                  v-if="!viewMode"
                  :ref="(el) => { if (el) checklistItemRefs[idx] = el as HTMLInputElement }"
                  v-model="item.text"
                  type="text"
                  class="checklist-text-input"
                  placeholder="Añadir un elemento"
                  @keydown.enter.prevent="addChecklistItemAndFocus"
                  @keydown.esc="onChecklistItemEscape(idx)"
                />
                <span v-else class="checklist-text" :class="{ completed: item.completed }">{{ item.text }}</span>
                <button v-if="!viewMode" class="icon-btn checklist-delete-btn" @click="removeChecklistItem(idx)">
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <button v-if="!viewMode" class="add-btn mt-2" @click="addChecklistItemAndFocus">
              <span class="material-symbols-outlined">add</span> Añadir un elemento
            </button>
          </div>

        </div>

        <!-- Sidebar -->
        <div class="task-side-col">
          <div class="meta-card">
            <h4 class="meta-title">Asignado a</h4>
            <div v-if="!viewMode">
              <w-remote-select
                v-model="form.assigneeId"
                placeholder="Sin asignar"
                :load-options="loadUserOptions"
                :load-option-by-value="loadUserOptionById"
              />
            </div>
            <div v-else class="meta-value">{{ form.assigneeId || 'Sin asignar' }}</div>
          </div>

          <div class="meta-card">
            <h4 class="meta-title">Prioridad</h4>
            <div v-if="!viewMode">
              <select v-model="form.priority" class="task-select">
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div v-else class="meta-value" :class="`priority-${form.priority}`">{{ form.priority }}</div>
          </div>

          <div class="meta-card">
            <h4 class="meta-title">Vencimiento</h4>
            <div v-if="!viewMode">
              <input v-model="form.dueDate" type="date" class="task-date" />
            </div>
            <div v-else class="meta-value">{{ form.dueDate || 'Sin fecha' }}</div>
          </div>

          <div class="meta-card actions-card" v-if="!viewMode">
            <button class="btn-primary w-full" :disabled="loading" @click="save">
              {{ loading ? 'Guardando...' : 'Guardar tarea' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import WRemoteSelect from '@/components/ui/WRemoteSelect.vue'
import { loadUserOptions, loadUserOptionById } from '@/utils/remote-entity-options'

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default defineComponent({
  name: 'TaskModal',
  components: { QuillEditor, WRemoteSelect },
  props: {
    modelValue: { type: Boolean, required: true },
    viewMode:   { type: Boolean, default: false },
    task:       { type: Object, default: null },
    loading:    { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const form = ref<any>({
      title: '', description: '', priority: 'medium', dueDate: '',
      assigneeId: '', checklist: [], labels: [], attachments: []
    })

    const editingDescription  = ref(false)
    const checklistItemRefs   = ref<HTMLInputElement[]>([])
    const showLabelPopover    = ref(false)
    const newLabelName        = ref('')
    const newLabelColor       = ref(COLORS[0])
    const colors              = COLORS
    const hasDraft            = ref(false)

    // Draft key: new task uses 'task-draft-new', existing uses 'task-draft-{id}'
    const draftKey = () => props.task?._id ? `task-draft-${props.task._id}` : 'task-draft-new'

    const saveDraft = () => {
      try { localStorage.setItem(draftKey(), JSON.stringify(form.value)) } catch { /* localStorage puede no estar disponible */ }
    }

    const loadDraft = (): any | null => {
      try { const s = localStorage.getItem(draftKey()); return s ? JSON.parse(s) : null } catch { return null }
    }

    const clearDraft = () => {
      try { localStorage.removeItem(draftKey()) } catch { /* localStorage puede no estar disponible */ }
      hasDraft.value = false
    }

    // Auto-save draft on every form change
    watch(form, saveDraft, { deep: true })

    watch(() => props.modelValue, (val) => {
      editingDescription.value = false
      checklistItemRefs.value  = []
      showLabelPopover.value   = false

      if (val && props.task) {
        const base = {
          title:       props.task.title       || '',
          description: props.task.description || '',
          priority:    props.task.priority    || 'medium',
          dueDate:     props.task.dueDate ? props.task.dueDate.split('T')[0] : '',
          assigneeId:  props.task.assigneeId  || '',
          checklist:   props.task.checklist   ? JSON.parse(JSON.stringify(props.task.checklist))   : [],
          labels:      props.task.labels      ? JSON.parse(JSON.stringify(props.task.labels))      : [],
          attachments: props.task.attachments ? JSON.parse(JSON.stringify(props.task.attachments)) : []
        }
        const draft = loadDraft()
        // Only restore draft if it has meaningful changes vs base
        if (draft && draft.title !== undefined) {
          form.value = draft
          hasDraft.value = true
        } else {
          form.value = base
          hasDraft.value = false
        }
      } else if (val) {
        // New task — restore draft if exists
        const draft = loadDraft()
        if (draft && (draft.title || draft.description)) {
          form.value = draft
          hasDraft.value = true
        } else {
          form.value = {
            title: '', description: '', priority: 'medium', dueDate: '',
            assigneeId: '', checklist: [], labels: [], attachments: []
          }
          hasDraft.value = false
        }
      }
    })

    const close = () => emit('update:modelValue', false)

    const save = () => {
      clearDraft()
      emit('save', form.value)
    }

    const discardDraft = () => {
      clearDraft()
      if (props.task) {
        form.value = {
          title:       props.task.title       || '',
          description: props.task.description || '',
          priority:    props.task.priority    || 'medium',
          dueDate:     props.task.dueDate ? props.task.dueDate.split('T')[0] : '',
          assigneeId:  props.task.assigneeId  || '',
          checklist:   props.task.checklist   ? JSON.parse(JSON.stringify(props.task.checklist))   : [],
          labels:      props.task.labels      ? JSON.parse(JSON.stringify(props.task.labels))      : [],
          attachments: props.task.attachments ? JSON.parse(JSON.stringify(props.task.attachments)) : []
        }
      } else {
        form.value = { title: '', description: '', priority: 'medium', dueDate: '', assigneeId: '', checklist: [], labels: [], attachments: [] }
      }
    }

    // In viewMode, save immediately when user finishes editing description
    const originalDescription = ref('')
    const saveInViewMode = () => {
      editingDescription.value = false
      clearDraft()
      emit('save', form.value)
    }
    const cancelDescriptionEdit = () => {
      form.value.description = originalDescription.value
      editingDescription.value = false
    }
    // Capture original before editing so cancel can revert
    const startEditingDescription = () => {
      originalDescription.value = form.value.description
      editingDescription.value = true
    }

    // ── Labels ──
    const addLabel = () => {
      if (!newLabelName.value.trim()) return
      form.value.labels.push({ name: newLabelName.value.trim(), color: newLabelColor.value })
      newLabelName.value   = ''
      newLabelColor.value  = COLORS[0]
      showLabelPopover.value = false
    }

    const removeLabel = (i: number) => form.value.labels.splice(i, 1)

    // ── Checklist ──
    const addChecklistItemAndFocus = async () => {
      form.value.checklist.push({ text: '', completed: false })
      await nextTick()
      const inputs = checklistItemRefs.value.filter(Boolean)
      inputs[inputs.length - 1]?.focus()
    }

    const removeChecklistItem = (i: number) => {
      form.value.checklist.splice(i, 1)
      checklistItemRefs.value.splice(i, 1)
    }

    const onChecklistItemEscape = (idx: number) => {
      if (!form.value.checklist[idx].text.trim()) {
        form.value.checklist.splice(idx, 1)
        checklistItemRefs.value.splice(idx, 1)
      }
    }

    return {
      form,
      editingDescription,
      checklistItemRefs,
      showLabelPopover,
      newLabelName,
      newLabelColor,
      colors,
      loadUserOptions,
      loadUserOptionById,
      hasDraft,
      close,
      save,
      discardDraft,
      saveInViewMode,
      cancelDescriptionEdit,
      startEditingDescription,
      addLabel,
      removeLabel,
      addChecklistItemAndFocus,
      removeChecklistItem,
      onChecklistItemEscape,
    }
  },
  computed: {
    checklistProgress(): number {
      if (!this.form.checklist.length) return 0
      const completed = this.form.checklist.filter((i: any) => i.completed).length
      return Math.round((completed / this.form.checklist.length) * 100)
    }
  }
})
</script>

<style scoped>
/* ── Overlay & box ── */
.task-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.task-modal-box {
  background: var(--color-bg-surface);
  width: 768px;
  max-width: 95vw;
  max-height: 90vh;
  height: auto;
  border-radius: 0;
  border: none;
  box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Header ── */
.task-modal-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.header-icon {
  color: var(--color-text-muted);
  font-size: 22px;
  margin-top: 2px;
  flex-shrink: 0;
}

.task-title-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-base);
  outline: none;
  font-family: var(--font-body);
  line-height: 1.3;
  min-width: 0;
}

.task-title-input::placeholder {
  color: var(--color-text-muted);
  font-weight: 400;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 0;
  transition: background 0.15s, color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover { background: var(--color-bg-base); color: var(--color-text-base); }
.icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.icon-btn .material-symbols-outlined { font-size: 20px; }
.icon-btn--save { color: var(--color-primary); }
.icon-btn--save:hover { background: rgba(37, 99, 235, 0.08); color: var(--color-primary); }

/* ── Draft banner ── */
.draft-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 24px;
  background: rgba(245, 158, 11, 0.1);
  border-bottom: 1px solid rgba(245, 158, 11, 0.25);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-warning);
  flex-shrink: 0;
}
.draft-discard {
  margin-left: auto;
  background: none;
  border: 1px solid currentColor;
  color: inherit;
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 8px;
  cursor: pointer;
  opacity: 0.8;
}
.draft-discard:hover { opacity: 1; }

/* ── Body ── */
.task-modal-body {
  display: flex;
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  gap: 24px;
  max-height: calc(90vh - 72px);
}

.task-main-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-width: 0;
}

.task-side-col {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Sections ── */
.task-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-base);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  text-transform: none;
  letter-spacing: normal;
}

.section-title .material-symbols-outlined {
  font-size: 18px;
  color: var(--color-text-muted);
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checklist-pct {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

/* ── Labels ── */
.labels-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  position: relative;
}

.task-label {
  padding: 3px 10px;
  border-radius: 0;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid transparent;
}

.remove-label {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  opacity: 0.6;
  padding: 0;
}

.remove-label:hover { opacity: 1; }
.remove-label .material-symbols-outlined { font-size: 13px; }

.add-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed var(--color-border);
  color: var(--color-text-muted);
  border-radius: 0;
  padding: 4px 12px;
  font-size: 11px;
  font-family: var(--font-mono);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: background 0.15s, color 0.15s;
}

.add-btn:hover { background: rgba(255, 255, 255, 0.1); color: var(--color-text-base); }
.add-btn .material-symbols-outlined { font-size: 14px; }
.mt-2 { margin-top: 4px; }

.label-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 12px;
  border-radius: 0;
  z-index: 10;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  width: 200px;
}

.popover-input {
  width: 100%;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  padding: 6px 10px;
  border-radius: 0;
  font-size: 12px;
  color: var(--color-text-base);
  margin-bottom: 8px;
  outline: none;
  font-family: var(--font-body);
  box-sizing: border-box;
}

.popover-input:focus { border-color: var(--color-primary); }

.color-picker { display: flex; gap: 6px; flex-wrap: wrap; }

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s;
}

.color-swatch:hover { transform: scale(1.15); }
.color-swatch.active { border-color: white; transform: scale(1.15); }

/* ── Description ── */
.editor-container {
  border: 1px solid var(--color-border);
  border-radius: 0;
  overflow: hidden;
}

:deep(.ql-toolbar) {
  background: var(--color-bg-surface);
  border-color: var(--color-border) !important;
  border-top: none;
  border-left: none;
  border-right: none;
}

:deep(.ql-container) {
  background: var(--color-bg-base);
  border: none !important;
  font-family: var(--font-body);
  font-size: 14px;
  min-height: 120px;
}

:deep(.ql-editor) { color: var(--color-text-base); }
:deep(.ql-stroke)  { stroke: var(--color-text-muted); }
:deep(.ql-fill)    { fill:   var(--color-text-muted); }
:deep(.ql-picker)  { color:  var(--color-text-muted); }

.description-view {
  background: var(--color-bg-base);
  padding: 12px 16px;
  border-radius: 0;
  border: 1px solid var(--color-border);
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-base);
}

.description-view--clickable {
  cursor: pointer;
  min-height: 60px;
  transition: background 0.15s;
  border: 1px solid transparent;
}

.description-view--clickable:hover {
  background: var(--color-bg-surface-high);
  border-color: var(--color-border);
}

.description-placeholder {
  color: var(--color-text-muted);
  font-size: 14px;
  margin: 0;
  padding: 4px 0;
}

.description-edit-actions {
  display: flex;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-surface);
}

/* ── Checklist ── */
.checklist-progress-container {
  margin-bottom: 4px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-bg-base);
  border-radius: 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s, background 0.3s;
}

.progress-fill--done { background: var(--color-success); }

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.checklist-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--color-primary);
  flex-shrink: 0;
}

.checklist-text-input {
  flex: 1;
  background: transparent;
  border: 1px solid transparent;
  padding: 6px 8px;
  color: var(--color-text-base);
  font-size: 14px;
  font-family: var(--font-body);
  outline: none;
  border-radius: 0;
  transition: background 0.15s, border-color 0.15s;
}

.checklist-text-input:focus {
  background: var(--color-bg-base);
  border-color: var(--color-border);
}

.checklist-item.completed .checklist-text-input {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.checklist-text {
  flex: 1;
  font-size: 14px;
  padding: 6px 0;
  color: var(--color-text-base);
}

.checklist-text.completed {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.checklist-delete-btn {
  padding: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.checklist-item:hover .checklist-delete-btn { opacity: 1; }

/* ── Sidebar ── */
.meta-card {
  background: none;
  border: none;
  padding: 0;
}

.meta-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin-bottom: 6px;
  font-family: var(--font-mono);
  font-weight: 600;
}

.task-select,
.task-date {
  width: 100%;
  background: var(--color-bg-surface-high);
  border: none;
  padding: 8px 10px;
  border-radius: 0;
  color: var(--color-text-base);
  font-size: 13px;
  outline: none;
  font-family: var(--font-body);
  cursor: pointer;
  box-sizing: border-box;
}

.task-select:hover,
.task-date:hover {
  background: var(--color-bg-surface-highest);
}

.task-select:focus,
.task-date:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.meta-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-base);
}

.priority-low    { color: var(--color-success); }
.priority-medium { color: var(--color-warning); }
.priority-high   { color: var(--color-error); }
.priority-urgent { color: var(--color-error); font-weight: 700; text-transform: uppercase; }

.actions-card { margin-top: auto; }

.btn-primary {
  padding: 10px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary:not(:disabled):hover { opacity: 0.85; }

.btn-secondary {
  padding: 10px 20px;
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
}

.btn-secondary:hover { color: var(--color-text-base); border-color: var(--color-text-muted); }

.w-full { width: 100%; }

/* ── Scrollbar ── */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
</style>
