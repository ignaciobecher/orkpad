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
