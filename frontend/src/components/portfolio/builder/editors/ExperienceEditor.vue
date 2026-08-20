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
  c('items', [...items(), { id: uid(), company: '', role: '', period: '', description: '', current: false }])
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
      <input class="ed__input" :value="content.title" @input="c('title', ($event.target as HTMLInputElement).value)" placeholder="Experiencia" />
    </div>

    <div class="ed__divider"></div>

    <div v-for="(item, idx) in items()" :key="item.id" class="ed__item">
      <div class="ed__item-header">
        <span class="ed__item-num">#{{ idx + 1 }}</span>
        <button class="ed__remove-btn" @click="removeItem(idx)"><span class="mdi mdi-trash-can-outline"></span></button>
      </div>
      <div class="ed__group">
        <label class="ed__label">Empresa</label>
        <input class="ed__input" :value="item.company" @input="updateItem(idx, 'company', ($event.target as HTMLInputElement).value)" placeholder="Nombre de la empresa" />
      </div>
      <div class="ed__group">
        <label class="ed__label">Rol</label>
        <input class="ed__input" :value="item.role" @input="updateItem(idx, 'role', ($event.target as HTMLInputElement).value)" placeholder="Senior Developer" />
      </div>
      <div class="ed__group">
        <label class="ed__label">Período</label>
        <input class="ed__input" :value="item.period" @input="updateItem(idx, 'period', ($event.target as HTMLInputElement).value)" placeholder="Ene 2022 — Presente" />
      </div>
      <div class="ed__group">
        <label class="ed__label">Descripción</label>
        <textarea class="ed__input ed__textarea" :value="item.description" @input="updateItem(idx, 'description', ($event.target as HTMLTextAreaElement).value)" rows="2" placeholder="Responsabilidades y logros..."></textarea>
      </div>
      <label class="ed__toggle">
        <input type="checkbox" :checked="item.current" @change="updateItem(idx, 'current', ($event.target as HTMLInputElement).checked)" />
        <span>Trabajo actual</span>
      </label>
    </div>

    <button class="ed__add-full" @click="addItem">
      <span class="mdi mdi-plus"></span> Agregar experiencia
    </button>
  </div>
</template>

<style scoped src="./editor.css"></style>
