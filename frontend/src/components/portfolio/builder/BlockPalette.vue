<script setup lang="ts">
import { SECTION_BLOCKS, type SectionType } from '@/api/portfolio/portfolio-builder.types'

const emit = defineEmits<{ add: [type: SectionType] }>()
</script>

<template>
  <div class="palette">
    <button
      v-for="block in SECTION_BLOCKS"
      :key="block.type"
      class="palette__item"
      :title="block.description"
      @click="emit('add', block.type)"
    >
      <span class="palette__icon mdi" :class="block.icon"></span>
      <div class="palette__info">
        <span class="palette__label">{{ block.label }}</span>
      </div>
      <span class="mdi mdi-plus palette__plus"></span>
    </button>
  </div>
</template>

<style scoped>
.palette {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.palette__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.15s;
  width: 100%;
}
.palette__item:hover {
  background: var(--color-bg-surface-high);
  color: var(--color-text-base);
  border-color: var(--color-border);
}
.palette__item:hover .palette__plus {
  opacity: 1;
}
.palette__icon {
  font-size: 15px;
  flex-shrink: 0;
  color: var(--color-primary);
}
.palette__info {
  flex: 1;
  min-width: 0;
}
.palette__label {
  font-size: 12px;
  display: block;
}
.palette__plus {
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
</style>
