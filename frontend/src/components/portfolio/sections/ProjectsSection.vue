<script setup lang="ts">
const props = defineProps<{
  content: Record<string, any>
  settings: Record<string, any>
  portfolioData: Record<string, any>
}>()

const limit = props.settings.limit ?? 6
const allProjects = props.portfolioData.featuredProjects ?? []
const projects = limit > 0 ? allProjects.slice(0, limit) : allProjects
</script>

<template>
  <section class="projects">
    <div class="projects__inner">
      <div class="projects__header">
        <h2 v-if="content.title" class="section-title">{{ content.title }}</h2>
        <p v-if="content.subtitle" class="projects__subtitle">{{ content.subtitle }}</p>
      </div>
      <div
        class="projects__grid"
        :style="{ '--cols': settings.columns ?? 3 }"
      >
        <div v-for="project in projects" :key="project.id" class="projects__card">
          <div v-if="project.coverImageUrl" class="projects__cover">
            <img :src="project.coverImageUrl" :alt="project.name" />
          </div>
          <div class="projects__cover projects__cover--placeholder" v-else>
            <span class="mdi mdi-folder-outline"></span>
          </div>
          <div class="projects__info">
            <p class="projects__name">{{ project.name }}</p>
            <p v-if="project.description" class="projects__desc">{{ project.description }}</p>
            <span class="projects__status" :class="`projects__status--${project.status}`">{{ project.status }}</span>
          </div>
        </div>
      </div>
      <div v-if="projects.length === 0" class="projects__empty">Sin proyectos destacados aún.</div>
    </div>
  </section>
</template>

<style scoped>
.projects { padding: 80px 24px; }
.projects__inner { max-width: 1100px; margin: 0 auto; }
.projects__header { margin-bottom: 40px; }
.projects__subtitle { color: var(--color-text-muted); margin: 8px 0 0; font-size: 16px; }
.projects__grid { display: grid; grid-template-columns: repeat(var(--cols, 3), 1fr); gap: 20px; }
@media (max-width: 768px) { .projects__grid { grid-template-columns: 1fr; } }
.projects__card { background: var(--color-bg-surface); border: 1px solid var(--color-border); overflow: hidden; transition: border-color 0.15s; }
.projects__card:hover { border-color: var(--pf-primary, var(--color-primary)); }
.projects__cover { aspect-ratio: 16/9; overflow: hidden; background: var(--color-bg-surface-high); }
.projects__cover img { width: 100%; height: 100%; object-fit: cover; }
.projects__cover--placeholder { display: flex; align-items: center; justify-content: center; font-size: 36px; color: var(--color-text-disabled); }
.projects__info { padding: 16px; }
.projects__name { font-size: 15px; font-weight: 700; margin: 0 0 6px; }
.projects__desc { font-size: 13px; color: var(--color-text-muted); margin: 0 0 12px; line-height: 1.5; }
.projects__status { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 3px 8px; }
.projects__status--active { background: var(--color-success-bg); color: var(--color-success); }
.projects__status--completed { background: var(--color-info); color: #fff; }
.projects__status--on-hold { background: var(--color-warning-bg); color: var(--color-warning); }
.projects__empty { color: var(--color-text-muted); font-size: 14px; }
.section-title { font-size: 28px; font-weight: 700; margin: 0; }
</style>
