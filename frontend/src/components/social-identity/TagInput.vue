<template>
  <div class="tags-editor">
    <span v-for="(tag, idx) in modelValue" :key="idx" class="tag-chip">
      {{ tag }}
      <button class="tag-remove" @click="removeTag(idx)">
        <span class="material-symbols-outlined">close</span>
      </button>
    </span>
    <input
      v-model="draft"
      class="tag-input"
      :placeholder="placeholder"
      @keydown.enter.prevent="addTag"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue'

export default defineComponent({
  name: 'TagInput',
  props: {
    modelValue: { type: Array as PropType<string[]>, default: () => [] },
    placeholder: { type: String, default: '+ agregar' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const draft = ref('')

    function addTag() {
      const value = draft.value.trim()
      if (!value) return
      emit('update:modelValue', [...props.modelValue, value])
      draft.value = ''
    }

    function removeTag(idx: number) {
      const next = [...props.modelValue]
      next.splice(idx, 1)
      emit('update:modelValue', next)
    }

    return { draft, addTag, removeTag }
  },
})
</script>

<style scoped>
.tags-editor {
  display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
  border: 1px solid var(--color-border); background: var(--color-bg-surface-low);
  padding: 6px 10px; min-height: 36px; border-radius: 4px;
}

.tag-chip {
  display: flex; align-items: center; gap: 2px; background: var(--color-bg-surface-high);
  font-family: var(--font-mono); font-size: 10px; color: var(--color-text-subtle); padding: 2px 6px;
}

.tag-remove { background: none; border: none; color: var(--color-text-muted); cursor: pointer; display: flex; align-items: center; padding: 0; }
.tag-remove:hover { color: var(--color-error); }
.tag-remove .material-symbols-outlined { font-size: 12px; }

.tag-input { background: none; border: none; outline: none; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-base); min-width: 80px; flex: 1; }
.tag-input::placeholder { color: var(--color-text-disabled); }
</style>
