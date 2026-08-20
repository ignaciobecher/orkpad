<template>
  <w-drawer v-model="isOpen" title="Definir foco de la semana" width="420px">
    <form class="focus-form" @submit.prevent="handleSubmit">
      <w-input v-model="form.title" label="¿Qué querés aprender esta semana?" placeholder="Ej: Kubernetes" :error="errors.title" />
      <w-input v-model="form.category" label="Categoría (opcional)" placeholder="Ej: devops, ia, ciberseguridad" />
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
import { defineComponent } from 'vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import WButton from '@/components/ui/WButton.vue'
import WInput from '@/components/ui/WInput.vue'

export default defineComponent({
  name: 'SkillFocusModal',
  components: { WDrawer, WButton, WInput },
  props: {
    modelValue: { type: Boolean, required: true },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'save'],
  data() {
    return { form: { title: '', category: '' }, errors: {} as Record<string, string> }
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
        this.form = { title: '', category: '' }
        this.errors = {}
      }
    },
  },
  methods: {
    handleSubmit() {
      if (!this.form.title.trim()) {
        this.errors = { title: 'El foco es obligatorio' }
        return
      }
      this.$emit('save', { title: this.form.title.trim(), category: this.form.category.trim() || undefined })
    },
  },
})
</script>

<style scoped>
.focus-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-footer-actions {
  display: flex;
  gap: 12px;
}
</style>
