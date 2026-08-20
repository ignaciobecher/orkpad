<template>
  <div class="audience-tab">
    <div v-if="!editing" class="audience-view">
      <div class="field-block">
        <span class="field-label">Perfil primario</span>
        <p class="field-value">{{ account.audience?.primaryProfile || '—' }}</p>
      </div>

      <div class="field-block">
        <span class="field-label">Rango de edad</span>
        <p class="field-value">{{ account.audience?.ageRange || '—' }}</p>
      </div>

      <div class="list-columns">
        <div class="list-block">
          <span class="field-label">Pain points</span>
          <ul class="bullet-list">
            <li v-for="(p, i) in account.audience?.painPoints" :key="i">{{ p }}</li>
          </ul>
        </div>
        <div class="list-block">
          <span class="field-label">Deseos</span>
          <ul class="bullet-list">
            <li v-for="(d, i) in account.audience?.desires" :key="i">{{ d }}</li>
          </ul>
        </div>
      </div>

      <div class="field-block">
        <span class="field-label">A quién NO le hablo</span>
        <ul class="bullet-list bullet-list--negative">
          <li v-for="(n, i) in account.audience?.notFor" :key="i">
            <span class="material-symbols-outlined">close</span>{{ n }}
          </li>
        </ul>
      </div>

      <w-button variant="secondary" @click="startEdit">Editar audiencia</w-button>
    </div>

    <form v-else class="audience-form" @submit.prevent>
      <div class="form-group">
        <label>Perfil primario</label>
        <input v-model="form.primaryProfile" type="text" />
      </div>
      <div class="form-group">
        <label>Rango de edad</label>
        <input v-model="form.ageRange" type="text" placeholder="30-55" />
      </div>
      <div class="form-group">
        <label>Pain points</label>
        <tag-input v-model="form.painPoints" placeholder="+ pain point" />
      </div>
      <div class="form-group">
        <label>Deseos</label>
        <tag-input v-model="form.desires" placeholder="+ deseo" />
      </div>
      <div class="form-group">
        <label>A quién NO le hablo</label>
        <tag-input v-model="form.notFor" placeholder="+ excluir" />
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
import TagInput from '@/components/social-identity/TagInput.vue'
import type { SocialAccount } from '@/api/social-identity/social-identity.types'

export default defineComponent({
  name: 'AudienceTab',
  components: { WButton, TagInput },
  props: {
    account: { type: Object as PropType<SocialAccount>, required: true },
  },
  emits: ['save'],
  setup(props, { emit }) {
    const editing = ref(false)
    const form = ref({
      primaryProfile: props.account.audience?.primaryProfile || '',
      ageRange: props.account.audience?.ageRange || '',
      painPoints: [...(props.account.audience?.painPoints || [])],
      desires: [...(props.account.audience?.desires || [])],
      whereLive: [...(props.account.audience?.whereLive || [])],
      notFor: [...(props.account.audience?.notFor || [])],
    })

    function startEdit() {
      form.value = {
        primaryProfile: props.account.audience?.primaryProfile || '',
        ageRange: props.account.audience?.ageRange || '',
        painPoints: [...(props.account.audience?.painPoints || [])],
        desires: [...(props.account.audience?.desires || [])],
        whereLive: [...(props.account.audience?.whereLive || [])],
        notFor: [...(props.account.audience?.notFor || [])],
      }
      editing.value = true
    }

    function handleSave() {
      emit('save', { audience: { ...form.value } })
      editing.value = false
    }

    return { editing, form, startEdit, handleSave }
  },
})
</script>

<style scoped>
.audience-tab { display: flex; flex-direction: column; gap: 20px; max-width: 640px; }

.audience-view { display: flex; flex-direction: column; gap: 16px; }
.field-block, .list-block { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
.field-value { font-family: var(--font-body); font-size: 13px; color: var(--color-text-base); margin: 0; }

.list-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.bullet-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.bullet-list li { font-family: var(--font-body); font-size: 13px; color: var(--color-text-base); padding-left: 14px; position: relative; }
.bullet-list li::before { content: '•'; position: absolute; left: 0; color: var(--color-primary); }

.bullet-list--negative li { padding-left: 0; display: flex; align-items: center; gap: 6px; color: var(--color-error); }
.bullet-list--negative li::before { content: none; }
.bullet-list--negative .material-symbols-outlined { font-size: 14px; }

.audience-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
.form-group input {
  background: var(--color-bg-surface-low); border: 1px solid var(--color-border);
  color: var(--color-text-base); font-family: var(--font-body); font-size: 13px;
  padding: 10px 12px; outline: none; border-radius: 4px; width: 100%;
}
.form-group input:focus { border-color: var(--color-border-focus); }

.form-actions { display: flex; gap: 12px; }

@media (max-width: 540px) {
  .list-columns { grid-template-columns: 1fr; }
}
</style>
