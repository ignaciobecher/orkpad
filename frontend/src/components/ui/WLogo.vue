<template>
  <div class="w-logo" :style="{ height: height + 'px' }">
    <img 
      :src="logoSrc" 
      alt="Orkpad Logo" 
      class="logo-img"
      :height="height"
      width="180"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useUIStore } from '@/stores/ui.store'

export default defineComponent({
  name: 'WLogo',
  props: {
    height: {
      type: [Number, String],
      default: 32
    },
    // Optional: force a specific version regardless of theme
    version: {
      type: String,
      default: 'auto', // 'auto', 'black', 'white'
    }
  },
  setup(props) {
    const uiStore = useUIStore()

    const logoSrc = computed(() => {
      if (props.version === 'white') return '/logo-white.png'
      if (props.version === 'black') return '/logo-black.png'
      
      // Auto based on theme
      return uiStore.theme === 'dark' ? '/logo-white.png' : '/logo-black.png'
    })

    return { logoSrc }
  }
})
</script>

<style scoped>
.w-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  height: 100%;
  width: auto;
  object-fit: contain;
}

@media (max-width: 768px) {
  .w-logo {
    max-height: 40px;
  }
}
</style>
