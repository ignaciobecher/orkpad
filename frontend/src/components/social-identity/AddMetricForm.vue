<template>
  <form class="metric-form" @submit.prevent="handleSubmit" novalidate>
    <div class="form-row">
      <div class="form-group">
        <label>Semana <span class="required-mark">*</span></label>
        <input v-model.number="form.weekNumber" type="number" min="1" max="53" />
      </div>
      <div class="form-group">
        <label>Año <span class="required-mark">*</span></label>
        <input v-model.number="form.year" type="number" />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Posts publicados</label>
        <input v-model.number="form.postsPublished" type="number" min="0" />
      </div>
      <div class="form-group">
        <label>Conexiones solicitadas</label>
        <input v-model.number="form.connectionsRequested" type="number" min="0" />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Mensajes enviados</label>
        <input v-model.number="form.messagesSent" type="number" min="0" />
      </div>
      <div class="form-group">
        <label>Respuestas recibidas</label>
        <input v-model.number="form.responsesReceived" type="number" min="0" />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Llamadas conseguidas</label>
        <input v-model.number="form.callsBooked" type="number" min="0" />
      </div>
      <div class="form-group">
        <label>Clientes cerrados</label>
        <input v-model.number="form.clientsClosed" type="number" min="0" />
      </div>
    </div>

    <div class="form-group">
      <label>Post con mejor desempeño</label>
      <input v-model="form.topPerformingPost" type="text" />
    </div>

    <div class="form-group">
      <label>Notas</label>
      <textarea v-model="form.notes" rows="3"></textarea>
    </div>

    <w-button variant="primary" block :disabled="loading" @click="handleSubmit">
      {{ loading ? 'Guardando...' : 'Registrar semana' }}
    </w-button>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import WButton from '@/components/ui/WButton.vue'
import { useToast } from '@/composables/useToast'
import type { AddWeeklyMetricDto } from '@/api/social-identity/social-identity.types'

function currentWeekYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil((((now as any) - (start as any)) / 86400000 + start.getDay() + 1) / 7)
  return { weekNumber: week, year: now.getFullYear() }
}

function emptyForm(): AddWeeklyMetricDto {
  return {
    ...currentWeekYear(),
    postsPublished: 0,
    connectionsRequested: undefined,
    messagesSent: 0,
    responsesReceived: 0,
    callsBooked: 0,
    clientsClosed: 0,
    topPerformingPost: '',
    notes: '',
  }
}

export default defineComponent({
  name: 'AddMetricForm',
  components: { WButton },
  props: {
    loading: { type: Boolean, default: false },
  },
  emits: ['submit'],
  setup(_props, { emit }) {
    const { warning } = useToast()
    const form = ref(emptyForm())

    function handleSubmit() {
      if (!form.value.weekNumber || !form.value.year) {
        warning('Completa la semana y el año')
        return
      }
      emit('submit', { ...form.value })
      form.value = emptyForm()
    }

    return { form, handleSubmit }
  },
})
</script>

<style scoped>
.metric-form { display: flex; flex-direction: column; gap: 16px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label {
  font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--color-text-muted);
}
.required-mark { color: var(--color-error); }

.form-group input,
.form-group textarea {
  background: var(--color-bg-surface-low); border: 1px solid var(--color-border);
  color: var(--color-text-base); font-family: var(--font-body); font-size: 13px;
  padding: 10px 12px; outline: none; border-radius: 4px; width: 100%;
}
.form-group input:focus,
.form-group textarea:focus { border-color: var(--color-border-focus); }

@media (max-width: 540px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
