<script setup lang="ts">
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const ICONS = [
  { value: 'mdi-web', label: 'Web' },
  { value: 'mdi-github', label: 'GitHub' },
  { value: 'mdi-linkedin', label: 'LinkedIn' },
  { value: 'mdi-twitter', label: 'Twitter/X' },
  { value: 'mdi-instagram', label: 'Instagram' },
  { value: 'mdi-youtube', label: 'YouTube' },
  { value: 'mdi-twitch', label: 'Twitch' },
  { value: 'mdi-file-document-outline', label: 'CV / Doc' },
  { value: 'mdi-email-outline', label: 'Email' },
  { value: 'mdi-phone-outline', label: 'Teléfono' },
  { value: 'mdi-link-variant', label: 'Link genérico' },
]

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
  c('items', [...items(), { id: uid(), label: '', url: '', icon: 'mdi-link-variant', description: '' }])
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
      <input class="ed__input" :value="content.title" @input="c('title', ($event.target as HTMLInputElement).value)" placeholder="Mis links" />
    </div>

    <div class="ed__divider"></div>

    <div v-for="(item, idx) in items()" :key="item.id" class="ed__item">
      <div class="ed__item-header">
        <span class="mdi" :class="item.icon || 'mdi-link-variant'" style="color:var(--color-primary)"></span>
        <span class="ed__item-num">{{ item.label || 'Sin nombre' }}</span>
        <button class="ed__remove-btn" @click="removeItem(idx)"><span class="mdi mdi-trash-can-outline"></span></button>
      </div>
      <div class="ed__group">
        <label class="ed__label">Etiqueta</label>
        <input class="ed__input" :value="item.label" @input="updateItem(idx, 'label', ($event.target as HTMLInputElement).value)" placeholder="Mi portafolio" />
      </div>
      <div class="ed__group">
        <label class="ed__label">URL</label>
        <input class="ed__input" :value="item.url" @input="updateItem(idx, 'url', ($event.target as HTMLInputElement).value)" placeholder="https://..." />
      </div>
      <div class="ed__group">
        <label class="ed__label">Descripción corta</label>
        <input class="ed__input" :value="item.description" @input="updateItem(idx, 'description', ($event.target as HTMLInputElement).value)" placeholder="Opcional" />
      </div>
      <div class="ed__group">
        <label class="ed__label">Icono</label>
        <select class="ed__input" :value="item.icon" @change="updateItem(idx, 'icon', ($event.target as HTMLSelectElement).value)">
          <option v-for="ic in ICONS" :key="ic.value" :value="ic.value">{{ ic.label }}</option>
        </select>
      </div>
    </div>

    <button class="ed__add-full" @click="addItem">
      <span class="mdi mdi-plus"></span> Agregar link
    </button>
  </div>
</template>

<style scoped src="./editor.css"></style>
