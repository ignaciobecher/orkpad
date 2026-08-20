<script setup lang="ts">
const props = defineProps<{
  content: Record<string, any>
  settings: Record<string, any>
  portfolioData: Record<string, any>
}>()

const stats = props.content.useWorkspaceStats !== false
  ? [
      props.portfolioData.stats?.yearsExperience
        ? { value: props.portfolioData.stats.yearsExperience + '+', label: 'Años de experiencia' }
        : null,
      props.portfolioData.stats?.completedProjects
        ? { value: props.portfolioData.stats.completedProjects + '+', label: 'Proyectos completados' }
        : null,
      props.portfolioData.stats?.happyClients
        ? { value: props.portfolioData.stats.happyClients + '+', label: 'Clientes satisfechos' }
        : null,
    ].filter(Boolean)
  : (props.content.customStats ?? [])
</script>

<template>
  <section class="stats">
    <div class="stats__inner">
      <div class="stats__grid">
        <div v-for="stat in stats" :key="stat.label" class="stats__item">
          <span class="stats__value">{{ stat.value }}</span>
          <span class="stats__label">{{ stat.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats { padding: 60px 24px; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }
.stats__inner { max-width: 960px; margin: 0 auto; }
.stats__grid { display: flex; justify-content: center; gap: 60px; flex-wrap: wrap; }
.stats__item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.stats__value { font-size: 42px; font-weight: 800; color: var(--pf-primary, var(--color-primary)); line-height: 1; }
.stats__label { font-size: 13px; color: var(--color-text-muted); text-align: center; }
</style>
