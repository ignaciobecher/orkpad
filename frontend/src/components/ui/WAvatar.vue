<template>
  <div class="w-avatar" :style="{ width: size + 'px', height: size + 'px' }">
    <span class="w-avatar__initials">{{ initials }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WAvatar',
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 32
    }
  },
  computed: {
    initials() {
      if (!this.name) return '??'
      const parts = this.name.split(' ')
      if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
      }
      return parts[0].charAt(0).toUpperCase()
    }
  }
})
</script>

<style scoped>
.w-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  color: white;
  font-family: var(--font-mono);
  font-weight: 600;
  border-radius: 0; /* Forced sharp edges */
}

.w-avatar__initials {
  font-size: 0.8em;
  letter-spacing: -0.05em;
}
</style>

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .w-avatar {
display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--w95-navy);
  color: #fff;
  font-family: Tahoma, Verdana, sans-serif;
  font-weight: bold;
  font-size: 11px;
  border: 2px solid;
  border-color: var(--w95-highlight) var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-highlight);
  border-radius: 0; 
  text-transform: none;
}

html[data-appearance="win95"] .w-avatar__initials {
font-size: 0.8em;
  letter-spacing: -0.05em;
}
</style>
