<template>
  <img
    class="win-icon"
    :src="src"
    :alt="alt"
    draggable="false"
    :width="size"
    :height="size"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { winIconSrc } from './icons'

export default defineComponent({
  name: 'WinIcon',
  props: {
    name: { type: String, required: true },
    size: { type: Number, default: 32 },
    alt: { type: String, default: '' },
  },
  setup(props) {
    const src = computed(() => winIconSrc(props.name, props.size))
    return { src }
  },
})
</script>

<style scoped>
.win-icon {
  image-rendering: pixelated;
  flex-shrink: 0;
  user-select: none;
  pointer-events: none;
}
</style>
