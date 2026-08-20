<template>
  <div
    :class="['note-card', { 'note-card--done': note.status === 'done', 'note-card--pinned': note.isPinned }]"
    :style="cardStyle"
    @click="$emit('edit', note)"
  >
    <!-- Header -->
    <div class="note-card__header">
      <div class="note-card__tags">
        <span
          v-for="tag in note.tags.slice(0, 3)"
          :key="tag"
          class="note-tag"
        >#{{ tag }}</span>
      </div>
      <div class="note-card__actions" @click.stop>
        <button
          class="note-action-btn"
          :title="note.isPinned ? 'Desfijar' : 'Fijar'"
          @click="$emit('pin', note._id)"
        >
          <span class="material-symbols-outlined" :style="{ color: note.isPinned ? 'var(--color-primary)' : '' }">
            {{ note.isPinned ? 'keep' : 'keep_off' }}
          </span>
        </button>
      </div>
    </div>

    <!-- Title -->
    <div v-if="note.title" class="note-card__title">{{ note.title }}</div>

    <!-- Checklist -->
    <div v-if="note.type === 'checklist' && note.checklist.length" class="note-card__checklist" @click.stop>
      <label
        v-for="item in note.checklist.slice(0, 5)"
        :key="item.id"
        class="checklist-item"
        @click.prevent="$emit('toggle-checklist', note._id, item.id)"
      >
        <span class="material-symbols-outlined checklist-icon">
          {{ item.completed ? 'check_box' : 'check_box_outline_blank' }}
        </span>
        <span :class="['checklist-text', { 'checklist-text--done': item.completed }]">{{ item.text }}</span>
      </label>
      <span v-if="note.checklist.length > 5" class="checklist-more">
        +{{ note.checklist.length - 5 }} más
      </span>
    </div>

    <!-- Content preview (plain text stripped from Tiptap HTML) -->
    <div v-else-if="renderedContent" class="note-card__content">{{ renderedContent }}</div>

    <!-- Footer -->
    <div class="note-card__footer" @click.stop>
      <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
      <div class="note-card__footer-actions">
        <button
          class="note-action-btn"
          :title="note.status === 'done' ? 'Reactivar' : 'Completar'"
          @click="$emit('toggle', note._id)"
        >
          <span class="material-symbols-outlined" :style="{ color: note.status === 'done' ? 'var(--color-success)' : '' }">
            {{ note.status === 'done' ? 'undo' : 'check_circle' }}
          </span>
        </button>
        <button class="note-action-btn note-action-btn--danger" title="Eliminar" @click="$emit('remove', note._id)">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import type { PropType } from 'vue'
import type { Note } from '@/api/notes/notes.types'

export default defineComponent({
  name: 'NoteCard',
  props: {
    note: {
      type: Object as PropType<Note>,
      required: true,
    },
  },
  emits: ['edit', 'pin', 'toggle', 'remove', 'toggle-checklist'],
  setup(props) {
    // Use individual border-left properties so borderLeftColor inline style works
    const cardStyle = computed(() => {
      const color = props.note.color
      if (!color) return {}
      return { borderLeftColor: color }
    })

    const renderedContent = computed(() => {
      const html = props.note.content || ''
      // Strip HTML tags from Tiptap output for plain text card preview
      return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 280)
    })

    function formatDate(iso: string) {
      const d = new Date(iso)
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
    }

    return { cardStyle, renderedContent, formatDate }
  },
})
</script>

<style scoped>
.note-card {
  background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border);
  /* Split border-left so inline borderLeftColor style is not overridden by shorthand */
  border-left-width: 3px;
  border-left-style: solid;
  border-left-color: var(--color-border);
  padding: 16px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 120px;
  position: relative;
}

.note-card:hover {
  background: var(--color-bg-surface-container);
  border-color: var(--color-border-focus);
}

.note-card--pinned {
  border-left-color: var(--color-primary) !important;
}

.note-card--done {
  opacity: 0.55;
}

.note-card--done .note-card__title,
.note-card--done .note-card__content {
  text-decoration: line-through;
}

/* Header */
.note-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.note-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.note-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  background: var(--color-bg-surface-high);
  padding: 1px 6px;
  text-transform: lowercase;
}

.note-card__actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.note-card:hover .note-card__actions {
  opacity: 1;
}

/* Title */
.note-card__title {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-base);
  line-height: 1.4;
}

/* Content */
.note-card__content {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--color-text-subtle);
  line-height: 1.6;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

/* Checklist */
.note-card__checklist {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.checklist-icon {
  font-size: 16px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.checklist-text {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-subtle);
}

.checklist-text--done {
  text-decoration: line-through;
  color: var(--color-text-disabled);
}

.checklist-more {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  padding-left: 22px;
}

/* Footer */
.note-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 4px;
  border-top: 1px solid var(--color-border-subtle);
}

.note-date {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
}

.note-card__footer-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.note-card:hover .note-card__footer-actions {
  opacity: 1;
}

/* Action buttons */
.note-action-btn {
  background: none;
  border: none;
  padding: 3px;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.note-action-btn:hover {
  color: var(--color-text-base);
}

.note-action-btn--danger:hover {
  color: var(--color-error);
}

.note-action-btn .material-symbols-outlined {
  font-size: 16px;
}
</style>
