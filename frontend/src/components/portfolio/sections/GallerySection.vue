<script setup lang="ts">
const props = defineProps<{
  content: Record<string, any>
  settings: Record<string, any>
  portfolioData: Record<string, any>
}>()
const images = props.content.images ?? []
</script>

<template>
  <section class="gallery">
    <div class="gallery__inner">
      <h2 v-if="content.title" class="section-title">{{ content.title }}</h2>
      <div class="gallery__grid" :style="{ '--cols': settings.columns ?? 3 }">
        <div v-for="img in images" :key="img.id" class="gallery__item">
          <img :src="img.url" :alt="img.caption || img.alt || ''" class="gallery__img" />
          <p v-if="img.caption" class="gallery__caption">{{ img.caption }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gallery { padding: 80px 24px; }
.gallery__inner { max-width: 1100px; margin: 0 auto; }
.gallery__grid { display: grid; grid-template-columns: repeat(var(--cols, 3), 1fr); gap: 12px; margin-top: 36px; }
@media (max-width: 600px) { .gallery__grid { grid-template-columns: 1fr 1fr; } }
.gallery__item { overflow: hidden; background: var(--color-bg-surface-high); }
.gallery__img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; transition: transform 0.3s; }
.gallery__item:hover .gallery__img { transform: scale(1.04); }
.gallery__caption { font-size: 12px; color: var(--color-text-muted); padding: 8px; margin: 0; }
.section-title { font-size: 28px; font-weight: 700; margin: 0; }
</style>
