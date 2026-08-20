<template>
  <div class="landing-container">
    <div class="grid-background"></div>
    <div class="glow-effect"></div>

    <!-- Navigation -->
    <nav class="landing-nav">
      <div class="nav-content">
        <div class="brand">
          <w-logo :height="52" />
        </div>
        <div class="nav-links-desktop font-mono">
          <a href="#features">{{ $t('nav.modules') }}</a>
          <a href="#workflow">{{ $t('nav.workflow') }}</a>
          <a href="#open-source">{{ $t('nav.github') }}</a>
          <a href="#get-started">{{ $t('nav.docs') }}</a>
          <a href="#community">{{ $t('nav.community') }}</a>
        </div>
        <div class="nav-actions">
          <div class="flex items-center gap-2">
            <button @click="toggleLocale" class="lang-switch" :title="$i18n.locale === 'es' ? 'English' : 'Español'">
              {{ $i18n.locale === 'es' ? '🇺🇸' : '🇪🇸' }}
            </button>
            <button @click="uiStore.toggleTheme()" class="theme-switch" :title="uiStore.theme === 'dark' ? 'Light Mode' : 'Dark Mode'">
              <span class="material-symbols-outlined">{{ uiStore.theme === 'dark' ? 'light_mode' : 'dark_mode' }}</span>
            </button>
          </div>
          <div class="desktop-only flex items-center gap-6">
            <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer" class="nav-link">
              <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: middle; margin-right: 4px;">star</span>
              GitHub
            </a>
          </div>
          <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer" class="mobile-cta">
            <span class="material-symbols-outlined" style="font-size: 14px;">star</span>
          </a>
          <button class="mobile-menu-btn" @click="isMenuOpen = !isMenuOpen">
            <span class="material-symbols-outlined">{{ isMenuOpen ? 'close' : 'menu' }}</span>
          </button>
        </div>
      </div>
      <transition name="slide-down">
        <div v-if="isMenuOpen" class="mobile-menu font-mono">
          <a href="#features" @click="isMenuOpen = false">{{ $t('nav.modules') }}</a>
          <a href="#workflow" @click="isMenuOpen = false">{{ $t('nav.workflow') }}</a>
          <a href="#open-source" @click="isMenuOpen = false">{{ $t('nav.github') }}</a>
          <a href="#get-started" @click="isMenuOpen = false">{{ $t('nav.docs') }}</a>
          <a href="#community" @click="isMenuOpen = false">{{ $t('nav.community') }}</a>
          <div class="mobile-menu-actions">
            <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer" class="nav-link" @click="isMenuOpen = false">
              <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: middle; margin-right: 4px;">star</span>
              GitHub
            </a>
          </div>
        </div>
      </transition>
    </nav>

    <main class="landing-main">
      <!-- Hero -->
      <section class="hero-section revealed">
        <div class="hero-content">
          <div class="chaos-inventory">
            <div v-for="(file, i) in $tm('hero.chaosFiles')" :key="i" class="chaos-file font-mono" :style="{ animationDelay: i * 0.1 + 's' }">
              <span class="material-symbols-outlined">description</span>
              {{ file }}
            </div>
          </div>
          <h1 class="hero-title">
            {{ $t('hero.title') }} <span class="text-gradient">{{ $t('hero.titleAccent') }}</span>
          </h1>
          <p class="hero-subtitle">{{ $t('hero.subtitle') }}</p>
          <div class="hero-cta">
            <div class="cta-group">
              <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer" class="w-button w-button--primary w-button--lg">
                <span class="material-symbols-outlined">star</span>
                {{ $t('hero.ctaGitHub') }}
              </a>
              <a href="#get-started" class="w-button w-button--outline w-button--lg">
                {{ $t('hero.ctaDocs') }}
              </a>
            </div>
            <div class="trust-bar font-mono">
              <span><span class="material-symbols-outlined">check_circle</span>{{ $t('hero.trust.openSource') }}</span>
              <span><span class="material-symbols-outlined">check_circle</span>{{ $t('hero.trust.selfHosted') }}</span>
              <span><span class="material-symbols-outlined">check_circle</span>{{ $t('hero.trust.noVendor') }}</span>
            </div>
            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-value">{{ $t('hero.stats.license.value') }}</span>
                <span class="stat-label">{{ $t('hero.stats.license.label') }}</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ $t('hero.stats.community.value') }}</span>
                <span class="stat-label">{{ $t('hero.stats.community.label') }}</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ $t('hero.stats.setup.value') }}</span>
                <span class="stat-label">{{ $t('hero.stats.setup.label') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-preview">
          <div class="dashboard-mockup">
            <div class="mockup-header font-mono">
              <div class="mockup-dots"><span></span><span></span><span></span></div>
              <span class="mockup-title">orkpad — dashboard</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Workflow -->
      <section id="workflow" class="workflow-section reveal">
        <div class="section-header centered">
          <div class="badge-mono">{{ $t('workflow.badge') }}</div>
          <h2 class="section-title">{{ $t('workflow.title') }}</h2>
          <p class="section-desc">{{ $t('workflow.description') }}</p>
        </div>
        <div class="workflow-grid">
          <div class="workflow-step reveal" v-for="(step, index) in workflowSteps" :key="index" :style="{ transitionDelay: index * 0.1 + 's' }">
            <div class="step-number font-mono">0{{ index + 1 }}</div>
            <div class="step-content">
              <span class="material-symbols-outlined step-icon">{{ step.icon }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.desc }}</p>
            </div>
            <div v-if="index < workflowSteps.length - 1" class="step-arrow">
              <span class="material-symbols-outlined">east</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Mid-page CTA -->
      <section class="mid-cta reveal">
        <div class="mid-cta-inner">
          <span class="badge-mono">{{ $t('midCta.badge') }}</span>
          <p>{{ $t('midCta.text') }}</p>
          <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer" class="w-button w-button--primary">
            {{ $t('midCta.button') }}
            <span class="material-symbols-outlined ml-2">arrow_forward</span>
          </a>
        </div>
      </section>

      <!-- Modules Bento Grid -->
      <section id="features" class="features-grid reveal">
        <div class="section-header">
          <div class="badge-mono">{{ $t('modules.badge') }}</div>
          <h2 class="section-title">{{ $t('modules.title') }}</h2>
          <p class="section-desc">{{ $t('modules.description') }}</p>
        </div>
        <div class="bento-container">
          <div class="bento-card bento-span-2 bento-row-2 reveal" style="transition-delay: 0.1s">
            <div class="bento-header">
              <span class="material-symbols-outlined bento-icon">dashboard</span>
              <div class="bento-title-group">
                <h3>{{ $t('modules.hub.title') }}</h3>
                <span class="badge-tiny">{{ $t('modules.hub.badge') }}</span>
              </div>
            </div>
            <p>{{ $t('modules.hub.desc') }}</p>
            <div class="feature-tags">
              <span>Kanban</span><span>CRM</span><span>Time Tracking</span><span>Agenda</span>
            </div>
            <div class="mock-ui-element tasks-preview">
              <div class="mock-task" v-for="i in 3" :key="i">
                <div class="task-check"></div>
                <div class="task-line"></div>
                <div class="task-tag"></div>
              </div>
            </div>
          </div>

          <div class="bento-card bento-span-2 reveal" style="transition-delay: 0.2s">
            <div class="bento-header">
              <span class="material-symbols-outlined bento-icon">payments</span>
              <h3>{{ $t('modules.finance.title') }}</h3>
            </div>
            <p>{{ $t('modules.finance.desc') }}</p>
            <div class="finance-metrics">
              <div class="metric">
                <div class="m-label">{{ $t('modules.finance.revenue') }}</div>
                <div class="m-value t-green">$12.4k</div>
              </div>
              <div class="metric">
                <div class="m-label">{{ $t('modules.finance.expenses') }}</div>
                <div class="m-value t-red">$3.1k</div>
              </div>
            </div>
          </div>

          <div class="bento-card reveal" style="transition-delay: 0.3s">
            <div class="bento-header">
              <span class="material-symbols-outlined bento-icon">account_tree</span>
              <h3>{{ $t('modules.sales.title') }}</h3>
            </div>
            <p>{{ $t('modules.sales.desc') }}</p>
          </div>

          <div class="bento-card reveal" style="transition-delay: 0.4s">
            <div class="bento-header">
              <span class="material-symbols-outlined bento-icon">description</span>
              <h3>{{ $t('modules.wiki.title') }}</h3>
            </div>
            <p>{{ $t('modules.wiki.desc') }}</p>
          </div>
        </div>
      </section>

      <!-- Open Source -->
      <section id="open-source" class="open-source-section reveal">
        <div class="section-header centered">
          <div class="badge-mono">{{ $t('openSource.badge') }}</div>
          <h2 class="section-title">{{ $t('openSource.title') }}</h2>
          <p class="section-desc">{{ $t('openSource.description') }}</p>
        </div>
        <div class="open-source-grid">
          <div class="open-source-card reveal" v-for="(item, index) in openSourceItems" :key="item.title" :style="{ transitionDelay: index * 0.1 + 's' }">
            <span class="material-symbols-outlined open-source-icon">{{ item.icon }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </section>

      <!-- Get Started -->
      <section id="get-started" class="get-started-section reveal">
        <div class="section-header centered">
          <div class="badge-mono">{{ $t('getStarted.badge') }}</div>
          <h2 class="section-title">{{ $t('getStarted.title') }}</h2>
          <p class="section-desc">{{ $t('getStarted.description') }}</p>
        </div>
        <div class="get-started-grid">
          <div class="get-started-step reveal" v-for="(step, index) in getStartedSteps" :key="step.title" :style="{ transitionDelay: index * 0.1 + 's' }">
            <div class="step-number font-mono">0{{ index + 1 }}</div>
            <h3>{{ step.title }}</h3>
            <p class="font-mono code-block">{{ step.desc }}</p>
          </div>
        </div>
        <div class="get-started-actions">
          <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer" class="w-button w-button--primary w-button--lg">
            {{ $t('getStarted.button') }}
            <span class="material-symbols-outlined ml-2">arrow_forward</span>
          </a>
        </div>
      </section>

      <!-- Community -->
      <section id="community" class="community-section reveal">
        <div class="section-header centered">
          <div class="badge-mono">{{ $t('community.badge') }}</div>
          <h2 class="section-title">{{ $t('community.title') }}</h2>
          <p class="section-desc">{{ $t('community.description') }}</p>
        </div>
        <div class="community-grid">
          <a :href="GITHUB_ISSUES_URL" target="_blank" rel="noopener noreferrer" class="community-card reveal">
            <span class="material-symbols-outlined community-icon">bug_report</span>
            <h3>{{ $t('community.links.issues') }}</h3>
          </a>
          <a :href="GITHUB_DISCUSSIONS_URL" target="_blank" rel="noopener noreferrer" class="community-card reveal">
            <span class="material-symbols-outlined community-icon">forum</span>
            <h3>{{ $t('community.links.discussions') }}</h3>
          </a>
          <a :href="GITHUB_PROJECTS_URL" target="_blank" rel="noopener noreferrer" class="community-card reveal">
            <span class="material-symbols-outlined community-icon">map</span>
            <h3>{{ $t('community.links.roadmap') }}</h3>
          </a>
        </div>
      </section>

      <!-- Privacy / Security -->
      <section id="infrastructure" class="infra-deep-dive reveal">
        <div class="infra-container">
          <div class="infra-text">
            <div class="badge-mono">{{ $t('security.badge') }}</div>
            <h2 class="text-h1">
              {{ $t('security.title') }}
              <span class="text-gradient">{{ $t('security.titleAccent') }}</span>
            </h2>
            <p>{{ $t('security.description') }}</p>
            <ul class="infra-list">
              <li>
                <span class="material-symbols-outlined">check_circle</span>
                <div><strong>{{ $t('security.list.isolation.title') }}</strong> {{ $t('security.list.isolation.desc') }}</div>
              </li>
              <li>
                <span class="material-symbols-outlined">check_circle</span>
                <div><strong>{{ $t('security.list.export.title') }}</strong> {{ $t('security.list.export.desc') }}</div>
              </li>
              <li>
                <span class="material-symbols-outlined">check_circle</span>
                <div><strong>{{ $t('security.list.backups.title') }}</strong> {{ $t('security.list.backups.desc') }}</div>
              </li>
            </ul>
          </div>
          <div class="infra-visual">
            <div class="privacy-card">
              <div class="privacy-icon-row">
                <span class="material-symbols-outlined privacy-icon">lock</span>
              </div>
              <div class="privacy-stat">
                <span class="privacy-stat-value">100%</span>
                <span class="privacy-stat-label font-mono">{{ $t('security.visual.isolation') }}</span>
              </div>
              <div class="privacy-divider"></div>
              <div class="privacy-list">
                <div class="privacy-item" v-for="item in securityItems" :key="item">
                  <span class="material-symbols-outlined">shield</span>
                  <span class="font-mono">{{ item }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Advanced Features -->
      <section class="advanced-features">
        <div class="section-header centered">
          <h2 class="section-title">{{ $t('advanced.title') }}</h2>
          <p class="section-desc">{{ $t('advanced.description') }}</p>
        </div>
        <div class="advanced-grid">
          <div class="adv-item reveal" v-for="(feat, index) in advancedFeatures" :key="feat.title" :style="{ transitionDelay: index * 0.05 + 's' }">
            <span class="material-symbols-outlined adv-icon">{{ feat.icon }}</span>
            <h4>{{ feat.title }}</h4>
            <p>{{ feat.desc }}</p>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="faq-section">
        <div class="section-header centered">
          <h2 class="section-title">{{ $t('faq.title') }}</h2>
        </div>
        <div class="faq-list">
          <div class="faq-item" v-for="(faq, i) in faqs" :key="i" :class="{ 'faq-item--open': openFaq === i }" @click="openFaq = openFaq === i ? null : i">
            <div class="faq-question">
              <span>{{ faq.q }}</span>
              <span class="material-symbols-outlined faq-icon">{{ openFaq === i ? 'remove' : 'add' }}</span>
            </div>
            <div v-if="openFaq === i" class="faq-answer">{{ faq.a }}</div>
          </div>
        </div>
      </section>

      <!-- Final CTA -->
      <section class="final-cta reveal">
        <div class="cta-inner">
          <div class="badge-mono" style="text-align:center; display:block; margin-bottom: 24px;">{{ $t('finalCta.badge') }}</div>
          <h2 class="hero-title">{{ $t('finalCta.title') }}</h2>
          <p>{{ $t('finalCta.subtitle') }}</p>
          <div class="final-cta-actions">
            <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer" class="w-button w-button--primary w-button--lg">
              <span class="material-symbols-outlined">star</span>
              {{ $t('finalCta.button') }}
            </a>
            <p class="cta-footnote font-mono">{{ $t('finalCta.footnote') }}</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="landing-footer">
      <div class="footer-grid">
        <div class="footer-brand-col">
          <div class="brand">
            <w-logo :height="52" />
          </div>
          <p class="footer-tagline">{{ $t('footer.tagline') }}</p>
        </div>
        <div class="footer-nav-col">
          <div class="footer-label font-mono">{{ $t('footer.product') }}</div>
          <a href="#features">{{ $t('footer.links.features') }}</a>
          <a href="#get-started">{{ $t('footer.links.docs') }}</a>
        </div>
        <div class="footer-nav-col">
          <div class="footer-label font-mono">{{ $t('footer.community') }}</div>
          <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer">{{ $t('footer.links.github') }}</a>
          <a :href="GITHUB_ISSUES_URL" target="_blank" rel="noopener noreferrer">{{ $t('footer.links.issues') }}</a>
          <a :href="GITHUB_DISCUSSIONS_URL" target="_blank" rel="noopener noreferrer">{{ $t('footer.links.discussions') }}</a>
        </div>
        <div class="footer-nav-col">
          <div class="footer-label font-mono">{{ $t('footer.legal') }}</div>
          <a href="/privacy">{{ $t('footer.links.privacy') }}</a>
          <a :href="GITHUB_LICENSE_URL" target="_blank" rel="noopener noreferrer">{{ $t('footer.links.license') }}</a>
        </div>
      </div>
      <div class="footer-bottom font-mono">
        <span>{{ $t('footer.copyright') }}</span>
        <span>Apache-2.0</span>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import WLogo from '@/components/ui/WLogo.vue'
import { useUIStore } from '@/stores/ui.store'
import {
  GITHUB_REPO_URL,
  GITHUB_ISSUES_URL,
  GITHUB_DISCUSSIONS_URL,
  GITHUB_PROJECTS_URL,
  GITHUB_LICENSE_URL,
} from '@/constants/links'

export default defineComponent({
  name: 'LandingPage',
  components: { WLogo },
  setup() {
    const uiStore = useUIStore()
    return {
      uiStore,
      GITHUB_REPO_URL,
      GITHUB_ISSUES_URL,
      GITHUB_DISCUSSIONS_URL,
      GITHUB_PROJECTS_URL,
      GITHUB_LICENSE_URL,
    }
  },
  data() {
    return {
      isMenuOpen: false,
      openFaq: null as number | null,
    }
  },
  computed: {
    securityItems() {
      return this.$tm('security.visual.items') as string[]
    },
    workflowSteps() {
      return [
        { icon: 'ads_click', title: this.$t('workflow.steps.capture.title'), desc: this.$t('workflow.steps.capture.desc') },
        { icon: 'assignment_turned_in', title: this.$t('workflow.steps.contract.title'), desc: this.$t('workflow.steps.contract.desc') },
        { icon: 'timer', title: this.$t('workflow.steps.execute.title'), desc: this.$t('workflow.steps.execute.desc') },
        { icon: 'receipt_long', title: this.$t('workflow.steps.liquidate.title'), desc: this.$t('workflow.steps.liquidate.desc') },
      ]
    },
    openSourceItems() {
      return [
        { icon: 'visibility', title: this.$t('openSource.items.transparent.title'), desc: this.$t('openSource.items.transparent.desc') },
        { icon: 'dns', title: this.$t('openSource.items.selfHosted.title'), desc: this.$t('openSource.items.selfHosted.desc') },
        { icon: 'groups', title: this.$t('openSource.items.community.title'), desc: this.$t('openSource.items.community.desc') },
        { icon: 'extension', title: this.$t('openSource.items.extensible.title'), desc: this.$t('openSource.items.extensible.desc') },
      ]
    },
    getStartedSteps() {
      return [
        { title: this.$t('getStarted.steps.clone.title'), desc: this.$t('getStarted.steps.clone.desc') },
        { title: this.$t('getStarted.steps.docs.title'), desc: this.$t('getStarted.steps.docs.desc') },
        { title: this.$t('getStarted.steps.contribute.title'), desc: this.$t('getStarted.steps.contribute.desc') },
      ]
    },
    advancedFeatures() {
      return [
        { icon: 'notifications_active', title: this.$t('advanced.features.alerts.title'), desc: this.$t('advanced.features.alerts.desc') },
        { icon: 'support_agent', title: this.$t('advanced.features.catalog.title'), desc: this.$t('advanced.features.catalog.desc') },
        { icon: 'calendar_month', title: this.$t('advanced.features.agenda.title'), desc: this.$t('advanced.features.agenda.desc') },
        { icon: 'api', title: this.$t('advanced.features.api.title'), desc: this.$t('advanced.features.api.desc') },
        { icon: 'currency_exchange', title: this.$t('advanced.features.cli.title'), desc: this.$t('advanced.features.cli.desc') },
        { icon: 'history_edu', title: this.$t('advanced.features.subscriptions.title'), desc: this.$t('advanced.features.subscriptions.desc') },
      ]
    },
    faqs() {
      return this.$tm('faq.questions') as Array<{ q: string; a: string }>
    },
  },
  methods: {
    toggleLocale() {
      this.$i18n.locale = this.$i18n.locale === 'es' ? 'en' : 'es'
      document.documentElement.lang = this.$i18n.locale
    },
    initScrollAnimations() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed')
        })
      }, { threshold: 0.1 })
      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    },
    injectFaqStructuredData() {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = 'faq-structured-data'
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: this.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      })
      document.head.appendChild(script)
    },
  },
  mounted() {
    this.initScrollAnimations()
    this.injectFaqStructuredData()
  },
  beforeUnmount() {
    document.getElementById('faq-structured-data')?.remove()
  },
})
</script>

<style scoped>
.landing-container {
  min-height: 100vh;
  background-color: var(--color-bg-base);
  color: var(--color-text-base);
  overflow-x: hidden;
  position: relative;
}

.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.revealed { opacity: 1; transform: translateY(0); }

/* Background */
.grid-background {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background-image:
    linear-gradient(to right, rgba(91, 78, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(91, 78, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none; z-index: 0;
}
.glow-effect {
  position: absolute; top: -10%; right: -10%;
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(91, 78, 255, 0.08) 0%, transparent 70%);
  z-index: 0;
}

/* Nav */
.landing-nav {
  position: sticky; top: 0; z-index: 100;
  background-color: var(--color-bg-surface);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}
.nav-content {
  max-width: 1300px; margin: 0 auto; padding: 16px 24px;
  display: flex; justify-content: space-between; align-items: center;
}
.nav-links-desktop { display: flex; gap: 32px; }
@media (max-width: 1024px) { .nav-links-desktop { display: none; } }
.nav-links-desktop a {
  font-size: 11px; color: var(--color-text-muted); text-decoration: none;
  letter-spacing: 0.1em; transition: color 0.2s ease;
}
.nav-links-desktop a:hover { color: var(--color-primary); }
.brand { display: flex; align-items: center; gap: 8px; }
.nav-actions { display: flex; align-items: center; gap: 24px; }
.desktop-only { display: flex; }
@media (max-width: 768px) { .desktop-only { display: none; } }
.mobile-cta {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--color-primary);
  color: var(--color-bg-base);
  border: none;
  font-family: var(--font-mono);
  font-size: 11px;
  text-decoration: none;
  cursor: pointer;
}
@media (max-width: 1024px) {
  .mobile-cta { display: inline-flex; }
}
.mobile-menu-btn {
  display: none; background: none; border: none;
  color: var(--color-text-base); cursor: pointer;
}
@media (max-width: 1024px) { .mobile-menu-btn { display: block; } }
.mobile-menu {
  position: absolute; top: 100%; left: 0; right: 0;
  background: var(--color-bg-surface); border-bottom: 1px solid var(--color-border);
  padding: 24px; display: flex; flex-direction: column; gap: 24px; z-index: 99;
}
.mobile-menu a {
  font-size: 11px; color: var(--color-text-muted); text-decoration: none;
  letter-spacing: 0.1em; transition: color 0.2s ease;
}
.mobile-menu a:hover { color: var(--color-primary); }
.mobile-menu-actions {
  display: flex; flex-direction: column;
  gap: 16px; padding-top: 16px; border-top: 1px solid var(--color-border);
}
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { transform: translateY(-20px); opacity: 0; }
.nav-link {
  font-family: var(--font-mono); font-size: 11px; text-transform: uppercase;
  color: var(--color-text-muted); text-decoration: none; display: flex; align-items: center;
}
.nav-link:hover { color: var(--color-primary); }
.lang-switch, .theme-switch {
  background: transparent; border: none; padding: 4px; cursor: pointer;
  font-size: 20px; border-radius: 6px; transition: all 0.2s ease;
  display: flex; align-items: center; justify-content: center;
  line-height: 1; color: var(--color-text-muted);
}
.theme-switch .material-symbols-outlined { font-size: 20px; }
.lang-switch:hover, .theme-switch:hover {
  background: var(--color-bg-surface-highest); color: var(--color-text-base); transform: scale(1.1);
}

/* Common */
.badge-mono {
  font-family: var(--font-mono); font-size: 11px; color: var(--color-primary);
  letter-spacing: 0.2em; margin-bottom: 24px; display: inline-block;
}
.section-header { margin-bottom: 64px; }
.centered { text-align: center; }
.section-title { font-size: clamp(28px, 5vw, 36px); font-weight: 700; margin-bottom: 16px; line-height: 1.2; }
.section-desc { font-size: 16px; color: var(--color-text-muted); max-width: 600px; }
.centered .section-desc { margin: 0 auto; }
.text-gradient {
  background: linear-gradient(45deg, var(--color-primary), #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

/* Hero */
.hero-section {
  max-width: 1300px; margin: 0 auto;
  padding: 100px 24px 80px;
  display: grid; grid-template-columns: 1.1fr 0.9fr;
  gap: 80px; align-items: center;
}
@media (max-width: 1024px) {
  .hero-section { grid-template-columns: 1fr; text-align: center; padding: 80px 24px 60px; }
  .hero-preview { display: none; }
  .chaos-inventory { justify-content: center; }
}
.chaos-inventory { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 32px; }
.chaos-file {
  background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444; padding: 5px 10px; border-radius: 4px; font-size: 10px;
  display: flex; align-items: center; gap: 6px; text-transform: lowercase; opacity: 0.8;
}
.hero-title {
  font-size: clamp(36px, 5.5vw, 60px); font-weight: 800;
  line-height: 1.1; margin-bottom: 20px; letter-spacing: -0.04em;
}
.hero-subtitle {
  font-size: 17px; color: var(--color-text-muted); line-height: 1.65;
  max-width: 520px; margin-bottom: 44px;
}
@media (max-width: 1024px) { .hero-subtitle { margin: 0 auto 44px; } }
.cta-group { display: flex; gap: 16px; margin-bottom: 44px; }
@media (max-width: 640px) {
  .cta-group { flex-direction: column; width: 100%; }
  .hero-stats { flex-direction: column; gap: 16px; align-items: center; }
  .stat-divider { width: 40px; height: 1px; }
}
.trust-bar { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 28px; }
.trust-bar span { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--color-text-muted); letter-spacing: 0.05em; }
.trust-bar .material-symbols-outlined { font-size: 15px; color: #10b981; }
@media (max-width: 1024px) { .trust-bar { justify-content: center; } }
.hero-stats { display: flex; gap: 32px; }
.stat-item { display: flex; flex-direction: column; }
.stat-value { font-family: var(--font-mono); font-size: 18px; font-weight: 700; }
.stat-label { font-size: 11px; color: var(--color-text-muted); }
.stat-divider { width: 1px; height: 32px; background-color: var(--color-border); }

/* Dashboard Mockup */
.dashboard-mockup {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}
.mockup-header {
  padding: 12px 16px;
  background: var(--color-bg-base);
  border-bottom: 1px solid var(--color-border);
  display: flex; align-items: center; gap: 12px;
}
.mockup-dots { display: flex; gap: 6px; }
.mockup-dots span {
  width: 8px; height: 8px; border-radius: 50%; background: var(--color-border);
}
.mockup-title { font-size: 11px; color: var(--color-text-muted); }

/* WButton link styles */
.w-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  padding: 12px 20px;
  white-space: nowrap;
}
.w-button--primary {
  background: var(--color-primary);
  color: var(--color-bg-base);
}
.w-button--primary:hover {
  background: var(--color-primary-hover);
}
.w-button--outline {
  background: transparent;
  color: var(--color-text-base);
  border: 1px solid var(--color-border);
}
.w-button--outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.w-button--lg {
  padding: 16px 24px;
  font-size: 13px;
}

/* Workflow */
.workflow-section {
  max-width: 1300px; margin: 0 auto; padding: 100px 24px;
  border-top: 1px solid var(--color-border);
}
.workflow-grid { display: flex; justify-content: space-between; gap: 20px; margin-top: 60px; }
@media (max-width: 968px) {
  .workflow-grid { flex-direction: column; gap: 40px; }
  .step-arrow { display: none; }
}
.workflow-step {
  flex: 1; position: relative; background: var(--color-bg-surface);
  border: 1px solid var(--color-border); padding: 32px;
  transition: all 0.3s ease;
}
.workflow-step:hover { border-color: var(--color-primary); transform: translateY(-4px); }
.step-number { font-size: 10px; color: var(--color-primary); margin-bottom: 24px; }
.step-icon { font-size: 32px; color: var(--color-text-muted); margin-bottom: 16px; display: block; }
.workflow-step h3 { font-size: 18px; margin-bottom: 12px; }
.workflow-step p { font-size: 14px; color: var(--color-text-muted); line-height: 1.6; }
.step-arrow { position: absolute; right: -25px; top: 50%; transform: translateY(-50%); color: var(--color-border); }

/* Mid CTA */
.mid-cta {
  max-width: 1300px; margin: 0 auto; padding: 0 24px 60px;
}
.mid-cta-inner {
  background: var(--color-bg-surface); border: 1px solid var(--color-border);
  padding: 32px 40px; display: flex; align-items: center; justify-content: space-between;
  gap: 24px; flex-wrap: wrap;
}
.mid-cta-inner .badge-mono { margin-bottom: 0; }
.mid-cta-inner p { font-size: 16px; font-weight: 600; flex: 1; min-width: 200px; margin: 0; }
@media (max-width: 640px) { .mid-cta-inner { flex-direction: column; text-align: center; } }

/* Bento */
.features-grid { max-width: 1300px; margin: 0 auto; padding: 100px 24px; }
.bento-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
@media (max-width: 1024px) { .bento-container { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) {
  .bento-container { grid-template-columns: 1fr; }
  .bento-span-2 { grid-column: span 1; }
  .bento-row-2 { grid-row: span 1; }
}
.bento-card {
  background: var(--color-bg-surface); border: 1px solid var(--color-border);
  padding: 36px; display: flex; flex-direction: column; transition: all 0.3s ease;
}
.bento-card:hover { border-color: var(--color-primary); transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.25); }
.bento-span-2 { grid-column: span 2; }
.bento-row-2 { grid-row: span 2; }
@media (max-width: 1024px) { .bento-span-2 { grid-column: span 2; } }
.bento-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.bento-icon { font-size: 28px; color: var(--color-primary); }
.bento-title-group h3 { font-size: 18px; }
.badge-tiny {
  font-family: var(--font-mono); font-size: 9px; padding: 2px 6px;
  border: 1px solid var(--color-primary); color: var(--color-primary);
}
.bento-card p { font-size: 14px; color: var(--color-text-muted); line-height: 1.6; }
.feature-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
.feature-tags span {
  font-family: var(--font-mono); font-size: 10px;
  background: rgba(255,255,255,0.04); padding: 4px 10px; border: 1px solid var(--color-border);
}
.mock-ui-element { margin-top: auto; padding-top: 28px; }
.mock-task { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; opacity: 0.4; }
.task-check { width: 14px; height: 14px; border: 1px solid var(--color-border); flex-shrink: 0; }
.task-line { height: 2px; flex: 1; background: var(--color-border); }
.task-tag { width: 40px; height: 8px; background: var(--color-primary); opacity: 0.4; }
.finance-metrics { display: flex; gap: 32px; margin-top: auto; padding-top: 28px; }
.metric .m-label { font-family: var(--font-mono); font-size: 9px; color: var(--color-text-muted); margin-bottom: 4px; }
.metric .m-value { font-size: 24px; font-weight: 700; }

/* Open Source */
.open-source-section {
  max-width: 1300px; margin: 0 auto; padding: 100px 24px;
  border-top: 1px solid var(--color-border);
}
.open-source-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
}
@media (max-width: 1024px) { .open-source-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .open-source-grid { grid-template-columns: 1fr; } }
.open-source-card {
  background: var(--color-bg-surface); border: 1px solid var(--color-border);
  padding: 32px; display: flex; flex-direction: column; transition: all 0.3s ease;
}
.open-source-card:hover { border-color: var(--color-primary); transform: translateY(-4px); }
.open-source-icon { font-size: 32px; color: var(--color-primary); margin-bottom: 16px; }
.open-source-card h3 { font-size: 16px; margin-bottom: 8px; }
.open-source-card p { font-size: 13px; color: var(--color-text-muted); line-height: 1.6; }

/* Get Started */
.get-started-section {
  max-width: 1300px; margin: 0 auto; padding: 100px 24px;
  border-top: 1px solid var(--color-border);
}
.get-started-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px;
}
@media (max-width: 968px) { .get-started-grid { grid-template-columns: 1fr; } }
.get-started-step {
  background: var(--color-bg-surface); border: 1px solid var(--color-border);
  padding: 32px; transition: all 0.3s ease;
}
.get-started-step:hover { border-color: var(--color-primary); transform: translateY(-4px); }
.get-started-step .step-number { font-size: 10px; color: var(--color-primary); margin-bottom: 24px; }
.get-started-step h3 { font-size: 18px; margin-bottom: 12px; }
.get-started-step .code-block {
  font-size: 12px; color: var(--color-text-muted); line-height: 1.6;
  background: var(--color-bg-base); padding: 12px; border: 1px solid var(--color-border);
  word-break: break-word;
}
.get-started-actions { display: flex; justify-content: center; }

/* Community */
.community-section {
  max-width: 1300px; margin: 0 auto; padding: 100px 24px;
  border-top: 1px solid var(--color-border);
}
.community-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
}
@media (max-width: 968px) { .community-grid { grid-template-columns: 1fr; } }
.community-card {
  background: var(--color-bg-surface); border: 1px solid var(--color-border);
  padding: 32px; display: flex; align-items: center; gap: 16px;
  text-decoration: none; color: var(--color-text-base); transition: all 0.3s ease;
}
.community-card:hover { border-color: var(--color-primary); transform: translateY(-4px); }
.community-icon { font-size: 28px; color: var(--color-primary); }
.community-card h3 { font-size: 16px; font-weight: 600; }

/* Security */
.infra-deep-dive {
  background: var(--color-bg-surface); padding: 120px 24px;
  border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border);
}
.infra-container {
  max-width: 1300px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 100px; align-items: center;
}
@media (max-width: 968px) { .infra-container { grid-template-columns: 1fr; gap: 60px; } }
.text-h1 { font-size: clamp(28px, 5vw, 40px); font-weight: 700; line-height: 1.2; margin-bottom: 20px; }
.infra-text > p { font-size: 16px; color: var(--color-text-muted); line-height: 1.7; }
.infra-list { list-style: none; padding: 0; margin-top: 32px; }
.infra-list li { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 20px; font-size: 15px; line-height: 1.5; }
.infra-list li .material-symbols-outlined { color: var(--color-primary); font-size: 20px; flex-shrink: 0; margin-top: 1px; }
.privacy-card {
  background: var(--color-bg-base); border: 1px solid var(--color-border);
  padding: 40px; display: flex; flex-direction: column; gap: 24px;
}
.privacy-icon-row { display: flex; justify-content: center; }
.privacy-icon { font-size: 48px; color: var(--color-primary); }
.privacy-stat { text-align: center; }
.privacy-stat-value { font-size: 56px; font-weight: 800; display: block; line-height: 1; }
.privacy-stat-label { font-size: 11px; color: var(--color-text-muted); letter-spacing: 0.1em; display: block; margin-top: 8px; }
.privacy-divider { height: 1px; background: var(--color-border); }
.privacy-list { display: flex; flex-direction: column; gap: 12px; }
.privacy-item { display: flex; align-items: center; gap: 10px; font-size: 11px; color: var(--color-text-muted); letter-spacing: 0.05em; }
.privacy-item .material-symbols-outlined { font-size: 16px; color: var(--color-primary); }

/* Advanced */
.advanced-features { max-width: 1300px; margin: 0 auto; padding: 100px 24px; }
.advanced-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
@media (max-width: 868px) { .advanced-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 580px) { .advanced-grid { grid-template-columns: 1fr; } }
.adv-item { padding: 24px; border-bottom: 1px solid var(--color-border); }
.adv-icon { color: var(--color-primary); margin-bottom: 12px; display: block; }
.adv-item h4 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
.adv-item p { font-size: 13px; color: var(--color-text-muted); line-height: 1.6; }

/* FAQ */
.faq-section { max-width: 800px; margin: 0 auto; padding: 100px 24px; }
.faq-list { margin-top: 48px; }
.faq-item { border-bottom: 1px solid var(--color-border); cursor: pointer; }
.faq-item:first-child { border-top: 1px solid var(--color-border); }
.faq-question { display: flex; justify-content: space-between; align-items: center; font-weight: 500; font-size: 15px; padding: 22px 0; user-select: none; }
.faq-item--open .faq-question { color: var(--color-primary); }
.faq-icon { font-size: 20px; color: var(--color-text-muted); flex-shrink: 0; }
.faq-item--open .faq-icon { color: var(--color-primary); }
.faq-answer { font-size: 14px; color: var(--color-text-muted); line-height: 1.7; padding-bottom: 22px; padding-right: 32px; }

/* Final CTA */
.final-cta { padding: 140px 24px; text-align: center; border-top: 1px solid var(--color-border); }
.cta-inner { max-width: 700px; margin: 0 auto; }
.cta-inner .hero-title { margin-bottom: 20px; }
.cta-inner > p { font-size: 16px; color: var(--color-text-muted); line-height: 1.7; margin-bottom: 40px; }
.final-cta-actions { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.cta-footnote { font-size: 10px; color: var(--color-text-muted); letter-spacing: 0.08em; margin: 0; }

/* Footer */
.landing-footer { padding: 80px 24px 40px; border-top: 1px solid var(--color-border); }
.footer-grid { max-width: 1300px; margin: 0 auto; display: grid; grid-template-columns: 2fr repeat(3, 1fr); gap: 60px; }
@media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr; gap: 40px; } }
.footer-tagline { margin-top: 16px; color: var(--color-text-muted); max-width: 240px; font-size: 14px; line-height: 1.6; }
.footer-label { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); margin-bottom: 20px; letter-spacing: 0.1em; }
.footer-nav-col a { display: block; padding: 7px 0; color: var(--color-text-muted); text-decoration: none; font-size: 14px; transition: color 0.2s; }
.footer-nav-col a:hover { color: var(--color-primary); }
.footer-bottom {
  max-width: 1300px; margin: 60px auto 0; padding-top: 32px;
  border-top: 1px solid var(--color-border);
  display: flex; justify-content: space-between; font-size: 10px; color: var(--color-text-muted);
}

.ml-2 { margin-left: 8px; }
</style>
