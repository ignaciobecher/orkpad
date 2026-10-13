<template>
  <app-classic-layout v-if="uiStore.appearance === 'classic'" />
  <win-desktop-layout v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AppClassicLayout from './AppClassicLayout.vue'
import WinDesktopLayout from './WinDesktopLayout.vue'
import { useUIStore } from '@/stores/ui.store'

export default defineComponent({
  name: 'AppLayout',
  components: { AppClassicLayout, WinDesktopLayout },
  setup() {
    const uiStore = useUIStore()
    return { uiStore }
  },
})
</script>
