<template>
  <span
    class="w-badge"
    :style="{ borderColor: color, color: color }"
  >
    <slot></slot>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WBadge',
  props: {
    color: {
      type: String,
      default: 'var(--color-primary)'
    }
  }
})
</script>

<style scoped>
.w-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  border-width: 1px;
  border-style: solid;
  font-weight: 500;
  line-height: 1;
}
</style>

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .w-badge {
display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  text-transform: none;
  letter-spacing: 0;
  border: 2px solid;
  border-color: var(--w95-highlight) var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-highlight);
  background: var(--w95-face);
  color: #000;
  font-weight: normal;
  line-height: 1.2;
  border-radius: 0;
  box-shadow: none;
}
</style>
