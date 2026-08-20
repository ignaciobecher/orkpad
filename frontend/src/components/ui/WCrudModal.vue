<template>
  <w-drawer v-model="isOpen" :title="isEditing ? $t('common.editRecord') : $t('common.createRecord')" width="450px">
    <form @submit.prevent="handleSubmit" class="crud-form" novalidate>
      <div v-for="field in schema" :key="field.name" class="form-group" :class="{ 'has-error': fieldErrors[field.name] }">
        <label :for="field.name">
          {{ field.label }}
          <span v-if="field.required" class="required-mark">*</span>
        </label>

        <select
          v-if="field.type === 'select'"
          :id="field.name"
          v-model="formData[field.name]"
          @change="clearFieldError(field.name)"
        >
          <option value="">{{ $t('common.select') }}</option>
          <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>

        <w-remote-select
          v-else-if="field.type === 'remote-select'"
          :model-value="formData[field.name]"
          :placeholder="field.placeholder"
          :search-placeholder="field.searchPlaceholder"
          :error="fieldErrors[field.name]"
          :disabled="isRemoteFieldDisabled(field)"
          :disabled-message="field.dependsOnMessage"
          :allow-custom="field.allowCustom"
          :custom-label-prefix="field.customLabelPrefix"
          :load-options="(search) => loadRemoteOptions(field, search)"
          :load-option-by-value="(value) => loadRemoteOptionByValue(field, value)"
          @update:model-value="handleRemoteFieldUpdate(field, $event)"
        />

        <textarea
          v-else-if="field.type === 'textarea'"
          :id="field.name"
          v-model="formData[field.name]"
          rows="4"
          @input="clearFieldError(field.name)"
        ></textarea>

        <input
          v-else
          :type="field.type || 'text'"
          :id="field.name"
          :step="field.centsField ? '0.01' : undefined"
          v-model="formData[field.name]"
          @input="clearFieldError(field.name)"
        />

        <span v-if="fieldErrors[field.name]" class="field-error">
          <span class="material-symbols-outlined">error</span>
          {{ fieldErrors[field.name] }}
        </span>
      </div>
    </form>

    <template #footer>
      <div class="drawer-footer-actions">
        <w-button variant="secondary" block @click="isOpen = false">{{ $t('common.cancel') }}</w-button>
        <w-button variant="primary" block @click="handleSubmit" :disabled="loading">
          {{ loading ? $t('common.saving') : $t('common.save') }}
        </w-button>
      </div>
    </template>
  </w-drawer>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { useToast } from '@/composables/useToast'
import type { RemoteOption } from '@/utils/remote-entity-options'
import WButton from './WButton.vue'
import WDrawer from './WDrawer.vue'
import WRemoteSelect from './WRemoteSelect.vue'

export interface CrudField {
  name: string
  label: string
  type?: string
  required?: boolean
  options?: { label: string; value: any }[]
  placeholder?: string
  searchPlaceholder?: string
  dependsOn?: string
  dependsOnMessage?: string
  resets?: string[]
  allowCustom?: boolean
  customLabelPrefix?: string
  centsField?: boolean
  loadOptions?: (_search: string, _formData: Record<string, any>) => Promise<RemoteOption[]>
  loadOptionByValue?: (_value: string, _formData: Record<string, any>) => Promise<RemoteOption | null>
}

export default defineComponent({
  name: 'WCrudModal',
  components: { WDrawer, WButton, WRemoteSelect },
  props: {
    modelValue: { type: Boolean, required: true },
    schema: { type: Array as PropType<CrudField[]>, required: true },
    initialData: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'save'],
  setup() {
    const { warning } = useToast()
    return { warning }
  },
  data() {
    return {
      formData: {} as Record<string, any>,
      fieldErrors: {} as Record<string, string>
    }
  },
  computed: {
    isOpen: {
      get() { return this.modelValue },
      set(val: boolean) { this.$emit('update:modelValue', val) }
    },
    isEditing() { return !!this.initialData._id }
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        this.formData = { ...this.initialData }
        this.fieldErrors = {}
        for (const field of this.schema as CrudField[]) {
          const val = this.formData[field.name]
          if (val == null) continue
          if (field.type === 'date' && typeof val === 'string' && val) {
            const d = new Date(val)
            const yyyy = d.getFullYear()
            const mm = String(d.getMonth() + 1).padStart(2, '0')
            const dd = String(d.getDate()).padStart(2, '0')
            this.formData[field.name] = `${yyyy}-${mm}-${dd}`
          }
          if (field.centsField && typeof val === 'number') {
            this.formData[field.name] = val / 100
          }
        }
      }
    }
  },
  methods: {
    clearFieldError(name: string) {
      if (this.fieldErrors[name]) {
        delete this.fieldErrors[name]
      }
    },
    isRemoteFieldDisabled(field: CrudField) {
      return !!field.dependsOn && !this.formData[field.dependsOn]
    },
    async loadRemoteOptions(field: CrudField, search: string) {
      if (!field.loadOptions || this.isRemoteFieldDisabled(field)) return []
      return field.loadOptions(search, this.formData)
    },
    async loadRemoteOptionByValue(field: CrudField, value: string) {
      if (!field.loadOptionByValue) return null
      return field.loadOptionByValue(value, this.formData)
    },
    handleRemoteFieldUpdate(field: CrudField, value: string) {
      this.formData[field.name] = value
      this.clearFieldError(field.name)

      field.resets?.forEach((fieldName) => {
        this.formData[fieldName] = ''
        this.clearFieldError(fieldName)
      })
    },
    validate(): boolean {
      const errors: Record<string, string> = {}
      for (const field of (this.schema as CrudField[])) {
        if (!field.required) continue
        const val = this.formData[field.name]
        if (val === undefined || val === null || val === '') {
          errors[field.name] = `${field.label} es obligatorio`
        }
      }
      this.fieldErrors = errors
      if (Object.keys(errors).length > 0) {
        const count = Object.keys(errors).length
        this.warning(`Completa los ${count} campo${count > 1 ? 's' : ''} obligatorio${count > 1 ? 's' : ''} antes de guardar`)
        return false
      }
      return true
    },
    handleSubmit() {
      if (!this.validate()) return

      const allowedKeys = new Set((this.schema as CrudField[]).map((f: CrudField) => f.name))
      const cleanedData: Record<string, any> = {}

      if (this.formData._id) {
        cleanedData._id = this.formData._id
      }

      allowedKeys.forEach((key: string) => {
        const value = this.formData[key]
        const field = (this.schema as CrudField[]).find(f => f.name === key)
        if (value !== '' && value !== null && value !== undefined) {
          if (field?.type === 'date' && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [y, m, d] = value.split('-').map(Number)
            cleanedData[key] = new Date(y, m - 1, d, 12, 0, 0).toISOString()
          } else if (field?.centsField) {
            cleanedData[key] = Math.round(Number(value) * 100)
          } else if (field?.type === 'number') {
            cleanedData[key] = Number(value)
          } else {
            cleanedData[key] = value
          }
        }
      })

      this.$emit('save', cleanedData)
    }
  }
})
</script>

<style scoped>
.crud-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-mark {
  color: var(--color-error);
  font-size: 14px;
  line-height: 1;
}

.form-group input,
.form-group select,
.form-group textarea {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 10px 12px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-base);
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--color-primary);
}

.form-group.has-error input,
.form-group.has-error select,
.form-group.has-error textarea {
  border-color: var(--color-error);
  background-color: rgba(239, 68, 68, 0.04);
}

.field-error {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-error);
  font-family: var(--font-body);
  font-size: 12px;
}

.field-error span {
  font-size: 14px;
}

.drawer-footer-actions {
  display: flex;
  gap: 12px;
}
</style>
