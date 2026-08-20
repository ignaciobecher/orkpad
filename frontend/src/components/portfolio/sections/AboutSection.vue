<script setup lang="ts">
defineProps<{
  content: Record<string, any>
  settings: Record<string, any>
  portfolioData: Record<string, any>
}>()
</script>

<template>
  <section class="about">
    <div class="about__inner" :class="`about__inner--${settings.layout ?? 'text-only'}`">
      <div class="about__text">
        <h2 v-if="content.title" class="section-title">{{ content.title }}</h2>
        <div class="about__body" v-html="content.body"></div>
      </div>
      <div v-if="content.imageUrl && settings.layout !== 'text-only'" class="about__img-wrap">
        <img :src="content.imageUrl" :alt="content.title" class="about__img" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.about { padding: 80px 24px; max-width: 960px; margin: 0 auto; }
.about__inner { display: flex; gap: 60px; align-items: center; }
.about__inner--text-only .about__text { width: 100%; }
.about__inner--text-image { flex-direction: row; }
.about__inner--image-text { flex-direction: row-reverse; }
.about__text { flex: 1; }
.about__body { font-size: 16px; line-height: 1.8; color: var(--color-text-muted); margin-top: 20px; }
.about__body :deep(b), .about__body :deep(strong) { color: var(--color-text-base); font-weight: 600; }
.about__body :deep(a) { color: var(--pf-primary, var(--color-primary)); }
.about__img-wrap { flex-shrink: 0; width: 320px; }
.about__img { width: 100%; object-fit: cover; aspect-ratio: 4/3; }
.section-title { font-size: 28px; font-weight: 700; margin: 0; }
</style>
