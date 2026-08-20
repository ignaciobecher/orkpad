<template>
  <div class="pillars-tab">
    <div class="pillars-grid">
      <div v-for="pillar in account.contentPillars" :key="pillar._id" class="pillar-card">
        <div class="pillar-card__header">
          <span class="pillar-card__name">{{ pillar.name }}</span>
          <button class="remove-btn" @click="$emit('remove', pillar._id)">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
        <p class="pillar-card__description">{{ pillar.description }}</p>
        <span class="pillar-card__frequency">{{ pillar.frequency }}</span>

        <ul v-if="pillar.examples?.length" class="examples-list">
          <li v-for="(ex, i) in pillar.examples" :key="i" class="example-item">
            <span>{{ ex }}</span>
            <button class="copy-btn" @click="copy(ex)">
              <span class="material-symbols-outlined">content_copy</span>
            </button>
          </li>
        </ul>

        <div v-if="pillar.callToAction" class="pillar-card__cta">
          <span class="cta-label">CTA</span> {{ pillar.callToAction }}
        </div>
      </div>
    </div>

    <w-button variant="primary" @click="showForm = true">
      <span class="material-symbols-outlined mr-2">add</span>
      Agregar pilar
    </w-button>

    <w-drawer v-model="showForm" title="Nuevo pilar de contenido" width="440px">
      <form class="pillar-form" @submit.prevent>
        <div class="form-group">
          <label>Nombre <span class="required-mark">*</span></label>
          <input v-model="form.name" type="text" />
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea v-model="form.description" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label>Frecuencia</label>
          <input v-model="form.frequency" type="text" placeholder="1 vez por semana" />
        </div>
        <div class="form-group">
          <label>Ejemplos</label>
          <tag-input v-model="form.examples" placeholder="+ ejemplo" />
        </div>
        <div class="form-group">
          <label>Call to action</label>
          <input v-model="form.callToAction" type="text" />
        </div>
      </form>

      <template #footer>
        <div class="drawer-footer-actions">
          <w-button variant="secondary" block @click="showForm = false">Cancelar</w-button>
          <w-button variant="primary" block @click="handleAdd">Agregar</w-button>
        </div>
      </template>
    </w-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import WButton from '@/components/ui/WButton.vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import TagInput from '@/components/social-identity/TagInput.vue'
import { useToast } from '@/composables/useToast'
import { copyToClipboard } from '@/utils/clipboard'
import type { SocialAccount, ContentPillar } from '@/api/social-identity/social-identity.types'

function emptyForm(): ContentPillar {
  return { name: '', description: '', frequency: '', examples: [], callToAction: '' }
}

export default defineComponent({
  name: 'PillarsTab',
  components: { WButton, WDrawer, TagInput },
  props: {
    account: { type: Object as PropType<SocialAccount>, required: true },
  },
  emits: ['add', 'remove'],
  setup(_props, { emit }) {
    const { success, warning } = useToast()
    const showForm = ref(false)
    const form = ref(emptyForm())

    function handleAdd() {
      if (!form.value.name.trim()) {
        warning('El nombre del pilar es obligatorio')
        return
      }
      emit('add', { ...form.value })
      form.value = emptyForm()
      showForm.value = false
    }

    async function copy(text: string) {
      await copyToClipboard(text)
      success('Copiado al portapapeles')
    }

    return { showForm, form, handleAdd, copy }
  },
})
</script>

<style scoped>
.pillars-tab { display: flex; flex-direction: column; gap: 20px; }

.pillars-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

.pillar-card { background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.pillar-card__header { display: flex; align-items: center; justify-content: space-between; }
.pillar-card__name { font-family: var(--font-body); font-size: 14px; font-weight: 600; color: var(--color-text-base); }
.pillar-card__description { font-family: var(--font-body); font-size: 13px; color: var(--color-text-muted); margin: 0; }
.pillar-card__frequency { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--color-text-disabled); }

.remove-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; display: flex; padding: 2px; }
.remove-btn:hover { color: var(--color-error); }
.remove-btn .material-symbols-outlined { font-size: 16px; }

.examples-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.example-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; color: var(--color-text-base); padding: 6px 8px; background: var(--color-bg-surface-low); border-radius: 4px; }

.copy-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; display: flex; padding: 2px; flex-shrink: 0; }
.copy-btn:hover { color: var(--color-primary); }
.copy-btn .material-symbols-outlined { font-size: 14px; }

.pillar-card__cta { font-size: 12px; color: var(--color-text-muted); border-top: 1px solid var(--color-border); padding-top: 8px; }
.cta-label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--color-primary); margin-right: 4px; }

.pillar-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
.required-mark { color: var(--color-error); }
.form-group input,
.form-group textarea {
  background: var(--color-bg-surface-low); border: 1px solid var(--color-border);
  color: var(--color-text-base); font-family: var(--font-body); font-size: 13px;
  padding: 10px 12px; outline: none; border-radius: 4px; width: 100%;
}
.form-group input:focus,
.form-group textarea:focus { border-color: var(--color-border-focus); }

.drawer-footer-actions { display: flex; gap: 12px; }
</style>
