<script setup lang="ts">
const props = defineProps<{
  content: Record<string, any>
  settings: Record<string, any>
  portfolioData: Record<string, any>
}>()

const skills = props.content.useWorkspaceSkills !== false
  ? (props.portfolioData.profile?.skills ?? [])
  : (props.content.customSkills ?? [])
</script>

<template>
  <section class="skills">
    <div class="skills__inner">
      <h2 v-if="content.title" class="section-title">{{ content.title }}</h2>
      <div class="skills__chips" v-if="(settings.layout ?? 'chips') === 'chips'">
        <span v-for="skill in skills" :key="skill" class="skills__chip">{{ skill }}</span>
      </div>
      <ul v-else class="skills__list">
        <li v-for="skill in skills" :key="skill" class="skills__list-item">
          <span class="mdi mdi-check" style="color:var(--pf-primary,var(--color-primary))"></span>
          {{ skill }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.skills { padding: 80px 24px; }
.skills__inner { max-width: 960px; margin: 0 auto; }
.skills__chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
.skills__chip { padding: 7px 16px; border: 1px solid var(--color-border); font-size: 13px; font-weight: 500; color: var(--color-text-base); transition: border-color 0.15s, color 0.15s; }
.skills__chip:hover { border-color: var(--pf-primary, var(--color-primary)); color: var(--pf-primary, var(--color-primary)); }
.skills__list { list-style: none; padding: 0; margin: 24px 0 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.skills__list-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.section-title { font-size: 28px; font-weight: 700; margin: 0; }
</style>
