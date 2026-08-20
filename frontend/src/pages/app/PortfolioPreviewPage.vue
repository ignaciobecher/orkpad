<template>
  <div class="preview-wrapper">
    <!-- Preview banner -->
    <div class="preview-banner">
      <span class="mdi mdi-eye-outline preview-banner__icon"></span>
      <span class="preview-banner__text">Modo previsualización — Este portfolio aún no es público para visitantes</span>
      <button class="preview-banner__close" @click="$router.push({ name: 'portfolio-builder' })">
        <span class="mdi mdi-arrow-left"></span>
        Volver al builder
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="pf-loading">
      <div class="pf-spinner"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="pf-error">
      <span class="mdi mdi-alert-circle-outline pf-error__icon"></span>
      <h2>No se pudo cargar la previsualización</h2>
      <p>{{ error }}</p>
      <button class="pf-error__btn" @click="$router.push({ name: 'portfolio-builder' })">Volver al builder</button>
    </div>

    <!-- Portfolio content (same rendering as PublicPortfolioPage) -->
    <div v-else-if="portfolio" class="pf-content">

      <!-- Sections-based layout -->
      <div v-if="hasSections" :style="themeStyle" :class="`pf-scheme--${portfolio.theme?.colorScheme || 'dark'}`">
        <Suspense>
          <template v-for="section in visibleSections" :key="section.id">
            <component
              :is="sectionComponents[section.type]"
              v-if="sectionComponents[section.type]"
              :content="section.content"
              :settings="section.settings"
              :portfolio-data="portfolio"
            />
          </template>
          <template #fallback>
            <div style="height:80px"></div>
          </template>
        </Suspense>
        <footer class="pf-footer">
          <span class="pf-footer__text">Hecho con Orkpad</span>
        </footer>
      </div>

      <!-- Legacy: no sections defined yet -->
      <div v-else class="pf-legacy">
        <div class="pf-legacy__hero">
          <div v-if="portfolio.profile.bannerUrl" class="pf-legacy__banner" :style="{ backgroundImage: `url(${portfolio.profile.bannerUrl})` }"></div>
          <div class="pf-legacy__hero-content">
            <div class="pf-legacy__avatar-wrap">
              <img v-if="portfolio.profile.avatarUrl" :src="portfolio.profile.avatarUrl" :alt="portfolio.profile.name" class="pf-legacy__avatar" />
              <div v-else class="pf-legacy__avatar-placeholder"><span class="mdi mdi-account" style="font-size:48px"></span></div>
            </div>
            <div class="pf-legacy__info">
              <h1 class="pf-legacy__name">{{ portfolio.profile.name }}</h1>
              <p v-if="portfolio.profile.headline" class="pf-legacy__headline">{{ portfolio.profile.headline }}</p>
              <p v-if="portfolio.profile.bio" class="pf-legacy__bio">{{ portfolio.profile.bio }}</p>
            </div>
          </div>
        </div>
        <div class="pf-legacy__body">
          <p class="pf-legacy__hint">
            <span class="mdi mdi-information-outline"></span>
            Agrega secciones en el builder para personalizar el diseño de tu portfolio.
          </p>
        </div>
        <footer class="pf-footer"><span class="pf-footer__text">Hecho con Orkpad</span></footer>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue'
import { portfolioBuilderApi } from '@/api/portfolio/portfolio-builder.api'
import type { PortfolioData } from '@/api/portfolio/portfolio.types'

const SECTION_COMPONENTS: Record<string, any> = {
  hero:         defineAsyncComponent(() => import('@/components/portfolio/sections/HeroSection.vue')),
  about:        defineAsyncComponent(() => import('@/components/portfolio/sections/AboutSection.vue')),
  skills:       defineAsyncComponent(() => import('@/components/portfolio/sections/SkillsSection.vue')),
  projects:     defineAsyncComponent(() => import('@/components/portfolio/sections/ProjectsSection.vue')),
  services:     defineAsyncComponent(() => import('@/components/portfolio/sections/ServicesSection.vue')),
  testimonials: defineAsyncComponent(() => import('@/components/portfolio/sections/TestimonialsSection.vue')),
  experience:   defineAsyncComponent(() => import('@/components/portfolio/sections/ExperienceSection.vue')),
  education:    defineAsyncComponent(() => import('@/components/portfolio/sections/EducationSection.vue')),
  links:        defineAsyncComponent(() => import('@/components/portfolio/sections/LinksSection.vue')),
  contact:      defineAsyncComponent(() => import('@/components/portfolio/sections/ContactSection.vue')),
  stats:        defineAsyncComponent(() => import('@/components/portfolio/sections/StatsSection.vue')),
  gallery:      defineAsyncComponent(() => import('@/components/portfolio/sections/GallerySection.vue')),
  custom:       defineAsyncComponent(() => import('@/components/portfolio/sections/CustomSection.vue')),
}

export default defineComponent({
  name: 'PortfolioPreviewPage',

  data() {
    return {
      loading: true,
      error: null as string | null,
      portfolio: null as PortfolioData | null,
      sectionComponents: SECTION_COMPONENTS,
    }
  },

  computed: {
    hasSections(): boolean {
      return !!(this.portfolio?.sections && this.portfolio.sections.length > 0)
    },
    visibleSections() {
      if (!this.portfolio?.sections) return []
      return [...this.portfolio.sections]
        .filter(s => s.visible !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    },
    themeStyle(): Record<string, string> {
      const theme = this.portfolio?.theme
      if (!theme) return {}
      const fontMap: Record<string, string> = {
        'jetbrains-mono': "'JetBrains Mono', monospace",
        'system': 'system-ui, sans-serif',
        'inter': "'Inter', sans-serif",
      }
      return {
        '--pf-primary': theme.primaryColor || 'var(--color-primary)',
        'fontFamily': fontMap[theme.fontFamily] ?? fontMap['inter'],
      }
    },
  },

  async created() {
    try {
      const { data } = await portfolioBuilderApi.getPreview()
      this.portfolio = data
      document.title = `[Preview] ${data.profile.name} | Portfolio`
    } catch (err: any) {
      this.error = err.response?.data?.message || err.message || 'Error al cargar la previsualización'
    } finally {
      this.loading = false
    }
  },

  beforeUnmount() {
    document.title = 'Orkpad'
  },
})
</script>

<style scoped>
.preview-wrapper { min-height: 100vh; background: var(--color-bg-base); }
.preview-banner {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: #1e3a5f;
  color: #93c5fd;
  font-family: var(--font-mono);
  font-size: 12px;
  border-bottom: 1px solid #2563eb;
}
.preview-banner__icon { font-size: 16px; flex-shrink: 0; }
.preview-banner__text { flex: 1; }
.preview-banner__close {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(37,99,235,0.3);
  border: 1px solid rgba(37,99,235,0.5);
  color: #93c5fd;
  padding: 4px 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  flex-shrink: 0;
}
.preview-banner__close:hover { background: rgba(37,99,235,0.5); }
.pf-loading { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
.pf-spinner { width: 40px; height: 40px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.pf-error { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; padding: 32px; gap: 12px; }
.pf-error__icon { font-size: 64px; color: var(--color-error); }
.pf-error h2 { font-size: 20px; font-weight: 600; margin: 0; }
.pf-error p { color: var(--color-text-muted); margin: 0; }
.pf-error__btn { padding: 10px 24px; background: var(--color-primary); color: white; border: none; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; margin-top: 8px; }
.pf-content { font-family: var(--font-body); color: var(--color-text-base); }
.pf-scheme--light { background: #f8f9fa; color: #212529; }
.pf-footer { text-align: center; padding: 24px; border-top: 1px solid var(--color-border); background: var(--color-bg-surface); }
.pf-footer__text { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.pf-legacy__hero { background: var(--color-bg-surface); border-bottom: 1px solid var(--color-border); }
.pf-legacy__banner { height: 200px; background-size: cover; background-position: center; background-color: var(--color-bg-surface-low); }
.pf-legacy__hero-content { max-width: 860px; margin: 0 auto; padding: 0 24px 32px; display: flex; align-items: flex-start; gap: 24px; }
.pf-legacy__avatar-wrap { margin-top: -40px; flex-shrink: 0; }
.pf-legacy__avatar { width: 96px; height: 96px; border: 3px solid var(--color-bg-surface); object-fit: cover; }
.pf-legacy__avatar-placeholder { width: 96px; height: 96px; border: 3px solid var(--color-bg-surface); background: var(--color-bg-surface-low); display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); }
.pf-legacy__info { padding-top: 16px; flex: 1; }
.pf-legacy__name { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
.pf-legacy__headline { font-size: 14px; color: var(--color-primary); font-weight: 500; margin: 0 0 8px; }
.pf-legacy__bio { font-size: 14px; color: var(--color-text-muted); line-height: 1.6; margin: 0; }
.pf-legacy__body { max-width: 860px; margin: 0 auto; padding: 32px 24px; }
.pf-legacy__hint { display: flex; align-items: center; gap: 8px; color: var(--color-text-muted); font-size: 14px; background: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 16px 20px; }
</style>
