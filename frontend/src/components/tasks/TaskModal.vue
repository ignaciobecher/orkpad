<template>
  <div v-if="modelValue" class="task-modal-overlay" @click.self="close">
    <div class="task-modal-box">
      <!-- Cover -->
      <div v-if="coverUrl || form.coverColor" class="task-cover" :style="coverStyle">
        <img v-if="coverUrl" :src="coverUrl" alt="Portada" />
        <button class="cover-close" @click="close">×</button>
      </div>
      <div class="task-modal-header">
        <span class="header-title">{{ form.title || 'Tarea' }}</span>
        <button class="icon-btn" @click="close" title="Cerrar">×</button>
      </div>

      <div class="task-modal-body">
        <div class="task-main">
          <!-- Título -->
          <input v-model="form.title" class="task-title-input" placeholder="Título de la tarea" />

          <!-- Etiquetas -->
          <div class="section">
            <h4>Etiquetas</h4>
            <div class="labels-row">
              <span v-for="(l, i) in form.labels" :key="i" class="label-chip"
                :style="{ backgroundColor: l.color + '22', color: l.color, borderColor: l.color + '55' }">
                {{ l.name }}
                <button @click="removeLabel(i)">×</button>
              </span>
              <button class="add-btn" @click="showLabelPop = !showLabelPop">+ Agregar</button>
            </div>
            <div v-if="showLabelPop" class="popover">
              <input v-model="newLabelName" placeholder="Nombre" class="popover-input" />
              <div class="color-row">
                <button v-for="c in COLORS" :key="c" class="swatch" :style="{ background: c }"
                  :class="{ active: newLabelColor === c }" @click="newLabelColor = c" />
              </div>
              <button class="btn-primary btn-block" @click="addLabel">Guardar</button>
            </div>
          </div>

          <!-- Fechas / miembros -->
          <div class="section grid-2">
            <div>
              <h4>Inicio</h4>
              <input v-model="form.startDate" type="date" class="input" />
            </div>
            <div>
              <h4>Vencimiento</h4>
              <input v-model="form.dueDate" type="date" class="input" />
            </div>
            <div>
              <h4>Prioridad</h4>
              <select v-model="form.priority" class="input">
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div>
              <h4>Responsable</h4>
              <w-remote-select v-model="form.assigneeId" placeholder="Sin asignar"
                :load-options="loadUserOptions" :load-option-by-value="loadUserOptionById" />
            </div>
          </div>

          <div class="section">
            <h4>Miembros ({{ form.memberIds.length }})</h4>
            <div class="members-list">
              <span v-for="mid in form.memberIds" :key="mid" class="label-chip">{{ shortId(mid) }} <button @click="removeMember(mid)">×</button></span>
            </div>
            <div class="row-between">
              <w-remote-select v-model="memberToAdd" placeholder="Agregar miembro"
                :load-options="loadUserOptions" :load-option-by-value="loadUserOptionById" />
              <button class="add-btn" :disabled="!memberToAdd" @click="addMember">Añadir</button>
            </div>
            <label class="watch-row">
              <input type="checkbox" :checked="isWatching" @change="toggleWatchLocal" />
              Vigilar esta tarjeta
            </label>
          </div>

          <!-- Descripción -->
          <div class="section">
            <h4>Descripción</h4>
            <QuillEditor v-model:content="form.description" content-type="html" theme="snow"
              placeholder="Añadir descripción..." />
          </div>

          <!-- Checklist -->
          <div class="section">
            <div class="row-between">
              <h4>Checklist</h4>
              <span v-if="form.checklist.length">{{ checklistPct }}%</span>
            </div>
            <div v-if="form.checklist.length" class="progress"><div class="fill" :style="{ width: checklistPct + '%' }" /></div>
            <div v-for="(it, idx) in form.checklist" :key="idx" class="check-item">
              <input type="checkbox" v-model="it.completed" />
              <input v-model="it.text" class="input" placeholder="Elemento" @keydown.enter.prevent="addCheckItem" />
              <button class="icon-btn" @click="form.checklist.splice(idx, 1)">×</button>
            </div>
            <button class="add-btn" @click="addCheckItem">+ Añadir elemento</button>
          </div>

          <!-- Adjuntos -->
          <div class="section" v-if="task?._id || form.attachments.length">
            <div class="row-between">
              <h4>Adjuntos ({{ form.attachments.length }})</h4>
              <label v-if="task?._id" class="add-btn file-label">
                + Subir
                <input type="file" hidden @change="onFilePicked" :disabled="uploading" />
              </label>
            </div>
            <div v-if="uploading" class="progress"><div class="fill" :style="{ width: uploadPct + '%' }" /></div>
            <div v-for="a in form.attachments" :key="a.id" class="attach-row">
              <img v-if="isImage(a)" :src="fileUrl(a)" class="attach-thumb" alt="" />
              <div v-else class="attach-thumb attach-file">📎</div>
              <div class="attach-meta">
                <a :href="fileUrl(a)" target="_blank" rel="noopener">{{ a.name }}</a>
                <small>{{ formatSize(a.size) }} · {{ formatDate(a.uploadedAt) }}</small>
              </div>
              <button class="mini-btn" @click="makeCover(a)" :disabled="!task?._id" title="Usar como portada">Portada</button>
              <button class="icon-btn" @click="deleteAttachment(a)" title="Quitar">×</button>
            </div>
            <p v-if="!task?._id" class="muted">Guardá la tarea para poder subir archivos.</p>
          </div>

          <!-- Comentarios -->
          <div class="section" v-if="task?._id">
            <h4>Comentarios ({{ comments.length }})</h4>
            <div class="comment-box">
              <textarea v-model="newComment" rows="2" placeholder="Escribí un comentario... (@ para mencionar)" />
              <div class="row-between">
                <small class="muted">Tip: escribí @seguido del nombre para notificar. Ej: @juan revisá esto</small>
                <button class="btn-primary" :disabled="!newComment.trim() || savingComment" @click="postComment">
                  {{ savingComment ? 'Enviando...' : 'Comentar' }}
                </button>
              </div>
            </div>
            <div v-for="c in comments" :key="c._id" class="comment">
              <div class="comment-head">
                <strong>{{ c.authorName || 'Miembro' }}</strong>
                <small>{{ formatDateTime(c.createdAt) }}<span v-if="c.editedAt"> · editado</span></small>
              </div>
              <div v-if="editingId !== c._id" class="comment-text">{{ c.text }}</div>
              <textarea v-else v-model="editingText" rows="2" class="input" />
              <div class="comment-actions" v-if="c.authorId === currentUserId">
                <button v-if="editingId !== c._id" class="mini-btn" @click="startEdit(c)">Editar</button>
                <template v-else>
                  <button class="mini-btn" @click="saveEdit(c)">Guardar</button>
                  <button class="mini-btn" @click="editingId = null">Cancelar</button>
                </template>
                <button class="mini-btn danger" @click="deleteComment(c)">Eliminar</button>
              </div>
            </div>
            <p v-if="!comments.length" class="muted">Sé la primera persona en comentar.</p>
          </div>

          <!-- Actividad -->
          <div class="section" v-if="task?._id">
            <h4>Actividad</h4>
            <div v-for="a in activities" :key="a._id" class="activity">
              <span class="dot" />
              <span><strong>{{ a.actorName || 'Sistema' }}</strong> {{ activityLabel(a) }}</span>
              <small>{{ formatDateTime(a.createdAt) }}</small>
            </div>
            <p v-if="!activities.length" class="muted">Sin actividad todavía.</p>
          </div>
        </div>

        <!-- Sidebar acciones -->
        <aside class="task-side">
          <h4>Acciones</h4>
          <button class="btn-primary btn-block" :disabled="loading" @click="save">
            {{ loading ? 'Guardando...' : task?._id ? 'Guardar cambios' : 'Crear tarea' }}
          </button>
          <template v-if="task?._id">
            <button class="side-btn" @click="toggleComplete">{{ isDone ? '↩ Reabrir' : '✓ Completar' }}</button>
            <button class="side-btn" @click="duplicate">⧉ Duplicar</button>
            <button class="side-btn" @click="toggleArchive">{{ form.archived ? '📥 Desarchivar' : '📦 Archivar' }}</button>
            <div class="side-group">
              <h4>Portada</h4>
              <div class="color-row">
                <button v-for="c in COLORS" :key="c" class="swatch" :style="{ background: c }"
                  :class="{ active: form.coverColor === c }" @click="form.coverColor = form.coverColor === c ? null : c" />
                <button v-if="form.coverColor" class="mini-btn" @click="form.coverColor = null">Quitar</button>
              </div>
            </div>
          </template>
        </aside>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import WRemoteSelect from '@/components/ui/WRemoteSelect.vue'
import { loadUserOptions, loadUserOptionById } from '@/utils/remote-entity-options'
import { tasksApi } from '@/api/tasks/tasks.api'
import { baseURL } from '@/api/axios.config'
import { useAuthStore } from '@/stores/auth.store'
import type { TaskComment, TaskActivity } from '@/api/tasks/tasks.types'

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default defineComponent({
  name: 'TaskModal',
  components: { QuillEditor, WRemoteSelect },
  props: {
    modelValue: { type: Boolean, required: true },
    viewMode: { type: Boolean, default: false },
    task: { type: Object as () => any, default: null },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'save', 'task-updated'],
  setup(props, { emit }) {
    const form = ref<any>({ title: '', description: '', priority: 'medium', dueDate: '', startDate: '', assigneeId: '', memberIds: [], watcherIds: [], checklist: [], labels: [], attachments: [], coverColor: null, coverAttachmentId: null, archived: false })
    const showLabelPop = ref(false)
    const newLabelName = ref('')
    const newLabelColor = ref(COLORS[0])
    const comments = ref<TaskComment[]>([])
    const activities = ref<TaskActivity[]>([])
    const newComment = ref('')
    const savingComment = ref(false)
    const editingId = ref<string | null>(null)
    const editingText = ref('')
    const uploading = ref(false)
    const uploadPct = ref(0)
    const auth = useAuthStore()
    const currentUserId = computed(() => (auth.user as any)?._id || (auth.user as any)?.id || '')

    const isDone = computed(() => (props.task as any)?.status === 'done')
    const checklistPct = computed(() => {
      if (!form.value.checklist.length) return 0
      return Math.round((form.value.checklist.filter((i: any) => i.completed).length / form.value.checklist.length) * 100)
    })
    const membersProxy = computed({
      get: () => form.value.memberIds,
      set: (v: any) => { form.value.memberIds = Array.isArray(v) ? v : v ? [v] : [] },
    })
    const memberToAdd = ref('')
    const shortId = (id: string) => String(id).slice(-6)
    const addMember = () => {
      if (!memberToAdd.value) return
      if (!form.value.memberIds.includes(memberToAdd.value)) form.value.memberIds.push(memberToAdd.value)
      memberToAdd.value = ''
    }
    const removeMember = (id: string) => { form.value.memberIds = form.value.memberIds.filter((x: string) => x !== id) }
    const isWatching = computed(() => (form.value.watcherIds || []).includes(currentUserId.value))
    const coverUrl = computed(() => {
      const id = form.value.coverAttachmentId
      const att = (form.value.attachments || []).find((a: any) => a.id === id)
      if (!att) return null
      return `${baseURL}${att.url}`
    })
    const coverStyle = computed(() => form.value.coverColor && !coverUrl.value ? { background: form.value.coverColor, minHeight: '64px' } : {})

    const resetForm = (t: any) => {
      form.value = {
        title: t?.title || '', description: t?.description || '', priority: t?.priority || 'medium',
        dueDate: t?.dueDate ? String(t.dueDate).split('T')[0] : '', startDate: t?.startDate ? String(t.startDate).split('T')[0] : '',
        assigneeId: t?.assigneeId || '', memberIds: t?.memberIds ? [...t.memberIds] : [], watcherIds: t?.watcherIds ? [...t.watcherIds] : [],
        checklist: t?.checklist ? JSON.parse(JSON.stringify(t.checklist)) : [], labels: t?.labels ? JSON.parse(JSON.stringify(t.labels)) : [],
        attachments: t?.attachments ? JSON.parse(JSON.stringify(t.attachments)) : [],
        coverColor: t?.coverColor ?? null, coverAttachmentId: t?.coverAttachmentId ?? null, archived: !!t?.archived,
      }
    }

    const loadThread = async () => {
      const id = props.task?._id
      if (!id) { comments.value = []; activities.value = []; return }
      try {
        const [{ data: c }, { data: a }] = await Promise.all([
          tasksApi.listComments(id, { limit: 100 }),
          tasksApi.listActivities(id, { limit: 50 }),
        ])
        comments.value = c.data
        activities.value = a.data
      } catch { /* best effort */ }
    }

    watch(() => props.modelValue, (v) => {
      if (v) { resetForm(props.task); newComment.value = ''; editingId.value = null; void loadThread() }
    }, { immediate: true })
    watch(() => props.task?._id, () => { if (props.modelValue) { resetForm(props.task); void loadThread() } })

    const close = () => emit('update:modelValue', false)
    const save = () => emit('save', { ...form.value })

    const addLabel = () => {
      if (!newLabelName.value.trim()) return
      form.value.labels.push({ name: newLabelName.value.trim(), color: newLabelColor.value })
      newLabelName.value = ''; newLabelColor.value = COLORS[0]; showLabelPop.value = false
    }
    const removeLabel = (i: number) => form.value.labels.splice(i, 1)
    const addCheckItem = () => form.value.checklist.push({ text: '', completed: false })
    const toggleWatchLocal = () => {
      const id = currentUserId.value
      if (!id) return
      const arr = [...(form.value.watcherIds || [])]
      const ix = arr.indexOf(id)
      if (ix === -1) arr.push(id); else arr.splice(ix, 1)
      form.value.watcherIds = arr
    }

    const fileUrl = (a: any) => `${baseURL}${a.url}`
    const isImage = (a: any) => (a.type || '').startsWith('image/')
    const formatSize = (n: number) => n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`
    const formatDate = (d: any) => { try { return new Date(d).toLocaleDateString('es-AR') } catch { return '' } }
    const formatDateTime = (d: any) => { try { return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) } catch { return '' } }
    const activityLabel = (a: TaskActivity) => {
      const map: Record<string, string> = { created: 'creó la tarjeta', updated: 'actualizó la tarjeta', moved: 'movió la tarjeta', completed: 'completó la tarjeta', reopened: 'reabrió la tarjeta', commented: 'comentó', attachment_added: `adjuntó ${(a.payload as any)?.name || 'un archivo'}`, attachment_removed: 'quitó un adjunto', archived: 'archivó la tarjeta', unarchived: 'desarchivó la tarjeta', duplicated: 'duplicó la tarjeta', member_added: 'agregó un miembro', member_removed: 'quitó un miembro' }
      return map[a.type] || a.type
    }

    const refreshTask = async () => {
      const id = props.task?._id
      if (!id) return
      try {
        const { data } = await tasksApi.getById(id)
        resetForm(data)
        emit('task-updated', data)
        void loadThread()
      } catch { /* noop */ }
    }

    const postComment = async () => {
      const id = props.task?._id
      const text = newComment.value.trim()
      if (!id || !text) return
      savingComment.value = true
      try {
        // Mencione simples @nombre -> el backend notifica por mentions explícitos si matchean IDs;
        // enviamos texto plano y dejamos que el backend extraiga @<id>.
        await tasksApi.addComment(id, { text })
        newComment.value = ''
        const { data } = await tasksApi.listComments(id, { limit: 100 })
        comments.value = data.data
        emit('task-updated', props.task)
      } finally { savingComment.value = false }
    }
    const startEdit = (c: TaskComment) => { editingId.value = c._id; editingText.value = c.text }
    const saveEdit = async (c: TaskComment) => {
      await tasksApi.updateComment(c.taskId, c._id, { text: editingText.value })
      editingId.value = null
      const { data } = await tasksApi.listComments(c.taskId, { limit: 100 })
      comments.value = data.data
    }
    const deleteComment = async (c: TaskComment) => {
      await tasksApi.removeComment(c.taskId, c._id)
      comments.value = comments.value.filter(x => x._id !== c._id)
    }

    const onFilePicked = async (e: Event) => {
      const input = e.target as HTMLInputElement
      const file = input.files?.[0]
      input.value = ''
      if (!file || !props.task?._id) return
      uploading.value = true; uploadPct.value = 0
      try {
        const { data } = await tasksApi.addAttachment(props.task._id, file, (p) => { uploadPct.value = p })
        form.value.attachments = [...(form.value.attachments || []), data.file]
        emit('task-updated', data.task)
        void loadThread()
      } finally { uploading.value = false }
    }
    const deleteAttachment = async (a: any) => {
      if (!props.task?._id) return
      const { data } = await tasksApi.removeAttachment(props.task._id, a.id)
      form.value.attachments = (form.value.attachments || []).filter((x: any) => x.id !== a.id)
      if (form.value.coverAttachmentId === a.id) form.value.coverAttachmentId = null
      emit('task-updated', data)
    }
    const makeCover = async (a: any) => {
      form.value.coverAttachmentId = a.id
      form.value.coverColor = null
      if (props.task?._id) {
        const { data } = await tasksApi.update(props.task._id, { coverAttachmentId: a.id, coverColor: null } as any)
        emit('task-updated', data)
      }
    }

    const toggleComplete = async () => {
      if (!props.task?._id) return
      const { data } = await tasksApi.complete(props.task._id, { completed: !isDone.value })
      emit('task-updated', data.task)
      close()
    }
    const duplicate = async () => {
      if (!props.task?._id) return
      await tasksApi.duplicate(props.task._id)
      close()
    }
    const toggleArchive = async () => {
      form.value.archived = !form.value.archived
      if (props.task?._id) {
        const { data } = await tasksApi.update(props.task._id, { archived: form.value.archived } as any)
        emit('task-updated', data)
      }
      close()
    }

    return {
      form, COLORS, showLabelPop, newLabelName, newLabelColor, comments, activities, newComment, savingComment,
      editingId, editingText, uploading, uploadPct, currentUserId, isDone, checklistPct, membersProxy, memberToAdd, shortId, addMember, removeMember, isWatching,
      coverUrl, coverStyle, close, save, addLabel, removeLabel, addCheckItem, toggleWatchLocal, fileUrl, isImage,
      formatSize, formatDate, formatDateTime, activityLabel, postComment, startEdit, saveEdit, deleteComment,
      onFilePicked, deleteAttachment, makeCover, toggleComplete, duplicate, toggleArchive,
      loadUserOptions, loadUserOptionById, refreshTask,
    }
  },
})
</script>

<style scoped>
.task-modal-overlay { position: fixed; inset: 0; background: var(--color-overlay, rgba(0,0,0,.6)); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.task-modal-box { background: var(--color-bg-surface); color: var(--color-text-base); width: 880px; max-width: 96vw; max-height: 92vh; display: flex; flex-direction: column; border: 1px solid var(--color-border); border-radius: var(--radius); overflow: hidden; color-scheme: dark; }
:root[data-theme="light"] .task-modal-box { color-scheme: light; }
.task-cover { position: relative; min-height: 64px; display: flex; } .task-cover img { width: 100%; max-height: 180px; object-fit: cover; }
.cover-close { position: absolute; top: 8px; right: 8px; }
.task-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--color-border); font-weight: 700; }
.header-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.task-modal-body { display: grid; grid-template-columns: 1fr 220px; gap: 16px; padding: 16px; overflow: auto; }
.task-main { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.task-side { display: flex; flex-direction: column; gap: 8px; }
.task-side h4, .section h4 { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: var(--color-text-muted); }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.task-title-input { font-size: 20px; font-weight: 700; border: none; border-bottom: 1px solid transparent; width: 100%; background: transparent; color: var(--color-text-base); } .task-title-input:focus { outline: none; border-color: var(--color-primary); } .task-title-input::placeholder { color: var(--color-text-muted); }
.input, .popover-input, textarea { width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid var(--color-border); border-radius: var(--radius); background: var(--color-bg-surface-low); color: var(--color-text-base); }
.input::placeholder, textarea::placeholder { color: var(--color-text-muted); }
.input:focus, textarea:focus { outline: none; border-color: var(--color-border-focus); }
select.input option { background: var(--color-bg-surface); color: var(--color-text-base); }
.labels-row { display: flex; flex-wrap: wrap; gap: 6px; } .label-chip { border: 1px solid; border-radius: 20px; padding: 2px 8px; font-size: 12px; display: inline-flex; gap: 6px; align-items: center; } .label-chip button { border: none; background: none; cursor: pointer; color: inherit; }
.members-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.add-btn { border: 1px dashed var(--color-text-muted); background: none; border-radius: var(--radius); padding: 4px 10px; cursor: pointer; font-size: 12px; color: var(--color-text-base); white-space: nowrap; }
.add-btn:disabled { opacity: .4; cursor: default; }
.popover { border: 1px solid var(--color-border); border-radius: var(--radius); background: var(--color-bg-surface-low); padding: 10px; margin-top: 8px; display: flex; flex-direction: column; gap: 8px; }
.color-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; } .swatch { width: 24px; height: 24px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; } .swatch.active { border-color: var(--color-text-base); }
.btn-primary { background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius); padding: 8px 12px; cursor: pointer; font-weight: 600; } .btn-primary:hover { background: var(--color-primary-hover); } .btn-primary:disabled { opacity: .5; cursor: default; } .btn-block { width: 100%; }
.side-btn { border: 1px solid var(--color-border); background: var(--color-bg-surface-high); color: var(--color-text-base); border-radius: var(--radius); padding: 8px; cursor: pointer; text-align: left; font-size: 13px; } .side-btn:hover { background: var(--color-bg-surface-highest); }
.side-group { border-top: 1px solid var(--color-border); padding-top: 8px; }
.row-between { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.progress { height: 6px; background: var(--color-bg-surface-highest); border-radius: 4px; overflow: hidden; } .fill { height: 100%; background: var(--color-primary); }
.check-item { display: flex; gap: 8px; align-items: center; margin: 6px 0; } .check-item input[type="checkbox"] { accent-color: var(--color-primary); }
.icon-btn { border: none; background: none; font-size: 18px; cursor: pointer; color: var(--color-text-muted); } .icon-btn:hover { color: var(--color-text-base); }
.mini-btn { font-size: 12px; border: 1px solid var(--color-border); background: var(--color-bg-surface-high); color: var(--color-text-base); border-radius: var(--radius); padding: 2px 8px; cursor: pointer; } .mini-btn:hover { background: var(--color-bg-surface-highest); } .mini-btn.danger { color: var(--color-error); } .mini-btn:disabled { opacity: .4; }
.attach-row { display: flex; gap: 10px; align-items: center; border: 1px solid var(--color-border); border-radius: var(--radius); background: var(--color-bg-surface-low); padding: 8px; margin: 6px 0; }
.attach-thumb { width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius); background: var(--color-bg-surface-highest); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.attach-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; } .attach-meta a { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-primary-dim, var(--color-primary)); } .attach-meta small { color: var(--color-text-muted); }
.comment-box textarea { width: 100%; } .comment { border-top: 1px solid var(--color-border-subtle); padding: 8px 0; } .comment-head { display: flex; gap: 8px; align-items: baseline; } .comment-head small { color: var(--color-text-muted); } .comment-text { white-space: pre-wrap; margin: 4px 0; } .comment-actions { display: flex; gap: 6px; margin-top: 4px; }
.activity { display: flex; gap: 8px; align-items: center; font-size: 13px; padding: 4px 0; } .activity .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); flex-shrink: 0; } .activity small { margin-left: auto; color: var(--color-text-muted); }
.muted { color: var(--color-text-muted); font-size: 13px; } .file-label { cursor: pointer; } .watch-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; font-size: 13px; } .watch-row input { accent-color: var(--color-primary); }
/* Quill snow adaptado al tema (el editor se monta por JS: selectores deep) */
:deep(.ql-toolbar.ql-snow) { border-color: var(--color-border); background: var(--color-bg-surface-low); border-radius: 0; }
:deep(.ql-container.ql-snow) { border-color: var(--color-border); background: var(--color-bg-surface-low); color: var(--color-text-base); }
:deep(.ql-editor) { min-height: 120px; color: var(--color-text-base); }
:deep(.ql-editor.ql-blank::before) { color: var(--color-text-muted); }
:deep(.ql-snow .ql-stroke) { stroke: var(--color-text-muted); }
:deep(.ql-snow .ql-fill) { fill: var(--color-text-muted); }
:deep(.ql-snow .ql-picker-label) { color: var(--color-text-muted); }
:deep(.ql-snow .ql-picker-options) { background: var(--color-bg-surface); border-color: var(--color-border); }
@media (max-width: 760px) { .task-modal-body { grid-template-columns: 1fr; } }
</style>
