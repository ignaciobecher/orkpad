<script setup lang="ts">
const props = defineProps<{
  content: Record<string, any>
  settings: Record<string, any>
  portfolioData: Record<string, any>
}>()
const services = props.portfolioData.services ?? []
</script>

<template>
  <section class="services">
    <div class="services__inner">
      <div class="services__header">
        <h2 v-if="content.title" class="section-title">{{ content.title }}</h2>
        <p v-if="content.subtitle" class="services__subtitle">{{ content.subtitle }}</p>
      </div>
      <div class="services__grid">
        <div v-for="svc in services" :key="svc._id" class="services__card">
          <div class="services__icon"><span class="mdi mdi-briefcase-outline"></span></div>
          <p class="services__name">{{ svc.name }}</p>
          <p v-if="svc.description" class="services__desc">{{ svc.description }}</p>
          <p v-if="settings.showPrice !== false && svc.price" class="services__price">
            {{ svc.currency ?? 'USD' }} {{ svc.price }}
          </p>
        </div>
      </div>
      <div v-if="services.length === 0" class="services__empty">Sin servicios aún.</div>
    </div>
  </section>
</template>

<style scoped>
.services { padding: 80px 24px; }
.services__inner { max-width: 1100px; margin: 0 auto; }
.services__header { margin-bottom: 40px; }
.services__subtitle { color: var(--color-text-muted); margin: 8px 0 0; font-size: 16px; }
.services__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
.services__card { background: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 28px; transition: border-color 0.15s; }
.services__card:hover { border-color: var(--pf-primary, var(--color-primary)); }
.services__icon { width: 44px; height: 44px; background: rgba(var(--color-primary-rgb),0.1); display: flex; align-items: center; justify-content: center; font-size: 22px; color: var(--pf-primary, var(--color-primary)); margin-bottom: 16px; }
.services__name { font-size: 16px; font-weight: 700; margin: 0 0 8px; }
.services__desc { font-size: 13px; color: var(--color-text-muted); margin: 0 0 16px; line-height: 1.6; }
.services__price { font-size: 18px; font-weight: 700; color: var(--pf-primary, var(--color-primary)); margin: 0; }
.services__empty { color: var(--color-text-muted); font-size: 14px; }
.section-title { font-size: 28px; font-weight: 700; margin: 0; }
</style>
