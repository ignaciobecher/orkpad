<template>
  <v-app>
    <router-view />
  </v-app>
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
      theme.global.name.value = uiStore.theme
    })

    watch(() => uiStore.theme, (newTheme) => {
      theme.global.name.value = newTheme
    })
  }
})
</script>

<style>
/* Global styles are in main.css */
</style>
