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
