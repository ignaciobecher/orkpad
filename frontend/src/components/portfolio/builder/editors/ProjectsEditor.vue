<script setup lang="ts">
defineProps<{ content: Record<string, any>; settings: Record<string, any> }>()
const emit = defineEmits<{
  'update-content': [v: Record<string, any>]
  'update-settings': [v: Record<string, any>]
}>()
const c = (k: string, v: any) => emit('update-content', { [k]: v })
const s = (k: string, v: any) => emit('update-settings', { [k]: v })
</script>

<template>
  <div class="ed">
    <p class="ed__info">Los proyectos se obtienen automáticamente del workspace (marcados como destacados).</p>
    <div class="ed__group">
      <label class="ed__label">Título</label>
      <input class="ed__input" :value="content.title" @input="c('title', ($event.target as HTMLInputElement).value)" placeholder="Proyectos" />
    </div>
    <div class="ed__group">
      <label class="ed__label">Subtítulo</label>
      <input class="ed__input" :value="content.subtitle" @input="c('subtitle', ($event.target as HTMLInputElement).value)" placeholder="Opcional" />
    </div>
    <div class="ed__divider"></div>
    <div class="ed__group">
      <label class="ed__label">Columnas</label>
      <select class="ed__input" :value="settings.columns" @change="s('columns', Number(($event.target as HTMLSelectElement).value))">
        <option :value="2">2 columnas</option>
        <option :value="3">3 columnas</option>
        <option :value="4">4 columnas</option>
      </select>
    </div>
    <div class="ed__group">
      <label class="ed__label">Máximos a mostrar</label>
      <select class="ed__input" :value="settings.limit" @change="s('limit', Number(($event.target as HTMLSelectElement).value))">
        <option :value="3">3</option>
        <option :value="6">6</option>
        <option :value="9">9</option>
        <option :value="0">Todos</option>
      </select>
    </div>
  </div>
</template>

<style scoped src="./editor.css"></style>
