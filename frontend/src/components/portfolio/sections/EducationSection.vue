<script setup lang="ts">
const props = defineProps<{
  content: Record<string, any>
  settings: Record<string, any>
  portfolioData: Record<string, any>
}>()
const items = props.content.items ?? []
</script>

<template>
  <section class="edu">
    <div class="edu__inner">
      <h2 v-if="content.title" class="section-title">{{ content.title }}</h2>
      <div class="edu__list">
        <div v-for="item in items" :key="item.id" class="edu__item">
          <div class="edu__icon"><span class="mdi mdi-school-outline"></span></div>
          <div class="edu__body">
            <p class="edu__degree">{{ item.degree }}</p>
            <p class="edu__institution">{{ item.institution }}</p>
            <p v-if="item.period" class="edu__period">{{ item.period }}</p>
            <p v-if="item.description" class="edu__desc">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.edu { padding: 80px 24px; }
.edu__inner { max-width: 800px; margin: 0 auto; }
.edu__list { margin-top: 36px; display: flex; flex-direction: column; gap: 20px; }
.edu__item { display: flex; gap: 20px; background: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 20px 24px; }
.edu__icon { width: 40px; height: 40px; background: rgba(var(--color-primary-rgb),0.1); display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--pf-primary, var(--color-primary)); flex-shrink: 0; }
.edu__body { flex: 1; }
.edu__degree { font-size: 15px; font-weight: 700; margin: 0 0 4px; }
.edu__institution { font-size: 13px; color: var(--pf-primary, var(--color-primary)); margin: 0 0 4px; }
.edu__period { font-size: 12px; color: var(--color-text-muted); margin: 0 0 8px; }
.edu__desc { font-size: 13px; color: var(--color-text-muted); margin: 0; line-height: 1.6; }
.section-title { font-size: 28px; font-weight: 700; margin: 0; }
</style>
