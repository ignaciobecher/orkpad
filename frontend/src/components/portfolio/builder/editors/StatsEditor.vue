<script setup lang="ts">
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const props = defineProps<{ content: Record<string, any>; settings: Record<string, any> }>()
const emit = defineEmits<{
  'update-content': [v: Record<string, any>]
  'update-settings': [v: Record<string, any>]
}>()
const c = (k: string, v: any) => emit('update-content', { [k]: v })

const items = () => props.content.customStats ?? []
function updateItem(idx: number, key: string, val: any) {
  const arr = [...items()]
  arr[idx] = { ...arr[idx], [key]: val }
  c('customStats', arr)
}
function addItem() {
  c('customStats', [...items(), { id: uid(), label: '', value: '' }])
}
function removeItem(idx: number) {
  const arr = [...items()]
  arr.splice(idx, 1)
  c('customStats', arr)
}
</script>

<template>
  <div class="ed">
    <div class="ed__group">
      <label class="ed__toggle">
        <input type="checkbox" :checked="content.useWorkspaceStats" @change="c('useWorkspaceStats', ($event.target as HTMLInputElement).checked)" />
        <span>Usar estadísticas del workspace</span>
      </label>
    </div>
    <template v-if="!content.useWorkspaceStats">
      <div class="ed__divider"></div>
      <div v-for="(item, idx) in items()" :key="item.id" class="ed__item">
        <div class="ed__item-header">
          <span class="ed__item-num">Stat #{{ idx + 1 }}</span>
          <button class="ed__remove-btn" @click="removeItem(idx)"><span class="mdi mdi-trash-can-outline"></span></button>
        </div>
        <div class="ed__row">
          <div class="ed__group" style="flex:1">
            <label class="ed__label">Valor</label>
            <input class="ed__input" :value="item.value" @input="updateItem(idx, 'value', ($event.target as HTMLInputElement).value)" placeholder="50+" />
          </div>
          <div class="ed__group" style="flex:1">
            <label class="ed__label">Etiqueta</label>
            <input class="ed__input" :value="item.label" @input="updateItem(idx, 'label', ($event.target as HTMLInputElement).value)" placeholder="Proyectos" />
          </div>
        </div>
      </div>
      <button class="ed__add-full" @click="addItem"><span class="mdi mdi-plus"></span> Agregar stat</button>
    </template>
  </div>
</template>

<style scoped src="./editor.css"></style>
