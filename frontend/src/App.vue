<template>
  <v-app v-if="uiStore.appearance === 'classic'">
    <router-view />
  </v-app>
  <div v-else id="orkpad95" class="w95-desktop-root">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui.store'
import { useTheme } from 'vuetify'

export default defineComponent({
  name: 'App',
  setup() {
    const uiStore = useUIStore()
    const theme = useTheme()

    onMounted(() => {
      uiStore.initTheme()
      theme.change(uiStore.theme)
    })

    watch(() => uiStore.theme, (newTheme) => {
      theme.change(newTheme)
    })

    return { uiStore }
  }
})
</script>

<style>
/* Global styles are in main.css */
#orkpad95 {
  min-height: 100vh;
}
html[data-appearance='win95'] #orkpad95 {
  background: var(--w95-teal);
}
</style>
