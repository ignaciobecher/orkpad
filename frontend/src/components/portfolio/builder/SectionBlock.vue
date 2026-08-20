<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioSection } from '@/api/portfolio/portfolio-builder.types'
import { SECTION_BLOCKS } from '@/api/portfolio/portfolio-builder.types'

const props = defineProps<{
  section: PortfolioSection
  selected: boolean
  position: number
  total: number
}>()

const emit = defineEmits<{
  select: []
  'toggle-visibility': []
  remove: []
  'move-up': []
  'move-down': []
  duplicate: []
}>()

const meta = computed(() => SECTION_BLOCKS.find(b => b.type === props.section.type))
const label = computed(() => meta.value?.label ?? props.section.type)
const icon = computed(() => meta.value?.icon ?? 'mdi-widgets-outline')
</script>

<template>
  <div
    class="section-block"
    :class="{
      'section-block--selected': selected,
      'section-block--hidden': !section.visible,
    }"
    @click="emit('select')"
  >
    <span class="section-block__grip mdi mdi-drag-vertical"></span>
    <span class="section-block__order">{{ position }}</span>
    <span class="section-block__icon mdi" :class="icon"></span>
    <span class="section-block__label">{{ label }}</span>
    <span v-if="!section.visible" class="section-block__badge">Oculto</span>

    <div class="section-block__actions" @click.stop>
      <button
        class="section-block__btn"
        title="Subir"
        :disabled="position === 1"
        @click="emit('move-up')"
      >
        <span class="mdi mdi-chevron-up"></span>
      </button>
      <button
        class="section-block__btn"
        title="Bajar"
        :disabled="position === total"
        @click="emit('move-down')"
      >
        <span class="mdi mdi-chevron-down"></span>
      </button>
      <button
        class="section-block__btn"
        title="Duplicar"
        @click="emit('duplicate')"
      >
        <span class="mdi mdi-content-copy"></span>
      </button>
      <button
        class="section-block__btn section-block__btn--visibility"
        :title="section.visible ? 'Ocultar' : 'Mostrar'"
        @click="emit('toggle-visibility')"
      >
        <span
          class="mdi"
          :class="section.visible ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
        ></span>
      </button>
      <button
        class="section-block__btn section-block__btn--danger"
        title="Eliminar"
        @click="emit('remove')"
      >
        <span class="mdi mdi-trash-can-outline"></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.section-block {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  margin-bottom: 6px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  user-select: none;
}
.section-block:hover {
  border-color: rgba(var(--color-primary-rgb), 0.5);
}
.section-block--selected {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.06);
}
.section-block--hidden {
  opacity: 0.45;
}
:global(.section-block--ghost) {
  opacity: 0.3;
  background: var(--color-bg-surface-high);
}
.section-block__grip {
  color: var(--color-text-muted);
  cursor: grab;
  font-size: 20px;
  flex-shrink: 0;
  padding: 4px 2px;
  margin: -4px -2px;
}
.section-block__grip:active {
  cursor: grabbing;
}
.section-block__order {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-muted);
  min-width: 14px;
  text-align: center;
  flex-shrink: 0;
}
.section-block__icon {
  color: var(--color-primary);
  font-size: 16px;
  flex-shrink: 0;
}
.section-block__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-base);
  flex: 1;
}
.section-block__badge {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--color-bg-surface-high);
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
}
.section-block__actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}
.section-block__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 15px;
  transition: color 0.15s, background 0.15s;
  border-radius: 4px;
}
.section-block__btn:hover:not(:disabled) {
  color: var(--color-text-base);
  background: var(--color-bg-surface-high);
}
.section-block__btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

/* Move up/down and duplicate only visible on hover */
.section-block__btn:not(.section-block__btn--visibility):not(.section-block__btn--danger) {
  opacity: 0;
  transition: opacity 0.15s, color 0.15s, background 0.15s;
}
.section-block:hover .section-block__btn:not(.section-block__btn--visibility):not(.section-block__btn--danger) {
  opacity: 1;
}

.section-block__btn--danger:hover:not(:disabled) {
  color: var(--color-error);
  background: rgba(var(--color-error-rgb, 220 38 38), 0.08);
}
</style>
