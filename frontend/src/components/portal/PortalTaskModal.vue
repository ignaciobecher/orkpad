<template>
  <div class="portal-modal-overlay" @click.self="$emit('close')">
    <div class="portal-modal-box">
      <div v-if="coverUrl || form.coverColor" class="task-cover" :style="coverUrl ? {} : { background: form.coverColor }">
        <img v-if="coverUrl" :src="coverUrl" alt="Portada" />
      </div>
      <div class="portal-modal-header">
        <span class="header-title">{{ form.title || 'Tarea' }}</span>
        <button class="icon-btn" @click="$emit('close')">×</button>
      </div>
      <div class="portal-modal-body">
        <input v-model="form.title" class="task-title-input" :readonly="!perms.canEdit" placeholder="Título" @change="saveBase" />

        <div v-if="(form.labels || []).length" class="labels-row">
          <span v-for="(l, i) in form.labels" :key="i" class="label-chip" :style="{ backgroundColor: l.color + '22', color: l.color, borderColor: l.color + '55' }">
            {{ l.name }}
            <button v-if="perms.canEdit" @click="removeLabel(i)">×</button>
          </span>
        </div>
        <div v-if="perms.canEdit" class="row">
          <input v-model="newLabelName" class="input" placeholder="Nueva etiqueta" />
          <input v-model="newLabelColor" type="color" class="color-input" />
          <button class="mini-btn" @click="addLabel">Añadir</button>
        </div>

        <div class="grid-2">
          <div><label>Inicio</label><input v-model="form.startDate" type="date" class="input" :disabled="!perms.canEdit" @change="saveBase" /></div>
          <div><label>Vencimiento</label><input v-model="form.dueDate" type="date" class="input" :disabled="!perms.canEdit" @change="saveBase" /></div>
          <div>
            <label>Prioridad</label>
            <select v-model="form.priority" class="input" :disabled="!perms.canEdit" @change="saveBase">
              <option value="low">Baja</option><option value="medium">Media</option>
              <option value="high">Alta</option><option value="urgent">Urgente</option>
            </select>
          </div>
          <div>
            <label>Estado</label>
            <select v-model="statusSel" class="input" :disabled="!perms.canEdit" @change="saveBase">
              <option value="todo">Pendiente</option><option value="in-progress">En curso</option>
              <option value="done">Finalizada</option><option value="cancelled">Cancelada</option>
            </select>
          </div>
        </div>

        <div>
          <label>Descripción</label>
          <div v-if="!perms.canEdit && form.description" class="ql-content" v-html="form.description"></div>
          <p v-else-if="!perms.canEdit" class="muted">Sin descripción.</p>
          <QuillEditor v-else v-model:content="form.description" content-type="html" theme="snow" placeholder="Descripción..." @blur="saveBase" />
        </div>

        <div>
          <div class="row-between"><label>Checklist</label><span v-if="form.checklist.length" class="muted">{{ doneCount }}/{{ form.checklist.length }}</span></div>
          <div v-for="(it, idx) in form.checklist" :key="idx" class="check-item">
            <input type="checkbox" v-model="it.completed" :disabled="!perms.canEdit" @change="saveBase" />
            <input v-model="it.text" class="input" :readonly="!perms.canEdit" @change="saveBase" />
            <button v-if="perms.canEdit" class="icon-btn" @click="removeCheck(idx)">×</button>
          </div>
          <button v-if="perms.canEdit" class="add-btn" @click="addCheck">+ Añadir elemento</button>
        </div>

        <div>
          <div class="row-between">
            <label>Adjuntos ({{ (form.attachments || []).length }})</label>
            <label v-if="perms.canUpload" class="add-btn file-label">+ Subir<input type="file" hidden @change="onFile" :disabled="uploading" /></label>
          </div>
          <div v-if="uploading" class="progress"><div class="fill" :style="{ width: uploadPct + '%' }" /></div>
          <div v-for="a in (form.attachments || [])" :key="a.id" class="attach-row">
            <div class="attach-meta">
              <a :href="portalApi.fileUrl(task._id, a.id)" target="_blank" rel="noopener">{{ a.name }}</a>
              <small>{{ formatSize(a.size) }}</small>
            </div>
            <button v-if="perms.canUpload" class="icon-btn" @click="delAttach(a)">×</button>
          </div>
        </div>

        <div>
          <label>Comentarios ({{ comments.length }})</label>
          <div v-if="perms.canComment" class="comment-box">
            <textarea v-model="newComment" rows="2" class="input" placeholder="Escribí un comentario..." />
            <button class="btn-primary" :disabled="!newComment.trim() || sending" @click="postComment">{{ sending ? 'Enviando...' : 'Comentar' }}</button>
          </div>
          <div v-for="c in comments" :key="c._id" class="comment">
            <div class="comment-head"><strong>{{ c.authorName || 'Miembro' }}</strong><small>{{ fmtDT(c.createdAt) }}</small></div>
            <div v-if="editingId !== c._id" class="comment-text">{{ c.text }}</div>
            <textarea v-else v-model="editingText" rows="2" class="input" />
            <div v-if="c.authorId === actorId" class="comment-actions">
              <template v-if="editingId !== c._id"><button class="mini-btn" @click="startEdit(c)">Editar</button></template>
              <template v-else><button class="mini-btn" @click="saveEdit(c)">Guardar</button><button class="mini-btn" @click="editingId = null">Cancelar</button></template>
              <button class="mini-btn danger" @click="delComment(c)">Eliminar</button>
            </div>
          </div>
        </div>

        <div v-if="activities.length">
          <label>Actividad</label>
          <div v-for="a in activities" :key="a._id" class="activity">
            <span class="dot" /><span><strong>{{ a.actorName || 'Sistema' }}</strong> {{ a.type }}</span><small>{{ fmtDT(a.createdAt) }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { portalApi, type PortalPermissions } from '@/api/portal/portal.api'

export default defineComponent({
  name: 'PortalTaskModal',
  components: { QuillEditor },
  props: {
    task: { type: Object as () => any, required: true },
    permissions: { type: Object as () => PortalPermissions, required: true },
    actorId: { type: String, default: '' },
  },
  emits: ['close', 'changed'],
  setup(props, { emit }) {
    const perms = computed(() => props.permissions)
    const form = ref<any>({ title: '', description: '', priority: 'medium', dueDate: '', startDate: '', checklist: [], labels: [], attachments: [], coverColor: null, coverAttachmentId: null })
    const statusSel = ref('todo')
    const comments = ref<any[]>([])
    const activities = ref<any[]>([])
    const newComment = ref('')
    const sending = ref(false)
    const editingId = ref<string | null>(null)
    const editingText = ref('')
    const uploading = ref(false)
    const uploadPct = ref(0)
    const newLabelName = ref('')
    const newLabelColor = ref('#2563EB')
    const saving = ref(false)

    const doneCount = computed(() => form.value.checklist.filter((i: any) => i.completed).length)
    const coverUrl = computed(() => {
      const att = (form.value.attachments || []).find((a: any) => a.id === form.value.coverAttachmentId)
      if (!att || !(att.type || '').startsWith('image/')) return null
      return portalApi.fileUrl(props.task._id, att.id)
    })

    const reset = () => {
      const t = props.task
      form.value = {
        title: t.title || '', description: t.description || '', priority: t.priority || 'medium',
        dueDate: t.dueDate ? String(t.dueDate).split('T')[0] : '', startDate: t.startDate ? String(t.startDate).split('T')[0] : '',
        checklist: t.checklist ? JSON.parse(JSON.stringify(t.checklist)) : [],
        labels: t.labels ? JSON.parse(JSON.stringify(t.labels)) : [],
        attachments: t.attachments ? JSON.parse(JSON.stringify(t.attachments)) : [],
        coverColor: t.coverColor ?? null, coverAttachmentId: t.coverAttachmentId ?? null,
      }
      statusSel.value = t.status || 'todo'
    }

    const loadThread = async () => {
      try {
        const [{ data: c }, { data: a }] = await Promise.all([
          portalApi.listComments(props.task._id),
          portalApi.listActivities(props.task._id),
        ])
        comments.value = c.data
        activities.value = a.data
      } catch { /* noop */ }
    }

    const refresh = async () => {
      try {
        const { data } = await portalApi.getTasks()
        const fresh = (data.data as any[]).find(t => t._id === props.task._id)
        if (fresh) emit('changed', fresh)
      } catch { /* noop */ }
    }

    const saveBase = async () => {
      if (!perms.value.canEdit || saving.value) return
      saving.value = true
      try {
        const { data } = await portalApi.updateTask(props.task._id, {
          title: form.value.title, description: form.value.description, priority: form.value.priority,
          status: statusSel.value, dueDate: form.value.dueDate || null, startDate: form.value.startDate || null,
          checklist: form.value.checklist.filter((i: any) => i.text.trim() !== ''),
          labels: form.value.labels, coverColor: form.value.coverColor, coverAttachmentId: form.value.coverAttachmentId,
        })
        emit('changed', data)
      } finally { saving.value = false }
    }

    const addLabel = () => {
      if (!newLabelName.value.trim()) return
      form.value.labels.push({ name: newLabelName.value.trim(), color: newLabelColor.value })
      newLabelName.value = ''
      void saveBase()
    }
    const removeLabel = (i: number) => { form.value.labels.splice(i, 1); void saveBase() }
    const addCheck = () => { form.value.checklist.push({ text: '', completed: false }) }
    const removeCheck = (i: number) => { form.value.checklist.splice(i, 1); void saveBase() }

    const postComment = async () => {
      const text = newComment.value.trim()
      if (!text) return
      sending.value = true
      try {
        await portalApi.addComment(props.task._id, { text })
        newComment.value = ''
        const { data } = await portalApi.listComments(props.task._id)
        comments.value = data.data
        void refresh()
      } finally { sending.value = false }
    }
    const startEdit = (c: any) => { editingId.value = c._id; editingText.value = c.text }
    const saveEdit = async (c: any) => {
      await portalApi.updateComment(c.taskId, c._id, { text: editingText.value })
      editingId.value = null
      const { data } = await portalApi.listComments(c.taskId)
      comments.value = data.data
    }
    const delComment = async (c: any) => {
      await portalApi.removeComment(c.taskId, c._id)
      comments.value = comments.value.filter(x => x._id !== c._id)
      void refresh()
    }

    const onFile = async (e: Event) => {
      const input = e.target as HTMLInputElement
      const file = input.files?.[0]
      input.value = ''
      if (!file) return
      uploading.value = true
      uploadPct.value = 0
      try {
        const { data } = await portalApi.uploadAttachment(props.task._id, file, p => { uploadPct.value = p })
        form.value.attachments = [...(form.value.attachments || []), data.file]
        emit('changed', data.task)
      } finally { uploading.value = false }
    }
    const delAttach = async (a: any) => {
      const { data } = await portalApi.removeAttachment(props.task._id, a.id)
      form.value.attachments = (form.value.attachments || []).filter((x: any) => x.id !== a.id)
      emit('changed', data)
    }

    const formatSize = (n: number) => n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`
    const fmtDT = (d: any) => { try { return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) } catch { return '' } }

    onMounted(() => { reset(); void loadThread() })

    return {
      perms, form, statusSel, comments, activities, newComment, sending, editingId, editingText,
      uploading, uploadPct, newLabelName, newLabelColor, doneCount, coverUrl, portalApi,
      saveBase, addLabel, removeLabel, addCheck, removeCheck, postComment, startEdit, saveEdit,
      delComment, onFile, delAttach, formatSize, fmtDT,
    }
  },
})
</script>

<style scoped>
.portal-modal-overlay { position: fixed; inset: 0; background: var(--color-overlay, rgba(0,0,0,.6)); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; color-scheme: dark; }
.portal-modal-box { background: var(--color-bg-surface); color: var(--color-text-base); width: 720px; max-width: 94vw; max-height: 90vh; display: flex; flex-direction: column; border: 1px solid var(--color-border); overflow: hidden; }
.task-cover img { width: 100%; max-height: 150px; object-fit: cover; display: block; }
.task-cover { min-height: 48px; }
.portal-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--color-border); font-weight: 700; }
.header-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.portal-modal-body { padding: 16px; overflow: auto; display: flex; flex-direction: column; gap: 14px; }
.portal-modal-body label { font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: var(--color-text-muted); display: block; margin-bottom: 4px; }
.task-title-input { font-size: 20px; font-weight: 700; border: none; background: transparent; color: var(--color-text-base); width: 100%; } .task-title-input:focus { outline: none; }
.input { width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid var(--color-border); background: var(--color-bg-surface-low); color: var(--color-text-base); }
.row { display: flex; gap: 6px; } .row .input { flex: 1; } .color-input { width: 40px; height: 34px; padding: 0; border: 1px solid var(--color-border); background: none; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.labels-row { display: flex; flex-wrap: wrap; gap: 6px; } .label-chip { border: 1px solid; border-radius: 20px; padding: 2px 8px; font-size: 12px; display: inline-flex; gap: 6px; align-items: center; } .label-chip button { border: none; background: none; cursor: pointer; color: inherit; }
.row-between { display: flex; justify-content: space-between; align-items: center; }
.check-item { display: flex; gap: 8px; align-items: center; margin: 6px 0; } .check-item input[type="checkbox"] { accent-color: var(--color-primary); }
.icon-btn { border: none; background: none; font-size: 18px; cursor: pointer; color: var(--color-text-muted); }
.mini-btn, .add-btn { font-size: 12px; border: 1px solid var(--color-border); background: var(--color-bg-surface-high); color: var(--color-text-base); padding: 4px 10px; cursor: pointer; } .mini-btn.danger { color: var(--color-error); } .file-label { cursor: pointer; }
.btn-primary { background: var(--color-primary); color: #fff; border: none; padding: 8px 12px; cursor: pointer; font-weight: 600; margin-top: 6px; } .btn-primary:disabled { opacity: .5; }
.progress { height: 6px; background: var(--color-bg-surface-highest); overflow: hidden; } .fill { height: 100%; background: var(--color-primary); }
.attach-row { display: flex; gap: 10px; align-items: center; border: 1px solid var(--color-border); background: var(--color-bg-surface-low); padding: 8px; margin: 6px 0; }
.attach-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; } .attach-meta a { color: var(--color-primary-dim, var(--color-primary)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .attach-meta small { color: var(--color-text-muted); }
.comment { border-top: 1px solid var(--color-border-subtle); padding: 8px 0; } .comment-head { display: flex; gap: 8px; align-items: baseline; } .comment-head small { color: var(--color-text-muted); } .comment-text { white-space: pre-wrap; margin: 4px 0; } .comment-actions { display: flex; gap: 6px; }
.comment-box { display: flex; flex-direction: column; gap: 6px; margin: 6px 0 10px; } .comment-box .btn-primary { align-self: flex-end; margin-top: 0; }
.activity { display: flex; gap: 8px; align-items: center; font-size: 13px; padding: 4px 0; } .activity .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); flex-shrink: 0; } .activity small { margin-left: auto; color: var(--color-text-muted); }
.muted { color: var(--color-text-muted); font-size: 13px; }
:deep(.ql-toolbar.ql-snow) { border-color: var(--color-border); background: var(--color-bg-surface-low); }
:deep(.ql-container.ql-snow) { border-color: var(--color-border); background: var(--color-bg-surface-low); color: var(--color-text-base); }
:deep(.ql-editor) { min-height: 100px; color: var(--color-text-base); }
:deep(.ql-editor.ql-blank::before) { color: var(--color-text-muted); }
:deep(.ql-snow .ql-stroke) { stroke: var(--color-text-muted); }
:deep(.ql-snow .ql-fill) { fill: var(--color-text-muted); }
:deep(.ql-snow .ql-picker-label) { color: var(--color-text-muted); }
:deep(.ql-snow .ql-picker-options) { background: var(--color-bg-surface); border-color: var(--color-border); }
@media (max-width: 640px) { .grid-2 { grid-template-columns: 1fr; } }
</style>
