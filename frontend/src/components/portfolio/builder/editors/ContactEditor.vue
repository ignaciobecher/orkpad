<script setup lang="ts">
defineProps<{ content: Record<string, any>; settings: Record<string, any> }>()
const emit = defineEmits<{
  'update-content': [v: Record<string, any>]
  'update-settings': [v: Record<string, any>]
}>()
const c = (k: string, v: any) => emit('update-content', { [k]: v })
</script>

<template>
  <div class="ed">
    <p class="ed__info">El formulario de contacto envía mensajes al pipeline de tu workspace como leads.</p>
    <div class="ed__group">
      <label class="ed__label">Título</label>
      <input class="ed__input" :value="content.title" @input="c('title', ($event.target as HTMLInputElement).value)" placeholder="¿Trabajamos juntos?" />
    </div>
    <div class="ed__group">
      <label class="ed__label">Subtítulo</label>
      <input class="ed__input" :value="content.subtitle" @input="c('subtitle', ($event.target as HTMLInputElement).value)" placeholder="Enviáme un mensaje y te respondo pronto." />
    </div>
  </div>
</template>

<style scoped src="./editor.css"></style>
