<template>
  <div class="public-portfolio">

    <!-- Loading -->
    <div v-if="loading" class="portfolio-loading">
      <div class="loading-spinner"></div>
    </div>

    <!-- Not found -->
    <div v-else-if="notFound" class="portfolio-not-found">
      <span class="mdi mdi-account-off not-found-icon"></span>
      <h2>Portfolio no encontrado</h2>
      <p>Este portfolio no existe o no está disponible públicamente.</p>
      <a href="/register" class="powered-cta">Crear tu portfolio gratis con Orkpad →</a>
    </div>

    <!-- Portfolio content -->
    <div v-else-if="portfolio">

      <!-- === NEW: Sections-based layout === -->
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
        <footer class="portfolio-footer">
          <a href="/register" class="powered-link">Hecho con Orkpad · Crea tu portfolio gratis →</a>
        </footer>
      </div>

      <!-- === LEGACY: Classic layout (no sections defined) === -->
      <div v-else>

        <!-- Hero -->
        <div class="portfolio-hero">
          <div v-if="portfolio.profile.bannerUrl" class="hero-banner" :style="{ backgroundImage: `url(${portfolio.profile.bannerUrl})` }"></div>
          <div class="hero-content">
            <div class="hero-avatar-wrap">
              <img
                v-if="portfolio.profile.avatarUrl"
                :src="portfolio.profile.avatarUrl"
                :alt="portfolio.profile.name"
                class="hero-avatar"
              />
              <div v-else class="hero-avatar-placeholder">
                <span class="mdi mdi-account" style="font-size:48px;color:var(--color-text-muted)"></span>
              </div>
            </div>
            <div class="hero-info">
              <h1 class="hero-name">{{ portfolio.profile.name }}</h1>
              <p v-if="portfolio.profile.headline" class="hero-headline">{{ portfolio.profile.headline }}</p>
              <p v-if="portfolio.profile.bio" class="hero-bio">{{ portfolio.profile.bio }}</p>
              <div class="availability-wrap">
                <span class="availability-badge" :class="portfolio.profile.availableForWork ? 'availability-badge--open' : 'availability-badge--closed'">
                  <span class="availability-dot"></span>
                  {{ portfolio.profile.availableForWork ? 'Disponible para proyectos' : 'No disponible' }}
                </span>
                <span v-if="portfolio.profile.availableForWork && portfolio.profile.availabilityNote" class="availability-note">
                  {{ portfolio.profile.availabilityNote }}
                </span>
              </div>
              <div class="social-links">
                <a v-if="portfolio.profile.socialLinks.website" :href="portfolio.profile.socialLinks.website" target="_blank" rel="noopener" class="social-btn">
                  <span class="mdi mdi-web"></span>
                </a>
                <a v-if="portfolio.profile.socialLinks.linkedin" :href="portfolio.profile.socialLinks.linkedin" target="_blank" rel="noopener" class="social-btn">
                  <span class="mdi mdi-linkedin"></span>
                </a>
                <a v-if="portfolio.profile.socialLinks.twitter" :href="portfolio.profile.socialLinks.twitter" target="_blank" rel="noopener" class="social-btn">
                  <span class="mdi mdi-twitter"></span>
                </a>
                <a v-if="portfolio.profile.socialLinks.github" :href="portfolio.profile.socialLinks.github" target="_blank" rel="noopener" class="social-btn">
                  <span class="mdi mdi-github"></span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats bar -->
        <div v-if="hasStats" class="stats-bar">
          <div class="stats-inner">
            <div v-if="portfolio.stats.yearsExperience" class="stat-item">
              <span class="stat-number">{{ portfolio.stats.yearsExperience }}+</span>
              <span class="stat-label">Años</span>
            </div>
            <div v-if="portfolio.stats.completedProjects" class="stat-item">
              <span class="stat-number">{{ portfolio.stats.completedProjects }}+</span>
              <span class="stat-label">Proyectos</span>
            </div>
            <div v-if="portfolio.stats.happyClients" class="stat-item">
              <span class="stat-number">{{ portfolio.stats.happyClients }}+</span>
              <span class="stat-label">Clientes</span>
            </div>
          </div>
        </div>

        <div class="portfolio-body">
          <!-- Skills -->
          <section v-if="portfolio.profile.skills?.length" class="portfolio-section">
            <h2 class="section-title">Skills / Stack</h2>
            <div class="skills-grid">
              <span v-for="skill in portfolio.profile.skills" :key="skill" class="skill-badge">{{ skill }}</span>
            </div>
          </section>

          <!-- Servicios -->
          <section v-if="portfolio.services.length > 0" class="portfolio-section">
            <h2 class="section-title">Servicios</h2>
            <div class="services-grid">
              <div v-for="service in portfolio.services" :key="service._id" class="service-card">
                <h3 class="service-name">{{ service.name }}</h3>
                <p v-if="service.description" class="service-description">{{ service.description }}</p>
                <p v-if="service.price" class="service-price">{{ formatPrice(service.price, service.currency) }}</p>
              </div>
            </div>
          </section>

          <!-- Proyectos -->
          <section v-if="portfolio.featuredProjects.length > 0" class="portfolio-section">
            <h2 class="section-title">Proyectos</h2>
            <div class="projects-grid">
              <div v-for="project in portfolio.featuredProjects" :key="project.id" class="project-card">
                <img v-if="project.coverImageUrl" :src="project.coverImageUrl" :alt="project.name" class="project-cover" />
                <div class="project-body">
                  <div class="project-header">
                    <h3 class="project-name">{{ project.name }}</h3>
                    <span class="project-status" :class="`status-${project.status}`">{{ project.status }}</span>
                  </div>
                  <p v-if="project.description" class="project-description">{{ project.description }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Testimonios -->
          <section v-if="portfolio.testimonials.length > 0" class="portfolio-section">
            <h2 class="section-title">Lo que dicen mis clientes</h2>
            <div class="testimonials-grid">
              <div v-for="t in portfolio.testimonials" :key="t._id" class="testimonial-card">
                <div class="testimonial-header">
                  <img v-if="t.clientAvatarUrl" :src="t.clientAvatarUrl" :alt="t.clientName" class="testimonial-avatar" />
                  <div v-else class="testimonial-avatar-placeholder"><span class="mdi mdi-account"></span></div>
                  <div>
                    <p class="testimonial-name">{{ t.clientName }}</p>
                    <p v-if="t.clientRole" class="testimonial-role">{{ t.clientRole }}</p>
                  </div>
                </div>
                <p class="testimonial-content">&ldquo;{{ t.content }}&rdquo;</p>
                <div v-if="t.rating" class="testimonial-stars">
                  <span v-for="n in t.rating" :key="n">★</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Contacto -->
          <section class="portfolio-section contact-section">
            <h2 class="section-title">Contacto</h2>
            <div class="contact-card">
              <div v-if="contactSent" class="contact-success">
                <span class="mdi mdi-check-circle-outline" style="font-size:48px"></span>
                <h3>¡Mensaje enviado!</h3>
                <p>{{ portfolio.profile.name }} se pondrá en contacto con vos pronto.</p>
              </div>
              <form v-else @submit.prevent="submitContact" class="contact-form">
                <div class="form-row">
                  <div class="form-group"><label class="form-label">Nombre *</label><input v-model="contactForm.name" type="text" class="form-input" required placeholder="Tu nombre" /></div>
                  <div class="form-group"><label class="form-label">Email *</label><input v-model="contactForm.email" type="email" class="form-input" required placeholder="tu@email.com" /></div>
                </div>
                <div class="form-group"><label class="form-label">Asunto</label><input v-model="contactForm.subject" type="text" class="form-input" placeholder="¿En qué puedo ayudarte?" /></div>
                <div class="form-group"><label class="form-label">Mensaje *</label><textarea v-model="contactForm.message" class="form-textarea" required rows="5" placeholder="Contáme tu proyecto..."></textarea></div>
                <button type="submit" class="contact-submit-btn" :disabled="contactLoading">{{ contactLoading ? 'Enviando...' : 'Enviar mensaje' }}</button>
              </form>
            </div>
          </section>
        </div>

        <footer class="portfolio-footer">
          <a href="/register" target="_blank" rel="noopener" class="powered-link">Hecho con Orkpad · Crea tu portfolio gratis →</a>
        </footer>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue'
import { portfolioApi } from '@/api/portfolio/portfolio.api'
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
  name: 'PublicPortfolioPage',

  data() {
    return {
      loading: true,
      notFound: false,
      portfolio: null as PortfolioData | null,
      sectionComponents: SECTION_COMPONENTS,
      contactForm: { name: '', email: '', message: '', subject: '' },
      contactLoading: false,
      contactSent: false,
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
    appRegisterUrl(): string { return '/register' },
    hasStats(): boolean {
      if (!this.portfolio) return false
      const s = this.portfolio.stats
      return !!(s.yearsExperience || s.completedProjects || s.happyClients)
    },
  },

  async created() {
    const slug = this.$route.params.slug as string
    try {
      const { data } = await portfolioApi.getPortfolio(slug)
      this.portfolio = data
      this.setMetaTags(data)
    } catch {
      this.notFound = true
    } finally {
      this.loading = false
    }
  },

  beforeUnmount() {
    document.title = 'Orkpad'
  },

  methods: {
    async submitContact() {
      const slug = this.$route.params.slug as string
      this.contactLoading = true
      try {
        await portfolioApi.submitContact(slug, {
          name: this.contactForm.name,
          email: this.contactForm.email,
          message: this.contactForm.message,
          subject: this.contactForm.subject || undefined,
        })
        this.contactSent = true
      } catch {
        alert('Error al enviar el mensaje. Por favor intentá de nuevo.')
      } finally {
        this.contactLoading = false
      }
    },

    setMetaTags(portfolio: PortfolioData) {
      const seo = portfolio.seo
      const { name, headline, bio, avatarUrl } = portfolio.profile
      const title = seo?.title || `${name} | Portfolio`
      const description = seo?.description || headline || bio || `Portfolio de ${name}`
      const image = seo?.ogImageUrl || avatarUrl || ''
      document.title = title
      this.setMeta('og:title', title)
      this.setMeta('og:description', description)
      this.setMeta('og:type', 'profile')
      this.setMeta('og:url', window.location.href)
      if (image) this.setMeta('og:image', image)
      this.setMeta('twitter:card', 'summary')
      this.setMeta('twitter:title', title)
      this.setMeta('twitter:description', description)
      if (image) this.setMeta('twitter:image', image)
    },

    setMeta(property: string, content: string) {
      const attr = property.startsWith('og:') ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, property); document.head.appendChild(el) }
      el.setAttribute('content', content)
    },

    formatPrice(cents: number, currency = 'USD'): string {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency, minimumFractionDigits: 0 }).format(cents / 100)
    },
  },
})
</script>

<style scoped>
.public-portfolio { min-height: 100vh; background: var(--color-bg-base); font-family: var(--font-body); color: var(--color-text-base); }
.pf-scheme--light { background: #f8f9fa; color: #212529; }
.portfolio-loading { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
.loading-spinner { width: 40px; height: 40px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.portfolio-not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; padding: 32px; gap: 12px; }
.not-found-icon { font-size: 64px; color: var(--color-text-muted); }
.portfolio-not-found h2 { font-size: 20px; font-weight: 600; margin: 0; }
.portfolio-not-found p { color: var(--color-text-muted); margin: 0; }
.portfolio-hero { background: var(--color-bg-surface); border-bottom: 1px solid var(--color-border); }
.hero-banner { height: 200px; background-size: cover; background-position: center; background-color: var(--color-bg-surface-low); }
.hero-content { max-width: 860px; margin: 0 auto; padding: 0 24px 32px; display: flex; align-items: flex-start; gap: 24px; }
.hero-avatar-wrap { margin-top: -40px; flex-shrink: 0; }
.hero-avatar { width: 96px; height: 96px; border: 3px solid var(--color-bg-surface); object-fit: cover; }
.hero-avatar-placeholder { width: 96px; height: 96px; border: 3px solid var(--color-bg-surface); background: var(--color-bg-surface-low); display: flex; align-items: center; justify-content: center; }
.hero-info { padding-top: 16px; flex: 1; }
.hero-name { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
.hero-headline { font-size: 14px; color: var(--color-primary); font-weight: 500; margin: 0 0 8px; }
.hero-bio { font-size: 14px; color: var(--color-text-muted); line-height: 1.6; margin: 0 0 12px; max-width: 540px; }
.social-links { display: flex; gap: 8px; }
.social-btn { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1px solid var(--color-border); background: var(--color-bg-base); color: var(--color-text-muted); text-decoration: none; font-size: 18px; transition: border-color 0.15s, color 0.15s; }
.social-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.availability-wrap { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
.availability-badge { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.availability-badge--open { color: #34d399; }
.availability-badge--closed { color: var(--color-text-muted); }
.availability-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.availability-badge--open .availability-dot { background: #34d399; }
.availability-badge--closed .availability-dot { background: var(--color-text-muted); }
.availability-note { font-size: 12px; color: var(--color-text-muted); }
.stats-bar { background: var(--color-bg-surface); border-bottom: 1px solid var(--color-border); }
.stats-inner { max-width: 860px; margin: 0 auto; padding: 20px 24px; display: flex; gap: 48px; }
.stat-item { display: flex; flex-direction: column; gap: 2px; }
.stat-number { font-size: 28px; font-weight: 700; line-height: 1; }
.stat-label { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
.skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.skill-badge { display: inline-block; padding: 4px 12px; border: 1px solid var(--color-border); background: var(--color-bg-surface); color: var(--color-text-muted); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
.project-cover { width: 100%; height: 160px; object-fit: cover; border-bottom: 1px solid var(--color-border); display: block; }
.portfolio-body { max-width: 860px; margin: 0 auto; padding: 32px 24px; display: flex; flex-direction: column; gap: 40px; }
.section-title { font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 20px; padding-bottom: 8px; border-bottom: 1px solid var(--color-border); }
.services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: 16px; }
.service-card { background: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 20px; }
.service-name { font-size: 14px; font-weight: 600; margin: 0 0 6px; }
.service-description { font-size: 13px; color: var(--color-text-muted); margin: 0 0 10px; }
.service-price { font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--color-primary); margin: 0; }
.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 16px; }
.project-card { background: var(--color-bg-surface); border: 1px solid var(--color-border); overflow: hidden; }
.project-body { padding: 16px 20px; }
.project-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
.project-name { font-size: 14px; font-weight: 600; margin: 0; }
.project-status { font-family: var(--font-mono); font-size: 10px; font-weight: 600; padding: 2px 8px; text-transform: uppercase; letter-spacing: 0.05em; flex-shrink: 0; border: 1px solid; }
.status-completed { color: #34d399; border-color: rgba(52,211,153,0.3); }
.status-active { color: var(--color-primary); border-color: rgba(37,99,235,0.3); }
.status-on-hold { color: #f59e0b; border-color: rgba(245,158,11,0.3); }
.status-archived { color: var(--color-text-muted); border-color: var(--color-border); }
.project-description { font-size: 13px; color: var(--color-text-muted); margin: 0; line-height: 1.5; }
.testimonials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 16px; }
.testimonial-card { background: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.testimonial-header { display: flex; align-items: center; gap: 12px; }
.testimonial-avatar { width: 44px; height: 44px; object-fit: cover; }
.testimonial-avatar-placeholder { width: 44px; height: 44px; background: var(--color-bg-surface-low); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; }
.testimonial-name { font-weight: 600; font-size: 13px; margin: 0; }
.testimonial-role { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); margin: 0; }
.testimonial-content { font-size: 13px; color: var(--color-text-muted); line-height: 1.6; font-style: italic; margin: 0; }
.testimonial-stars { color: #f59e0b; font-size: 14px; letter-spacing: 2px; }
.contact-card { background: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 32px; max-width: 560px; }
.contact-form { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-family: var(--font-mono); font-size: 11px; font-weight: 500; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.form-input, .form-textarea { padding: 10px 12px; border: 1px solid var(--color-border); font-size: 14px; font-family: var(--font-body); color: var(--color-text-base); background: var(--color-bg-base); transition: border-color 0.15s; }
.form-input:focus, .form-textarea:focus { outline: none; border-color: var(--color-primary); }
.form-textarea { resize: vertical; }
.contact-submit-btn { padding: 10px 24px; background: var(--color-primary); color: white; border: none; font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: opacity 0.15s; align-self: flex-start; }
.contact-submit-btn:hover:not(:disabled) { opacity: 0.85; }
.contact-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.contact-success { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; padding: 24px 0; color: var(--color-primary); }
.contact-success h3 { font-size: 16px; font-weight: 600; color: var(--color-text-base); margin: 0; }
.contact-success p { color: var(--color-text-muted); margin: 0; }
.portfolio-footer { text-align: center; padding: 24px; border-top: 1px solid var(--color-border); background: var(--color-bg-surface); }
.powered-link, .powered-cta { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); text-decoration: none; text-transform: uppercase; letter-spacing: 0.05em; transition: color 0.15s; }
.powered-link:hover, .powered-cta:hover { color: var(--color-primary); }
@media (max-width: 640px) { .hero-content { flex-direction: column; } .form-row { grid-template-columns: 1fr; } .contact-card { padding: 20px; } }
</style>
