<script setup lang="ts">
defineProps<{
  content: Record<string, any>
  settings: Record<string, any>
  portfolioData: Record<string, any>
}>()
</script>

<template>
  <section class="custom">
    <div class="custom__inner">
      <h2 v-if="content.title" class="section-title">{{ content.title }}</h2>
      <div v-if="content.body" class="custom__body" v-html="content.body"></div>
    </div>
  </section>
</template>

<style scoped>
.custom { padding: 80px 24px; }
.custom__inner { max-width: 960px; margin: 0 auto; }
.custom__body { margin-top: 24px; font-size: 16px; line-height: 1.8; color: var(--color-text-muted); }
.custom__body :deep(h1), .custom__body :deep(h2), .custom__body :deep(h3) { color: var(--color-text-base); margin-top: 24px; }
.custom__body :deep(a) { color: var(--pf-primary, var(--color-primary)); }
.custom__body :deep(b), .custom__body :deep(strong) { color: var(--color-text-base); }
.custom__body :deep(ul), .custom__body :deep(ol) { padding-left: 24px; }
.custom__body :deep(code) { font-family: var(--font-mono, monospace); background: var(--color-bg-surface-high); padding: 2px 6px; font-size: 0.9em; }
.section-title { font-size: 28px; font-weight: 700; margin: 0; }
</style>
