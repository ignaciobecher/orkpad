<script setup lang="ts">
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const props = defineProps<{ content: Record<string, any>; settings: Record<string, any> }>()
const emit = defineEmits<{
  'update-content': [v: Record<string, any>]
  'update-settings': [v: Record<string, any>]
}>()
const c = (k: string, v: any) => emit('update-content', { [k]: v })
const s = (k: string, v: any) => emit('update-settings', { [k]: v })

const images = () => props.content.images ?? []
function updateImage(idx: number, key: string, val: any) {
  const arr = [...images()]
  arr[idx] = { ...arr[idx], [key]: val }
  c('images', arr)
}
function addImage() {
  c('images', [...images(), { id: uid(), url: '', caption: '', alt: '' }])
}
function removeImage(idx: number) {
  const arr = [...images()]
  arr.splice(idx, 1)
  c('images', arr)
}
</script>

<template>
  <div class="ed">
    <div class="ed__group">
      <label class="ed__label">Título</label>
      <input class="ed__input" :value="content.title" @input="c('title', ($event.target as HTMLInputElement).value)" placeholder="Galería" />
    </div>
    <div class="ed__group">
      <label class="ed__label">Columnas</label>
      <select class="ed__input" :value="settings.columns" @change="s('columns', Number(($event.target as HTMLSelectElement).value))">
        <option :value="2">2 columnas</option>
        <option :value="3">3 columnas</option>
        <option :value="4">4 columnas</option>
      </select>
    </div>
    <div class="ed__divider"></div>
    <div v-for="(img, idx) in images()" :key="img.id" class="ed__item">
      <div class="ed__item-header">
        <span class="ed__item-num">Imagen #{{ idx + 1 }}</span>
        <button class="ed__remove-btn" @click="removeImage(idx)"><span class="mdi mdi-trash-can-outline"></span></button>
      </div>
      <div class="ed__group">
        <label class="ed__label">URL</label>
        <input class="ed__input" :value="img.url" @input="updateImage(idx, 'url', ($event.target as HTMLInputElement).value)" placeholder="https://..." />
      </div>
      <div class="ed__group">
        <label class="ed__label">Caption</label>
        <input class="ed__input" :value="img.caption" @input="updateImage(idx, 'caption', ($event.target as HTMLInputElement).value)" placeholder="Opcional" />
      </div>
    </div>
    <button class="ed__add-full" @click="addImage"><span class="mdi mdi-plus"></span> Agregar imagen</button>
  </div>
</template>

<style scoped src="./editor.css"></style>
