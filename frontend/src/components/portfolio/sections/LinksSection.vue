<script setup lang="ts">
const props = defineProps<{
  content: Record<string, any>
  settings: Record<string, any>
  portfolioData: Record<string, any>
}>()
const items = props.content.items ?? []
</script>

<template>
  <section class="links">
    <div class="links__inner">
      <h2 v-if="content.title" class="section-title links__title">{{ content.title }}</h2>
      <div class="links__list">
        <a
          v-for="item in items"
          :key="item.id"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="links__item"
        >
          <span class="links__icon mdi" :class="item.icon || 'mdi-link-variant'"></span>
          <div class="links__text">
            <span class="links__label">{{ item.label }}</span>
            <span v-if="item.description" class="links__desc">{{ item.description }}</span>
          </div>
          <span class="mdi mdi-arrow-right links__arrow"></span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.links { padding: 80px 24px; }
.links__inner { max-width: 600px; margin: 0 auto; }
.links__title { text-align: center; margin-bottom: 40px; }
.links__list { display: flex; flex-direction: column; gap: 12px; }
.links__item { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: var(--color-bg-surface); border: 1px solid var(--color-border); text-decoration: none; color: var(--color-text-base); transition: all 0.15s; }
.links__item:hover { border-color: var(--pf-primary, var(--color-primary)); transform: translateY(-1px); }
.links__icon { font-size: 22px; color: var(--pf-primary, var(--color-primary)); flex-shrink: 0; }
.links__text { flex: 1; }
.links__label { display: block; font-size: 15px; font-weight: 600; }
.links__desc { display: block; font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }
.links__arrow { color: var(--color-text-muted); font-size: 18px; }
.section-title { font-size: 28px; font-weight: 700; margin: 0; }
</style>
