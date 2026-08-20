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
    <div class="ed__group">
      <label class="ed__label">Título</label>
      <input class="ed__input" :value="content.title" @input="c('title', ($event.target as HTMLInputElement).value)" placeholder="Sobre mí" />
    </div>
    <div class="ed__group">
      <label class="ed__label">Contenido</label>
      <textarea class="ed__input ed__textarea" style="min-height:140px" :value="content.body" @input="c('body', ($event.target as HTMLTextAreaElement).value)" placeholder="Escribe sobre ti, tu experiencia, tus intereses..."></textarea>
    </div>
    <div class="ed__group">
      <label class="ed__label">Imagen lateral (URL)</label>
      <input class="ed__input" type="text" :value="content.imageUrl" @input="c('imageUrl', ($event.target as HTMLInputElement).value)" placeholder="https://..." />
    </div>
    <div class="ed__divider"></div>
    <div class="ed__group">
      <label class="ed__label">Layout</label>
      <select class="ed__input" :value="settings.layout" @change="s('layout', ($event.target as HTMLSelectElement).value)">
        <option value="text-only">Solo texto</option>
        <option value="text-image">Texto + imagen (derecha)</option>
        <option value="image-text">Imagen + texto (izquierda)</option>
      </select>
    </div>
  </div>
</template>

<style scoped src="./editor.css"></style>
