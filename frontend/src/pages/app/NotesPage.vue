<template>
  <div class="notes-page">
    <!-- Header -->
    <header class="notes-header">
      <div class="notes-header__left">
        <h1 class="page-title">Pizarra</h1>
        <span class="notes-count">{{ notesStore.total }} notas</span>
      </div>
      <div class="notes-header__right">
        <div class="filter-dropdown" :class="{ open: projectOpen }">
          <button class="filter-btn" @click="toggleProjectMenu" :title="activeProjectName || 'Todos los proyectos'">
            <span class="material-symbols-outlined">folder</span>
            {{ activeProjectName || 'Proyectos' }}
          </button>
          <div v-if="projectOpen" class="filter-menu project-menu" @click.stop>
            <div class="project-menu-search">
              <span class="material-symbols-outlined">search</span>
              <input
                v-model="projectSearch"
                placeholder="Buscar proyecto..."
                @input="onProjectSearch"
              />
            </div>
            <button
              :class="['filter-item', { 'filter-item--active': !activeProjectId }]"
              @click.stop="selectProject('', '')"
            >
              Todos los proyectos
            </button>
            <div class="project-menu-list" @scroll="onProjectListScroll">
              <button
                v-for="p in projectOptions"
                :key="p._id"
                :class="['filter-item', { 'filter-item--active': activeProjectId === p._id }]"
                @click.stop="selectProject(p._id, p.name)"
              >
                {{ p.name }}
              </button>
              <div v-if="projectLoadingMore" class="filter-item">Cargando más...</div>
            </div>
            <button
              v-if="activeProjectId"
              class="filter-item filter-item--clear"
              @click.stop="selectProject('', '')"
            >
              Limpiar filtro
            </button>
          </div>
        </div>

        <div class="search-wrap">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            v-model="searchQuery"
            class="search-input"
            placeholder="Buscar notas..."
            @input="onSearch"
          />
        </div>

        <div class="filter-dropdown" :class="{ open: filterOpen }">
          <button class="filter-btn" @click="filterOpen = !filterOpen">
            <span class="material-symbols-outlined">filter_list</span>
            {{ currentStatusLabel }}
          </button>
          <div v-if="filterOpen" class="filter-menu" @click="filterOpen = false">
            <button
              v-for="opt in STATUS_OPTIONS"
              :key="String(opt.value)"
              :class="['filter-item', { 'filter-item--active': filters.status === opt.value }]"
              @click.stop="setStatus(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <button class="btn-new" @click="openCreate">
          <span class="material-symbols-outlined">add</span>
          Nueva nota
        </button>

        <div class="view-toggle">
          <button
            :class="['view-btn', { 'view-btn--active': notesStore.view === 'grid' }]"
            title="Vista grilla"
            @click="notesStore.setView('grid')"
          >
            <span class="material-symbols-outlined">grid_view</span>
          </button>
          <button
            :class="['view-btn', { 'view-btn--active': notesStore.view === 'list' }]"
            title="Vista lista"
            @click="notesStore.setView('list')"
          >
            <span class="material-symbols-outlined">view_list</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="notesStore.loading && !notesStore.items.length" class="notes-loading">
      <span class="material-symbols-outlined spinning">sync</span>
      Cargando pizarra...
    </div>

    <!-- Empty state -->
    <div v-else-if="!notesStore.items.length" class="notes-empty">
      <span class="material-symbols-outlined notes-empty__icon">edit_note</span>
      <p class="notes-empty__title">{{ activeProjectId ? 'Sin notas en este proyecto' : 'La pizarra está vacía' }}</p>
      <p class="notes-empty__sub">Anotá ideas, bugs, pendientes o lo que sea</p>
      <button class="btn-new" @click="openCreate">
        <span class="material-symbols-outlined">add</span>
        Primera nota
      </button>
    </div>

    <template v-else>
      <!-- Pinned -->
      <div v-if="notesStore.pinnedNotes.length" class="notes-section">
        <div class="section-label">
          <span class="material-symbols-outlined section-icon">keep</span>
          Fijadas
        </div>
        <div v-if="notesStore.view === 'grid'" class="notes-grid">
          <note-card
            v-for="note in notesStore.pinnedNotes"
            :key="note._id"
            :note="note"
            @edit="openEdit"
            @pin="handlePin"
            @toggle="handleToggle"
            @remove="handleRemove"
            @toggle-checklist="handleToggleChecklist"
          />
        </div>
        <div v-else class="notes-list">
          <div
            v-for="note in notesStore.pinnedNotes"
            :key="note._id"
            :class="['note-list-row', { 'note-list-row--done': note.status === 'done' }]"
            @click="openEdit(note)"
          >
            <button class="list-action-btn" @click.stop="handleToggle(note._id)">
              <span class="material-symbols-outlined" :style="{ color: note.status === 'done' ? 'var(--color-success)' : 'var(--color-text-muted)' }">
                {{ note.status === 'done' ? 'check_circle' : 'radio_button_unchecked' }}
              </span>
            </button>
            <div v-if="note.color" class="note-list-row__color" :style="{ background: note.color }"></div>
            <span class="note-list-row__title">{{ note.title || plainText(note.content) || '(Sin contenido)' }}</span>
            <div class="note-list-row__tags">
              <span v-for="tag in note.tags.slice(0, 3)" :key="tag" class="note-tag">#{{ tag }}</span>
            </div>
            <button class="list-action-btn" @click.stop="handlePin(note._id)">
              <span class="material-symbols-outlined" :style="{ color: note.isPinned ? 'var(--color-primary)' : '' }">keep</span>
            </button>
            <button class="list-action-btn list-action-btn--danger" @click.stop="handleRemove(note._id)">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Active -->
      <div v-if="notesStore.activeNotes.length" class="notes-section">
        <div v-if="notesStore.pinnedNotes.length" class="section-label">
          <span class="material-symbols-outlined section-icon">notes</span>
          Notas
        </div>
        <div v-if="notesStore.view === 'grid'" class="notes-grid">
          <note-card
            v-for="note in notesStore.activeNotes"
            :key="note._id"
            :note="note"
            @edit="openEdit"
            @pin="handlePin"
            @toggle="handleToggle"
            @remove="handleRemove"
            @toggle-checklist="handleToggleChecklist"
          />
        </div>
        <div v-else class="notes-list">
          <div
            v-for="note in notesStore.activeNotes"
            :key="note._id"
            :class="['note-list-row', { 'note-list-row--done': note.status === 'done' }]"
            @click="openEdit(note)"
          >
            <button class="list-action-btn" @click.stop="handleToggle(note._id)">
              <span class="material-symbols-outlined" :style="{ color: note.status === 'done' ? 'var(--color-success)' : 'var(--color-text-muted)' }">
                {{ note.status === 'done' ? 'check_circle' : 'radio_button_unchecked' }}
              </span>
            </button>
            <div v-if="note.color" class="note-list-row__color" :style="{ background: note.color }"></div>
            <span class="note-list-row__title">{{ note.title || plainText(note.content) || '(Sin contenido)' }}</span>
            <div class="note-list-row__tags">
              <span v-for="tag in note.tags.slice(0, 3)" :key="tag" class="note-tag">#{{ tag }}</span>
            </div>
            <button class="list-action-btn" @click.stop="handlePin(note._id)">
              <span class="material-symbols-outlined" :style="{ color: note.isPinned ? 'var(--color-primary)' : '' }">keep</span>
            </button>
            <button class="list-action-btn list-action-btn--danger" @click.stop="handleRemove(note._id)">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Done -->
      <div v-if="notesStore.doneNotes.length && filters.status !== 'active'" class="notes-section notes-section--done">
        <button class="done-toggle" @click="doneExpanded = !doneExpanded">
          <span class="material-symbols-outlined done-toggle__icon">
            {{ doneExpanded ? 'expand_less' : 'expand_more' }}
          </span>
          <span class="section-label-inline">
            <span class="material-symbols-outlined section-icon">check_circle</span>
            Completadas ({{ notesStore.doneNotes.length }})
          </span>
        </button>
        <template v-if="doneExpanded">
          <div v-if="notesStore.view === 'grid'" class="notes-grid">
            <note-card
              v-for="note in notesStore.doneNotes"
              :key="note._id"
              :note="note"
              @edit="openEdit"
              @pin="handlePin"
              @toggle="handleToggle"
              @remove="handleRemove"
              @toggle-checklist="handleToggleChecklist"
            />
          </div>
          <div v-else class="notes-list">
            <div
              v-for="note in notesStore.doneNotes"
              :key="note._id"
              :class="['note-list-row', { 'note-list-row--done': note.status === 'done' }]"
              @click="openEdit(note)"
            >
              <button class="list-action-btn" @click.stop="handleToggle(note._id)">
                <span class="material-symbols-outlined" :style="{ color: 'var(--color-success)' }">check_circle</span>
              </button>
              <div v-if="note.color" class="note-list-row__color" :style="{ background: note.color }"></div>
              <span class="note-list-row__title">{{ note.title || plainText(note.content) || '(Sin contenido)' }}</span>
              <div class="note-list-row__tags">
                <span v-for="tag in note.tags.slice(0, 3)" :key="tag" class="note-tag">#{{ tag }}</span>
              </div>
              <button class="list-action-btn list-action-btn--danger" @click.stop="handleRemove(note._id)">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- Modal -->
    <note-edit-modal
      :is-open="modalOpen"
      :note="editingNote"
      :default-project-id="activeProjectId"
      @close="modalOpen = false"
      @saved="handleSaved"
    />

    <!-- Confirm delete -->
    <w-confirm-modal
      :is-open="confirmDeleteOpen"
      title="Eliminar nota"
      message="¿Estás seguro? Esta acción no se puede deshacer."
      confirm-text="Eliminar"
      :is-danger="true"
      @confirm="confirmDelete"
      @cancel="confirmDeleteOpen = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNotesStore } from '@/stores/notes.store'
import { projectsApi } from '@/api/projects/projects.api'
import type { Project } from '@/api/projects/projects.types'
import NoteCard from '@/components/notes/NoteCard.vue'
import NoteEditModal from '@/components/notes/NoteEditModal.vue'
import WConfirmModal from '@/components/ui/WConfirmModal.vue'
import type { Note, CreateNoteDto, UpdateNoteDto, NoteQueryDto } from '@/api/notes/notes.types'

const STATUS_OPTIONS = [
  { value: undefined as 'active' | 'done' | undefined, label: 'Todas' },
  { value: 'active' as const, label: 'Activas' },
  { value: 'done' as const, label: 'Completadas' },
]

export default defineComponent({
  name: 'NotesPage',
  components: { NoteCard, NoteEditModal, WConfirmModal },

  setup() {
    const notesStore = useNotesStore()

    const modalOpen = ref(false)
    const editingNote = ref<Note | null>(null)
    const confirmDeleteOpen = ref(false)
    const deletingId = ref<string | null>(null)
    const doneExpanded = ref(false)
    const filterOpen = ref(false)
    const searchQuery = ref('')
    const filters = ref<NoteQueryDto>({})
    const projectOpen = ref(false)
    const activeProjectId = ref('')
    const activeProjectName = ref('')
    const projectSearch = ref('')
    const projectOptions = ref<Project[]>([])
    const projectPage = ref(1)
    const projectHasMore = ref(true)
    const projectLoadingMore = ref(false)
    const PROJECT_PAGE_SIZE = 20

    let searchTimeout: ReturnType<typeof setTimeout>
    let projectSearchTimeout: ReturnType<typeof setTimeout>

    onMounted(async () => {
      const routeProjectId = useRoute().query.projectId as string | undefined
      if (routeProjectId) {
        try {
          const { data } = await projectsApi.getById(routeProjectId)
          activeProjectId.value = data._id
          activeProjectName.value = data.name
          filters.value.projectId = data._id
        } catch {
          // proyecto inválido: se ignora y se muestra todo
        }
      }
      await notesStore.setFilters({ ...filters.value })
    })

    const currentStatusLabel = computed(() => {
      const opt = STATUS_OPTIONS.find(o => o.value === filters.value.status)
      return opt?.label ?? 'Todas'
    })

    function plainText(html: string) {
      return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)
    }

    function onSearch() {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        filters.value.search = searchQuery.value || undefined
        notesStore.setFilters({ ...filters.value })
      }, 300)
    }

    function setStatus(value: 'active' | 'done' | undefined) {
      filters.value.status = value
      filterOpen.value = false
      notesStore.setFilters({ ...filters.value })
    }

    async function fetchProjects(reset: boolean) {
      if (reset) {
        projectPage.value = 1
        projectHasMore.value = true
      }
      if (!projectHasMore.value) return
      projectLoadingMore.value = true
      try {
        const { data } = await projectsApi.getAll({
          search: projectSearch.value || undefined,
          page: projectPage.value,
          limit: PROJECT_PAGE_SIZE,
        } as any)
        projectOptions.value = reset ? data.data : [...projectOptions.value, ...data.data]
        projectHasMore.value = data.data.length >= PROJECT_PAGE_SIZE
        projectPage.value += 1
      } catch {
        if (reset) projectOptions.value = []
      } finally {
        projectLoadingMore.value = false
      }
    }

    function onProjectSearch() {
      clearTimeout(projectSearchTimeout)
      projectSearchTimeout = setTimeout(() => {
        void fetchProjects(true)
      }, 250)
    }

    function onProjectListScroll(e: Event) {
      const el = e.target as HTMLElement
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40 && !projectLoadingMore.value) {
        void fetchProjects(false)
      }
    }

    function toggleProjectMenu() {
      projectOpen.value = !projectOpen.value
      if (projectOpen.value && !projectOptions.value.length) {
        void fetchProjects(true)
      }
    }

    function selectProject(id: string, name: string) {
      activeProjectId.value = id
      activeProjectName.value = name
      projectOpen.value = false
      if (id) filters.value.projectId = id
      else delete filters.value.projectId
      notesStore.setFilters({ ...filters.value })
    }

    function openCreate() {
      editingNote.value = null
      modalOpen.value = true
    }

    function openEdit(note: Note) {
      editingNote.value = note
      modalOpen.value = true
    }

    async function handleSaved(payload: CreateNoteDto | UpdateNoteDto) {
      if (editingNote.value) {
        await notesStore.update(editingNote.value._id, payload as UpdateNoteDto)
      } else {
        await notesStore.create(payload as CreateNoteDto)
      }
      modalOpen.value = false
    }

    async function handlePin(id: string) {
      await notesStore.pin(id)
    }

    async function handleToggle(id: string) {
      await notesStore.toggle(id)
    }

    function handleRemove(id: string) {
      deletingId.value = id
      confirmDeleteOpen.value = true
    }

    async function confirmDelete() {
      if (deletingId.value) {
        await notesStore.remove(deletingId.value)
        deletingId.value = null
      }
      confirmDeleteOpen.value = false
    }

    async function handleToggleChecklist(noteId: string, itemId: string) {
      const note = notesStore.items.find(n => n._id === noteId)
      if (!note) return
      const checklist = note.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item,
      )
      await notesStore.update(noteId, { checklist })
    }

    return {
      notesStore,
      modalOpen,
      editingNote,
      confirmDeleteOpen,
      doneExpanded,
      filterOpen,
      searchQuery,
      filters,
      projectOpen,
      activeProjectId,
      activeProjectName,
      projectSearch,
      projectOptions,
      projectLoadingMore,
      onProjectSearch,
      onProjectListScroll,
      toggleProjectMenu,
      selectProject,
      STATUS_OPTIONS,
      currentStatusLabel,
      plainText,
      onSearch,
      setStatus,
      openCreate,
      openEdit,
      handleSaved,
      handlePin,
      handleToggle,
      handleRemove,
      confirmDelete,
      handleToggleChecklist,
    }
  },
})
</script>

<style scoped>
.notes-page {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100%;
}

/* Header */
.notes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 16px;
  flex-wrap: wrap;
}

.notes-header__left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-title {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: var(--color-text-base);
  margin: 0;
}

.notes-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.notes-header__right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* Search */
.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border);
  padding: 0 12px;
  height: 36px;
  min-width: 200px;
}

.search-icon {
  font-size: 16px;
  color: var(--color-text-muted);
}

.search-input {
  background: none;
  border: none;
  outline: none;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-base);
  width: 100%;
}

.search-input::placeholder {
  color: var(--color-text-disabled);
}

/* Filter */
.filter-dropdown {
  position: relative;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-btn:hover,
.filter-dropdown.open .filter-btn {
  border-color: var(--color-border-focus);
  color: var(--color-text-base);
}

.filter-btn .material-symbols-outlined {
  font-size: 16px;
}

.filter-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  z-index: 50;
  min-width: 140px;
}

.filter-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: none;
  border: none;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.filter-item:hover {
  background: var(--color-bg-surface-high);
  color: var(--color-text-base);
}

.filter-item--active {
  color: var(--color-primary);
}

.filter-menu.project-menu {
  min-width: 220px;
  max-width: 280px;
}

.project-menu-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
}

.project-menu-search .material-symbols-outlined {
  font-size: 14px;
  color: var(--color-text-muted);
}

.project-menu-search input {
  background: none;
  border: none;
  outline: none;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-base);
  width: 100%;
}

.project-menu-list {
  max-height: 240px;
  overflow-y: auto;
}

.filter-item--clear {
  border-top: 1px solid var(--color-border);
  color: var(--color-warning);
}

/* New note button */
.btn-new {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  background: var(--color-primary);
  border: none;
  color: white;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-new:hover {
  background: var(--color-primary-hover);
}

.btn-new .material-symbols-outlined {
  font-size: 16px;
}

/* View toggle */
.view-toggle {
  display: flex;
  border: 1px solid var(--color-border);
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--color-bg-surface-low);
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.view-btn + .view-btn {
  border-left: 1px solid var(--color-border);
}

.view-btn:hover {
  background: var(--color-bg-surface-high);
  color: var(--color-text-base);
}

.view-btn--active {
  background: var(--color-primary);
  color: white;
}

.view-btn .material-symbols-outlined {
  font-size: 18px;
}

/* Loading / Empty */
.notes-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
  padding: 48px 0;
}

.notes-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 0;
  text-align: center;
}

.notes-empty__icon {
  font-size: 56px;
  color: var(--color-text-disabled);
}

.notes-empty__title {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin: 0;
}

.notes-empty__sub {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-disabled);
  margin: 0 0 8px;
}

/* Sections */
.notes-section {
  margin-bottom: 32px;
}

.notes-section--done {
  opacity: 0.75;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}

.section-icon {
  font-size: 14px;
}

.done-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-bottom: 12px;
}

.done-toggle__icon {
  font-size: 16px;
  color: var(--color-text-muted);
}

.section-label-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}

/* Grid */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

/* List */
.notes-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
}

.note-list-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border-subtle);
  cursor: pointer;
  transition: background 0.1s;
  background: var(--color-bg-surface);
}

.note-list-row:last-child {
  border-bottom: none;
}

.note-list-row:hover {
  background: var(--color-bg-surface-low);
}

.note-list-row--done .note-list-row__title {
  text-decoration: line-through;
  color: var(--color-text-disabled);
}

.note-list-row__color {
  width: 4px;
  height: 20px;
  flex-shrink: 0;
}

.note-list-row__title {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-list-row__tags {
  display: flex;
  gap: 4px;
}

.note-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  background: var(--color-bg-surface-high);
  padding: 1px 6px;
}

.list-action-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  padding: 4px;
  transition: color 0.1s;
  flex-shrink: 0;
}

.list-action-btn:hover {
  color: var(--color-text-base);
}

.list-action-btn--danger:hover {
  color: var(--color-error);
}

.list-action-btn .material-symbols-outlined {
  font-size: 16px;
}

/* Spinner */
.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile */
@media (max-width: 640px) {
  .notes-page {
    padding: 16px;
  }

  .notes-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .notes-header__right {
    width: 100%;
  }

  .search-wrap {
    flex: 1;
    min-width: 0;
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
