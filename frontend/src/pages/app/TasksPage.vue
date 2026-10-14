<template>
  <div class="kanban-page">
    <header class="kanban-header">
      <div class="header-left">
        <h1 class="page-title">Tareas</h1>

        <button
          v-if="activeProjectId"
          class="change-project-btn"
          @click="backToProjectPicker"
        >
          <win-icon name="folder" :size="16" />
          {{ activeProjectName || 'Cambiar proyecto' }}
          <span class="change-project-icon">↔</span>
        </button>
      </div>

      <button
        v-if="activeProjectId"
        class="add-column-btn"
        @click="openAddColumn"
      >
        <win-icon name="folder" :size="16" />
        Nueva columna
      </button>

      <div v-if="activeProjectId" class="board-filters">
        <input v-model="boardSearch" class="board-search" placeholder="Filtrar tarjetas..." @input="onBoardSearch" />
        <label class="archived-toggle"><input type="checkbox" v-model="showArchived" @change="reloadBoard" /> Archivadas</label>
      </div>

      <div v-if="activeProjectId" class="board-view-toggle" role="group" aria-label="Vista del tablero">
        <button
          :class="['view-btn', { 'view-btn--active': boardView === 'kanban' }]"
          title="Vista kanban"
          @click="setBoardView('kanban')"
        >
          <win-icon material="view_kanban" :size="16" />
        </button>
        <button
          :class="['view-btn', { 'view-btn--active': boardView === 'list' }]"
          title="Vista lista"
          @click="setBoardView('list')"
        >
          <win-icon material="view_list" :size="16" />
        </button>
      </div>
    </header>

    <div v-if="!activeProjectId" class="project-picker">
      <div class="project-picker-search">
        <win-icon name="search" :size="16" />
        <input
          type="text"
          v-model="projectSearch"
          placeholder="Buscar proyecto por nombre..."
          @input="handleProjectSearch"
        />
      </div>

      <div
        v-if="projectPickerLoading && !projectPickerOptions.length"
        class="project-picker-state"
      >
        <win-icon name="hourglass" :size="16" class="spinning" />
        Cargando proyectos...
      </div>

      <div
        v-else-if="!projectPickerOptions.length"
        class="project-picker-state"
      >
        <win-icon name="folder" :size="32" class="empty-icon" />
        <h2>No se encontraron proyectos</h2>
      </div>

      <div v-else class="project-cards-grid" @scroll="handleProjectGridScroll">
        <button
          v-for="project in projectPickerOptions"
          :key="project._id"
          type="button"
          class="project-card"
          @click="onProjectChange(project._id, project.name)"
        >
          <win-icon name="folder" :size="24" class="project-card-icon" />
          <span class="project-card-name">{{ project.name }}</span>
          <w-badge :color="getStatusColor(project.status)">{{ getStatusLabel(project.status) }}</w-badge>
        </button>
        <div v-if="projectPickerLoadingMore" class="project-picker-state project-picker-state--inline">
          <win-icon name="hourglass" :size="16" class="spinning" />
          Cargando más...
        </div>
      </div>
    </div>

    <div v-else-if="columnsStore.loading" class="kanban-loading">
      <win-icon name="hourglass" :size="16" class="spinning" />
      Cargando tablero...
    </div>

    <div v-else-if="boardView === 'list'" class="task-list-container">
      <div
        v-for="column in columnsStore.columns"
        :key="column._id"
        class="task-list-group"
      >
        <div class="task-list-group-header">
          <span class="column-dot" :style="{ background: column.color }"></span>
          <span class="task-list-group-name">{{ column.name }}</span>
          <span class="column-count">{{ columnsData[column._id]?.length || 0 }}</span>
          <button class="col-btn" title="Agregar tarea" @click="startQuickAdd(column._id)">
            <span>+</span>
          </button>
        </div>
        <div v-if="quickAddColumnId === column._id" class="quick-add-card quick-add-card--list">
          <textarea
            ref="quickAddInputRef"
            v-model="quickAddTitle"
            class="quick-add-input"
            placeholder="Ingresá el título de la tarea..."
            rows="2"
            @keydown.enter.prevent="confirmQuickAdd"
            @keydown.esc="cancelQuickAdd"
          ></textarea>
          <div class="quick-add-actions">
            <button class="btn-primary" @click="confirmQuickAdd">Agregar tarjeta</button>
            <button class="col-btn" @click="cancelQuickAdd">
              <span>×</span>
            </button>
          </div>
        </div>
        <div
          v-for="task in (columnsData[column._id] || [])"
          :key="task._id"
          :class="['task-list-row', { 'is-done': task.status === 'done' }]"
          @click="openViewTask(task, column._id)"
        >
          <button
            class="card-complete-btn"
            :class="{ 'is-done': task.status === 'done' }"
            :title="task.status === 'done' ? 'Desmarcar completada' : 'Marcar como completada'"
            @click.stop="toggleCompleteTask(task)"
          >
<win-icon :material="task.status === 'done' ? 'check_circle' : 'radio_button_unchecked'" :size="16" />
          </button>
          <span class="task-list-title">{{ task.title }}</span>
          <span
            v-for="(label, lIdx) in (task.labels || []).slice(0, 2)"
            :key="lIdx"
            class="card-label-mini"
            :style="{ backgroundColor: label.color, color: getLabelTextColor(label.color) }"
          >{{ label.name }}</span>
          <span class="card-priority" :class="`priority-${task.priority}`">{{ task.priority }}</span>
          <span v-if="task.dueDate" class="card-due" :class="getDueDateClass(task)">
            <win-icon name="clock" :size="16" />
            {{ formatCalendarDate(task.dueDate) }}
          </span>
          <button class="card-action-btn" title="Eliminar" @click.stop="confirmDeleteTask(task)">
            <win-icon name="recycle" :size="16" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="kanban-board-container">
      <draggable
        v-model="columnsStore.columns"
        item-key="_id"
        class="kanban-board"
        handle=".column-header"
        :delay="150"
        :delay-on-touch-only="true"
        @change="onColumnReorder"
      >
        <template #item="{ element: column }">
          <div class="kanban-column" :style="{ '--col-color': column.color }">
            <!-- Column header -->
            <div class="column-header">
              <div class="column-title-row">
                <span class="column-name">{{ column.name }}</span>
                <span class="column-count">{{ columnsData[column._id]?.length || 0 }}</span>
              </div>
              <div class="column-header-actions">
                <button class="col-btn" title="Agregar tarea" @click.stop="startQuickAdd(column._id)">
                  <span>+</span>
                </button>
                <button class="col-btn" title="Opciones" @click.stop="toggleColumnMenu(column)">
                  <span>•••</span>
                </button>
              </div>
            </div>

            <!-- Column dropdown menu -->
            <div v-if="columnMenuColumn?._id === column._id" class="column-menu-dropdown" @click.stop>
              <button class="dropdown-item" @click="openEditColumn(column); columnMenuColumn = null">
                <win-icon name="paint" :size="16" /> Editar columna
              </button>
              <button class="dropdown-item dropdown-item--danger" @click="confirmDeleteColumn(column); columnMenuColumn = null">
                <win-icon name="recycle" :size="16" /> Eliminar columna
              </button>
            </div>

            <!-- Task cards -->
            <draggable
              v-model="columnsData[column._id]"
              group="tasks"
              item-key="_id"
              class="column-cards"
              :delay="150"
              :delay-on-touch-only="true"
              @change="onTaskMove($event, column._id)"
            >
              <template #item="{ element: task }">
                <div
                  class="kanban-card"
                  :class="{ 'is-done': task.status === 'done' }"
                  @click="openViewTask(task, column._id)"
                >
                  <!-- Cover strip (color del primer label) -->
                  <div
                    v-if="coverImage(task)"
                    class="card-cover-img"
                  ><img :src="coverImage(task)" alt="" /></div>
                  <div
                    v-else-if="task.coverColor || (task.labels && task.labels.length > 0)"
                    class="card-cover-strip"
                    :style="{ background: task.coverColor || task.labels[0].color }"
                  ></div>

                  <!-- Labels -->
                  <div v-if="task.labels && task.labels.length > 0" class="card-labels">
                    <span
                      v-for="(label, lIdx) in task.labels"
                      :key="lIdx"
                      class="card-label-mini"
                      :style="{ backgroundColor: label.color, color: getLabelTextColor(label.color) }"
                    >{{ label.name }}</span>
                  </div>

                  <!-- Header: título + menú ... -->
                  <div class="card-header">
                    <span class="card-title">{{ task.title }}</span>
                    <div class="card-menu">
                      <button class="card-action-btn" @click.stop="openCardMenu(task)">
                        <span>•••</span>
                      </button>
                    </div>
                  </div>

                  <!-- Card dropdown menu -->
                  <div v-if="cardMenuTask?._id === task._id" class="card-menu-dropdown" @click.stop>
                    <button class="dropdown-item" @click="openEditTask(task, column._id); cardMenuTask = null">
                      <win-icon name="paint" :size="16" /> Editar
                    </button>
                    <button class="dropdown-item" @click="duplicateTask(task); cardMenuTask = null">
                      <win-icon name="notepad-file" :size="16" /> Duplicar
                    </button>
                    <button class="dropdown-item" @click="archiveTask(task, true); cardMenuTask = null">
                      <win-icon name="folder" :size="16" /> Archivar
                    </button>
                    <button
                      v-if="activeProjectHasRepo"
                      class="dropdown-item"
                      @click="createBranchForTask(task); cardMenuTask = null"
                    >
                      <win-icon name="network" :size="16" /> Crear branch
                    </button>
                    <button class="dropdown-item dropdown-item--danger" @click="confirmDeleteTask(task); cardMenuTask = null">
                      <win-icon name="recycle" :size="16" /> Eliminar
                    </button>
                  </div>

                  <!-- Description preview -->
                  <div v-if="task.description" class="card-description ql-content" v-html="task.description"></div>

                  <!-- Checklist progress bar -->
                  <div v-if="task.checklist && task.checklist.length > 0" class="card-checklist">
                    <span
                      class="checklist-count-label"
                      :class="{ 'is-complete': getChecklistProgress(task) === 100 }"
                    >
                      {{ task.checklist.filter(i => i.completed).length }}/{{ task.checklist.length }}
                    </span>
                    <div class="checklist-progress-bar">
                      <div
                        class="checklist-progress-fill"
                        :class="{ 'is-complete': getChecklistProgress(task) === 100 }"
                        :style="{ width: getChecklistProgress(task) + '%' }"
                      ></div>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div class="card-footer">
                    <button
                      class="card-complete-btn"
                      :class="{ 'is-done': task.status === 'done' }"
                      :title="task.status === 'done' ? 'Desmarcar completada' : 'Marcar como completada'"
                      @click.stop="toggleCompleteTask(task)"
                    >
<win-icon :material="task.status === 'done' ? 'check_circle' : 'radio_button_unchecked'" :size="16" />
                    </button>
                    <span class="card-priority" :class="`priority-${task.priority}`">{{ task.priority }}</span>
                    <div class="card-footer-right">
                      <span v-if="task.description" class="card-desc-icon" title="Tiene descripción">
                        <win-icon name="file-lines" :size="16" />
                      </span>
                      <span v-if="task.commentsCount" class="card-badge" title="Comentarios">💬 {{ task.commentsCount }}</span>
                      <span v-if="task.attachments && task.attachments.length" class="card-badge" title="Adjuntos">📎 {{ task.attachments.length }}</span>
                      <span v-if="(task.memberIds && task.memberIds.length) || task.assigneeId" class="card-badge" title="Miembros">👥 {{ (task.memberIds?.length || 0) + (task.assigneeId ? 1 : 0) }}</span>
                      <span v-if="task.dueDate" class="card-due" :class="getDueDateClass(task)">
                        <win-icon name="clock" :size="16" />
                        {{ formatCalendarDate(task.dueDate) }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>

            <!-- Quick-add inline -->
            <div v-if="quickAddColumnId === column._id" class="quick-add-card">
              <textarea
                ref="quickAddInputRef"
                v-model="quickAddTitle"
                class="quick-add-input"
                placeholder="Ingresá el título de la tarea..."
                rows="2"
                @keydown.enter.prevent="confirmQuickAdd"
                @keydown.esc="cancelQuickAdd"
              ></textarea>
              <div class="quick-add-actions">
                <button class="btn-primary" @click="confirmQuickAdd">Agregar tarjeta</button>
                <button class="col-btn" @click="cancelQuickAdd">
                  <span>×</span>
                </button>
              </div>
            </div>
            <button v-else class="add-card-btn" @click="startQuickAdd(column._id)">
              Agregar una tarjeta
            </button>
          </div>
        </template>
      </draggable>

      <div v-if="columnsStore.columns.length === 0" class="empty-board">
        <win-icon name="calendar" :size="32" class="empty-icon" />
        <h3>Sin columnas</h3>
        <p>Creá la primera columna para este tablero o copialas de otro proyecto</p>
        <div class="empty-board-actions">
          <button class="add-column-btn" @click="openAddColumn">
            CREAR COLUMNA
          </button>
          <button class="btn-secondary" @click="openCopyColumns">
            <win-icon name="notepad-file" :size="16" />
            COPIAR DE OTRO PROYECTO
          </button>
        </div>
      </div>

      <div
        v-if="columnsStore.columns.length > 0"
        class="add-column-placeholder"
        @click="openAddColumn"
      >
        <span>Nueva columna</span>
      </div>
    </div>

    <!-- Column Modal -->
    <div v-if="showColumnModal" class="modal-overlay" @click.self="showColumnModal = false">
      <div class="modal-box">
        <h3 class="modal-title">{{ editingColumn ? 'Editar columna' : 'Nueva columna' }}</h3>
        <div class="modal-form">
          <div class="form-group" :class="{ 'has-error': columnErrors.name }">
            <label>Nombre <span class="required-mark">*</span></label>
            <input v-model="columnForm.name" type="text" placeholder="Ej: En revisión" @input="columnErrors.name = ''" />
            <span v-if="columnErrors.name" class="field-error">
              <win-icon name="error" :size="16" />{{ columnErrors.name }}
            </span>
          </div>
          <div class="form-group">
            <label>Color</label>
            <div class="color-picker">
              <button
                v-for="c in COLUMN_COLORS"
                :key="c"
                class="color-swatch"
                :class="{ active: columnForm.color === c }"
                :style="{ background: c }"
                @click="columnForm.color = c"
              ></button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showColumnModal = false">Cancelar</button>
          <button class="btn-primary" :disabled="columnsStore.loading" @click="saveColumn">
            {{ columnsStore.loading ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Copy Columns Modal -->
    <div v-if="showCopyModal" class="modal-overlay" @click.self="showCopyModal = false">
      <div class="modal-box">
        <h3 class="modal-title">Copiar columnas de otro proyecto</h3>
        <div class="modal-form">
          <div class="form-group">
            <label>Buscar proyecto origen</label>
            <input v-model="copySearch" type="text" placeholder="Nombre del proyecto..." @input="onCopySearch" />
          </div>
          <div v-if="copyLoading" class="copy-loading">
            <win-icon name="hourglass" :size="16" class="spinning" />
            Cargando proyectos...
          </div>
          <div v-else-if="!copyOptions.length" class="copy-empty">Sin proyectos para copiar</div>
          <div v-else class="copy-list">
            <button
              v-for="p in copyOptions"
              :key="p._id"
              type="button"
              :class="['copy-item', { 'copy-item--active': copySourceId === p._id }]"
              @click="copySourceId = p._id"
            >
              <win-icon name="folder" :size="16" />
              {{ p.name }}
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCopyModal = false">Cancelar</button>
          <button class="btn-primary" :disabled="!copySourceId || copySaving" @click="confirmCopyColumns">
            {{ copySaving ? 'Copiando...' : 'Copiar columnas' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Task Report Modal -->
    <div v-if="showReportModal" class="modal-overlay" @click.self="showReportModal = false">
      <div class="modal-box modal-box--report">
        <div class="report-modal-header">
          <h3 class="modal-title" style="border:none;padding:0;">
            <span class="done-icon"></span> Tarea completada
          </h3>
          <button class="col-btn" @click="showReportModal = false">
            <span>×</span>
          </button>
        </div>

        <div v-if="reportLoading" class="report-loading">
          <win-icon name="hourglass" :size="16" class="spinning" />
          Generando reporte...
        </div>

        <div v-else-if="reportData" class="report-body">
          <div class="report-task-info">
            <span class="report-task-title">{{ reportData.task.title }}</span>
            <span v-if="reportData.project" class="report-project">
              <win-icon name="folder" :size="16" />{{ reportData.project.name }}
            </span>
          </div>

          <!-- WhatsApp -->
          <div class="report-section">
            <div class="report-section-label">
              <win-icon name="mail" :size="16" class="report-section-icon whatsapp-icon" />
              <span>Mensaje para WhatsApp</span>
              <span v-if="!reportData.client?.phone" class="report-no-contact">Sin teléfono registrado</span>
              <span v-else class="report-contact-info">{{ reportData.client.phone }}</span>
            </div>
            <textarea v-model="editableWhatsappText" class="report-textarea" rows="8" />
            <div class="report-section-actions">
              <button class="btn-secondary btn-icon" @click="copyWhatsapp">
                <win-icon name="notepad-file" :size="16" />
                {{ whatsappCopied ? '¡Copiado!' : 'Copiar' }}
              </button>
              <a
                v-if="reportData.client?.phone"
                :href="buildWhatsappUrl()"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-primary btn-icon whatsapp-btn"
              >
                <win-icon name="search" :size="16" />
                Abrir WhatsApp
              </a>
            </div>
          </div>

          <!-- Email -->
          <div class="report-section">
            <div class="report-section-label">
              <win-icon name="mail" :size="16" class="report-section-icon" />
              <span>Email al cliente</span>
              <span v-if="reportData.client?.email" class="report-contact-info">{{ reportData.client.email }}</span>
              <span v-else class="report-no-contact">Sin email registrado</span>
            </div>
            <div v-if="reportData.emailSent" class="report-email-sent">
              <win-icon name="check" :size="16" />
              Email enviado correctamente
            </div>
            <button
              v-else-if="reportData.client?.email"
              class="btn-primary btn-icon"
              :disabled="sendingEmail"
              @click="sendEmail"
            >
              <win-icon name="mail" :size="16" />
              {{ sendingEmail ? 'Enviando...' : 'Enviar email al cliente' }}
            </button>
            <p v-else class="report-no-action">Agregá el email del cliente desde la sección Clientes para poder enviarle un email.</p>
          </div>
        </div>
      </div>
    </div>

    <TaskModal
      v-model="showTaskModal"
      :view-mode="viewMode"
      :task="editingTask"
      :loading="savingTask"
      @save="saveTaskFromModal"
      @task-updated="onTaskUpdatedFromModal"
    />
    <w-confirm-modal
      :is-open="!!deleteColumnTarget"
      title="Eliminar columna"
      :message="deleteColumnMsg"
      confirm-text="Eliminar"
      :is-danger="true"
      @confirm="doDeleteColumn"
      @cancel="deleteColumnTarget = null"
    />
    <w-confirm-modal
      :is-open="!!deleteTaskTarget"
      title="Eliminar tarea"
      :message="`¿Eliminar &quot;${deleteTaskTarget?.title}&quot;?`"
      confirm-text="Eliminar"
      :is-danger="true"
      @confirm="doDeleteTask"
      @cancel="deleteTaskTarget = null"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import draggable from 'vuedraggable'
import { tasksApi } from '@/api/tasks/tasks.api'
import { taskColumnsApi } from '@/api/task-columns/task-columns.api'
import TaskModal from '@/components/tasks/TaskModal.vue'
import WConfirmModal from '@/components/ui/WConfirmModal.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WinIcon from '@/components/win95/WinIcon.vue'
import { useToast } from '@/composables/useToast'
import type { TaskColumn } from '@/api/task-columns/task-columns.types'
import type { Task, CompleteTaskResponse } from '@/api/tasks/tasks.types'
import type { Project } from '@/api/projects/projects.types'
import { useTaskColumnsStore } from '@/stores/task-columns.store'
import { useTasksStore } from '@/stores/tasks.store'
import { formatCalendarDate } from '@/utils/date'
import { useProjectsStore } from '@/stores/projects.store'
import { useGithubStore } from '@/stores/github.store'
import { projectsApi } from '@/api/projects/projects.api'
import { useBoardSocket } from '@/composables/useBoardSocket'
import { baseURL } from '@/api/axios.config'

const PROJECT_PAGE_SIZE = 20

const COLUMN_COLORS = [
  '#2563EB', '#10B981', '#F59E0B', '#EF4444',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280',
]

export default defineComponent({
  name: 'TasksPage',
  components: { draggable, TaskModal, WBadge, WConfirmModal, WinIcon },
  setup() {
    const columnsStore = useTaskColumnsStore()
    const tasksStore = useTasksStore()
    const projectsStore = useProjectsStore()
    const githubStore = useGithubStore()
    const toast = useToast()

    const activeProjectId = ref('')
    const activeProjectName = ref('')
    const columnsData = ref<Record<string, Task[]>>({})
    const boardSearch = ref('')
    const showArchived = ref(false)
    const { joinProject, onBoardEvent } = useBoardSocket()
    const boardView = ref<'kanban' | 'list'>(
      (localStorage.getItem('tasks_board_view') as 'kanban' | 'list' | null) || 'kanban',
    )

    function setBoardView(view: 'kanban' | 'list') {
      boardView.value = view
      localStorage.setItem('tasks_board_view', view)
    }

    // ── Project picker (cards) ──
    const projectSearch = ref('')
    const projectPickerOptions = ref<Project[]>([])
    const projectPickerLoading = ref(false)
    const projectPickerLoadingMore = ref(false)
    const projectPickerPage = ref(1)
    const projectPickerHasMore = ref(true)
    let projectSearchDebounce: ReturnType<typeof setTimeout> | null = null

    const fetchProjectPickerOptions = async (reset: boolean) => {
      if (reset) {
        projectPickerPage.value = 1
        projectPickerHasMore.value = true
        projectPickerLoading.value = true
      } else {
        if (projectPickerLoadingMore.value || !projectPickerHasMore.value) return
        projectPickerLoadingMore.value = true
      }

      try {
        const { data } = await projectsApi.getAll({
          search: projectSearch.value,
          page: projectPickerPage.value,
          limit: PROJECT_PAGE_SIZE,
        })
        projectPickerOptions.value = reset ? data.data : [...projectPickerOptions.value, ...data.data]
        projectPickerHasMore.value = data.data.length >= PROJECT_PAGE_SIZE
      } catch {
        if (reset) projectPickerOptions.value = []
        projectPickerHasMore.value = false
      } finally {
        projectPickerLoading.value = false
        projectPickerLoadingMore.value = false
      }
    }

    const handleProjectSearch = () => {
      if (projectSearchDebounce) clearTimeout(projectSearchDebounce)
      projectSearchDebounce = setTimeout(() => {
        void fetchProjectPickerOptions(true)
      }, 250)
    }

    const loadMoreProjectPickerOptions = async () => {
      projectPickerPage.value += 1
      await fetchProjectPickerOptions(false)
    }

    const handleProjectGridScroll = (event: Event) => {
      const el = event.target as HTMLElement
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
        void loadMoreProjectPickerOptions()
      }
    }

    const backToProjectPicker = () => {
      activeProjectId.value = ''
      activeProjectName.value = ''
      columnsStore.columns = []
      columnsData.value = {}
      void fetchProjectPickerOptions(true)
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'var(--color-primary)'
        case 'completed': return 'var(--color-success)'
        case 'on-hold': return 'var(--color-warning)'
        default: return 'var(--color-text-muted)'
      }
    }

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'active': return 'Activo'
        case 'completed': return 'Completado'
        case 'on-hold': return 'En pausa'
        case 'archived': return 'Archivado'
        default: return status
      }
    }

    const loadBoard = async (projectId: string) => {
      await columnsStore.fetchAll(projectId)
      const params: any = { projectId, limit: 500 }
      if (boardSearch.value.trim()) params.search = boardSearch.value.trim()
      if (showArchived.value) params.archived = true
      const { data } = await tasksApi.getAll(params)
      const allTasks = data.data

      const groups: Record<string, Task[]> = {}
      columnsStore.columns.forEach(col => {
        groups[col._id] = allTasks
          .filter(t => t.columnId === col._id)
          .sort((a, b) => a.order - b.order)
      })
      columnsData.value = groups
      try { joinProject(projectId) } catch { /* realtime best-effort */ }
    }

    const reloadBoard = async () => {
      if (activeProjectId.value) await loadBoard(activeProjectId.value)
    }

    let searchDebounce: ReturnType<typeof setTimeout> | null = null
    const onBoardSearch = () => {
      if (searchDebounce) clearTimeout(searchDebounce)
      searchDebounce = setTimeout(() => { void reloadBoard() }, 300)
    }

    const upsertTask = (task: Task) => {
      // Quitar de todas las columnas y reinsertar en la correcta
      Object.keys(columnsData.value).forEach(colId => {
        columnsData.value[colId] = columnsData.value[colId].filter(t => t._id !== task._id)
      })
      if ((task as any).archived && !showArchived.value) {
        if (editingTask.value && editingTask.value._id === task._id) editingTask.value = task
        return
      }
      const colId = task.columnId || ''
      if (colId) {
        if (!columnsData.value[colId]) columnsData.value[colId] = []
        const arr = columnsData.value[colId]
        const idx = Math.min(task.order ?? arr.length, arr.length)
        arr.splice(idx, 0, task)
        arr.forEach((t, i) => { t.order = i })
      }
      if (editingTask.value && editingTask.value._id === task._id) editingTask.value = task
    }

    const removeTaskFromBoard = (taskId: string) => {
      Object.keys(columnsData.value).forEach(colId => {
        columnsData.value[colId] = columnsData.value[colId].filter(t => t._id !== taskId)
      })
    }

    const coverImage = (task: Task) => {
      const att = (task.attachments || []).find(a => a.id === (task as any).coverAttachmentId)
      if (!att) return null
      if (!att.type?.startsWith('image/')) return null
      return `${baseURL}${att.url}`
    }

    const duplicateTask = async (task: Task) => {
      try {
        const { data } = await tasksApi.duplicate(task._id)
        upsertTask(data)
        toast.success('Tarjeta duplicada')
      } catch { toast.error('Error al duplicar') }
    }

    const archiveTask = async (task: Task, archived: boolean) => {
      try {
        const { data } = await tasksApi.update(task._id, { archived } as any)
        if (archived && !showArchived.value) removeTaskFromBoard(task._id)
        else upsertTask(data)
        toast.success(archived ? 'Tarjeta archivada' : 'Tarjeta desarchivada')
      } catch { toast.error('Error al archivar') }
    }

    const onTaskUpdatedFromModal = (task: Task) => {
      if (!task) { void reloadBoard(); return }
      if ((task as any).archived && !showArchived.value) removeTaskFromBoard(task._id)
      else upsertTask(task)
    }

    const onProjectChange = async (projectId: string, projectName = '') => {
      activeProjectId.value = projectId
      activeProjectName.value = projectName
      if (projectId) {
        await loadBoard(projectId)
        await projectsStore.fetchById(projectId)
        if (!projectName) activeProjectName.value = projectsStore.selected?.name || ''
      } else {
        columnsStore.columns = []
        columnsData.value = {}
      }
    }

    const onColumnReorder = async () => {
      const ids = columnsStore.columns.map(c => c._id)
      try {
        await taskColumnsApi.reorder(ids)
      } catch {
        toast.error('Error al guardar el orden de las columnas')
      }
    }

    const onTaskMove = async (evt: any, columnId: string) => {
      if (evt.added || evt.moved) {
        const task = evt.added ? evt.added.element : evt.moved.element
        const tasksInCol = columnsData.value[columnId]
        await Promise.all(
          tasksInCol.map((t, idx) => {
            if (t._id === task._id || t.order !== idx) {
              return tasksStore.move(t._id, { columnId, order: idx })
            }
            return Promise.resolve()
          })
        )
      }
    }

    // ── Copy columns from another project ──
    const showCopyModal = ref(false)
    const copySearch = ref('')
    const copyOptions = ref<Project[]>([])
    const copyLoading = ref(false)
    const copySaving = ref(false)
    const copySourceId = ref('')
    let copySearchDebounce: ReturnType<typeof setTimeout> | null = null

    const fetchCopyOptions = async () => {
      copyLoading.value = true
      try {
        const { data } = await projectsApi.getAll({
          search: copySearch.value || undefined,
          page: 1,
          limit: PROJECT_PAGE_SIZE,
        })
        copyOptions.value = (data.data as Project[]).filter(p => p._id !== activeProjectId.value)
      } catch {
        copyOptions.value = []
      } finally {
        copyLoading.value = false
      }
    }

    const openCopyColumns = () => {
      copySearch.value = ''
      copySourceId.value = ''
      showCopyModal.value = true
      void fetchCopyOptions()
    }

    const onCopySearch = () => {
      if (copySearchDebounce) clearTimeout(copySearchDebounce)
      copySearchDebounce = setTimeout(() => {
        void fetchCopyOptions()
      }, 250)
    }

    const confirmCopyColumns = async () => {
      if (!copySourceId.value) return
      copySaving.value = true
      try {
        const { data } = await taskColumnsApi.copy(copySourceId.value, activeProjectId.value)
        toast.success(`${data.copied} columnas copiadas`)
        showCopyModal.value = false
        await loadBoard(activeProjectId.value)
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Error al copiar columnas')
      } finally {
        copySaving.value = false
      }
    }

    // ── Column modal ──
    const showColumnModal = ref(false)
    const editingColumn = ref<TaskColumn | null>(null)
    const columnForm = ref({ name: '', color: COLUMN_COLORS[0] })
    const columnErrors = ref<Record<string, string>>({})

    const openAddColumn = () => {
      editingColumn.value = null
      columnForm.value = { name: '', color: COLUMN_COLORS[0] }
      columnErrors.value = {}
      showColumnModal.value = true
    }

    const openEditColumn = (col: TaskColumn) => {
      editingColumn.value = col
      columnForm.value = { name: col.name, color: col.color }
      columnErrors.value = {}
      showColumnModal.value = true
    }

    const saveColumn = async () => {
      columnErrors.value = {}
      if (!columnForm.value.name.trim()) {
        columnErrors.value.name = 'El nombre es obligatorio'
        return
      }
      try {
        if (editingColumn.value) {
          await columnsStore.update(editingColumn.value._id, columnForm.value)
        } else {
          const newCol = await columnsStore.create({ ...columnForm.value, projectId: activeProjectId.value })
          columnsData.value[newCol._id] = []
        }
        showColumnModal.value = false
      } catch {
        // store muestra toast
      }
    }

    const deleteColumnTarget = ref<TaskColumn | null>(null)
    const deleteColumnMsg = ref('')
    const confirmDeleteColumn = (col: TaskColumn) => {
      const count = columnsData.value[col._id]?.length || 0
      deleteColumnMsg.value = count > 0
        ? `¿Eliminar "${col.name}"? Las ${count} tarea(s) quedarán sin columna.`
        : `¿Eliminar la columna "${col.name}"?`
      deleteColumnTarget.value = col
    }
    const doDeleteColumn = () => {
      const col = deleteColumnTarget.value
      if (!col) return
      void columnsStore.remove(col._id)
      delete columnsData.value[col._id]
      deleteColumnTarget.value = null
    }

    // ── Column dropdown menu ──
    const columnMenuColumn = ref<TaskColumn | null>(null)

    const toggleColumnMenu = (col: TaskColumn) => {
      columnMenuColumn.value = columnMenuColumn.value?._id === col._id ? null : col
    }

    // ── Card dropdown menu ──
    const cardMenuTask = ref<Task | null>(null)

    const openCardMenu = (task: Task) => {
      cardMenuTask.value = cardMenuTask.value?._id === task._id ? null : task
    }

    // ── Global click → cierra todos los menús ──
    const closeAllMenus = () => {
      columnMenuColumn.value = null
      cardMenuTask.value = null
    }

    let offBoardEvent: (() => void) | null = null
    onMounted(() => {
      document.addEventListener('click', closeAllMenus)
      void fetchProjectPickerOptions(true)
      offBoardEvent = onBoardEvent((event, payload: any) => {
        if (!activeProjectId.value) return
        if (event === 'task:created' && payload?.task) {
          if (payload.task.projectId !== activeProjectId.value) return
          upsertTask(payload.task)
        } else if ((event === 'task:updated' || event === 'task:moved') && payload?.task) {
          if (payload.task.projectId !== activeProjectId.value) {
            removeTaskFromBoard(payload.task._id)
            return
          }
          upsertTask(payload.task)
        } else if (event === 'task:deleted' && payload?.taskId) {
          removeTaskFromBoard(payload.taskId)
        } else if (event === 'comment:created' && payload?.taskId) {
          const colId = Object.keys(columnsData.value).find(c => columnsData.value[c].some(t => t._id === payload.taskId))
          if (colId) {
            const t = columnsData.value[colId].find(x => x._id === payload.taskId)
            if (t) t.commentsCount = (t.commentsCount || 0) + 1
          }
        }
      })
    })
    onUnmounted(() => {
      document.removeEventListener('click', closeAllMenus)
      offBoardEvent?.()
      offBoardEvent = null
    })

    // ── Quick-add inline ──
    const quickAddColumnId = ref<string | null>(null)
    const quickAddTitle = ref('')
    const quickAddInputRef = ref<HTMLTextAreaElement | null>(null)
    const quickAddSaving = ref(false)

    const startQuickAdd = async (columnId: string) => {
      quickAddColumnId.value = columnId
      quickAddTitle.value = ''
      await nextTick()
      quickAddInputRef.value?.focus()
    }

    const cancelQuickAdd = () => {
      quickAddColumnId.value = null
      quickAddTitle.value = ''
    }

    const confirmQuickAdd = async () => {
      if (quickAddSaving.value) return
      const title = quickAddTitle.value.trim()
      if (!title) { cancelQuickAdd(); return }
      const columnId = quickAddColumnId.value!
      const order = columnsData.value[columnId]?.length || 0
      quickAddSaving.value = true
      try {
        const { data } = await tasksApi.create({
          title,
          columnId,
          projectId: activeProjectId.value,
          priority: 'medium',
          order,
        })
        // Idempotente: el evento realtime task:created puede llegar antes
        // que la respuesta del POST e insertar la tarjeta primero.
        upsertTask(data)
        quickAddTitle.value = ''
        await nextTick()
        quickAddInputRef.value?.focus()
      } catch {
        toast.error('Error al crear tarea')
      } finally {
        quickAddSaving.value = false
      }
    }

    // ── Task modal ──
    const showTaskModal = ref(false)
    const viewMode = ref(false)
    const editingTask = ref<Task | null>(null)
    const activeColumnId = ref('')
    const savingTask = ref(false)

    const getChecklistProgress = (task: Task) => {
      if (!task.checklist || task.checklist.length === 0) return 0
      const completed = task.checklist.filter(i => i.completed).length
      return Math.round((completed / task.checklist.length) * 100)
    }

    const openViewTask = (task: Task, columnId: string) => {
      editingTask.value = task
      activeColumnId.value = columnId
      viewMode.value = true
      showTaskModal.value = true
    }

    const openAddTask = (columnId: string) => {
      editingTask.value = null
      viewMode.value = false
      activeColumnId.value = columnId
      showTaskModal.value = true
    }

    const openEditTask = (task: Task, columnId: string) => {
      editingTask.value = task
      viewMode.value = false
      activeColumnId.value = columnId
      showTaskModal.value = true
    }

    const saveTaskFromModal = async (modalForm: any) => {
      if (!modalForm.title.trim()) {
        toast.error('El título es obligatorio')
        return
      }

      savingTask.value = true
      const dto: any = {
        title: modalForm.title,
        columnId: activeColumnId.value,
        projectId: activeProjectId.value,
        description: modalForm.description,
        priority: modalForm.priority,
        dueDate: modalForm.dueDate || null,
        startDate: modalForm.startDate || null,
        assigneeId: modalForm.assigneeId || null,
        memberIds: modalForm.memberIds || [],
        watcherIds: modalForm.watcherIds || [],
        coverColor: modalForm.coverColor ?? null,
        coverAttachmentId: modalForm.coverAttachmentId ?? null,
        archived: !!modalForm.archived,
        checklist: (modalForm.checklist || []).filter((item: any) => item.text.trim() !== ''),
        labels: modalForm.labels,
        attachments: modalForm.attachments
      }

      try {
        if (editingTask.value) {
          const { data } = await tasksApi.update(editingTask.value._id, dto)
          upsertTask(data)
          toast.success('Tarea actualizada')
        } else {
          dto.order = (columnsData.value[activeColumnId.value]?.length || 0)
          const { data } = await tasksApi.create(dto)
          upsertTask(data)
          toast.success('Tarea creada')
        }
        showTaskModal.value = false
        editingTask.value = null
        viewMode.value = false
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Error al guardar tarea'
        toast.error(Array.isArray(msg) ? msg.join(', ') : msg)
      } finally {
        savingTask.value = false
      }
    }

    const toggleCompleteTask = async (task: Task) => {
      const newCompleted = task.status !== 'done'
      try {
        const { data } = await tasksApi.complete(task._id, { completed: newCompleted })
        if (task.columnId && columnsData.value[task.columnId]) {
          const idx = columnsData.value[task.columnId].findIndex(t => t._id === task._id)
          if (idx !== -1) columnsData.value[task.columnId][idx] = data.task
        }
        if (newCompleted) {
          reportData.value = data
          editableWhatsappText.value = data.whatsappText
          showReportModal.value = true
        }
      } catch {
        toast.error('Error al actualizar la tarea')
      }
    }

    const deleteTaskTarget = ref<Task | null>(null)
    const confirmDeleteTask = async (task: Task) => {
      deleteTaskTarget.value = task
    }
    const doDeleteTask = async () => {
      const task = deleteTaskTarget.value
      if (!task) return
      try {
        await tasksApi.remove(task._id)
        if (task.columnId) {
          columnsData.value[task.columnId] = columnsData.value[task.columnId].filter(t => t._id !== task._id)
        }
        toast.success('Tarea eliminada')
      } catch {
        toast.error('Error al eliminar la tarea')
      } finally {
        deleteTaskTarget.value = null
      }
    }

    // ── Report modal ──
    const showReportModal = ref(false)
    const reportLoading = ref(false)
    const reportData = ref<CompleteTaskResponse | null>(null)
    const editableWhatsappText = ref('')
    const whatsappCopied = ref(false)
    const sendingEmail = ref(false)

    const buildWhatsappUrl = () => {
      if (!reportData.value?.client?.phone) return '#'
      const phone = reportData.value.client.phone.replace(/\D/g, '')
      return `https://wa.me/${phone}?text=${encodeURIComponent(editableWhatsappText.value)}`
    }

    const copyWhatsapp = async () => {
      try {
        await navigator.clipboard.writeText(editableWhatsappText.value)
        whatsappCopied.value = true
        setTimeout(() => { whatsappCopied.value = false }, 2000)
      } catch {
        toast.error('No se pudo copiar al portapapeles')
      }
    }

    const sendEmail = async () => {
      if (!reportData.value) return
      sendingEmail.value = true
      try {
        const { data } = await tasksApi.complete(reportData.value.task._id, { sendEmail: true })
        reportData.value = { ...reportData.value, emailSent: data.emailSent }
        toast.success('Email enviado al cliente')
      } catch {
        toast.error('Error al enviar el email')
      } finally {
        sendingEmail.value = false
      }
    }

    // ── GitHub branch creation ──
    const activeProjectHasRepo = computed(() => !!(projectsStore.selected as any)?.githubRepo)

    const createBranchForTask = async (task: Task) => {
      const result = await githubStore.createBranch(task._id)
      if (result?.url) {
        // toast already shown by the store; open link in new tab
        window.open(result.url, '_blank')
      }
    }

    // ── Helpers ──
    const getDueDateClass = (task: Task): string => {
      if (!task.dueDate) return ''
      if (task.status === 'done') return 'due-done'
      const due = new Date(task.dueDate)
      const now = new Date()
      const diffMs = due.getTime() - now.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      if (diffMs < 0) return 'due-overdue'
      if (diffDays <= 2) return 'due-soon'
      return ''
    }

    const getLabelTextColor = (hex: string): string => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      return luminance > 0.5 ? '#1a1a1a' : '#ffffff'
    }

    const formatDate = (iso: string) => {
      const d = new Date(iso)
      return `${d.getDate()}/${d.getMonth() + 1}`
    }

    return {
      activeProjectId,
      activeProjectName,
      columnsStore,
      tasksStore,
      columnsData,
      COLUMN_COLORS,
      boardView,
      setBoardView,
      onProjectChange,
      onColumnReorder,
      onTaskMove,
      // project picker (cards)
      projectSearch,
      projectPickerOptions,
      projectPickerLoading,
      projectPickerLoadingMore,
      handleProjectSearch,
      handleProjectGridScroll,
      backToProjectPicker,
      getStatusColor,
      getStatusLabel,
      // column modal
      showColumnModal,
      editingColumn,
      columnForm,
      columnErrors,
      openAddColumn,
      openEditColumn,
      saveColumn,
      confirmDeleteColumn,
      // copy columns
      showCopyModal,
      copySearch,
      copyOptions,
      copyLoading,
      copySaving,
      copySourceId,
      openCopyColumns,
      onCopySearch,
      confirmCopyColumns,
      // column menu
      columnMenuColumn,
      toggleColumnMenu,
      // card menu
      cardMenuTask,
      openCardMenu,
      closeAllMenus,
      // quick-add
      quickAddColumnId,
      quickAddTitle,
      quickAddInputRef,
      startQuickAdd,
      cancelQuickAdd,
      confirmQuickAdd,
      // task modal
      showTaskModal,
      viewMode,
      editingTask,
      savingTask,
      openViewTask,
      openAddTask,
      openEditTask,
      saveTaskFromModal,
      onTaskUpdatedFromModal,
      getChecklistProgress,
      confirmDeleteTask,
      duplicateTask,
      archiveTask,
      coverImage,
      boardSearch,
      showArchived,
      onBoardSearch,
      reloadBoard,
      doDeleteTask,
      deleteTaskTarget,
      doDeleteColumn,
      deleteColumnTarget,
      deleteColumnMsg,
      // report modal
      showReportModal,
      reportLoading,
      reportData,
      editableWhatsappText,
      whatsappCopied,
      sendingEmail,
      toggleCompleteTask,
      buildWhatsappUrl,
      copyWhatsapp,
      sendEmail,
      // helpers
      getDueDateClass,
      getLabelTextColor,
      formatDate,
      formatCalendarDate,
      // github
      activeProjectHasRepo,
      createBranchForTask,
    }
  }
})
</script>

<style scoped>
.kanban-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--topbar-height));
  padding: 24px 32px 0;
  overflow: hidden;
}

.kanban-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-shrink: 0;
  gap: 24px;
}

@media (max-width: 768px) {
  .kanban-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  min-width: 0;
}

@media (max-width: 1024px) {
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

.page-title {
  font-family: var(--font-body);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
  flex-shrink: 0;
}

.change-project-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 0;
  color: var(--color-text-base);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s;
}

.change-project-btn:hover { border-color: var(--color-primary); }
.change-project-btn .material-symbols-outlined { font-size: 18px; color: var(--color-text-muted); }
.change-project-icon { margin-left: 4px; }

/* ── Project picker (cards) ── */
.project-picker {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 20px;
}

.project-picker-search {
  position: relative;
  max-width: 360px;
  flex-shrink: 0;
}

.project-picker-search span, .project-picker-search .win-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--color-text-muted);
}

.project-picker-search input {
  width: 100%;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 10px 12px 10px 40px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-base);
  outline: none;
  box-sizing: border-box;
}

.project-picker-search input:focus { border-color: var(--color-primary); }

.project-picker-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: var(--color-text-muted);
  text-align: center;
  flex: 1;
}

.project-picker-state--inline {
  flex: none;
  flex-direction: row;
  padding: 16px;
  grid-column: 1 / -1;
}

.project-picker-state h2 { font-size: 16px; color: var(--color-text-base); margin: 0; }

.project-cards-grid {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  align-content: start;
  padding: 6px 6px 24px;
  margin: -6px -6px 0;
}

.project-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 20px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 0;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.12s;
}

.project-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  transform: translateY(-2px);
}

.project-card-icon {
  font-size: 28px;
  color: var(--color-primary);
}

.project-card-name {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-base);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.add-column-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.15s;
}

.add-column-btn:hover { opacity: 0.85; }
.add-column-btn .material-symbols-outlined { font-size: 18px; }

/* ── Board view toggle (kanban / list) ── */
.board-view-toggle {
  display: flex;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 34px;
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

/* ── List view ── */
.task-list-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
}

.task-list-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.column-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-list-group-name {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-base);
}

.task-list-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-bottom: none;
  cursor: pointer;
}

.task-list-group .task-list-row:last-of-type {
  border-bottom: 1px solid var(--color-border);
}

.task-list-row:hover {
  background: var(--color-bg-surface-low);
}

.task-list-row.is-done .task-list-title {
  text-decoration: line-through;
  color: var(--color-text-disabled);
}

.task-list-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--color-text-base);
}

.quick-add-card--list {
  border: 1px solid var(--color-border);
  border-top: none;
  padding: 8px;
}

/* ── Copy columns modal ── */
.empty-board-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.copy-loading,
.copy-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 16px 0;
}

.copy-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 260px;
  overflow-y: auto;
}

.copy-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}

.copy-item:hover {
  background: var(--color-bg-surface-low);
}

.copy-item--active {
  border-color: var(--color-primary);
}

.copy-item .material-symbols-outlined {
  font-size: 18px;
  color: var(--color-text-muted);
}

/* ── Board ── */
.kanban-board-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.kanban-board {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  min-height: 0;
  padding: 4px 4px 24px 4px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
  align-items: stretch;
}

.kanban-board::-webkit-scrollbar { height: 6px; }
.kanban-board::-webkit-scrollbar-thumb { background: var(--color-border); }

/* ── Column ── */
.kanban-column {
  flex-shrink: 0;
  width: 272px;
  display: flex;
  flex-direction: column;
  background: var(--color-kanban-column-bg);
  border: none;
  border-radius: 0;
  border-top: 3px solid var(--col-color, var(--color-primary));
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  height: 100%;
  max-height: calc(100vh - var(--topbar-height) - 100px);
  min-height: 0;
  position: relative;
  transition: box-shadow 0.15s;
}

@media (max-width: 768px) {
  .kanban-page { padding: 16px 16px 0; }
  .kanban-column {
    width: 260px;
    max-height: calc(100vh - var(--topbar-height) - 180px);
  }
}

@media (max-width: 480px) {
  .kanban-column { width: 240px; }
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 10px 6px;
  flex-shrink: 0;
  cursor: grab;
}

.column-title-row { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }

.column-name {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.column-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  background: var(--color-border);
  padding: 1px 7px;
  border-radius: 10px;
  flex-shrink: 0;
}

.column-header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.kanban-column:hover .column-header-actions { opacity: 1; }

.col-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.col-btn:hover { background: var(--color-bg-surface-highest); color: var(--color-text-base); }
.col-btn .material-symbols-outlined { font-size: 18px; }

/* ── Column dropdown ── */
.column-menu-dropdown {
  position: absolute;
  top: 44px;
  right: 8px;
  z-index: 200;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  min-width: 160px;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  width: 100%;
  background: none;
  border: none;
  color: var(--color-text-base);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
  text-align: left;
}

.dropdown-item:hover { background: var(--color-bg-surface-high); }
.dropdown-item--danger:hover { color: var(--color-error); }
.dropdown-item .material-symbols-outlined { font-size: 16px; }

/* ── Column cards area ── */
.column-cards {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.column-cards::-webkit-scrollbar { width: 4px; }
.column-cards::-webkit-scrollbar-thumb { background: var(--color-border); }
.column-cards:empty { min-height: 60px; }

/* ── Kanban card ── */
.kanban-card {
  background: var(--color-kanban-card-bg);
  border: none;
  border-radius: 0;
  padding: 10px 12px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.15s, transform 0.12s;
  user-select: none;
  position: relative;
}

.kanban-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  transform: translateY(-1px);
}

.kanban-card.dragging { opacity: 0.45; cursor: grabbing; }

/* Cover strip */
.card-cover-strip {
  height: 6px;
  margin: -10px -12px 8px;
  border-radius: 0;
}

/* Labels */
.card-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.card-label-mini {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 0;
  font-size: 10px;
  font-weight: 600;
  font-family: var(--font-mono);
  letter-spacing: 0.03em;
  white-space: nowrap;
}

/* Card header */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.card-title {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-base);
  line-height: 1.4;
  flex: 1;
}

.card-menu {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.kanban-card:hover .card-menu { opacity: 1; }

.card-action-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 2px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-action-btn:hover { background: var(--color-bg-surface); color: var(--color-text-base); }
.card-action-btn .material-symbols-outlined { font-size: 16px; }

/* Card dropdown */
.card-menu-dropdown {
  position: absolute;
  top: 4px;
  right: 28px;
  z-index: 200;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  min-width: 140px;
  overflow: hidden;
}

/* Description preview */
.card-description {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0 0 8px;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Checklist progress bar */
.card-checklist {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0 8px;
}

.checklist-count-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  flex-shrink: 0;
  min-width: 28px;
}

.checklist-count-label.is-complete { color: var(--color-success); }

.checklist-progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-border);
  border-radius: 0;
  overflow: hidden;
}

.checklist-progress-fill {
  height: 100%;
  background: var(--color-warning);
  transition: width 0.3s, background 0.3s;
}

.checklist-progress-fill.is-complete { background: var(--color-success); }

/* Card footer */
.card-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.card-footer-right {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

/* Complete button */
.card-complete-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 2px;
  border-radius: 0;
  display: flex;
  flex-shrink: 0;
  transition: color 0.15s;
}

.card-complete-btn .material-symbols-outlined { font-size: 18px; }
.card-complete-btn:hover { color: var(--color-success); }
.card-complete-btn.is-done { color: var(--color-success); }

/* Priority badge */
.card-priority {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 0;
}

.priority-low    { background: rgba(16, 185, 129, 0.15); color: var(--color-success); }
.priority-medium { background: rgba(245, 158, 11, 0.15); color: var(--color-warning); }
.priority-high   { background: rgba(239, 68, 68, 0.15);  color: var(--color-error); }
.priority-urgent { background: rgba(239, 68, 68, 0.25);  color: var(--color-error); font-weight: 700; }

/* Description indicator */
.card-desc-icon {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-muted);
}

.card-desc-icon .material-symbols-outlined { font-size: 14px; }

/* Due date chip */
.card-due {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 0;
  background: var(--color-bg-surface-highest);
  color: var(--color-text-muted);
}

.card-due.due-done     { background: var(--color-success-bg); color: var(--color-success); }
.card-due.due-soon     { background: var(--color-warning-bg); color: var(--color-due-soon-text); }
.card-due.due-overdue  { background: var(--color-error-bg);   color: var(--color-due-overdue-text); }
.card-due .material-symbols-outlined { font-size: 11px; }
.card-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; padding: 2px 6px; background: var(--color-bg-surface-highest); border-radius: 4px; color: var(--color-text-muted); }
.card-cover-img img { width: 100%; max-height: 120px; object-fit: cover; display: block; }
.board-filters { display: flex; align-items: center; gap: 10px; }
.board-search { padding: 6px 10px; border: 1px solid var(--color-border); border-radius: var(--radius); background: var(--color-bg-surface-low); color: var(--color-text-base); font-size: 13px; min-width: 200px; }
.board-search::placeholder { color: var(--color-text-muted); }
.archived-toggle { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-muted); } .archived-toggle input { accent-color: var(--color-primary); }

/* Done card state */
.kanban-card.is-done { opacity: 0.72; }
.kanban-card.is-done .card-title { text-decoration: line-through; color: var(--color-text-muted); }

/* ── Quick-add inline ── */
.quick-add-card {
  padding: 8px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.quick-add-input {
  width: 100%;
  resize: none;
  background: var(--color-kanban-card-bg);
  border: 1px solid var(--color-primary);
  border-radius: 0;
  padding: 8px 10px;
  font-size: 13px;
  color: var(--color-text-base);
  font-family: var(--font-body);
  outline: none;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
  margin-bottom: 6px;
  box-sizing: border-box;
}

.quick-add-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.quick-add-actions .btn-primary {
  padding: 6px 14px;
  font-size: 12px;
}

/* Add card button */
.add-card-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  flex-shrink: 0;
  padding: 10px 12px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.add-card-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-base);
}

.add-card-btn .material-symbols-outlined { font-size: 18px; }

/* ── Add column placeholder ── */
.add-column-placeholder {
  flex-shrink: 0;
  width: 272px;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 0;
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  border: none;
  align-self: flex-start;
}

.add-column-placeholder:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--color-text-base);
}

.add-column-placeholder .material-symbols-outlined { font-size: 20px; }

/* ── Empty states ── */
.empty-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: var(--color-text-muted);
  text-align: center;
}

.empty-board h3 { font-size: 18px; color: var(--color-text-base); margin: 0; }
.empty-board p  { font-size: 14px; margin: 0; }

.kanban-loading,
.kanban-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 16px;
  color: var(--color-text-muted);
}

.empty-icon { font-size: 64px; opacity: 0.2; }
.spinning { animation: spin 2s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* ── Modals ── */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-box {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 0;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.modal-title {
  padding: 24px 24px 16px;
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-base);
}

.modal-form {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group { display: flex; flex-direction: column; gap: 8px; }

.form-group label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

.required-mark { color: var(--color-error); }

.form-group input {
  background: var(--color-bg-surface-highest);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 12px;
  border-radius: 0;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus { border-color: var(--color-primary); }
.form-group.has-error input { border-color: var(--color-error); }
.field-error { display: flex; align-items: center; gap: 4px; color: var(--color-error); font-size: 12px; }
.field-error .material-symbols-outlined { font-size: 14px; }

.color-picker { display: flex; gap: 8px; flex-wrap: wrap; }

.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
}

.color-swatch:hover { transform: scale(1.15); }
.color-swatch.active { border-color: white; transform: scale(1.15); box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3); }

.modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--color-border);
}

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

/* ── Report modal ── */
.modal-box--report { max-width: 560px; }

.report-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-border);
}

.done-icon { font-style: normal; margin-right: 6px; }

.report-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.report-body {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: calc(90vh - 80px);
}

.report-task-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 24px;
  background: var(--color-bg-surface-highest);
  border-bottom: 1px solid var(--color-border);
}

.report-task-title { font-size: 15px; font-weight: 600; color: var(--color-text-base); }

.report-project {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.report-project .material-symbols-outlined { font-size: 14px; }

.report-section {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-section:last-child { border-bottom: none; }

.report-section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.report-section-icon { font-size: 16px !important; }
.whatsapp-icon { color: #25D366; }

.report-contact-info {
  font-family: var(--font-body);
  font-size: 12px;
  text-transform: none;
  letter-spacing: 0;
  color: var(--color-text-base);
  margin-left: auto;
}

.report-no-contact {
  font-family: var(--font-body);
  text-transform: none;
  letter-spacing: 0;
  color: var(--color-warning);
  font-size: 11px;
  margin-left: auto;
}

.report-textarea {
  background: var(--color-bg-surface-highest);
  border: 1px solid var(--color-border);
  border-radius: 0;
  color: var(--color-text-base);
  font-family: var(--font-body);
  font-size: 13px;
  line-height: 1.6;
  padding: 10px 12px;
  resize: vertical;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.report-textarea:focus { border-color: var(--color-primary); }

.report-section-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-icon {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-icon .material-symbols-outlined { font-size: 16px; }

.whatsapp-btn {
  background: #25D366 !important;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: white !important;
  text-transform: uppercase;
  cursor: pointer;
}

.whatsapp-btn:hover { opacity: 0.88; }

.report-email-sent {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-success);
}

.report-email-sent .material-symbols-outlined { font-size: 18px; }

.report-no-action {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0;
}
</style>

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .kanban-page {
display: flex;
  flex-direction: column;
  height: calc(100vh - var(--topbar-height));
  padding: 24px 32px 0;
  overflow: hidden;
}

html[data-appearance="win95"] .kanban-header {
display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-shrink: 0;
  gap: 24px;
}

@media (max-width: 768px) {
html[data-appearance="win95"] .kanban-header {
flex-direction: column;
    align-items: stretch;
    gap: 16px;
}
}

html[data-appearance="win95"] .header-left {
display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  min-width: 0;
}

@media (max-width: 1024px) {
html[data-appearance="win95"] .header-left {
flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}
}

html[data-appearance="win95"] .page-title {
font-family: var(--font-body);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
  flex-shrink: 0;
}

html[data-appearance="win95"] .change-project-btn {
display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 0;
  color: var(--color-text-base);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s;
}

html[data-appearance="win95"] .change-project-btn:hover {
border-color: var(--color-primary);
}

html[data-appearance="win95"] .change-project-btn .material-symbols-outlined {
font-size: 18px; color: var(--color-text-muted);
}

html[data-appearance="win95"] .change-project-icon {
margin-left: 4px;
}

html[data-appearance="win95"] .project-picker {
flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 20px;
}

html[data-appearance="win95"] .project-picker-search {
position: relative;
  max-width: 360px;
  flex-shrink: 0;
}

html[data-appearance="win95"] .project-picker-search span {
position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--color-text-muted);
}

html[data-appearance="win95"] .project-picker-search input {
width: 100%;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 10px 12px 10px 40px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-base);
  outline: none;
  box-sizing: border-box;
}

html[data-appearance="win95"] .project-picker-search input:focus {
border-color: var(--color-primary);
}

html[data-appearance="win95"] .project-picker-state {
display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: var(--color-text-muted);
  text-align: center;
  flex: 1;
}

html[data-appearance="win95"] .project-picker-state--inline {
flex: none;
  flex-direction: row;
  padding: 16px;
  grid-column: 1 / -1;
}

html[data-appearance="win95"] .project-picker-state h2 {
font-size: 16px; color: var(--color-text-base); margin: 0;
}

html[data-appearance="win95"] .project-cards-grid {
flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  align-content: start;
  padding: 6px 6px 24px;
  margin: -6px -6px 0;
}

html[data-appearance="win95"] .project-card {
display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 20px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 0;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.12s;
}

html[data-appearance="win95"] .project-card:hover {
border-color: var(--color-primary);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  transform: translateY(-2px);
}

html[data-appearance="win95"] .project-card-icon {
font-size: 28px;
  color: var(--color-primary);
}

html[data-appearance="win95"] .project-card-name {
font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-base);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

html[data-appearance="win95"] .add-column-btn {
display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.15s;
}

html[data-appearance="win95"] .add-column-btn:hover {
opacity: 0.85;
}

html[data-appearance="win95"] .add-column-btn .material-symbols-outlined {
font-size: 18px;
}

html[data-appearance="win95"] .board-view-toggle {
display: flex;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

html[data-appearance="win95"] .view-btn {
display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 34px;
  background: var(--color-bg-surface-low);
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

html[data-appearance="win95"] .view-btn + .view-btn {
border-left: 1px solid var(--color-border);
}

html[data-appearance="win95"] .view-btn:hover {
background: var(--color-bg-surface-high);
  color: var(--color-text-base);
}

html[data-appearance="win95"] .view-btn--active {
background: var(--color-primary);
  color: white;
}

html[data-appearance="win95"] .view-btn .material-symbols-outlined {
font-size: 18px;
}

html[data-appearance="win95"] .task-list-container {
flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
}

html[data-appearance="win95"] .task-list-group-header {
display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

html[data-appearance="win95"] .column-dot {
width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

html[data-appearance="win95"] .task-list-group-name {
font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-base);
}

html[data-appearance="win95"] .task-list-row {
display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-bottom: none;
  cursor: pointer;
}

html[data-appearance="win95"] .task-list-group .task-list-row:last-of-type {
border-bottom: 1px solid var(--color-border);
}

html[data-appearance="win95"] .task-list-row:hover {
background: var(--color-bg-surface-low);
}

html[data-appearance="win95"] .task-list-row.is-done .task-list-title {
text-decoration: line-through;
  color: var(--color-text-disabled);
}

html[data-appearance="win95"] .task-list-title {
flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--color-text-base);
}

html[data-appearance="win95"] .quick-add-card--list {
border: 1px solid var(--color-border);
  border-top: none;
  padding: 8px;
}

html[data-appearance="win95"] .empty-board-actions {
display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

html[data-appearance="win95"] .copy-loading, html[data-appearance="win95"] .copy-empty {
display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 16px 0;
}

html[data-appearance="win95"] .copy-list {
display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 260px;
  overflow-y: auto;
}

html[data-appearance="win95"] .copy-item {
display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}

html[data-appearance="win95"] .copy-item:hover {
background: var(--color-bg-surface-low);
}

html[data-appearance="win95"] .copy-item--active {
border-color: var(--color-primary);
}

html[data-appearance="win95"] .copy-item .material-symbols-outlined {
font-size: 18px;
  color: var(--color-text-muted);
}

html[data-appearance="win95"] .kanban-board-container {
flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

html[data-appearance="win95"] .kanban-board {
display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  min-height: 0;
  padding: 4px 4px 24px 4px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
  align-items: stretch;
}

html[data-appearance="win95"] .kanban-board::-webkit-scrollbar {
height: 6px;
}

html[data-appearance="win95"] .kanban-board::-webkit-scrollbar-thumb {
background: var(--color-border);
}

html[data-appearance="win95"] .kanban-column {
flex-shrink: 0;
  width: 272px;
  display: flex;
  flex-direction: column;
  background: var(--color-kanban-column-bg);
  border: none;
  border-radius: 0;
  border-top: 3px solid var(--col-color, var(--color-primary));
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  height: 100%;
  max-height: calc(100vh - var(--topbar-height) - 100px);
  min-height: 0;
  position: relative;
  transition: box-shadow 0.15s;
}

@media (max-width: 768px) {
html[data-appearance="win95"] .kanban-page {
padding: 16px 16px 0;
}
html[data-appearance="win95"] .kanban-column {
width: 260px;
    max-height: calc(100vh - var(--topbar-height) - 180px);
}
}

@media (max-width: 480px) {
html[data-appearance="win95"] .kanban-column {
width: 240px;
}
}

html[data-appearance="win95"] .column-header {
display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 10px 6px;
  flex-shrink: 0;
  cursor: grab;
}

html[data-appearance="win95"] .column-title-row {
display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;
}

html[data-appearance="win95"] .column-name {
font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

html[data-appearance="win95"] .column-count {
font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  color: #000;
  background: #fff;
  border: 1px solid;
  border-color: var(--w95-shadow) var(--w95-highlight) var(--w95-highlight) var(--w95-shadow);
  padding: 0 6px;
  flex-shrink: 0;
}

html[data-appearance="win95"] .column-header-actions {
display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

html[data-appearance="win95"] .kanban-column:hover .column-header-actions {
opacity: 1;
}

html[data-appearance="win95"] .col-btn {
background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

html[data-appearance="win95"] .col-btn:hover {
background: var(--color-bg-surface-highest); color: var(--color-text-base);
}

html[data-appearance="win95"] .col-btn .material-symbols-outlined {
font-size: 18px;
}

html[data-appearance="win95"] .column-menu-dropdown {
position: absolute;
  top: 44px;
  right: 8px;
  z-index: 200;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  min-width: 160px;
  overflow: hidden;
}

html[data-appearance="win95"] .dropdown-item {
display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  width: 100%;
  background: none;
  border: none;
  color: var(--color-text-base);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
  text-align: left;
}

html[data-appearance="win95"] .dropdown-item:hover {
background: var(--color-bg-surface-high);
}

html[data-appearance="win95"] .dropdown-item--danger:hover {
color: var(--color-error);
}

html[data-appearance="win95"] .dropdown-item .material-symbols-outlined {
font-size: 16px;
}

html[data-appearance="win95"] .column-cards {
flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

html[data-appearance="win95"] .column-cards::-webkit-scrollbar {
width: 4px;
}

html[data-appearance="win95"] .column-cards::-webkit-scrollbar-thumb {
background: var(--color-border);
}

html[data-appearance="win95"] .column-cards:empty {
min-height: 60px;
}

html[data-appearance="win95"] .kanban-card {
background: var(--color-kanban-card-bg);
  border: none;
  border-radius: 0;
  padding: 10px 12px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.15s, transform 0.12s;
  user-select: none;
  position: relative;
}

html[data-appearance="win95"] .kanban-card:hover {
box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  transform: translateY(-1px);
}

html[data-appearance="win95"] .kanban-card.dragging {
opacity: 0.45; cursor: grabbing;
}

html[data-appearance="win95"] .card-cover-strip {
height: 6px;
  margin: -10px -12px 8px;
  border-radius: 0;
}

html[data-appearance="win95"] .card-labels {
display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

html[data-appearance="win95"] .card-label-mini {
display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 0;
  font-size: 10px;
  font-weight: 600;
  font-family: var(--font-mono);
  letter-spacing: 0.03em;
  white-space: nowrap;
}

html[data-appearance="win95"] .card-header {
display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

html[data-appearance="win95"] .card-title {
font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-base);
  line-height: 1.4;
  flex: 1;
}

html[data-appearance="win95"] .card-menu {
display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

html[data-appearance="win95"] .kanban-card:hover .card-menu {
opacity: 1;
}

html[data-appearance="win95"] .card-action-btn {
background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 2px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

html[data-appearance="win95"] .card-action-btn:hover {
background: var(--color-bg-surface); color: var(--color-text-base);
}

html[data-appearance="win95"] .card-action-btn .material-symbols-outlined {
font-size: 16px;
}

html[data-appearance="win95"] .card-menu-dropdown {
position: absolute;
  top: 4px;
  right: 28px;
  z-index: 200;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  min-width: 140px;
  overflow: hidden;
}

html[data-appearance="win95"] .card-description {
font-family: var(--font-body);
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0 0 8px;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

html[data-appearance="win95"] .card-checklist {
display: flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0 8px;
}

html[data-appearance="win95"] .checklist-count-label {
font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  flex-shrink: 0;
  min-width: 28px;
}

html[data-appearance="win95"] .checklist-count-label.is-complete {
color: var(--color-success);
}

html[data-appearance="win95"] .checklist-progress-bar {
flex: 1;
  height: 10px;
  background: #fff;
  border: 1px solid;
  border-color: var(--w95-shadow) var(--w95-highlight) var(--w95-highlight) var(--w95-shadow);
  border-radius: 0;
  overflow: hidden;
}

html[data-appearance="win95"] .checklist-progress-fill {
height: 100%;
  background: var(--color-warning);
  transition: width 0.3s, background 0.3s;
}

html[data-appearance="win95"] .checklist-progress-fill.is-complete {
background: var(--color-success);
}

html[data-appearance="win95"] .card-footer {
display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

html[data-appearance="win95"] .card-footer-right {
display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

html[data-appearance="win95"] .card-complete-btn {
background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 2px;
  border-radius: 0;
  display: flex;
  flex-shrink: 0;
  transition: color 0.15s;
}

html[data-appearance="win95"] .card-complete-btn .material-symbols-outlined {
font-size: 18px;
}

html[data-appearance="win95"] .card-complete-btn:hover {
color: var(--color-success);
}

html[data-appearance="win95"] .card-complete-btn.is-done {
color: var(--color-success);
}

html[data-appearance="win95"] .card-priority {
font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 0;
}

html[data-appearance="win95"] .priority-low {
background: rgba(16, 185, 129, 0.15); color: var(--color-success);
}

html[data-appearance="win95"] .priority-medium {
background: rgba(245, 158, 11, 0.15); color: var(--color-warning);
}

html[data-appearance="win95"] .priority-high {
background: rgba(239, 68, 68, 0.15);  color: var(--color-error);
}

html[data-appearance="win95"] .priority-urgent {
background: rgba(239, 68, 68, 0.25);  color: var(--color-error); font-weight: 700;
}

html[data-appearance="win95"] .card-desc-icon {
display: inline-flex;
  align-items: center;
  color: var(--color-text-muted);
}

html[data-appearance="win95"] .card-desc-icon .material-symbols-outlined {
font-size: 14px;
}

html[data-appearance="win95"] .card-due {
display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 0;
  background: var(--color-bg-surface-highest);
  color: var(--color-text-muted);
}

html[data-appearance="win95"] .card-due.due-done {
background: var(--color-success-bg); color: var(--color-success);
}

html[data-appearance="win95"] .card-due.due-soon {
background: var(--color-warning-bg); color: var(--color-due-soon-text);
}

html[data-appearance="win95"] .card-due.due-overdue {
background: var(--color-error-bg);   color: var(--color-due-overdue-text);
}

html[data-appearance="win95"] .card-due .material-symbols-outlined {
font-size: 11px;
}

html[data-appearance="win95"] .kanban-card.is-done {
opacity: 0.72;
}

html[data-appearance="win95"] .kanban-card.is-done .card-title {
text-decoration: line-through; color: var(--color-text-muted);
}

html[data-appearance="win95"] .quick-add-card {
padding: 8px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

html[data-appearance="win95"] .quick-add-input {
width: 100%;
  resize: none;
  background: var(--color-kanban-card-bg);
  border: 1px solid var(--color-primary);
  border-radius: 0;
  padding: 8px 10px;
  font-size: 13px;
  color: var(--color-text-base);
  font-family: var(--font-body);
  outline: none;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
  margin-bottom: 6px;
  box-sizing: border-box;
}

html[data-appearance="win95"] .quick-add-actions {
display: flex;
  align-items: center;
  gap: 6px;
}

html[data-appearance="win95"] .quick-add-actions .btn-primary {
padding: 6px 14px;
  font-size: 12px;
}

html[data-appearance="win95"] .add-card-btn {
display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  flex-shrink: 0;
  padding: 10px 12px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

html[data-appearance="win95"] .add-card-btn:hover {
background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-base);
}

html[data-appearance="win95"] .add-card-btn .material-symbols-outlined {
font-size: 18px;
}

html[data-appearance="win95"] .add-column-placeholder {
flex-shrink: 0;
  width: 272px;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 0;
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  border: none;
  align-self: flex-start;
}

html[data-appearance="win95"] .add-column-placeholder:hover {
background: rgba(255, 255, 255, 0.12);
  color: var(--color-text-base);
}

html[data-appearance="win95"] .add-column-placeholder .material-symbols-outlined {
font-size: 20px;
}

html[data-appearance="win95"] .empty-board {
display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: var(--color-text-muted);
  text-align: center;
}

html[data-appearance="win95"] .empty-board h3 {
font-size: 18px; color: var(--color-text-base); margin: 0;
}

html[data-appearance="win95"] .empty-board p {
font-size: 14px; margin: 0;
}

html[data-appearance="win95"] .kanban-loading, html[data-appearance="win95"] .kanban-empty {
display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 16px;
  color: var(--color-text-muted);
}

html[data-appearance="win95"] .empty-icon {
font-size: 64px; opacity: 0.2;
}

html[data-appearance="win95"] .spinning {
animation: w95-spin 2s linear infinite;
}

@keyframes w95-spin {
from { transform: rotate(0deg); } to { transform: rotate(360deg); }
}

html[data-appearance="win95"] .modal-overlay {
position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

html[data-appearance="win95"] .modal-box {
background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 0;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

html[data-appearance="win95"] .modal-title {
padding: 24px 24px 16px;
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-base);
}

html[data-appearance="win95"] .modal-form {
padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

html[data-appearance="win95"] .form-group {
display: flex; flex-direction: column; gap: 8px;
}

html[data-appearance="win95"] .form-group label {
font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

html[data-appearance="win95"] .required-mark {
color: var(--color-error);
}

html[data-appearance="win95"] .form-group input {
background: var(--color-bg-surface-highest);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 12px;
  border-radius: 0;
  outline: none;
  transition: border-color 0.2s;
}

html[data-appearance="win95"] .form-group input:focus {
border-color: var(--color-primary);
}

html[data-appearance="win95"] .form-group.has-error input {
border-color: var(--color-error);
}

html[data-appearance="win95"] .field-error {
display: flex; align-items: center; gap: 4px; color: var(--color-error); font-size: 12px;
}

html[data-appearance="win95"] .field-error .material-symbols-outlined {
font-size: 14px;
}

html[data-appearance="win95"] .color-picker {
display: flex; gap: 8px; flex-wrap: wrap;
}

html[data-appearance="win95"] .color-swatch {
width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
}

html[data-appearance="win95"] .color-swatch:hover {
transform: scale(1.15);
}

html[data-appearance="win95"] .color-swatch.active {
border-color: white; transform: scale(1.15); box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

html[data-appearance="win95"] .modal-footer {
padding: 16px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--color-border);
}

html[data-appearance="win95"] .btn-primary {
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
}

html[data-appearance="win95"] .btn-primary:disabled {
opacity: 0.6; cursor: not-allowed;
}

html[data-appearance="win95"] .btn-primary:not(:disabled):hover {
opacity: 0.85;
}

html[data-appearance="win95"] .btn-secondary {
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

html[data-appearance="win95"] .btn-secondary:hover {
color: var(--color-text-base); border-color: var(--color-text-muted);
}

html[data-appearance="win95"] .modal-box--report {
max-width: 560px;
}

html[data-appearance="win95"] .report-modal-header {
display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-border);
}

html[data-appearance="win95"] .done-icon {
font-style: normal; margin-right: 6px;
}

html[data-appearance="win95"] .report-loading {
display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: var(--color-text-muted);
  font-size: 14px;
}

html[data-appearance="win95"] .report-body {
display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: calc(90vh - 80px);
}

html[data-appearance="win95"] .report-task-info {
display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 24px;
  background: var(--color-bg-surface-highest);
  border-bottom: 1px solid var(--color-border);
}

html[data-appearance="win95"] .report-task-title {
font-size: 15px; font-weight: 600; color: var(--color-text-base);
}

html[data-appearance="win95"] .report-project {
display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
}

html[data-appearance="win95"] .report-project .material-symbols-outlined {
font-size: 14px;
}

html[data-appearance="win95"] .report-section {
padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

html[data-appearance="win95"] .report-section:last-child {
border-bottom: none;
}

html[data-appearance="win95"] .report-section-label {
display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

html[data-appearance="win95"] .report-section-icon {
font-size: 16px !important;
}

html[data-appearance="win95"] .whatsapp-icon {
color: #25D366;
}

html[data-appearance="win95"] .report-contact-info {
font-family: var(--font-body);
  font-size: 12px;
  text-transform: none;
  letter-spacing: 0;
  color: var(--color-text-base);
  margin-left: auto;
}

html[data-appearance="win95"] .report-no-contact {
font-family: var(--font-body);
  text-transform: none;
  letter-spacing: 0;
  color: var(--color-warning);
  font-size: 11px;
  margin-left: auto;
}

html[data-appearance="win95"] .report-textarea {
background: var(--color-bg-surface-highest);
  border: 1px solid var(--color-border);
  border-radius: 0;
  color: var(--color-text-base);
  font-family: var(--font-body);
  font-size: 13px;
  line-height: 1.6;
  padding: 10px 12px;
  resize: vertical;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

html[data-appearance="win95"] .report-textarea:focus {
border-color: var(--color-primary);
}

html[data-appearance="win95"] .report-section-actions {
display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

html[data-appearance="win95"] .btn-icon {
display: flex;
  align-items: center;
  gap: 6px;
}

html[data-appearance="win95"] .btn-icon .material-symbols-outlined {
font-size: 16px;
}

html[data-appearance="win95"] .whatsapp-btn {
background: #25D366 !important;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: white !important;
  text-transform: uppercase;
  cursor: pointer;
}

html[data-appearance="win95"] .whatsapp-btn:hover {
opacity: 0.88;
}

html[data-appearance="win95"] .report-email-sent {
display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-success);
}

html[data-appearance="win95"] .report-email-sent .material-symbols-outlined {
font-size: 18px;
}

html[data-appearance="win95"] .report-no-action {
font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0;
}
</style>
