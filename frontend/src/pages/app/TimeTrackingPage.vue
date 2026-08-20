<template>
  <div class="tt-page">
    <!-- ───── HEADER ───── -->
    <header class="tt-header">
      <h1 class="tt-title">Time Tracking</h1>
      <w-button
        v-if="!hasActiveSession"
        variant="primary"
        :loading="loading"
        @click="handleStart"
      >
        <span class="material-symbols-outlined mr-1">play_arrow</span>
        INICIAR JORNADA
      </w-button>
    </header>

    <!-- ───── JORNADA ACTIVA ───── -->
    <section v-if="activeSession" class="active-card">
      <div class="active-card__left">
        <div class="active-badge">
          <span class="active-dot"></span>
          JORNADA ACTIVA
        </div>
        <div class="active-timer">{{ elapsedTime }}</div>
        <div class="active-meta">
          {{ formatDate(activeSession.startTime) }} &middot; inicio {{ formatTime(activeSession.startTime) }}
        </div>
      </div>
      <div class="active-card__right">
        <w-button variant="secondary" @click="openAddBlock">
          <span class="material-symbols-outlined mr-1">add</span>
          AGREGAR BLOQUE
        </w-button>
        <w-button variant="danger" :loading="loading" @click="handleEnd">
          <span class="material-symbols-outlined mr-1">stop</span>
          FINALIZAR JORNADA
        </w-button>
      </div>
    </section>

    <!-- bloques de la jornada activa -->
    <section v-if="activeSession" class="blocks-section">
      <div class="section-label">BLOQUES DE HOY</div>

      <div v-if="entriesLoading" class="blocks-loading">
        <span class="material-symbols-outlined spin">autorenew</span>
      </div>

      <div v-else-if="!activeEntries.length" class="blocks-empty">
        Sin bloques registrados — agrega el primero arriba.
      </div>

      <div v-else class="blocks-list">
        <div
          v-for="entry in activeEntries"
          :key="entry._id"
          class="block-row"
        >
          <span class="material-symbols-outlined block-icon">schedule</span>
          <div class="block-project">{{ getProjectLabel(entry.projectId) }}</div>
          <div class="block-time">
            {{ formatTime(entry.startTime) }}
            <span class="arrow">→</span>
            {{ entry.endTime ? formatTime(entry.endTime) : '…' }}
          </div>
          <div class="block-duration mono">{{ formatDuration(entry.duration) }}</div>
          <div v-if="entry.description" class="block-desc">{{ entry.description }}</div>
          <button class="block-delete" @click="handleRemoveBlock(entry._id)" title="Eliminar">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <div v-if="activeEntries.length" class="blocks-summary">
        <span class="summary-label">TOTAL REGISTRADO</span>
        <span class="summary-value mono">{{ totalActiveHours }}</span>
      </div>
    </section>

    <!-- ───── SIN JORNADA ───── -->
    <section v-else-if="!loading" class="no-session">
      <span class="material-symbols-outlined no-session__icon">wb_sunny</span>
      <p class="no-session__title">SIN JORNADA ACTIVA</p>
      <p class="no-session__sub">Registra el inicio de tu día de trabajo y los bloques dedicados a cada proyecto.</p>
      <w-button variant="primary" :loading="loading" @click="handleStart">
        <span class="material-symbols-outlined mr-1">play_arrow</span>
        INICIAR JORNADA
      </w-button>
    </section>

    <!-- ───── HISTORIAL ───── -->
    <section class="history-section">
      <div class="section-label">HISTORIAL DE JORNADAS</div>

      <div v-if="loading && !pastSessions.length" class="blocks-loading">
        <span class="material-symbols-outlined spin">autorenew</span>
      </div>

      <div v-else-if="!pastSessions.length" class="blocks-empty">
        Sin jornadas anteriores registradas.
      </div>

      <div v-else class="history-list">
        <div
          v-for="session in pastSessions"
          :key="session._id"
          class="history-item"
        >
          <button class="history-header" @click="toggleHistory(session._id)">
            <div class="history-date">{{ formatDate(session.startTime) }}</div>
            <div class="history-range mono">
              {{ formatTime(session.startTime) }} → {{ session.endTime ? formatTime(session.endTime) : '—' }}
            </div>
            <div class="history-total mono">{{ formatSessionDuration(session) }}</div>
            <span class="material-symbols-outlined history-chevron">
              {{ expandedSessions[session._id] ? 'expand_less' : 'expand_more' }}
            </span>
            <button
              class="history-delete"
              @click.stop="handleRemoveSession(session._id)"
              title="Eliminar jornada"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </button>

          <div v-if="expandedSessions[session._id]" class="history-entries">
            <div v-if="entriesLoading" class="blocks-loading small">
              <span class="material-symbols-outlined spin">autorenew</span>
            </div>
            <div
              v-else-if="!getSessionEntries(session._id).length"
              class="blocks-empty small"
            >
              Sin bloques en esta jornada.
            </div>
            <div v-else>
              <div
                v-for="entry in getSessionEntries(session._id)"
                :key="entry._id"
                class="block-row block-row--compact"
              >
                <span class="material-symbols-outlined block-icon">schedule</span>
                <div class="block-project">{{ getProjectLabel(entry.projectId) }}</div>
                <div class="block-time">
                  {{ formatTime(entry.startTime) }}
                  <span class="arrow">→</span>
                  {{ entry.endTime ? formatTime(entry.endTime) : '—' }}
                </div>
                <div class="block-duration mono">{{ formatDuration(entry.duration) }}</div>
                <div v-if="entry.description" class="block-desc">{{ entry.description }}</div>
              </div>
              <div class="history-breakdown">
                <div
                  v-for="(mins, proj) in getProjectBreakdown(session._id)"
                  :key="proj"
                  class="breakdown-row"
                >
                  <span class="breakdown-proj">{{ proj }}</span>
                  <span class="breakdown-mins mono">{{ formatDuration(mins) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── MODAL AGREGAR BLOQUE ───── -->
    <div v-if="showAddBlockModal" class="modal-overlay" @click.self="showAddBlockModal = false">
      <div class="modal-box">
        <h3 class="modal-title">AGREGAR BLOQUE DE PROYECTO</h3>

        <div class="modal-form">
          <div class="form-group">
            <label>Proyecto</label>
            <select v-model="blockForm.projectId" class="form-select">
              <option value="">Sin proyecto</option>
              <option v-for="p in projectOptions" :key="p.value" :value="p.value">
                {{ p.label }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Inicio <span class="required">*</span></label>
              <input
                v-model="blockForm.startTime"
                type="datetime-local"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Fin</label>
              <input
                v-model="blockForm.endTime"
                type="datetime-local"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <input
              v-model="blockForm.description"
              type="text"
              class="form-input"
              placeholder="Opcional"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="showAddBlockModal = false">Cancelar</button>
          <w-button
            variant="primary"
            :loading="blockSaving"
            :disabled="!blockForm.startTime"
            @click="handleSaveBlock"
          >
            Guardar bloque
          </w-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import WButton from '@/components/ui/WButton.vue'
import { useWorkSessionsStore } from '@/stores/work-sessions.store'
import { loadProjectOptions } from '@/utils/remote-entity-options'

export default defineComponent({
  name: 'TimeTrackingPage',
  components: { WButton },

  data() {
    return {
      now: new Date() as Date,
      timer: null as ReturnType<typeof setInterval> | null,
      expandedSessions: {} as Record<string, boolean>,
      projectLabels: {} as Record<string, string>,
      projectOptions: [] as { value: string; label: string }[],
      showAddBlockModal: false,
      blockSaving: false,
      blockForm: {
        projectId: '',
        startTime: '',
        endTime: '',
        description: '',
      },
    }
  },

  computed: {
    ...mapState(useWorkSessionsStore, [
      'sessions',
      'activeSession',
      'loading',
      'entriesLoading',
      'entriesBySession',
    ]),

    hasActiveSession(): boolean {
      return this.activeSession !== null
    },

    pastSessions(): any[] {
      return (this.sessions as any[]).filter((s: any) => s.endTime)
    },

    activeEntries(): any[] {
      if (!this.activeSession) return []
      return (this.entriesBySession as any)[(this.activeSession as any)._id] ?? []
    },

    elapsedTime(): string {
      if (!this.activeSession) return '00:00:00'
      const diff = this.now.getTime() - new Date((this.activeSession as any).startTime).getTime()
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0')
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0')
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
      return `${h}:${m}:${s}`
    },

    totalActiveHours(): string {
      const total = (this.activeEntries as any[]).reduce(
        (sum: number, e: any) => sum + (e.duration || 0), 0,
      )
      return this.formatDuration(total)
    },
  },

  methods: {
    ...mapActions(useWorkSessionsStore, [
      'init',
      'startSession',
      'endSession',
      'fetchEntriesForSession',
      'addBlock',
      'removeBlock',
      'removeSession',
    ]),

    async handleStart() {
      await this.startSession()
    },

    async handleEnd() {
      if (!this.activeSession) return
      if (!confirm('¿Finalizar la jornada de hoy?')) return
      await this.endSession((this.activeSession as any)._id)
    },

    async toggleHistory(sessionId: string) {
      this.expandedSessions = {
        ...this.expandedSessions,
        [sessionId]: !this.expandedSessions[sessionId],
      }
      if (this.expandedSessions[sessionId] && !(this.entriesBySession as any)[sessionId]) {
        await this.fetchEntriesForSession(sessionId)
        await this.loadLabels((this.entriesBySession as any)[sessionId] ?? [])
      }
    },

    async openAddBlock() {
      if (!this.projectOptions.length) {
        this.projectOptions = await loadProjectOptions('').catch(() => [])
      }
      this.blockForm = {
        projectId: '',
        startTime: this.toLocalDatetimeInput(new Date()),
        endTime: '',
        description: '',
      }
      this.showAddBlockModal = true
    },

    async handleSaveBlock() {
      if (!this.activeSession || !this.blockForm.startTime) return
      this.blockSaving = true
      try {
        await this.addBlock((this.activeSession as any)._id, {
          projectId: this.blockForm.projectId || undefined,
          startTime: new Date(this.blockForm.startTime).toISOString(),
          endTime: this.blockForm.endTime
            ? new Date(this.blockForm.endTime).toISOString()
            : undefined,
          description: this.blockForm.description || undefined,
        })
        this.showAddBlockModal = false
      } finally {
        this.blockSaving = false
      }
    },

    async handleRemoveBlock(entryId: string) {
      if (!this.activeSession) return
      if (!confirm('¿Eliminar este bloque?')) return
      await this.removeBlock((this.activeSession as any)._id, entryId)
    },

    async handleRemoveSession(sessionId: string) {
      if (!confirm('¿Eliminar esta jornada?')) return
      await this.removeSession(sessionId)
    },

    getSessionEntries(sessionId: string): any[] {
      return (this.entriesBySession as any)[sessionId] ?? []
    },

    getProjectLabel(projectId?: string): string {
      if (!projectId) return 'Sin proyecto'
      return this.projectLabels[projectId] || 'Cargando…'
    },

    getProjectBreakdown(sessionId: string): Record<string, number> {
      const entries = this.getSessionEntries(sessionId)
      const breakdown: Record<string, number> = {}
      for (const e of entries) {
        const label = this.getProjectLabel(e.projectId)
        breakdown[label] = (breakdown[label] ?? 0) + (e.duration || 0)
      }
      return breakdown
    },

    async loadLabels(entries: any[]) {
      const { loadProjectOptionById } = await import('@/utils/remote-entity-options')
      const ids = [...new Set(entries.map((e: any) => e.projectId).filter(Boolean))] as string[]
      await Promise.all(
        ids.map(async (id) => {
          if (this.projectLabels[id]) return
          const opt = await loadProjectOptionById(id).catch(() => null)
          if (opt) this.projectLabels = { ...this.projectLabels, [id]: opt.label }
        }),
      )
    },

    formatDate(iso: string): string {
      return new Date(iso).toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    },

    formatTime(iso: string): string {
      return new Date(iso).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    },

    formatDuration(minutes: number): string {
      if (!minutes) return '0m'
      const h = Math.floor(minutes / 60)
      const m = minutes % 60
      if (h === 0) return `${m}m`
      if (m === 0) return `${h}h`
      return `${h}h ${m}m`
    },

    toLocalDatetimeInput(date: Date): string {
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
    },

    formatSessionDuration(session: any): string {
      if (!session.endTime) return '—'
      const mins = Math.round(
        (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000,
      )
      return this.formatDuration(mins)
    },
  },

  watch: {
    entriesBySession: {
      deep: true,
      handler() {
        const allEntries = Object.values(this.entriesBySession as Record<string, any[]>).flat()
        this.loadLabels(allEntries)
      },
    },
  },

  async mounted() {
    await this.init()
    await this.loadLabels(this.activeEntries)
    this.timer = setInterval(() => { this.now = new Date() }, 1000)
  },

  unmounted() {
    if (this.timer) clearInterval(this.timer)
  },
})
</script>

<style scoped>
.tt-page {
  padding: 32px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.tt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
@media (max-width: 1024px) {
  .tt-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .tt-page {
    padding: 16px;
  }
  .active-card {
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
  }
  .active-card__right {
    align-items: stretch;
  }
  .block-row {
    grid-template-columns: 20px 1fr 28px;
    grid-template-areas: 
      "icon project delete"
      ". time time"
      ". duration ."
      ". desc desc";
    gap: 8px;
    padding: 12px;
  }
  .block-icon { grid-area: icon; }
  .block-project { grid-area: project; }
  .block-delete { grid-area: delete; justify-self: end; }
  .block-time { grid-area: time; }
  .block-duration { grid-area: duration; }
  .block-desc { grid-area: desc; }

  .history-header {
    grid-template-columns: 1fr auto 24px 28px;
    grid-template-areas: 
      "date date date delete"
      "range total chevron .";
    gap: 8px;
    padding: 12px;
  }
  .history-date { grid-area: date; }
  .history-range { grid-area: range; }
  .history-total { grid-area: total; justify-self: end; }
  .history-chevron { grid-area: chevron; justify-self: end; }
  .history-delete { grid-area: delete; justify-self: end; }

  .form-row {
    grid-template-columns: 1fr;
  }
}

.tt-title {
  font-family: var(--font-body);
  font-size: 24px;
  font-weight: 600;
  color: white;
}
.mr-1 { margin-right: 6px; }

/* active session */
.active-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 24px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-primary);
  border-left: 4px solid var(--color-primary);
}
@media (max-width: 700px) { .active-card { flex-direction: column; } }
.active-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}
.active-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.active-timer {
  font-family: var(--font-mono);
  font-size: 40px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 8px;
}
.active-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
}
.active-card__right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.section-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

/* blocks */
.blocks-section {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 20px;
}
.blocks-loading {
  display: flex;
  justify-content: center;
  padding: 24px;
  color: var(--color-text-muted);
}
.blocks-loading.small,
.blocks-empty.small { padding: 12px 16px; }
.blocks-empty {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  padding: 16px 0;
}
.blocks-list { display: flex; flex-direction: column; gap: 1px; }
.block-row {
  display: grid;
  grid-template-columns: 20px 1fr auto auto 1fr 28px;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  background: var(--color-bg-surface-low);
}
.block-row:hover { background: var(--color-bg-surface-container); }
.block-row--compact {
  grid-template-columns: 20px 1fr auto auto 1fr;
  background: var(--color-bg-surface);
  padding: 8px 16px;
}
.block-icon { font-size: 16px; color: var(--color-text-muted); }
.block-project { font-size: 13px; color: var(--color-text-base); font-weight: 500; }
.block-time {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
}
.arrow { margin: 0 4px; color: var(--color-text-muted); }
.block-duration {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-primary);
  white-space: nowrap;
}
.block-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.block-delete {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  padding: 2px;
}
.block-delete:hover { color: var(--color-error); }
.block-delete .material-symbols-outlined { font-size: 16px; }
.blocks-summary {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}
.summary-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
}
.summary-value {
  font-size: 14px;
  color: var(--color-primary);
  font-weight: 600;
}

/* no session */
.no-session {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  border: 1px dashed var(--color-border);
  background: var(--color-bg-surface);
  text-align: center;
}
.no-session__icon { font-size: 40px; color: var(--color-text-muted); }
.no-session__title {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.no-session__sub { font-size: 13px; color: var(--color-text-muted); max-width: 360px; }

/* history */
.history-section { display: flex; flex-direction: column; }
.history-list { display: flex; flex-direction: column; gap: 2px; }
.history-item {
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
}
.history-header {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto auto 24px 28px;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: transparent;
  border: none;
  color: var(--color-text-base);
  cursor: pointer;
  text-align: left;
}
.history-header:hover { background: rgba(255,255,255,0.03); }
.history-date {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-base);
  text-transform: capitalize;
}
.history-range { font-size: 11px; color: var(--color-text-muted); }
.history-total { font-size: 12px; color: var(--color-primary); font-weight: 600; }
.history-chevron { font-size: 18px; color: var(--color-text-muted); }
.history-delete {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  padding: 2px;
}
.history-delete:hover { color: var(--color-error); }
.history-delete .material-symbols-outlined { font-size: 16px; }
.history-entries {
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-surface-low);
}
.history-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border-subtle);
}
.breakdown-row { display: flex; align-items: center; gap: 8px; }
.breakdown-proj { font-size: 12px; color: var(--color-text-muted); }
.breakdown-mins { font-size: 12px; color: var(--color-primary); }

.spin { animation: spin 1s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
.mono { font-family: var(--font-mono); }

/* modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-box {
  width: 100%;
  max-width: 480px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 28px;
}
.modal-title {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 20px;
}
.modal-form { display: flex; flex-direction: column; gap: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.required { color: var(--color-error); }
.form-input,
.form-select {
  background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border);
  padding: 9px 12px;
  color: var(--color-text-base);
  font-family: var(--font-body);
  font-size: 13px;
  outline: none;
  width: 100%;
  color-scheme: dark;
}
.form-input:focus,
.form-select:focus { border-color: var(--color-primary); }
.form-select option { background: var(--color-bg-surface-low); }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}
.btn-cancel {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 9px 16px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
}
.btn-cancel:hover { border-color: var(--color-text-muted); color: var(--color-text-base); }
</style>
