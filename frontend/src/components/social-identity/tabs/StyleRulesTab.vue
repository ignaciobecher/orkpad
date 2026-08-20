<template>
  <div class="style-tab">
    <div v-if="!editing" class="style-view">
      <div class="do-dont-columns">
        <div class="rules-block rules-block--do">
          <span class="field-label">Hacer</span>
          <ul class="rules-list">
            <li v-for="(item, i) in account.styleRules?.doList" :key="i">
              <span class="material-symbols-outlined">check</span>{{ item }}
            </li>
          </ul>
        </div>
        <div class="rules-block rules-block--dont">
          <span class="field-label">No hacer</span>
          <ul class="rules-list">
            <li v-for="(item, i) in account.styleRules?.dontList" :key="i">
              <span class="material-symbols-outlined">close</span>{{ item }}
            </li>
          </ul>
        </div>
      </div>

      <div class="field-block">
        <span class="field-label">Palabras de tono</span>
        <div class="tone-badges">
          <w-badge v-for="(word, i) in account.styleRules?.toneWords" :key="i">{{ word }}</w-badge>
        </div>
      </div>

      <div class="field-block">
        <span class="field-label">Formato</span>
        <p class="field-value">{{ account.styleRules?.format || '—' }}</p>
      </div>

      <div class="field-block">
        <span class="field-label">Estilo de video</span>
        <p class="field-value">{{ account.styleRules?.videoStyle || '—' }}</p>
      </div>

      <div class="field-block">
        <span class="field-label">Longitud del post</span>
        <p class="field-value">{{ account.styleRules?.postLength || '—' }}</p>
      </div>

      <w-button variant="secondary" @click="startEdit">Editar reglas de estilo</w-button>
    </div>

    <form v-else class="style-form" @submit.prevent>
      <div class="form-group">
        <label>Hacer</label>
        <tag-input v-model="form.doList" placeholder="+ regla" />
      </div>
      <div class="form-group">
        <label>No hacer</label>
        <tag-input v-model="form.dontList" placeholder="+ regla" />
      </div>
      <div class="form-group">
        <label>Palabras de tono</label>
        <tag-input v-model="form.toneWords" placeholder="+ palabra" />
      </div>
      <div class="form-group">
        <label>Formato</label>
        <input v-model="form.format" type="text" />
      </div>
      <div class="form-group">
        <label>Estilo de video</label>
        <input v-model="form.videoStyle" type="text" />
      </div>
      <div class="form-group">
        <label>Longitud del post</label>
        <input v-model="form.postLength" type="text" />
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
import WBadge from '@/components/ui/WBadge.vue'
import TagInput from '@/components/social-identity/TagInput.vue'
import type { SocialAccount } from '@/api/social-identity/social-identity.types'

export default defineComponent({
  name: 'StyleRulesTab',
  components: { WButton, WBadge, TagInput },
  props: {
    account: { type: Object as PropType<SocialAccount>, required: true },
  },
  emits: ['save'],
  setup(props, { emit }) {
    const editing = ref(false)
    const form = ref({
      doList: [...(props.account.styleRules?.doList || [])],
      dontList: [...(props.account.styleRules?.dontList || [])],
      toneWords: [...(props.account.styleRules?.toneWords || [])],
      format: props.account.styleRules?.format || '',
      videoStyle: props.account.styleRules?.videoStyle || '',
      postLength: props.account.styleRules?.postLength || '',
    })

    function startEdit() {
      form.value = {
        doList: [...(props.account.styleRules?.doList || [])],
        dontList: [...(props.account.styleRules?.dontList || [])],
        toneWords: [...(props.account.styleRules?.toneWords || [])],
        format: props.account.styleRules?.format || '',
        videoStyle: props.account.styleRules?.videoStyle || '',
        postLength: props.account.styleRules?.postLength || '',
      }
      editing.value = true
    }

    function handleSave() {
      emit('save', { styleRules: { ...form.value } })
      editing.value = false
    }

    return { editing, form, startEdit, handleSave }
  },
})
</script>

<style scoped>
.style-tab { display: flex; flex-direction: column; gap: 20px; max-width: 640px; }

.style-view { display: flex; flex-direction: column; gap: 16px; }
.do-dont-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.rules-block { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
.field-value { font-family: var(--font-body); font-size: 13px; color: var(--color-text-base); margin: 0; }

.rules-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.rules-list li { display: flex; align-items: flex-start; gap: 6px; font-size: 13px; color: var(--color-text-base); }
.rules-list .material-symbols-outlined { font-size: 14px; margin-top: 1px; }
.rules-block--do .material-symbols-outlined { color: var(--color-success, #22c55e); }
.rules-block--dont .material-symbols-outlined { color: var(--color-error); }

.field-block { display: flex; flex-direction: column; gap: 6px; }
.tone-badges { display: flex; gap: 6px; flex-wrap: wrap; }

.style-form { display: flex; flex-direction: column; gap: 16px; }
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
  .do-dont-columns { grid-template-columns: 1fr; }
}
</style>
