<template>
  <img
    v-if="isWin95"
    class="win-icon"
    :src="src"
    :alt="alt"
    draggable="false"
    :width="size"
    :height="size"
  />
  <span
    v-else
    class="material-symbols-outlined win-icon--material"
    :style="{ fontSize: size + 'px' }"
    aria-hidden="true"
  >{{ materialGlyph }}</span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useUIStore } from '@/stores/ui.store'
import { winIconSrc, materialToWinIcon, winToMaterial } from './icons'

export default defineComponent({
  name: 'WinIcon',
  props: {
    /** Clave win (p.ej. 'folder'). Se usa directo en Win95; en clásica se invierte a Material. */
    name: { type: String, default: '' },
    /** Nombre Material original (p.ej. 'view_list'). Exacto en clásica; mapeado en Win95. */
    material: { type: String, default: '' },
    size: { type: Number, default: 32 },
    alt: { type: String, default: '' },
  },
  setup(props) {
    // Pinia puede no estar listo en algún contexto de test: fallback Win95.
    let uiStore: { appearance?: string } | null = null
    try { uiStore = useUIStore() } catch { uiStore = null }
    const isWin95 = computed(() => (uiStore?.appearance ?? 'win95') === 'win95')
    const winKey = computed(() => props.material
      ? materialToWinIcon(props.material)
      : (props.name || 'file-lines'))
    const src = computed(() => winIconSrc(winKey.value, props.size))
    const materialGlyph = computed(() => props.material || winToMaterial(props.name))
    return { isWin95, src, materialGlyph }
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
.win-icon--material {
  image-rendering: auto;
  flex-shrink: 0;
  user-select: none;
  pointer-events: none;
  line-height: 1;
}
</style>
