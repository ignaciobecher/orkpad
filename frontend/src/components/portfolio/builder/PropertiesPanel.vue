<script setup lang="ts">
import { defineAsyncComponent, ref, onErrorCaptured } from 'vue'
import type { PortfolioSection } from '@/api/portfolio/portfolio-builder.types'

defineProps<{ section: PortfolioSection }>()
const emit = defineEmits<{
  'update-content': [content: Record<string, any>]
  'update-settings': [settings: Record<string, any>]
}>()

const error = ref<string | null>(null)

onErrorCaptured((err: any) => {
  error.value = err?.message || String(err) || 'Error al cargar el editor'
  return false
})

function handleRetry() {
  error.value = null
}

const EDITORS: Record<string, any> = {
  hero:         defineAsyncComponent(() => import('./editors/HeroEditor.vue')),
  about:        defineAsyncComponent(() => import('./editors/AboutEditor.vue')),
  skills:       defineAsyncComponent(() => import('./editors/SkillsEditor.vue')),
  projects:     defineAsyncComponent(() => import('./editors/ProjectsEditor.vue')),
  services:     defineAsyncComponent(() => import('./editors/ServicesEditor.vue')),
  testimonials: defineAsyncComponent(() => import('./editors/TestimonialsEditor.vue')),
  experience:   defineAsyncComponent(() => import('./editors/ExperienceEditor.vue')),
  education:    defineAsyncComponent(() => import('./editors/EducationEditor.vue')),
  links:        defineAsyncComponent(() => import('./editors/LinksEditor.vue')),
  contact:      defineAsyncComponent(() => import('./editors/ContactEditor.vue')),
  stats:        defineAsyncComponent(() => import('./editors/StatsEditor.vue')),
  gallery:      defineAsyncComponent(() => import('./editors/GalleryEditor.vue')),
  custom:       defineAsyncComponent(() => import('./editors/CustomEditor.vue')),
}
</script>

<template>
  <div class="props-panel">
    <div v-if="error" class="props-panel__error">
      <span class="mdi mdi-alert-circle-outline"></span>
      <p>{{ error }}</p>
      <button class="pb__btn pb__btn--ghost" @click="handleRetry" style="margin-top:4px">
        Reintentar
      </button>
    </div>
    <Suspense v-else>
      <component
        :is="EDITORS[section.type]"
        :content="section.content"
        :settings="section.settings"
        @update-content="emit('update-content', $event)"
        @update-settings="emit('update-settings', $event)"
      />
      <template #fallback>
        <div class="props-panel__loading">
          <span class="mdi mdi-loading mdi-spin"></span>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<style scoped>
.props-panel {
  flex: 1;
  overflow-y: auto;
}
.props-panel__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: var(--color-text-muted);
}
.props-panel__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: var(--color-error);
  text-align: center;
  gap: 4px;
  font-size: 13px;
}
.pb__btn--ghost {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.pb__btn--ghost:hover {
  color: var(--color-text-base);
  background: var(--color-bg-surface-high);
}
</style>
