<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ content: Record<string, any>; settings: Record<string, any> }>()
const emit = defineEmits<{
  'update-content': [v: Record<string, any>]
  'update-settings': [v: Record<string, any>]
}>()
const c = (k: string, v: any) => emit('update-content', { [k]: v })
const s = (k: string, v: any) => emit('update-settings', { [k]: v })

const newSkill = ref('')

function addSkill() {
  if (!newSkill.value.trim()) return
  const skills = [...(props.content.customSkills ?? []), newSkill.value.trim()]
  c('customSkills', skills)
  newSkill.value = ''
}

function removeSkill(idx: number) {
  const skills = [...(props.content.customSkills ?? [])]
  skills.splice(idx, 1)
  c('customSkills', skills)
}
</script>

<template>
  <div class="ed">
    <div class="ed__group">
      <label class="ed__label">Título</label>
      <input class="ed__input" :value="content.title" @input="c('title', ($event.target as HTMLInputElement).value)" placeholder="Mis habilidades" />
    </div>
    <div class="ed__group">
      <label class="ed__toggle">
        <input type="checkbox" :checked="content.useWorkspaceSkills" @change="c('useWorkspaceSkills', ($event.target as HTMLInputElement).checked)" />
        <span>Usar habilidades del workspace</span>
      </label>
    </div>
    <template v-if="!content.useWorkspaceSkills">
      <div class="ed__group">
        <label class="ed__label">Agregar habilidad</label>
        <div class="ed__row">
          <input class="ed__input" v-model="newSkill" placeholder="Ej: React, TypeScript..." @keyup.enter="addSkill" />
          <button class="ed__add-btn" @click="addSkill"><span class="mdi mdi-plus"></span></button>
        </div>
      </div>
      <div class="ed__chips">
        <span v-for="(skill, i) in content.customSkills" :key="i" class="ed__chip">
          {{ skill }}
          <button @click="removeSkill(i)" class="ed__chip-remove"><span class="mdi mdi-close"></span></button>
        </span>
      </div>
    </template>
    <div class="ed__divider"></div>
    <div class="ed__group">
      <label class="ed__label">Estilo</label>
      <select class="ed__input" :value="settings.layout" @change="s('layout', ($event.target as HTMLSelectElement).value)">
        <option value="chips">Chips / Etiquetas</option>
        <option value="grid">Grid con íconos</option>
        <option value="list">Lista</option>
      </select>
    </div>
  </div>
</template>

<style scoped src="./editor.css"></style>
