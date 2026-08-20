<script setup lang="ts">
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const props = defineProps<{ content: Record<string, any>; settings: Record<string, any> }>()
const emit = defineEmits<{
  'update-content': [v: Record<string, any>]
  'update-settings': [v: Record<string, any>]
}>()
const c = (k: string, v: any) => emit('update-content', { [k]: v })

const items = () => props.content.items ?? []

function updateItem(idx: number, key: string, val: any) {
  const arr = [...items()]
  arr[idx] = { ...arr[idx], [key]: val }
  c('items', arr)
}
function addItem() {
  c('items', [...items(), { id: uid(), institution: '', degree: '', period: '', description: '' }])
}
function removeItem(idx: number) {
  const arr = [...items()]
  arr.splice(idx, 1)
  c('items', arr)
}
</script>

<template>
  <div class="ed">
    <div class="ed__group">
      <label class="ed__label">Título</label>
      <input class="ed__input" :value="content.title" @input="c('title', ($event.target as HTMLInputElement).value)" placeholder="Educación" />
    </div>

    <div class="ed__divider"></div>

    <div v-for="(item, idx) in items()" :key="item.id" class="ed__item">
      <div class="ed__item-header">
        <span class="ed__item-num">#{{ idx + 1 }}</span>
        <button class="ed__remove-btn" @click="removeItem(idx)"><span class="mdi mdi-trash-can-outline"></span></button>
      </div>
      <div class="ed__group">
        <label class="ed__label">Institución</label>
        <input class="ed__input" :value="item.institution" @input="updateItem(idx, 'institution', ($event.target as HTMLInputElement).value)" placeholder="Universidad / Instituto" />
      </div>
      <div class="ed__group">
        <label class="ed__label">Título / Carrera</label>
        <input class="ed__input" :value="item.degree" @input="updateItem(idx, 'degree', ($event.target as HTMLInputElement).value)" placeholder="Ingeniería en Sistemas" />
      </div>
      <div class="ed__group">
        <label class="ed__label">Período</label>
        <input class="ed__input" :value="item.period" @input="updateItem(idx, 'period', ($event.target as HTMLInputElement).value)" placeholder="2016 — 2020" />
      </div>
      <div class="ed__group">
        <label class="ed__label">Descripción</label>
        <textarea class="ed__input ed__textarea" :value="item.description" @input="updateItem(idx, 'description', ($event.target as HTMLTextAreaElement).value)" rows="2" placeholder="Opcional"></textarea>
      </div>
    </div>

    <button class="ed__add-full" @click="addItem">
      <span class="mdi mdi-plus"></span> Agregar educación
    </button>
  </div>
</template>

<style scoped src="./editor.css"></style>
