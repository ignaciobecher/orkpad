<template>
  <div class="client-access">
    <div class="section-header">
      <h2 class="section-title">Acceso cliente</h2>
      <span class="section-count">{{ shares.length }}</span>
      <button class="add-btn" @click="showForm = !showForm">
        {{ showForm ? 'Cancelar' : '+ Nuevo acceso' }}
      </button>
    </div>
    <p class="muted">Generá un link privado con usuario y contraseña para que el cliente vea el kanban del proyecto, cargue y edite sus tareas.</p>

    <!-- Crear -->
    <div v-if="showForm" class="share-form">
      <div class="grid-2">
        <div>
          <label>Etiqueta</label>
          <input v-model="form.label" class="input" placeholder="Ej: Acceso cliente Acme" />
        </div>
        <div>
          <label>Vence (opcional)</label>
          <input v-model="form.expiresAt" type="date" class="input" />
        </div>
      </div>
      <div class="grid-2">
        <div>
          <label>Usuario</label>
          <div class="row">
            <input v-model="form.username" class="input" placeholder="cliente-acme" />
            <button class="mini-btn" @click="suggestUsername">Sugerir</button>
          </div>
        </div>
        <div>
          <label>Contraseña</label>
          <div class="row">
            <input v-model="form.password" class="input" placeholder="Mínimo 6 caracteres" />
            <button class="mini-btn" @click="generatePassword">Generar</button>
          </div>
        </div>
      </div>
      <div class="perms">
        <label v-for="p in PERM_DEFS" :key="p.key" class="perm">
          <input type="checkbox" v-model="form.permissions[p.key]" /> {{ p.label }}
        </label>
      </div>
      <button class="btn-primary" :disabled="creating || !valid" @click="create">
        {{ creating ? 'Creando...' : 'Crear acceso' }}
      </button>
      <p v-if="formError" class="error">{{ formError }}</p>
    </div>

    <!-- Credenciales recién creadas -->
    <div v-if="fresh" class="fresh-box">
      <h4>Acceso creado — copiá estos datos ahora (la contraseña no se vuelve a mostrar)</h4>
      <div class="cred-row"><span>Link:</span><code>{{ fresh.link }}</code><button class="mini-btn" @click="copy(fresh.link)">Copiar</button></div>
      <div class="cred-row"><span>Usuario:</span><code>{{ fresh.username }}</code><button class="mini-btn" @click="copy(fresh.username)">Copiar</button></div>
      <div class="cred-row"><span>Contraseña:</span><code>{{ fresh.password }}</code><button class="mini-btn" @click="copy(fresh.password)">Copiar</button></div>
    </div>

    <!-- Lista -->
    <div v-if="loading" class="muted">Cargando accesos...</div>
    <div v-for="s in shares" :key="s._id" class="share-card" :class="{ inactive: !s.isActive }">
      <div class="share-head">
        <strong>{{ s.label }}</strong>
        <span class="user-chip">@{{ s.username }}</span>
        <span v-if="!s.isActive" class="inactive-chip">Revocado</span>
        <span v-if="s.expiresAt" class="muted">vence {{ s.expiresAt.split('T')[0] }}</span>
      </div>
      <div class="cred-row"><span>Link:</span><code>{{ portalLink(s) }}</code><button class="mini-btn" @click="copy(portalLink(s))">Copiar</button></div>
      <div class="perms">
        <label v-for="p in PERM_DEFS" :key="p.key" class="perm">
          <input type="checkbox" :checked="!!s.permissions?.[p.key]" @change="togglePerm(s, p.key)" /> {{ p.label }}
        </label>
      </div>
      <div v-if="s.lastAccessAt" class="muted">Último acceso: {{ formatDT(s.lastAccessAt) }}</div>
      <div class="share-actions">
        <button class="mini-btn" @click="toggleActive(s)">{{ s.isActive ? 'Revocar' : 'Activar' }}</button>
        <button class="mini-btn" @click="regenToken(s)">Nuevo link</button>
        <button class="mini-btn" @click="startPw(s)">Nueva contraseña</button>
        <button class="mini-btn danger" @click="remove(s)">Eliminar</button>
      </div>
      <div v-if="pwFor === s._id" class="row">
        <input v-model="pwValue" class="input" placeholder="Nueva contraseña (mín 6)" />
        <button class="mini-btn" @click="generatePwValue">Generar</button>
        <button class="mini-btn" @click="savePw(s)">Guardar</button>
      </div>
      <div v-if="newPw && newPw.id === s._id" class="fresh-box">
        <span>Nueva contraseña: </span><code>{{ newPw.password }}</code>
        <button class="mini-btn" @click="copy(newPw.password)">Copiar</button>
      </div>
    </div>
    <p v-if="!loading && !shares.length" class="muted">Todavía no hay accesos para este proyecto.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { projectsApi } from '@/api/projects/projects.api'
import type { ProjectShare } from '@/api/projects/projects.types'

const PERM_DEFS = [
  { key: 'canCreate', label: 'Crear tareas' },
  { key: 'canEdit', label: 'Editar/mover' },
  { key: 'canComment', label: 'Comentar' },
  { key: 'canUpload', label: 'Adjuntar' },
] as const

function randomPassword(len = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!#'
  const arr = new Uint32Array(len)
  crypto.getRandomValues(arr)
  return [...arr].map(n => chars[n % chars.length]).join('')
}

export default defineComponent({
  name: 'ClientAccessSection',
  props: { projectId: { type: String, required: true } },
  setup(props) {
    const shares = ref<ProjectShare[]>([])
    const loading = ref(false)
    const showForm = ref(false)
    const creating = ref(false)
    const formError = ref('')
    const form = ref({ label: '', username: '', password: '', expiresAt: '', permissions: { canCreate: true, canEdit: true, canComment: true, canUpload: true } })
    const fresh = ref<{ link: string; username: string; password: string } | null>(null)
    const pwFor = ref<string | null>(null)
    const pwValue = ref('')
    const newPw = ref<{ id: string; password: string } | null>(null)

    const valid = computed(() =>
      form.value.label.trim().length > 0 &&
      /^[a-z0-9][a-z0-9._-]*$/.test(form.value.username.trim()) &&
      form.value.password.length >= 6,
    )

    const portalLink = (s: ProjectShare) => `${window.location.origin}/p/${s.token}`

    const load = async () => {
      loading.value = true
      try {
        const { data } = await projectsApi.listShares(props.projectId)
        shares.value = data
      } catch { shares.value = [] } finally { loading.value = false }
    }

    const suggestUsername = () => {
      const base = (form.value.label || 'cliente').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || 'cliente'
      form.value.username = `${base}-${Math.random().toString(36).slice(2, 6)}`
    }
    const generatePassword = () => { form.value.password = randomPassword() }
    const generatePwValue = () => { pwValue.value = randomPassword() }

    const create = async () => {
      if (!valid.value) return
      creating.value = true
      formError.value = ''
      try {
        const { data } = await projectsApi.createShare(props.projectId, {
          label: form.value.label.trim(),
          username: form.value.username.trim().toLowerCase(),
          password: form.value.password,
          permissions: { ...form.value.permissions },
          ...(form.value.expiresAt ? { expiresAt: form.value.expiresAt } : {}),
        })
        fresh.value = { link: portalLink(data.share), username: data.share.username, password: data.password }
        form.value = { label: '', username: '', password: '', expiresAt: '', permissions: { canCreate: true, canEdit: true, canComment: true, canUpload: true } }
        showForm.value = false
        await load()
      } catch (err: any) {
        formError.value = err.response?.data?.message || 'Error al crear el acceso'
      } finally { creating.value = false }
    }

    const togglePerm = async (s: ProjectShare, key: string) => {
      const next = { ...(s.permissions || {}), [key]: !(s.permissions as any)?.[key] }
      try {
        const { data } = await projectsApi.updateShare(props.projectId, s._id, { permissions: next })
        s.permissions = data.share.permissions
      } catch { /* el checkbox revierte solo al recargar */ await load() }
    }

    const toggleActive = async (s: ProjectShare) => {
      const { data } = await projectsApi.updateShare(props.projectId, s._id, { isActive: !s.isActive })
      s.isActive = data.share.isActive
    }

    const regenToken = async (s: ProjectShare) => {
      if (!confirm('El link anterior dejará de funcionar. ¿Continuar?')) return
      const { data } = await projectsApi.regenerateShareToken(props.projectId, s._id)
      s.token = data.token
    }

    const startPw = (s: ProjectShare) => { pwFor.value = s._id; pwValue.value = randomPassword(); newPw.value = null }
    const savePw = async (s: ProjectShare) => {
      if (pwValue.value.length < 6) return
      const { data } = await projectsApi.updateShare(props.projectId, s._id, { password: pwValue.value })
      if (data.password) newPw.value = { id: s._id, password: data.password }
      pwFor.value = null
      pwValue.value = ''
    }

    const remove = async (s: ProjectShare) => {
      if (!confirm(`¿Eliminar el acceso "${s.label}"? El cliente perderá el acceso.`)) return
      await projectsApi.removeShare(props.projectId, s._id)
      shares.value = shares.value.filter(x => x._id !== s._id)
    }

    const copy = async (text: string) => {
      try { await navigator.clipboard.writeText(text) } catch { /* noop */ }
    }
    const formatDT = (d: string) => { try { return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) } catch { return d } }

    onMounted(load)

    return {
      shares, loading, showForm, creating, formError, form, fresh, pwFor, pwValue, newPw,
      PERM_DEFS, valid, portalLink, suggestUsername, generatePassword, generatePwValue,
      create, togglePerm, toggleActive, regenToken, startPw, savePw, remove, copy, formatDT,
    }
  },
})
</script>

<style scoped>
.client-access { display: flex; flex-direction: column; gap: 12px; }
.section-header { display: flex; align-items: center; gap: 10px; }
.section-title { margin: 0; font-size: 16px; }
.section-count { background: var(--color-bg-surface-highest); border-radius: 10px; padding: 0 8px; font-size: 12px; }
.muted { color: var(--color-text-muted); font-size: 13px; margin: 0; }
.error { color: var(--color-error); font-size: 13px; }
.share-form { border: 1px solid var(--color-border); border-radius: var(--radius); background: var(--color-bg-surface-low); padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.share-form label { font-size: 12px; color: var(--color-text-muted); display: block; margin-bottom: 4px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.row { display: flex; gap: 6px; } .row .input { flex: 1; }
.input { width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid var(--color-border); border-radius: var(--radius); background: var(--color-bg-surface); color: var(--color-text-base); }
.perms { display: flex; gap: 12px; flex-wrap: wrap; } .perm { display: flex; gap: 6px; align-items: center; font-size: 13px; } .perm input { accent-color: var(--color-primary); }
.btn-primary { background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius); padding: 8px 12px; cursor: pointer; font-weight: 600; align-self: flex-start; } .btn-primary:disabled { opacity: .5; }
.add-btn { border: 1px dashed var(--color-text-muted); background: none; border-radius: var(--radius); padding: 4px 10px; cursor: pointer; font-size: 12px; color: var(--color-text-base); margin-left: auto; }
.mini-btn { font-size: 12px; border: 1px solid var(--color-border); background: var(--color-bg-surface-high); color: var(--color-text-base); border-radius: var(--radius); padding: 2px 8px; cursor: pointer; white-space: nowrap; } .mini-btn.danger { color: var(--color-error); }
.fresh-box { border: 1px solid var(--color-success); border-radius: var(--radius); background: var(--color-success-bg); padding: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 13px; } .fresh-box h4 { margin: 0; font-size: 13px; }
.cred-row { display: flex; gap: 8px; align-items: center; font-size: 13px; flex-wrap: wrap; } .cred-row span { color: var(--color-text-muted); min-width: 80px; } .cred-row code { background: var(--color-bg-surface-highest); padding: 2px 6px; border-radius: 4px; word-break: break-all; flex: 1; }
.share-card { border: 1px solid var(--color-border); border-radius: var(--radius); background: var(--color-bg-surface-low); padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.share-card.inactive { opacity: .6; }
.share-head { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.user-chip { background: var(--color-bg-surface-highest); border-radius: 12px; padding: 0 8px; font-size: 12px; }
.inactive-chip { color: var(--color-error); font-size: 12px; font-weight: 700; }
.share-actions { display: flex; gap: 6px; flex-wrap: wrap; }
@media (max-width: 700px) { .grid-2 { grid-template-columns: 1fr; } }
</style>
