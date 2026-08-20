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
    <p class="ed__info">Los servicios se obtienen de los productos activos del workspace.</p>
    <div class="ed__group">
      <label class="ed__label">Título</label>
      <input class="ed__input" :value="content.title" @input="c('title', ($event.target as HTMLInputElement).value)" placeholder="Mis servicios" />
    </div>
    <div class="ed__group">
      <label class="ed__label">Subtítulo</label>
      <input class="ed__input" :value="content.subtitle" @input="c('subtitle', ($event.target as HTMLInputElement).value)" placeholder="Opcional" />
    </div>
    <div class="ed__divider"></div>
    <div class="ed__group">
      <label class="ed__toggle">
        <input type="checkbox" :checked="settings.showPrice" @change="s('showPrice', ($event.target as HTMLInputElement).checked)" />
        <span>Mostrar precios</span>
      </label>
    </div>
  </div>
</template>

<style scoped src="./editor.css"></style>
