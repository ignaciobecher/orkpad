<template>
  <div class="w-card w95-outset">
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

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .w-card {
background: var(--w95-face);
  display: flex;
  flex-direction: column;
  border-radius: 0;
}

html[data-appearance="win95"] .w-card__header {
padding: 4px 8px;
  background: linear-gradient(90deg, var(--w95-navy), var(--w95-navy-light));
  color: #fff;
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2px 2px 0 2px;
}

html[data-appearance="win95"] .w-card__body {
padding: 10px;
  flex-grow: 1;
  background: var(--w95-face);
  color: #000;
}

html[data-appearance="win95"] .w-card__footer {
padding: 6px 10px;
  border-top: 1px solid var(--w95-shadow);
  box-shadow: inset 0 1px 0 var(--w95-highlight);
  background: var(--w95-face);
}
</style>
