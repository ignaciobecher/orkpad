<template>
  <div class="redirect-page">
    <span class="mdi mdi-loading mdi-spin redirect-page__spinner"></span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PortfolioPage',
  mounted() {
    this.$router.replace({ name: 'portfolio-builder' })
  },
})
</script>

<style scoped>
.redirect-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: var(--color-text-muted);
  font-size: 32px;
}
</style>
