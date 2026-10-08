<template>
  <div v-if="visible" class="top-loading-bar" :class="{ 'top-loading-bar--done': done }">
    <div class="top-loading-bar__fill"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useUIStore } from '@/stores/ui.store'

export default defineComponent({
  name: 'WTopLoadingBar',
  setup() {
    const uiStore = useUIStore()
    const visible = ref(false)
    const done = ref(false)
    let showTimer: ReturnType<typeof setTimeout> | null = null
    let hideTimer: ReturnType<typeof setTimeout> | null = null

    const clearTimers = () => {
      if (showTimer) clearTimeout(showTimer)
      if (hideTimer) clearTimeout(hideTimer)
      showTimer = hideTimer = null
    }

    watch(
      () => uiStore.globalLoading,
      (loading) => {
        if (loading) {
          if (hideTimer) clearTimeout(hideTimer)
          done.value = false
          // evita parpadeo en requests rápidos
          if (!visible.value && !showTimer) {
            showTimer = setTimeout(() => {
              visible.value = true
              showTimer = null
            }, 250)
          }
        } else {
          if (showTimer) {
            clearTimeout(showTimer)
            showTimer = null
            visible.value = false
            return
          }
          if (!visible.value) return
          done.value = true
          hideTimer = setTimeout(() => {
            visible.value = false
            done.value = false
            hideTimer = null
          }, 300)
        }
      },
    )

    return { visible, done, clearTimers }
  },
  beforeUnmount() {
    this.clearTimers()
  },
})
</script>

<style scoped>
.top-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 9999;
  background: transparent;
  pointer-events: none;
}

.top-loading-bar__fill {
  height: 100%;
  width: 30%;
  background: var(--color-primary);
  border-radius: 0 3px 3px 0;
  animation: top-loading-slide 1s ease-in-out infinite;
}

.top-loading-bar--done .top-loading-bar__fill {
  animation: none;
  width: 100%;
  transition: width 0.2s;
}

@keyframes top-loading-slide {
  0% { margin-left: -30%; }
  100% { margin-left: 100%; }
}
</style>
