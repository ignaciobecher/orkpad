<template>
  <div class="w-card">
    <div v-if="$slots.header" class="w-card__header">
      <slot name="header"></slot>
    </div>
    <div class="w-card__body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="w-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WCard'
})
</script>

<style scoped>
.w-card {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.w-card__header {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.w-card__body {
  padding: var(--space-lg);
  flex-grow: 1;
}

.w-card__footer {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
}
</style>
