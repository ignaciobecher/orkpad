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
    <div class="ed__group">
      <label class="ed__label">Título (opcional)</label>
      <input class="ed__input" :value="content.title" @input="c('title', ($event.target as HTMLInputElement).value)" placeholder="Título de la sección" />
    </div>
    <div class="ed__group">
      <label class="ed__label">Contenido</label>
      <textarea
        class="ed__input ed__textarea"
        style="min-height:200px; font-family: var(--font-mono, monospace); font-size:11px"
        :value="content.body"
        @input="c('body', ($event.target as HTMLTextAreaElement).value)"
        placeholder="Escribe texto, HTML o Markdown..."
      ></textarea>
    </div>
    <p class="ed__hint">Puedes usar HTML básico: &lt;b&gt;, &lt;i&gt;, &lt;a&gt;, &lt;ul&gt;, etc.</p>
  </div>
</template>

<style scoped src="./editor.css"></style>
