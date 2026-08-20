<template>
  <w-drawer v-model="isOpen" title="Nueva cuenta" width="480px">
    <div class="wizard">
      <div class="wizard-steps">
        <span v-for="n in 3" :key="n" class="wizard-step" :class="{ active: currentStep === n, done: currentStep > n }">{{ n }}</span>
      </div>

      <!-- Step 1: básico -->
      <form v-if="currentStep === 1" class="account-form" @submit.prevent>
        <div class="form-group" :class="{ 'has-error': errors.accountName }">
          <label>Nombre de la cuenta <span class="required-mark">*</span></label>
          <input v-model="form.accountName" type="text" placeholder="MiMarca — TikTok" @input="clearError('accountName')" />
          <span v-if="errors.accountName" class="field-error">{{ errors.accountName }}</span>
        </div>

        <div class="form-row">
          <div class="form-group" :class="{ 'has-error': errors.platform }">
            <label>Plataforma <span class="required-mark">*</span></label>
            <select v-model="form.platform" @change="clearError('platform')">
              <option value="">Seleccionar</option>
              <option v-for="opt in PLATFORM_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <span v-if="errors.platform" class="field-error">{{ errors.platform }}</span>
          </div>

          <div class="form-group" :class="{ 'has-error': errors.purpose }">
            <label>Propósito <span class="required-mark">*</span></label>
            <select v-model="form.purpose" @change="clearError('purpose')">
              <option value="">Seleccionar</option>
              <option v-for="opt in PURPOSE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <span v-if="errors.purpose" class="field-error">{{ errors.purpose }}</span>
          </div>
        </div>

        <div class="form-group" :class="{ 'has-error': errors.handle }">
          <label>Handle <span class="required-mark">*</span></label>
          <input v-model="form.handle" type="text" placeholder="@tuusuario" @input="clearError('handle')" />
          <span v-if="errors.handle" class="field-error">{{ errors.handle }}</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Color</label>
            <input v-model="form.color" type="color" />
          </div>
          <div class="form-group">
            <label>Emoji</label>
            <input v-model="form.emoji" type="text" maxlength="4" placeholder="🎵" />
          </div>
        </div>
      </form>

      <!-- Step 2: identidad y audiencia -->
      <form v-else-if="currentStep === 2" class="account-form" @submit.prevent>
        <div class="form-group">
          <label>Bio</label>
          <textarea v-model="form.identity.bio" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>Posicionamiento</label>
          <textarea v-model="form.identity.positioning" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>Perfil de audiencia primario</label>
          <input v-model="form.audience.primaryProfile" type="text" />
        </div>

        <div class="form-group">
          <label>Pain points</label>
          <tag-input v-model="form.audience.painPoints" placeholder="+ pain point" />
        </div>

        <div class="form-group">
          <label>Deseos</label>
          <tag-input v-model="form.audience.desires" placeholder="+ deseo" />
        </div>

        <div class="form-group">
          <label>A quién NO le hablo</label>
          <tag-input v-model="form.audience.notFor" placeholder="+ excluir" />
        </div>
      </form>

      <!-- Step 3: confirmación -->
      <div v-else class="account-summary">
        <div class="summary-row"><span class="summary-label">Nombre</span><span>{{ form.accountName }}</span></div>
        <div class="summary-row"><span class="summary-label">Plataforma</span><span>{{ platformLabel }}</span></div>
        <div class="summary-row"><span class="summary-label">Handle</span><span>{{ form.handle }}</span></div>
        <div class="summary-row"><span class="summary-label">Propósito</span><span>{{ purposeLabel }}</span></div>
        <div v-if="form.identity.bio" class="summary-row"><span class="summary-label">Bio</span><span>{{ form.identity.bio }}</span></div>
        <div v-if="form.audience.primaryProfile" class="summary-row"><span class="summary-label">Audiencia</span><span>{{ form.audience.primaryProfile }}</span></div>
      </div>
    </div>

    <template #footer>
      <div class="drawer-footer-actions">
        <w-button v-if="currentStep > 1" variant="secondary" block @click="currentStep--">Atrás</w-button>
        <w-button v-else variant="secondary" block @click="isOpen = false">Cancelar</w-button>

        <w-button v-if="currentStep < 3" variant="primary" block @click="goNext">Siguiente</w-button>
        <w-button v-else variant="primary" block :disabled="loading" @click="handleSubmit">
          {{ loading ? 'Creando...' : 'Crear cuenta' }}
        </w-button>
      </div>
    </template>
  </w-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import WButton from '@/components/ui/WButton.vue'
import TagInput from '@/components/social-identity/TagInput.vue'
import { useToast } from '@/composables/useToast'
import type { CreateSocialAccountDto } from '@/api/social-identity/social-identity.types'

const PLATFORM_OPTIONS = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'email', label: 'Email' },
]

const PURPOSE_OPTIONS = [
  { value: 'clients', label: 'Clientes' },
  { value: 'founders', label: 'Founders' },
  { value: 'devs', label: 'Devs' },
  { value: 'saas', label: 'SaaS' },
  { value: 'mixed', label: 'Mixto' },
]

function emptyForm() {
  return {
    accountName: '',
    platform: '',
    handle: '',
    purpose: '',
    color: '#7C3AED',
    emoji: '',
    identity: { bio: '', positioning: '' },
    audience: { primaryProfile: '', painPoints: [] as string[], desires: [] as string[], notFor: [] as string[] },
  }
}

export default defineComponent({
  name: 'SocialAccountFormModal',
  components: { WDrawer, WButton, TagInput },
  props: {
    modelValue: { type: Boolean, required: true },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const { warning } = useToast()
    const form = ref(emptyForm())
    const errors = ref<Record<string, string>>({})
    const currentStep = ref(1)

    const isOpen = computed({
      get: () => props.modelValue,
      set: (val: boolean) => emit('update:modelValue', val),
    })

    watch(() => props.modelValue, (val) => {
      if (val) {
        form.value = emptyForm()
        errors.value = {}
        currentStep.value = 1
      }
    })

    function clearError(field: string) {
      if (errors.value[field]) delete errors.value[field]
    }

    function validateStep1(): boolean {
      const errs: Record<string, string> = {}
      if (!form.value.accountName.trim()) errs.accountName = 'El nombre es obligatorio'
      if (!form.value.platform) errs.platform = 'Selecciona una plataforma'
      if (!form.value.purpose) errs.purpose = 'Selecciona un propósito'
      if (!form.value.handle.trim()) errs.handle = 'El handle es obligatorio'
      errors.value = errs
      if (Object.keys(errs).length) {
        warning('Completa los campos obligatorios antes de continuar')
        return false
      }
      return true
    }

    function goNext() {
      if (currentStep.value === 1 && !validateStep1()) return
      currentStep.value++
    }

    function handleSubmit() {
      const dto: CreateSocialAccountDto = {
        accountName: form.value.accountName.trim(),
        platform: form.value.platform as any,
        handle: form.value.handle.trim(),
        purpose: form.value.purpose as any,
        color: form.value.color || undefined,
        emoji: form.value.emoji || undefined,
        identity: form.value.identity.bio || form.value.identity.positioning
          ? { bio: form.value.identity.bio, positioning: form.value.identity.positioning }
          : undefined,
        audience: form.value.audience.primaryProfile || form.value.audience.painPoints.length || form.value.audience.desires.length || form.value.audience.notFor.length
          ? { ...form.value.audience }
          : undefined,
      }
      emit('save', dto)
    }

    const platformLabel = computed(() => PLATFORM_OPTIONS.find(o => o.value === form.value.platform)?.label ?? '')
    const purposeLabel = computed(() => PURPOSE_OPTIONS.find(o => o.value === form.value.purpose)?.label ?? '')

    return {
      form,
      errors,
      currentStep,
      isOpen,
      clearError,
      goNext,
      handleSubmit,
      platformLabel,
      purposeLabel,
      PLATFORM_OPTIONS,
      PURPOSE_OPTIONS,
    }
  },
})
</script>

<style scoped>
.wizard { display: flex; flex-direction: column; gap: 20px; }
.wizard-steps { display: flex; gap: 8px; justify-content: center; }
.wizard-step {
  width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 11px; background: var(--color-bg-surface-low); color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}
.wizard-step.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
.wizard-step.done { border-color: var(--color-primary); color: var(--color-primary); }

.account-form { display: flex; flex-direction: column; gap: 16px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label {
  font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--color-text-muted);
}
.required-mark { color: var(--color-error); }

.form-group input,
.form-group select,
.form-group textarea {
  background: var(--color-bg-surface-low); border: 1px solid var(--color-border);
  color: var(--color-text-base); font-family: var(--font-body); font-size: 13px;
  padding: 10px 12px; outline: none; border-radius: 4px; width: 100%;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { border-color: var(--color-border-focus); }

.field-error { display: flex; align-items: center; gap: 4px; font-family: var(--font-body); font-size: 11px; color: var(--color-error); }
.has-error input,
.has-error select,
.has-error textarea { border-color: var(--color-error); }

.account-summary { display: flex; flex-direction: column; gap: 12px; }
.summary-row { display: flex; flex-direction: column; gap: 2px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
.summary-label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--color-text-muted); }

.drawer-footer-actions { display: flex; gap: 12px; }

@media (max-width: 540px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
