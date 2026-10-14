<template>
  <div v-if="modelValue" class="goal-modal-overlay w95-dialog-overlay" @click.self="isOpen = false">
    <div class="goal-modal w95-window">
      <div class="w95-titlebar">
        <win-icon name="dir-check" :size="16" alt="" />
        <span class="title-text">{{ isEditing ? 'Editar objetivo' : 'Nuevo objetivo' }} — Orkpad</span>
        <div class="w95-titlebar-buttons">
          <button class="w95-title-btn" @click="isOpen = false" title="Cerrar"><span class="tbtn-close" aria-hidden="true">×</span></button>
        </div>
      </div>

      <div class="goal-modal__body">
        <form class="goal-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">Tipo</label>
            <div class="type-selector">
              <button
                v-for="opt in typeOptions"
                :key="opt.value"
                type="button"
                class="type-option"
                :class="{ active: form.type === opt.value }"
                @click="onTypeChange(opt.value)"
              >
                <win-icon :material="opt.icon" :size="16" :alt="opt.label" />
                {{ opt.label }}
              </button>
            </div>
          </div>

          <w-input v-model="form.title" label="Título" placeholder="Ej: Enviar 10 mails de prospección" :error="errors.title" />

          <div class="form-group">
            <label class="form-label">Descripción (opcional)</label>
            <textarea v-model="form.description" class="form-textarea" rows="2"></textarea>
          </div>

          <div v-if="form.type !== 'target'" class="form-group">
            <label class="form-label">Periodicidad</label>
            <select v-model="form.period" class="form-select">
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>

          <div v-if="form.type !== 'checklist'" class="form-row">
            <w-input v-model.number="form.targetCount" type="number" label="Objetivo" placeholder="10" />
            <w-input v-model="form.unit" label="Unidad (opcional)" placeholder="mails, páginas, $" />
          </div>

          <div v-if="form.type === 'target'" class="form-group">
            <label class="form-label">Fecha límite</label>
            <input v-model="form.dueDate" type="date" class="form-select" />
            <span v-if="errors.dueDate" class="w-input-error">{{ errors.dueDate }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Color</label>
            <div class="color-selector">
              <button
                v-for="c in colorOptions"
                :key="c"
                type="button"
                class="color-swatch"
                :style="{ backgroundColor: c }"
                :class="{ active: form.color === c }"
                @click="form.color = c"
              ></button>
            </div>
          </div>
        </form>
      </div>

      <div class="goal-modal__footer">
        <button class="w95-btn" @click="isOpen = false">Cancelar</button>
        <button class="w95-btn w95-btn--default" :disabled="loading" @click="handleSubmit">Guardar</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import WInput from '@/components/ui/WInput.vue'
import WinIcon from '@/components/win95/WinIcon.vue'
import type { Goal, GoalType } from '@/api/goals/goals.types'

const COLOR_OPTIONS = ['#5B4EFF', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899']

interface FormState {
  _id?: string
  title: string
  description: string
  type: GoalType
  period: 'daily' | 'weekly' | 'monthly' | 'none'
  targetCount: number
  unit: string
  dueDate: string
  color: string
}

function emptyForm(): FormState {
  return {
    title: '',
    description: '',
    type: 'habit',
    period: 'daily',
    targetCount: 1,
    unit: '',
    dueDate: '',
    color: COLOR_OPTIONS[0],
  }
}

export default defineComponent({
  name: 'GoalModal',
  components: { WInput, WinIcon },
  props: {
    modelValue: { type: Boolean, required: true },
    initialData: { type: Object as PropType<Goal | null>, default: null },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'save'],
  data() {
    return {
      form: emptyForm(),
      errors: {} as Record<string, string>,
      colorOptions: COLOR_OPTIONS,
      typeOptions: [
        { value: 'habit', label: 'Hábito', icon: 'repeat' },
        { value: 'target', label: 'Meta', icon: 'flag' },
        { value: 'checklist', label: 'Checklist', icon: 'checklist' },
      ] as { value: GoalType; label: string; icon: string }[],
    }
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
    isEditing(): boolean {
      return !!this.initialData?._id
    },
  },
  watch: {
    modelValue(newVal: boolean) {
      if (!newVal) return
      this.errors = {}
      if (this.initialData) {
        this.form = {
          _id: this.initialData._id,
          title: this.initialData.title,
          description: this.initialData.description ?? '',
          type: this.initialData.type,
          period: this.initialData.period,
          targetCount: this.initialData.targetCount,
          unit: this.initialData.unit ?? '',
          dueDate: this.initialData.dueDate ? this.initialData.dueDate.slice(0, 10) : '',
          color: this.initialData.color,
        }
      } else {
        this.form = emptyForm()
      }
    },
  },
  methods: {
    onTypeChange(type: GoalType) {
      this.form.type = type
      if (type === 'checklist') {
        this.form.targetCount = 1
        this.form.period = 'daily'
      }
      if (type === 'target') {
        this.form.period = 'none'
      } else if (this.form.period === 'none') {
        this.form.period = 'daily'
      }
    },
    validate(): boolean {
      const errors: Record<string, string> = {}
      if (!this.form.title.trim()) errors.title = 'El título es obligatorio'
      if (this.form.type === 'target' && !this.form.dueDate) {
        errors.dueDate = 'La fecha límite es obligatoria para metas'
      }
      this.errors = errors
      return Object.keys(errors).length === 0
    },
    handleSubmit() {
      if (!this.validate()) return

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const payload: Record<string, any> = {
        title: this.form.title.trim(),
        description: this.form.description.trim() || undefined,
        type: this.form.type,
        period: this.form.type === 'target' ? 'none' : this.form.period,
        targetCount: this.form.targetCount || 1,
        unit: this.form.unit || undefined,
        color: this.form.color,
        timezone,
      }
      if (this.form.type === 'target' && this.form.dueDate) {
        payload.dueDate = new Date(`${this.form.dueDate}T23:59:59`).toISOString()
      }
      if (this.form._id) payload._id = this.form._id

      this.$emit('save', payload)
    },
  },
})
</script>

<style scoped>
.goal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.form-textarea,
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

.form-textarea:focus,
.form-select:focus {
  border-color: var(--color-primary);
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
}

.type-option.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(91, 78, 255, 0.08);
}

.color-selector {
  display: flex;
  gap: 8px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}

.color-swatch.active {
  border-color: var(--color-text-base);
}

.w-input-error {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-error);
  text-transform: uppercase;
}

.drawer-footer-actions {
  display: flex;
  gap: 12px;
}
</style>

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .goal-modal-overlay {
position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6000;
  padding: 16px;
}

html[data-appearance="win95"] .goal-modal {
width: 440px;
  max-width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  padding: 2px;
}

html[data-appearance="win95"] .goal-modal__body {
padding: 8px;
  overflow-y: auto;
  flex: 1;
  background: var(--w95-face);
}

html[data-appearance="win95"] .goal-form {
display: flex;
  flex-direction: column;
  gap: 16px;
}

html[data-appearance="win95"] .form-group {
display: flex;
  flex-direction: column;
  gap: 6px;
}

html[data-appearance="win95"] .form-row {
display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

html[data-appearance="win95"] .form-label {
font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

html[data-appearance="win95"] .form-textarea, html[data-appearance="win95"] .form-select {
background-color: var(--color-bg-base);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 12px;
  outline: none;
  border-radius: 4px;
}

html[data-appearance="win95"] .form-textarea:focus, html[data-appearance="win95"] .form-select:focus {
border-color: var(--color-primary);
}

html[data-appearance="win95"] .type-selector {
display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

html[data-appearance="win95"] .type-option {
display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  background: var(--w95-face);
  border: 2px solid;
  border-color: var(--w95-highlight) var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-highlight);
  box-shadow: inset 1px 1px 0 var(--w95-face-light), inset -1px -1px 0 var(--w95-shadow);
  color: #000;
  cursor: pointer;
  border-radius: 0;
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 10px;
  text-transform: uppercase;
}

html[data-appearance="win95"] .type-option.active {
font-weight: bold;
  background: var(--w95-face);
  color: #000;
  border-color: var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-darkshadow);
  box-shadow: inset 1px 1px 0 var(--w95-highlight), inset -1px -1px 0 var(--w95-shadow), 0 0 0 1px #000;
}

html[data-appearance="win95"] .color-selector {
display: flex;
  gap: 8px;
}

html[data-appearance="win95"] .color-swatch {
width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}

html[data-appearance="win95"] .color-swatch.active {
border-color: var(--color-text-base);
}

html[data-appearance="win95"] .w-input-error {
font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-error);
  text-transform: uppercase;
}

html[data-appearance="win95"] .goal-modal__footer {
display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--w95-shadow);
  box-shadow: inset 0 1px 0 var(--w95-highlight);
  background: var(--w95-face);
}
</style>
