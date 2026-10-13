<template>
  <teleport to="body">
    <div v-if="isOpen" class="note-modal-overlay w95-dialog-overlay" @click.self="$emit('close')">
      <div class="note-modal w95-window">
        <!-- Titlebar Win95 -->
        <div class="w95-titlebar">
          <win-icon name="note" :size="16" alt="" />
          <span class="title-text">{{ isEditing ? 'Editar nota' : 'Nueva nota' }} — Orkpad95</span>
          <div class="w95-titlebar-buttons">
            <button class="w95-title-btn" @click="$emit('close')" title="Cerrar"><span class="tbtn-close" aria-hidden="true">×</span></button>
          </div>
        </div>

        <!-- Type toggle -->
        <div class="note-modal__type-row">
          <button
            :class="['type-btn', { 'type-btn--active': form.type === 'note' }]"
            @click="form.type = 'note'"
          >
            Nota
          </button>
          <button
            :class="['type-btn', { 'type-btn--active': form.type === 'checklist' }]"
            @click="form.type = 'checklist'"
          >
            Checklist
          </button>
        </div>

        <!-- Title -->
        <input
          v-model="form.title"
          class="note-modal__input"
          placeholder="Título (opcional)"
          maxlength="120"
        />

        <!-- Rich text editor (note mode) -->
        <div v-if="form.type === 'note'" class="note-modal__editor-wrap">
          <div class="editor-toolbar">
            <button class="toolbar-btn" :class="{ active: editor?.isActive('bold') }" title="Negrita" @click="editor?.chain().focus().toggleBold().run()">
              <span class="tb-glyph" aria-hidden="true">B</span>
            </button>
            <button class="toolbar-btn" :class="{ active: editor?.isActive('italic') }" title="Cursiva" @click="editor?.chain().focus().toggleItalic().run()">
              <span class="tb-glyph" aria-hidden="true">I</span>
            </button>
            <button class="toolbar-btn" :class="{ active: editor?.isActive('code') }" title="Código" @click="editor?.chain().focus().toggleCode().run()">
              <span class="tb-glyph" aria-hidden="true">&lt;&gt;</span>
            </button>
            <div class="toolbar-sep"></div>
            <button class="toolbar-btn" :class="{ active: editor?.isActive('heading', { level: 2 }) }" title="H2" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()">
              <span class="tb-glyph" aria-hidden="true">H2</span>
            </button>
            <button class="toolbar-btn" :class="{ active: editor?.isActive('bulletList') }" title="Lista" @click="editor?.chain().focus().toggleBulletList().run()">
              <span class="tb-glyph" aria-hidden="true">•</span>
            </button>
            <button class="toolbar-btn" :class="{ active: editor?.isActive('orderedList') }" title="Lista numerada" @click="editor?.chain().focus().toggleOrderedList().run()">
              <span class="tb-glyph" aria-hidden="true">1.</span>
            </button>
            <button class="toolbar-btn" :class="{ active: editor?.isActive('codeBlock') }" title="Bloque de código" @click="editor?.chain().focus().toggleCodeBlock().run()">
              <span class="tb-glyph" aria-hidden="true">{;}</span>
            </button>
          </div>
          <editor-content class="note-modal__editor" :editor="editor" />
        </div>

        <!-- Checklist editor -->
        <div v-else class="note-modal__checklist-editor">
          <div
            v-for="(item, idx) in form.checklist"
            :key="item.id"
            class="checklist-editor-row"
          >
            <button class="checklist-toggle" @click="item.completed = !item.completed">
              <span v-if="item.completed" class="w95-check w95-check--done" aria-hidden="true">✓</span>
              <span v-else class="w95-check" aria-hidden="true"></span>
            </button>
            <input
              v-model="item.text"
              class="checklist-input"
              placeholder="Ítem..."
              @keydown.enter.prevent="addChecklistItem(idx)"
              @keydown.backspace="onChecklistBackspace(idx, item)"
            />
            <button class="checklist-remove" @click="removeChecklistItem(idx)">×</button>
          </div>
          <button class="add-checklist-btn" @click="addChecklistItem()">
            + Agregar ítem
          </button>
        </div>

        <!-- Color picker -->
        <div class="note-modal__row">
          <span class="note-modal__label">Color</span>
          <div class="color-picker">
            <button
              class="color-chip color-chip--none"
              :class="{ 'color-chip--active': !form.color }"
              title="Sin color"
              @click="form.color = null"
            >
              <span aria-hidden="true">–</span>
            </button>
            <button
              v-for="c in COLOR_OPTIONS"
              :key="c.value"
              class="color-chip"
              :class="{ 'color-chip--active': form.color === c.value }"
              :style="{ background: c.value }"
              :title="c.label"
              @click="form.color = c.value"
            ></button>
          </div>
        </div>

        <!-- Tags -->
        <div class="note-modal__row">
          <span class="note-modal__label">Etiquetas</span>
          <div class="tags-editor">
            <span
              v-for="tag in form.tags"
              :key="tag"
              class="tag-chip"
            >
              #{{ tag }}
              <button class="tag-remove" @click="removeTag(tag)">×</button>
            </span>
            <input
              v-model="tagInput"
              class="tag-input"
              placeholder="+ etiqueta"
              @keydown="handleTagKeydown"
            />
          </div>
        </div>

        <!-- Project / Client links -->
        <div class="note-modal__row">
          <span class="note-modal__label">Proyecto</span>
          <w-remote-select
            :model-value="form.projectId ?? undefined"
            placeholder="Vincular proyecto..."
            search-placeholder="Buscar proyecto..."
            :load-options="loadProjectOptions"
            :load-option-by-value="loadProjectOptionById"
            clearable
            @update:model-value="form.projectId = $event ?? null"
          />
        </div>

        <!-- Footer actions -->
        <div class="note-modal__footer">
          <button class="w95-btn" @click="$emit('close')">Cancelar</button>
          <button class="w95-btn w95-btn--default" :disabled="saving" @click="save">
            <span v-if="saving">...</span>
            <span v-else>{{ isEditing ? 'Guardar' : 'Crear nota' }}</span>
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onBeforeUnmount, computed } from 'vue'
import type { PropType } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import type { Note, CreateNoteDto, UpdateNoteDto, ChecklistItem } from '@/api/notes/notes.types'
import WRemoteSelect from '@/components/ui/WRemoteSelect.vue'
import WinIcon from '@/components/win95/WinIcon.vue'
import apiClient from '@/api/axios.config'

const COLOR_OPTIONS = [
  { value: '#EF4444', label: 'Rojo' },
  { value: '#F59E0B', label: 'Amarillo' },
  { value: '#10B981', label: 'Verde' },
  { value: '#2563EB', label: 'Azul' },
  { value: '#8B5CF6', label: 'Violeta' },
  { value: '#EC4899', label: 'Rosa' },
]

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function emptyForm() {
  return {
    title: '',
    content: '',
    type: 'note' as 'note' | 'checklist',
    color: null as string | null,
    tags: [] as string[],
    projectId: null as string | null,
    clientId: null as string | null,
    checklist: [] as ChecklistItem[],
  }
}

export default defineComponent({
  name: 'NoteEditModal',
  components: { EditorContent, WRemoteSelect, WinIcon },

  props: {
    isOpen: { type: Boolean, default: false },
    note: { type: Object as PropType<Note | null>, default: null },
    defaultProjectId: { type: String, default: '' },
  },

  emits: ['close', 'saved'],

  setup(props, { emit }) {
    const saving = ref(false)
    const tagInput = ref('')
    const form = ref(emptyForm())
    const isEditing = computed(() => !!props.note)

    const editor = useEditor({
      extensions: [
        StarterKit,
        Link.configure({ openOnClick: false }),
        Placeholder.configure({ placeholder: 'Escribí tu nota aquí...' }),
      ],
      content: '',
      editorProps: {
        attributes: { class: 'tiptap-inner' },
      },
    })

    watch(
      () => props.isOpen,
      (open) => {
        if (open) {
          if (props.note) {
            form.value = {
              title: props.note.title ?? '',
              content: props.note.content,
              type: props.note.type,
              color: props.note.color,
              tags: [...props.note.tags],
              projectId: props.note.projectId,
              clientId: props.note.clientId,
              checklist: props.note.checklist.map(i => ({ ...i })),
            }
            editor.value?.commands.setContent(props.note.content || '')
          } else {
            form.value = emptyForm()
            if (props.defaultProjectId) {
              form.value.projectId = props.defaultProjectId
            }
            editor.value?.commands.setContent('')
          }
        }
      },
      { immediate: true },
    )

    onBeforeUnmount(() => editor.value?.destroy())

    function addTag() {
      const t = tagInput.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
      if (t && !form.value.tags.includes(t) && form.value.tags.length < 10) {
        form.value.tags.push(t)
      }
      tagInput.value = ''
    }

    function handleTagKeydown(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
        e.preventDefault()
        addTag()
      }
    }

    function removeTag(tag: string) {
      form.value.tags = form.value.tags.filter(t => t !== tag)
    }

    function addChecklistItem(afterIdx?: number) {
      const item: ChecklistItem = { id: makeId(), text: '', completed: false }
      if (afterIdx !== undefined) {
        form.value.checklist.splice(afterIdx + 1, 0, item)
      } else {
        form.value.checklist.push(item)
      }
    }

    function removeChecklistItem(idx: number) {
      form.value.checklist.splice(idx, 1)
    }

    function onChecklistBackspace(idx: number, item: ChecklistItem) {
      if (!item.text && form.value.checklist.length > 1) {
        removeChecklistItem(idx)
      }
    }

    async function save() {
      saving.value = true
      try {
        const content = form.value.type === 'note'
          ? (editor.value?.getHTML() ?? '')
          : ''

        const payload: CreateNoteDto | UpdateNoteDto = {
          title: form.value.title || undefined,
          content,
          type: form.value.type,
          color: form.value.color ?? undefined,
          tags: form.value.tags,
          projectId: form.value.projectId ?? undefined,
          clientId: form.value.clientId ?? undefined,
          checklist: form.value.type === 'checklist' ? form.value.checklist : [],
        }

        emit('saved', payload)
      } finally {
        saving.value = false
      }
    }

    async function loadProjectOptions(search: string) {
      const { data } = await apiClient.get('/projects', { params: { search, limit: 20 } })
      return (data.data ?? []).map((p: any) => ({ value: p._id, label: p.name }))
    }

    async function loadProjectOptionById(id: string) {
      const { data } = await apiClient.get(`/projects/${id}`)
      return { value: data._id, label: data.name }
    }

    return {
      form,
      isEditing,
      saving,
      tagInput,
      editor,
      COLOR_OPTIONS,
      addTag,
      handleTagKeydown,
      removeTag,
      addChecklistItem,
      removeChecklistItem,
      onChecklistBackspace,
      save,
      loadProjectOptions,
      loadProjectOptionById,
    }
  },
})
</script>

<style scoped>
.note-modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.note-modal {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

/* Header */
.note-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.note-modal__title {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-base);
}

.note-modal__close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
}

.note-modal__close:hover {
  color: var(--color-text-base);
}

/* Type toggle */
.note-modal__type-row {
  display: flex;
  gap: 8px;
}

.type-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.type-btn .material-symbols-outlined {
  font-size: 16px;
}

.type-btn--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* Input */
.note-modal__input {
  width: 100%;
  background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border);
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-base);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.note-modal__input:focus {
  border-color: var(--color-border-focus);
}

.note-modal__input::placeholder {
  color: var(--color-text-disabled);
}

/* Editor */
.note-modal__editor-wrap {
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface-low);
  transition: border-color 0.15s;
}

.note-modal__editor-wrap:focus-within {
  border-color: var(--color-border-focus);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.toolbar-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  transition: color 0.1s, background 0.1s;
}

.toolbar-btn:hover,
.toolbar-btn.active {
  color: var(--color-text-base);
  background: var(--color-bg-surface-high);
}

.toolbar-btn .material-symbols-outlined {
  font-size: 18px;
}

.toolbar-sep {
  width: 1px;
  height: 18px;
  background: var(--color-border);
  margin: 0 4px;
}

.note-modal__editor {
  min-height: 180px;
  max-height: 340px;
  overflow-y: auto;
}

/* Tiptap global styles (not scoped) */
.note-modal__editor :deep(.tiptap-inner) {
  padding: 12px;
  outline: none;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-base);
  line-height: 1.7;
  min-height: 180px;
}

.note-modal__editor :deep(.tiptap-inner p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: var(--color-text-disabled);
  pointer-events: none;
  float: left;
  height: 0;
}

.note-modal__editor :deep(h2) {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  margin: 12px 0 4px;
}

.note-modal__editor :deep(code) {
  font-family: var(--font-mono);
  font-size: 11px;
  background: var(--color-bg-surface-high);
  padding: 1px 4px;
}

.note-modal__editor :deep(pre) {
  background: var(--color-bg-surface-high);
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  overflow-x: auto;
  margin: 8px 0;
}

.note-modal__editor :deep(ul),
.note-modal__editor :deep(ol) {
  padding-left: 20px;
  margin: 4px 0;
}

/* Checklist editor */
.note-modal__checklist-editor {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface-low);
  padding: 12px;
  min-height: 120px;
}

.checklist-editor-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checklist-toggle {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  padding: 0;
  flex-shrink: 0;
}

.checklist-toggle .material-symbols-outlined {
  font-size: 18px;
}

.checklist-input {
  flex: 1;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border-subtle);
  padding: 4px 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-base);
  outline: none;
}

.checklist-input:focus {
  border-bottom-color: var(--color-border-focus);
}

.checklist-remove {
  background: none;
  border: none;
  color: var(--color-text-disabled);
  cursor: pointer;
  display: flex;
  padding: 0;
  flex-shrink: 0;
}

.checklist-remove:hover {
  color: var(--color-error);
}

.checklist-remove .material-symbols-outlined {
  font-size: 16px;
}

.add-checklist-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  padding: 4px 0;
  margin-top: 4px;
}

.add-checklist-btn:hover {
  color: var(--color-primary);
}

.add-checklist-btn .material-symbols-outlined {
  font-size: 16px;
}

/* Row label */
.note-modal__row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.note-modal__label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  width: 72px;
  flex-shrink: 0;
}

/* Color picker */
.color-picker {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.color-chip {
  width: 22px;
  height: 22px;
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.1s, border-color 0.1s;
}

.color-chip:hover {
  transform: scale(1.15);
}

.color-chip--active {
  border-color: var(--color-text-base) !important;
}

.color-chip--none {
  background: var(--color-bg-surface-high);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-chip--none .material-symbols-outlined {
  font-size: 14px;
}

/* Tags */
.tags-editor {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  flex: 1;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface-low);
  padding: 6px 10px;
  min-height: 36px;
}

.tag-chip {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--color-bg-surface-high);
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-subtle);
  padding: 2px 6px;
}

.tag-remove {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  padding: 0;
  margin-left: 2px;
}

.tag-remove:hover {
  color: var(--color-error);
}

.tag-remove .material-symbols-outlined {
  font-size: 12px;
}

.tag-input {
  background: none;
  border: none;
  outline: none;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-base);
  min-width: 80px;
}

.tag-input::placeholder {
  color: var(--color-text-disabled);
}

/* Footer */
.note-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.note-modal__cancel {
  padding: 8px 16px;
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s;
}

.note-modal__cancel:hover {
  background: var(--color-bg-surface-high);
  color: var(--color-text-base);
}

.note-modal__save {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: var(--color-primary);
  border: none;
  color: white;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s;
  min-width: 100px;
  justify-content: center;
}

.note-modal__save:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.note-modal__save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spinner */
.spinning {
  animation: spin 0.8s linear infinite;
  font-size: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .note-modal-overlay {
position: fixed;
  inset: 0;
  background: var(--color-overlay);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

html[data-appearance="win95"] .note-modal {
width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 2px;
}

html[data-appearance="win95"] .note-modal__type-row {
margin: 8px 8px 0 8px;
}

html[data-appearance="win95"] .note-modal__input, html[data-appearance="win95"] .note-modal__editor-wrap, html[data-appearance="win95"] .note-modal__checklist-editor, html[data-appearance="win95"] .note-modal__row {
margin-left: 8px;
  margin-right: 8px;
}

html[data-appearance="win95"] .note-modal__row:last-of-type {
margin-bottom: 8px;
}

html[data-appearance="win95"] .note-modal__header {
display: none;
}

html[data-appearance="win95"] .note-modal__title {
font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-base);
}

html[data-appearance="win95"] .note-modal__close {
background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
}

html[data-appearance="win95"] .note-modal__close:hover {
color: var(--color-text-base);
}

html[data-appearance="win95"] .note-modal__type-row {
display: flex;
  gap: 8px;
}

html[data-appearance="win95"] .type-btn {
display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  background: var(--w95-face);
  border: 2px solid;
  border-color: var(--w95-highlight) var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-highlight);
  box-shadow: inset 1px 1px 0 var(--w95-face-light), inset -1px -1px 0 var(--w95-shadow);
  color: #000;
  cursor: pointer;
}

html[data-appearance="win95"] .type-btn--active {
font-weight: bold;
  border-color: var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-darkshadow);
  box-shadow: inset 1px 1px 0 var(--w95-highlight), inset -1px -1px 0 var(--w95-shadow), 0 0 0 1px #000;
}

html[data-appearance="win95"] .note-modal__input {
width: 100%;
  background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border);
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-base);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

html[data-appearance="win95"] .note-modal__input:focus {
border-color: var(--color-border-focus);
}

html[data-appearance="win95"] .note-modal__input::placeholder {
color: var(--color-text-disabled);
}

html[data-appearance="win95"] .note-modal__editor-wrap {
border: 1px solid var(--color-border);
  background: var(--color-bg-surface-low);
  transition: border-color 0.15s;
}

html[data-appearance="win95"] .note-modal__editor-wrap:focus-within {
border-color: var(--color-border-focus);
}

html[data-appearance="win95"] .editor-toolbar {
display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

html[data-appearance="win95"] .toolbar-btn {
background: var(--w95-face);
  border: 1px solid;
  border-color: var(--w95-highlight) var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-highlight);
  color: #000;
  cursor: pointer;
  padding: 3px 7px;
  display: flex;
  align-items: center;
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 12px;
  font-weight: bold;
  min-width: 24px;
  justify-content: center;
}

html[data-appearance="win95"] .toolbar-btn:hover {
background: var(--w95-face-light);
}

html[data-appearance="win95"] .toolbar-btn.active {
border-color: var(--w95-darkshadow) var(--w95-highlight) var(--w95-highlight) var(--w95-darkshadow);
  background: var(--w95-face-light);
  font-weight: bold;
}

html[data-appearance="win95"] .tb-glyph {
font-family: Tahoma, Verdana, sans-serif;
  font-size: 12px;
  font-weight: bold;
  font-style: normal;
  min-width: 18px;
  text-align: center;
}

html[data-appearance="win95"] .w95-check {
display: inline-block;
  width: 13px;
  height: 13px;
  background: #fff;
  border: 1px solid;
  border-color: var(--w95-shadow) var(--w95-highlight) var(--w95-highlight) var(--w95-shadow);
  box-shadow: inset 1px 1px 0 var(--w95-darkshadow);
  font-size: 10px;
  font-weight: bold;
  line-height: 11px;
  text-align: center;
  color: #000;
}

html[data-appearance="win95"] .toolbar-sep {
width: 1px;
  height: 18px;
  background: var(--color-border);
  margin: 0 4px;
}

html[data-appearance="win95"] .note-modal__editor {
min-height: 180px;
  max-height: 340px;
  overflow-y: auto;
}

html[data-appearance="win95"] .note-modal__editor .tiptap-inner {
padding: 12px;
  outline: none;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-base);
  line-height: 1.7;
  min-height: 180px;
}

html[data-appearance="win95"] .note-modal__editor .tiptap-inner p.is-editor-empty:first-child::before {
content: attr(data-placeholder);
  color: var(--color-text-disabled);
  pointer-events: none;
  float: left;
  height: 0;
}

html[data-appearance="win95"] .note-modal__editor h2 {
font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  margin: 12px 0 4px;
}

html[data-appearance="win95"] .note-modal__editor code {
font-family: var(--font-mono);
  font-size: 11px;
  background: var(--color-bg-surface-high);
  padding: 1px 4px;
}

html[data-appearance="win95"] .note-modal__editor pre {
background: var(--color-bg-surface-high);
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  overflow-x: auto;
  margin: 8px 0;
}

html[data-appearance="win95"] .note-modal__editor ul, html[data-appearance="win95"] .note-modal__editor ol {
padding-left: 20px;
  margin: 4px 0;
}

html[data-appearance="win95"] .note-modal__checklist-editor {
display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface-low);
  padding: 12px;
  min-height: 120px;
}

html[data-appearance="win95"] .checklist-editor-row {
display: flex;
  align-items: center;
  gap: 8px;
}

html[data-appearance="win95"] .checklist-toggle {
background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  padding: 0;
  flex-shrink: 0;
}

html[data-appearance="win95"] .checklist-toggle .material-symbols-outlined {
font-size: 18px;
}

html[data-appearance="win95"] .checklist-input {
flex: 1;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border-subtle);
  padding: 4px 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-base);
  outline: none;
}

html[data-appearance="win95"] .checklist-input:focus {
border-bottom-color: var(--color-border-focus);
}

html[data-appearance="win95"] .checklist-remove {
background: none;
  border: none;
  color: var(--color-text-disabled);
  cursor: pointer;
  display: flex;
  padding: 0;
  flex-shrink: 0;
}

html[data-appearance="win95"] .checklist-remove:hover {
color: var(--color-error);
}

html[data-appearance="win95"] .checklist-remove .material-symbols-outlined {
font-size: 16px;
}

html[data-appearance="win95"] .add-checklist-btn {
display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  padding: 4px 0;
  margin-top: 4px;
}

html[data-appearance="win95"] .add-checklist-btn:hover {
color: var(--color-primary);
}

html[data-appearance="win95"] .add-checklist-btn .material-symbols-outlined {
font-size: 16px;
}

html[data-appearance="win95"] .note-modal__row {
display: flex;
  align-items: center;
  gap: 16px;
}

html[data-appearance="win95"] .note-modal__label {
font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  width: 72px;
  flex-shrink: 0;
}

html[data-appearance="win95"] .color-picker {
display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

html[data-appearance="win95"] .color-chip {
width: 22px;
  height: 22px;
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.1s, border-color 0.1s;
}

html[data-appearance="win95"] .color-chip:hover {
transform: scale(1.15);
}

html[data-appearance="win95"] .color-chip--active {
border-color: var(--color-text-base) !important;
}

html[data-appearance="win95"] .color-chip--none {
background: var(--color-bg-surface-high);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

html[data-appearance="win95"] .color-chip--none .material-symbols-outlined {
font-size: 14px;
}

html[data-appearance="win95"] .tags-editor {
display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  flex: 1;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface-low);
  padding: 6px 10px;
  min-height: 36px;
}

html[data-appearance="win95"] .tag-chip {
display: flex;
  align-items: center;
  gap: 2px;
  background: var(--color-bg-surface-high);
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-subtle);
  padding: 2px 6px;
}

html[data-appearance="win95"] .tag-remove {
background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  padding: 0;
  margin-left: 2px;
}

html[data-appearance="win95"] .tag-remove:hover {
color: var(--color-error);
}

html[data-appearance="win95"] .tag-remove .material-symbols-outlined {
font-size: 12px;
}

html[data-appearance="win95"] .tag-input {
background: none;
  border: none;
  outline: none;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-base);
  min-width: 80px;
}

html[data-appearance="win95"] .tag-input::placeholder {
color: var(--color-text-disabled);
}

html[data-appearance="win95"] .note-modal__footer {
display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px;
  margin: 0;
  border-top: 1px solid var(--w95-shadow);
  box-shadow: inset 0 1px 0 var(--w95-highlight);
  background: var(--w95-face);
}

html[data-appearance="win95"] .note-modal__save:disabled {
opacity: 0.6;
  cursor: not-allowed;
}

html[data-appearance="win95"] .spinning {
animation: w95-spin 0.8s linear infinite;
  font-size: 16px;
}

@keyframes w95-spin {
to { transform: rotate(360deg); }
}
</style>
