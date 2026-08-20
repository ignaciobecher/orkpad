<template>
  <w-drawer v-model="isOpen" title="Duplicar cuenta" width="400px">
    <form class="duplicate-form" @submit.prevent>
      <div class="form-group">
        <label>Nueva plataforma <span class="required-mark">*</span></label>
        <select v-model="form.platform">
          <option value="">Seleccionar</option>
          <option v-for="opt in PLATFORM_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>Nombre de la nueva cuenta <span class="required-mark">*</span></label>
        <input v-model="form.accountName" type="text" />
      </div>
    </form>

    <template #footer>
      <div class="drawer-footer-actions">
        <w-button variant="secondary" block @click="isOpen = false">Cancelar</w-button>
        <w-button variant="primary" block @click="handleSubmit">Duplicar</w-button>
      </div>
    </template>
  </w-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import WButton from '@/components/ui/WButton.vue'
import { useToast } from '@/composables/useToast'

const PLATFORM_OPTIONS = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'email', label: 'Email' },
]

export default defineComponent({
  name: 'DuplicateAccountModal',
  components: { WDrawer, WButton },
  props: {
    modelValue: { type: Boolean, required: true },
  },
  emits: ['update:modelValue', 'duplicate'],
  setup(props, { emit }) {
    const { warning } = useToast()
    const form = ref({ platform: '', accountName: '' })

    const isOpen = computed({
      get: () => props.modelValue,
      set: (val: boolean) => emit('update:modelValue', val),
    })

    watch(() => props.modelValue, (val) => {
      if (val) form.value = { platform: '', accountName: '' }
    })

    function handleSubmit() {
      if (!form.value.platform || !form.value.accountName.trim()) {
        warning('Completa la plataforma y el nombre de la nueva cuenta')
        return
      }
      emit('duplicate', { ...form.value })
    }

    return { form, isOpen, handleSubmit, PLATFORM_OPTIONS }
  },
})
</script>

<style scoped>
.duplicate-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
.required-mark { color: var(--color-error); }
.form-group input,
.form-group select {
  background: var(--color-bg-surface-low); border: 1px solid var(--color-border);
  color: var(--color-text-base); font-family: var(--font-body); font-size: 13px;
  padding: 10px 12px; outline: none; border-radius: 4px; width: 100%;
}
.form-group input:focus,
.form-group select:focus { border-color: var(--color-border-focus); }

.drawer-footer-actions { display: flex; gap: 12px; }
</style>
