<template>
  <w-drawer v-model="isOpen" title="Registrar actividad de prospección" width="420px">
    <form class="activity-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label">Tipo</label>
        <select v-model="form.type" class="form-select">
          <option value="cold_email">Cold email</option>
          <option value="proposal_sent">Propuesta enviada</option>
          <option value="call_booked">Llamada agendada</option>
          <option value="follow_up">Follow-up</option>
          <option value="linkedin_message">Mensaje LinkedIn</option>
          <option value="other">Otro</option>
        </select>
      </div>

      <w-input v-model="form.targetName" label="Contacto / empresa" placeholder="Ej: Acme Corp" :error="errors.targetName" />
      <w-input v-model="form.channel" label="Canal (opcional)" placeholder="Ej: linkedin, email" />
      <w-input v-model="form.notes" label="Notas (opcional)" placeholder="Ej: referido por..." />
    </form>

    <template #footer>
      <div class="drawer-footer-actions">
        <w-button variant="secondary" block @click="isOpen = false">Cancelar</w-button>
        <w-button variant="primary" block :loading="loading" @click="handleSubmit">Registrar</w-button>
      </div>
    </template>
  </w-drawer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import WButton from '@/components/ui/WButton.vue'
import WInput from '@/components/ui/WInput.vue'
import type { OutreachActivityType } from '@/api/outreach/outreach.types'

interface FormState {
  type: OutreachActivityType
  targetName: string
  channel: string
  notes: string
}

function emptyForm(): FormState {
  return { type: 'cold_email', targetName: '', channel: '', notes: '' }
}

export default defineComponent({
  name: 'OutreachActivityModal',
  components: { WDrawer, WButton, WInput },
  props: {
    modelValue: { type: Boolean, required: true },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'save'],
  data() {
    return { form: emptyForm(), errors: {} as Record<string, string> }
  },
  computed: {
    isOpen: {
      get(): boolean {
        return this.modelValue
      },
      set(val: boolean) {
        this.$emit('update:modelValue', val)
      },
    },
  },
  watch: {
    modelValue(newVal: boolean) {
      if (newVal) {
        this.form = emptyForm()
        this.errors = {}
      }
    },
  },
  methods: {
    handleSubmit() {
      if (!this.form.targetName.trim()) {
        this.errors = { targetName: 'El contacto es obligatorio' }
        return
      }
      this.$emit('save', {
        type: this.form.type,
        targetName: this.form.targetName.trim(),
        channel: this.form.channel.trim() || undefined,
        notes: this.form.notes.trim() || undefined,
      })
    },
  },
})
</script>

<style scoped>
.activity-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.form-select {
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 12px;
  outline: none;
  border-radius: 4px;
}

.drawer-footer-actions {
  display: flex;
  gap: 12px;
}
</style>
