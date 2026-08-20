<template>
  <w-drawer v-model="isOpen" :title="isEditing ? 'Editar recurso' : 'Nuevo recurso de aprendizaje'" width="440px">
    <form class="resource-form" @submit.prevent="handleSubmit">
      <w-input v-model="form.title" label="Título" placeholder="Ej: Designing Data-Intensive Applications" :error="errors.title" />

      <div class="form-group">
        <label class="form-label">Tipo</label>
        <select v-model="form.type" class="form-select">
          <option value="book">Libro</option>
          <option value="video">Video</option>
          <option value="course">Curso</option>
          <option value="article">Artículo</option>
          <option value="podcast">Podcast</option>
        </select>
      </div>

      <w-input v-model="form.author" label="Autor / fuente (opcional)" placeholder="Ej: Martin Kleppmann" />

      <div class="form-row">
        <w-input v-model.number="form.totalUnits" type="number" label="Total (opcional)" placeholder="Ej: 320" />
        <div class="form-group">
          <label class="form-label">Unidad</label>
          <select v-model="form.unit" class="form-select">
            <option value="pages">Páginas</option>
            <option value="minutes">Minutos</option>
            <option value="episodes">Episodios</option>
            <option value="chapters">Capítulos</option>
            <option value="percent">Porcentaje</option>
          </select>
        </div>
      </div>

      <w-input
        v-model.number="form.dailyGoalUnits"
        type="number"
        label="Mínimo diario (opcional)"
        placeholder="Ej: 20 páginas por día"
      />
    </form>

    <template #footer>
      <div class="drawer-footer-actions">
        <w-button variant="secondary" block @click="isOpen = false">Cancelar</w-button>
        <w-button variant="primary" block :loading="loading" @click="handleSubmit">Guardar</w-button>
      </div>
    </template>
  </w-drawer>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import WButton from '@/components/ui/WButton.vue'
import WInput from '@/components/ui/WInput.vue'
import type { LearningResource, LearningResourceType, LearningResourceUnit } from '@/api/learning/learning.types'

interface FormState {
  title: string
  type: LearningResourceType
  author: string
  totalUnits: number | null
  unit: LearningResourceUnit
  dailyGoalUnits: number | null
}

function emptyForm(): FormState {
  return { title: '', type: 'book', author: '', totalUnits: null, unit: 'pages', dailyGoalUnits: null }
}

export default defineComponent({
  name: 'LearningResourceModal',
  components: { WDrawer, WButton, WInput },
  props: {
    modelValue: { type: Boolean, required: true },
    initialData: { type: Object as PropType<LearningResource | null>, default: null },
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
          title: this.initialData.title,
          type: this.initialData.type,
          author: this.initialData.author ?? '',
          totalUnits: this.initialData.totalUnits,
          unit: this.initialData.unit,
          dailyGoalUnits: this.initialData.dailyGoalUnits,
        }
      } else {
        this.form = emptyForm()
      }
    },
  },
  methods: {
    handleSubmit() {
      if (!this.form.title.trim()) {
        this.errors = { title: 'El título es obligatorio' }
        return
      }

      this.$emit('save', {
        _id: this.initialData?._id,
        title: this.form.title.trim(),
        type: this.form.type,
        author: this.form.author.trim() || undefined,
        totalUnits: this.form.totalUnits || undefined,
        unit: this.form.unit,
        dailyGoalUnits: this.form.dailyGoalUnits || undefined,
      })
    },
  },
})
</script>

<style scoped>
.resource-form {
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

.form-select:focus {
  border-color: var(--color-primary);
}

.drawer-footer-actions {
  display: flex;
  gap: 12px;
}
</style>
