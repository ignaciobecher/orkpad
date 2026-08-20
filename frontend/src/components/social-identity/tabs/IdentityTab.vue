<template>
  <div class="identity-tab">
    <div v-if="!editing" class="identity-view">
      <div class="field-block">
        <div class="field-header">
          <span class="field-label">Bio</span>
          <button class="copy-btn" @click="copy(account.identity?.bio)">
            <span class="material-symbols-outlined">content_copy</span>
          </button>
        </div>
        <p class="field-value">{{ account.identity?.bio || '—' }}</p>
      </div>

      <div class="field-block">
        <span class="field-label">Posicionamiento</span>
        <p class="field-value">{{ account.identity?.positioning || '—' }}</p>
      </div>

      <div class="field-block">
        <span class="field-label">Ángulo único</span>
        <p class="field-value">{{ account.identity?.uniqueAngle || '—' }}</p>
      </div>

      <div class="field-block">
        <span class="field-label">Foto de perfil</span>
        <p class="field-value">{{ account.identity?.profilePhoto || '—' }}</p>
      </div>

      <div class="field-block">
        <span class="field-label">Banner</span>
        <p class="field-value">{{ account.identity?.bannerDescription || '—' }}</p>
      </div>

      <div class="field-block">
        <span class="field-label">Link en bio</span>
        <p class="field-value">{{ account.identity?.linkInBio || '—' }}</p>
      </div>

      <w-button variant="secondary" @click="startEdit">Editar identidad</w-button>
    </div>

    <form v-else class="identity-form" @submit.prevent>
      <div class="form-group">
        <label>Bio</label>
        <textarea v-model="form.bio" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>Posicionamiento</label>
        <textarea v-model="form.positioning" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>Ángulo único</label>
        <textarea v-model="form.uniqueAngle" rows="2"></textarea>
      </div>
      <div class="form-group">
        <label>Foto de perfil</label>
        <input v-model="form.profilePhoto" type="text" />
      </div>
      <div class="form-group">
        <label>Banner</label>
        <input v-model="form.bannerDescription" type="text" />
      </div>
      <div class="form-group">
        <label>Link en bio</label>
        <input v-model="form.linkInBio" type="text" />
      </div>

      <div class="form-actions">
        <w-button variant="secondary" @click="editing = false">Cancelar</w-button>
        <w-button variant="primary" @click="handleSave">Guardar</w-button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import WButton from '@/components/ui/WButton.vue'
import { useToast } from '@/composables/useToast'
import { copyToClipboard } from '@/utils/clipboard'
import type { SocialAccount } from '@/api/social-identity/social-identity.types'

export default defineComponent({
  name: 'IdentityTab',
  components: { WButton },
  props: {
    account: { type: Object as PropType<SocialAccount>, required: true },
  },
  emits: ['save'],
  setup(props, { emit }) {
    const { success } = useToast()
    const editing = ref(false)
    const form = ref({ ...props.account.identity })

    function startEdit() {
      form.value = { ...props.account.identity }
      editing.value = true
    }

    function handleSave() {
      emit('save', { identity: { ...form.value } })
      editing.value = false
    }

    async function copy(text?: string) {
      if (!text) return
      await copyToClipboard(text)
      success('Copiado al portapapeles')
    }

    return { editing, form, startEdit, handleSave, copy }
  },
})
</script>

<style scoped>
.identity-tab { display: flex; flex-direction: column; gap: 20px; max-width: 640px; }

.identity-view { display: flex; flex-direction: column; gap: 16px; }
.field-block { display: flex; flex-direction: column; gap: 4px; }
.field-header { display: flex; align-items: center; justify-content: space-between; }
.field-label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
.field-value { font-family: var(--font-body); font-size: 13px; color: var(--color-text-base); white-space: pre-wrap; margin: 0; }

.copy-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; display: flex; padding: 2px; }
.copy-btn:hover { color: var(--color-primary); }
.copy-btn .material-symbols-outlined { font-size: 16px; }

.identity-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
.form-group input,
.form-group textarea {
  background: var(--color-bg-surface-low); border: 1px solid var(--color-border);
  color: var(--color-text-base); font-family: var(--font-body); font-size: 13px;
  padding: 10px 12px; outline: none; border-radius: 4px; width: 100%;
}
.form-group input:focus,
.form-group textarea:focus { border-color: var(--color-border-focus); }

.form-actions { display: flex; gap: 12px; }
</style>
