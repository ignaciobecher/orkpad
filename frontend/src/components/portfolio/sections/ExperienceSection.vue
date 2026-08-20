<script setup lang="ts">
const props = defineProps<{
  content: Record<string, any>
  settings: Record<string, any>
  portfolioData: Record<string, any>
}>()

const items = props.content.items ?? []
</script>

<template>
  <section class="exp">
    <div class="exp__inner">
      <h2 v-if="content.title" class="section-title">{{ content.title }}</h2>
      <div class="exp__timeline">
        <div v-for="item in items" :key="item.id" class="exp__item">
          <div class="exp__dot"></div>
          <div class="exp__card">
            <div class="exp__header">
              <div>
                <p class="exp__role">{{ item.role }}</p>
                <p class="exp__company">{{ item.company }}</p>
              </div>
              <span class="exp__period">{{ item.period }}<span v-if="item.current" class="exp__current"> — Actual</span></span>
            </div>
            <p v-if="item.description" class="exp__desc">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.exp { padding: 80px 24px; }
.exp__inner { max-width: 800px; margin: 0 auto; }
.exp__timeline { margin-top: 36px; position: relative; padding-left: 28px; border-left: 2px solid var(--color-border); }
.exp__item { position: relative; margin-bottom: 36px; }
.exp__dot { position: absolute; left: -36px; top: 4px; width: 12px; height: 12px; background: var(--pf-primary, var(--color-primary)); }
.exp__card { background: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 20px 24px; }
.exp__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }
.exp__role { font-size: 16px; font-weight: 700; margin: 0; }
.exp__company { font-size: 14px; color: var(--pf-primary, var(--color-primary)); margin: 2px 0 0; }
.exp__period { font-size: 12px; color: var(--color-text-muted); white-space: nowrap; }
.exp__current { color: var(--color-success); font-weight: 600; }
.exp__desc { font-size: 14px; color: var(--color-text-muted); line-height: 1.6; margin: 0; }
.section-title { font-size: 28px; font-weight: 700; margin: 0; }
</style>
