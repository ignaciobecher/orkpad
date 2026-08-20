<template>
  <div :class="['w-skeleton', { 'w-skeleton--rounded': rounded }]" :style="{ width, height }"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WLoadingSkeleton',
  props: {
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '20px'
    },
    rounded: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style scoped>
.w-skeleton {
  background-color: var(--color-bg-surface-highest);
  animation: pulse 1.5s infinite ease-in-out;
}

.w-skeleton--rounded {
  border-radius: 4px;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}
</style>
