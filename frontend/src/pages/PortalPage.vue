<template>
  <div class="portal-page">
    <!-- Estado: cargando link -->
    <div v-if="stage === 'loading'" class="portal-center">
      <p class="muted">Cargando acceso...</p>
    </div>

    <!-- Estado: link inválido -->
    <div v-else-if="stage === 'invalid'" class="portal-center">
      <div class="portal-card">
        <h2>Enlace inválido</h2>
        <p class="muted">Este link no existe, fue revocado o venció. Pedile al equipo un nuevo acceso.</p>
      </div>
    </div>

    <!-- Estado: login -->
    <div v-else-if="stage === 'login'" class="portal-center">
      <form class="portal-card" @submit.prevent="doLogin">
        <h2>{{ info?.projectName || 'Portal cliente' }}</h2>
        <p class="muted">{{ info?.label || 'Ingresá tus credenciales para ver el tablero' }}</p>
        <label>Usuario</label>
        <input v-model="username" class="input" autocomplete="username" />
        <label>Contraseña</label>
        <input v-model="password" type="password" class="input" autocomplete="current-password" />
        <p v-if="loginError" class="error">{{ loginError }}</p>
        <button class="btn-primary" :disabled="loggingIn || !username || !password">
          {{ loggingIn ? 'Ingresando...' : 'Ver tablero' }}
        </button>
      </form>
    </div>

    <!-- Estado: tablero -->
    <div v-else class="portal-board">
      <header class="portal-header">
        <div>
          <h1>{{ project?.name }}</h1>
          <p v-if="project?.description" class="muted">{{ project.description }}</p>
        </div>
        <div class="portal-header-actions">
          <span class="user-chip">{{ label }}</span>
          <button class="mini-btn" @click="logout">Salir</button>
        </div>
      </header>

      <div v-if="boardLoading" class="muted">Cargando tablero...</div>
      <div v-else class="portal-columns">
        <div v-for="col in columns" :key="col._id" class="portal-column">
          <div class="portal-column-header">
            <span class="column-dot" :style="{ background: col.color }"></span>
            <span class="column-name">{{ col.name }}</span>
            <span class="column-count">{{ tasksByColumn[col._id]?.length || 0 }}</span>
          </div>
          <draggable
            v-model="tasksByColumn[col._id]"
            :group="perms.canEdit ? 'portal-tasks' : { name: 'portal-tasks', pull: false, put: false }"
            item-key="_id"
            class="portal-cards"
            :disabled="!perms.canEdit"
            @change="onMove($event, col._id)"
          >
            <template #item="{ element: task }">
              <div class="portal-card-task" @click="openTask(task)">
                <div v-if="task.coverColor" class="cover-strip" :style="{ background: task.coverColor }"></div>
                <div v-if="(task.labels || []).length" class="labels-row">
                  <span v-for="(l, i) in task.labels" :key="i" class="label-chip" :style="{ backgroundColor: l.color + '22', color: l.color }">{{ l.name }}</span>
                </div>
                <span class="task-title">{{ task.title }}</span>
                <div class="task-badges">
                  <span v-if="(task.checklist || []).length" class="badge">☑ {{ task.checklist.filter((i: any) => i.completed).length }}/{{ task.checklist.length }}</span>
                  <span v-if="task.commentsCount" class="badge">💬 {{ task.commentsCount }}</span>
                  <span v-if="(task.attachments || []).length" class="badge">📎 {{ task.attachments.length }}</span>
                  <span v-if="task.dueDate" class="badge" :class="dueClass(task)">📅 {{ task.dueDate.split('T')[0].split('-').reverse().join('/') }}</span>
                </div>
              </div>
            </template>
          </draggable>
          <div v-if="perms.canCreate">
            <div v-if="quickAddCol === col._id" class="quick-add">
              <textarea v-model="quickAddTitle" rows="2" class="input" placeholder="Título..." @keydown.enter.prevent="confirmQuickAdd(col._id)" @keydown.esc="quickAddCol = null" />
              <div class="row"><button class="btn-primary" @click="confirmQuickAdd(col._id)">Agregar</button><button class="mini-btn" @click="quickAddCol = null">×</button></div>
            </div>
            <button v-else class="add-card" @click="quickAddCol = col._id; quickAddTitle = ''">+ Agregar tarjeta</button>
          </div>
        </div>
      </div>

      <portal-task-modal
        v-if="selected"
        :task="selected"
        :permissions="perms"
        :actor-id="actorId"
        @close="selected = null"
        @changed="onTaskChanged"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import draggable from 'vuedraggable'
import { io, type Socket } from 'socket.io-client'
import { portalApi, getPortalToken, setPortalToken, type PortalPermissions } from '@/api/portal/portal.api'
import { baseURL } from '@/api/axios.config'
import PortalTaskModal from '@/components/portal/PortalTaskModal.vue'

export default defineComponent({
  name: 'PortalPage',
  components: { draggable, PortalTaskModal },
  setup() {
    const route = useRoute()
    const stage = ref<'loading' | 'invalid' | 'login' | 'board'>('loading')
    const info = ref<{ username: string; label: string; projectName: string } | null>(null)
    const username = ref('')
    const password = ref('')
    const loginError = ref('')
    const loggingIn = ref(false)
    const project = ref<any>(null)
    const label = ref('')
    const perms = ref<PortalPermissions>({ canCreate: false, canEdit: false, canComment: false, canUpload: false })
    const actorId = ref('')
    const columns = ref<any[]>([])
    const tasksByColumn = ref<Record<string, any[]>>({})
    const boardLoading = ref(false)
    const selected = ref<any>(null)
    const quickAddCol = ref<string | null>(null)
    const quickAddTitle = ref('')
    const quickAddSaving = ref(false)
    let socket: Socket | null = null

    const token = computed(() => route.params.token as string)

    const upsertTask = (task: any) => {
      Object.keys(tasksByColumn.value).forEach(c => {
        tasksByColumn.value[c] = tasksByColumn.value[c].filter(t => t._id !== task._id)
      })
      const colId = task.columnId
      if (colId) {
        if (!tasksByColumn.value[colId]) tasksByColumn.value[colId] = []
        const arr = tasksByColumn.value[colId]
        arr.splice(Math.min(task.order ?? arr.length, arr.length), 0, task)
      }
      if (selected.value && selected.value._id === task._id) selected.value = task
    }

    const loadBoard = async () => {
      boardLoading.value = true
      try {
        const [{ data: cols }, { data: tasks }] = await Promise.all([
          portalApi.getColumns(),
          portalApi.getTasks(),
        ])
        columns.value = cols
        const groups: Record<string, any[]> = {}
        cols.forEach((c: any) => {
          groups[c._id] = (tasks.data as any[])
            .filter(t => t.columnId === c._id)
            .sort((a, b) => a.order - b.order)
        })
        tasksByColumn.value = groups
      } finally { boardLoading.value = false }
    }

    const connectSocket = () => {
      const t = getPortalToken()
      if (!t) return
      socket?.disconnect()
      socket = io(`${baseURL}/boards`, { auth: { token: t }, transports: ['websocket', 'polling'] })
      socket.on('task:created', (p: any) => { if (p?.task) upsertTask(p.task) })
      socket.on('task:updated', (p: any) => { if (p?.task) upsertTask(p.task) })
      socket.on('task:moved', (p: any) => { if (p?.task) upsertTask(p.task) })
      socket.on('task:deleted', (p: any) => {
        if (!p?.taskId) return
        Object.keys(tasksByColumn.value).forEach(c => {
          tasksByColumn.value[c] = tasksByColumn.value[c].filter(t => t._id !== p.taskId)
        })
      })
      socket.on('comment:created', (p: any) => {
        if (!p?.taskId) return
        const col = Object.keys(tasksByColumn.value).find(c => tasksByColumn.value[c].some(t => t._id === p.taskId))
        const t = col ? tasksByColumn.value[col].find((x: any) => x._id === p.taskId) : null
        if (t) t.commentsCount = (t.commentsCount || 0) + 1
      })
    }

    const enterBoard = async (loginData: { token: string; shareId: string; project: any; permissions: PortalPermissions; label: string }) => {
      setPortalToken(loginData.token)
      actorId.value = `portal:${loginData.shareId}`
      project.value = loginData.project
      perms.value = loginData.permissions
      label.value = loginData.label
      stage.value = 'board'
      await loadBoard()
      connectSocket()
    }

    const doLogin = async () => {
      loggingIn.value = true
      loginError.value = ''
      try {
        const { data } = await portalApi.login({ username: username.value.trim(), password: password.value })
        await enterBoard(data)
      } catch (err: any) {
        loginError.value = err.response?.status === 401 || err.response?.status === 429
          ? (err.response?.data?.message || 'Acceso denegado')
          : 'Error al ingresar. Intentá de nuevo.'
      } finally { loggingIn.value = false }
    }

    const logout = () => {
      setPortalToken(null)
      socket?.disconnect()
      socket = null
      password.value = ''
      stage.value = 'login'
    }

    const openTask = (task: any) => { selected.value = task }
    const onTaskChanged = (task: any) => { upsertTask(task) }

    const onMove = async (evt: any, columnId: string) => {
      if (!perms.value.canEdit) return
      if (evt.added || evt.moved) {
        const task = evt.added ? evt.added.element : evt.moved.element
        const arr = tasksByColumn.value[columnId]
        try {
          const { data } = await portalApi.moveTask(task._id, { columnId, order: arr.findIndex((t: any) => t._id === task._id) })
          upsertTask(data)
        } catch { void loadBoard() }
      }
    }

    const confirmQuickAdd = async (columnId: string) => {
      if (quickAddSaving.value) return
      const title = quickAddTitle.value.trim()
      if (!title) { quickAddCol.value = null; return }
      quickAddSaving.value = true
      try {
        const { data } = await portalApi.createTask({
          title, columnId, order: tasksByColumn.value[columnId]?.length || 0,
        })
        upsertTask(data)
        quickAddTitle.value = ''
        quickAddCol.value = null
      } catch { /* toast-less: mostrar inline */ } finally { quickAddSaving.value = false }
    }

    const dueClass = (task: any) => {
      if (!task.dueDate || task.status === 'done') return ''
      return new Date(task.dueDate).getTime() < Date.now() ? 'due-overdue' : ''
    }

    onMounted(async () => {
      // Sesión existente: intentar entrar directo
      if (getPortalToken()) {
        try {
          const { data } = await portalApi.getProject()
          project.value = data
          perms.value = data.permissions
          label.value = data.label
          stage.value = 'board'
          await loadBoard()
          connectSocket()
          return
        } catch { setPortalToken(null) }
      }
      // Link con token: pre-cargar usuario
      if (token.value) {
        try {
          const { data } = await portalApi.shareInfo(token.value)
          info.value = data
          username.value = data.username
          stage.value = 'login'
        } catch { stage.value = 'invalid' }
      } else {
        stage.value = 'login'
      }
      await nextTick()
    })

    onUnmounted(() => { socket?.disconnect(); socket = null })

    return {
      stage, info, username, password, loginError, loggingIn, project, label, perms, actorId,
      columns, tasksByColumn, boardLoading, selected, quickAddCol, quickAddTitle,
      doLogin, logout, openTask, onTaskChanged, onMove, confirmQuickAdd, dueClass,
    }
  },
})
</script>

<style scoped>
.portal-page { min-height: 100vh; background: var(--color-bg-base); color: var(--color-text-base); }
.portal-center { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; }
.portal-card { background: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 24px; width: 380px; max-width: 94vw; display: flex; flex-direction: column; gap: 8px; }
.portal-card h2 { margin: 0; } .portal-card label { font-size: 12px; color: var(--color-text-muted); margin-top: 6px; }
.muted { color: var(--color-text-muted); font-size: 13px; }
.error { color: var(--color-error); font-size: 13px; }
.input { width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid var(--color-border); background: var(--color-bg-surface-low); color: var(--color-text-base); }
.btn-primary { background: var(--color-primary); color: #fff; border: none; padding: 10px; cursor: pointer; font-weight: 600; margin-top: 8px; } .btn-primary:disabled { opacity: .5; }
.mini-btn { font-size: 12px; border: 1px solid var(--color-border); background: var(--color-bg-surface-high); color: var(--color-text-base); padding: 4px 10px; cursor: pointer; }
.user-chip { background: var(--color-bg-surface-highest); border-radius: 12px; padding: 2px 10px; font-size: 12px; }
.portal-board { padding: 16px; max-width: 1400px; margin: 0 auto; }
.portal-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.portal-header h1 { margin: 0 0 4px; font-size: 22px; }
.portal-header-actions { display: flex; gap: 8px; align-items: center; }
.portal-columns { display: flex; gap: 12px; overflow-x: auto; align-items: flex-start; padding-bottom: 12px; }
.portal-column { background: var(--color-kanban-column-bg); min-width: 272px; width: 272px; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.portal-column-header { display: flex; gap: 8px; align-items: center; font-weight: 700; font-size: 14px; }
.column-dot { width: 10px; height: 10px; border-radius: 50%; } .column-name { flex: 1; } .column-count { font-size: 12px; color: var(--color-text-muted); }
.portal-cards { display: flex; flex-direction: column; gap: 8px; min-height: 40px; }
.portal-card-task { background: var(--color-kanban-card-bg); border: 1px solid var(--color-border-subtle); padding: 10px; cursor: pointer; display: flex; flex-direction: column; gap: 6px; }
.portal-card-task:hover { border-color: var(--color-border-focus); }
.cover-strip { height: 6px; margin: -10px -10px 0; }
.labels-row { display: flex; flex-wrap: wrap; gap: 4px; } .label-chip { border-radius: 10px; padding: 0 8px; font-size: 11px; }
.task-title { font-weight: 600; font-size: 14px; }
.task-badges { display: flex; gap: 6px; flex-wrap: wrap; } .badge { font-size: 11px; background: var(--color-bg-surface-highest); padding: 1px 6px; border-radius: 4px; color: var(--color-text-muted); } .badge.due-overdue { color: var(--color-due-overdue-text); }
.add-card { border: none; background: none; color: var(--color-text-muted); cursor: pointer; text-align: left; padding: 6px; font-size: 13px; } .add-card:hover { color: var(--color-text-base); }
.quick-add { display: flex; flex-direction: column; gap: 6px; } .quick-add .row { display: flex; gap: 6px; }
.quick-add textarea { resize: none; }
</style>
