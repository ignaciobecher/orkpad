<template>
  <div class="landing">
    <!-- NAV -->
    <nav class="nav">
      <div class="nav-inner">
        <div class="nav-brand">
          <w-logo :height="40" />
        </div>
        <div class="nav-links font-mono">
          <a href="#modules">{{ $t('nav.modules') }}</a>
          <a href="#workflow">{{ $t('nav.workflow') }}</a>
          <a href="#open-source">{{ $t('nav.github') }}</a>
          <a href="#get-started">{{ $t('nav.docs') }}</a>
          <a href="#community">{{ $t('nav.community') }}</a>
        </div>
        <div class="nav-right">
          <button @click="toggleLocale" class="nav-icon" :title="$i18n.locale === 'es' ? 'English' : 'Español'">
            {{ $i18n.locale === 'es' ? 'EN' : 'ES' }}
          </button>
          <button @click="uiStore.toggleTheme()" class="nav-icon">
            <span class="material-symbols-outlined">{{ uiStore.theme === 'dark' ? 'light_mode' : 'dark_mode' }}</span>
          </button>
          <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer" class="nav-gh font-mono">
            <span class="material-symbols-outlined" style="font-size:16px">star</span>
            GitHub
          </a>
          <button class="nav-burger" @click="isMenuOpen = !isMenuOpen">
            <span class="material-symbols-outlined">{{ isMenuOpen ? 'close' : 'menu' }}</span>
          </button>
        </div>
      </div>
      <div v-if="isMenuOpen" class="nav-mobile font-mono">
        <a href="#modules" @click="isMenuOpen = false">{{ $t('nav.modules') }}</a>
        <a href="#workflow" @click="isMenuOpen = false">{{ $t('nav.workflow') }}</a>
        <a href="#open-source" @click="isMenuOpen = false">{{ $t('nav.github') }}</a>
        <a href="#get-started" @click="isMenuOpen = false">{{ $t('nav.docs') }}</a>
        <a href="#community" @click="isMenuOpen = false">{{ $t('nav.community') }}</a>
        <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer" @click="isMenuOpen = false">GitHub</a>
      </div>
    </nav>

    <main>
      <!-- HERO -->
      <section class="hero">
        <div class="hero-left">
          <div class="hero-eyebrow font-mono">
            <span class="dot"></span>
            OPEN SOURCE · SELF-HOSTABLE · APACHE-2.0
          </div>
          <h1 class="hero-title">
            {{ $t('hero.title') }}
            <br />
            <span class="hero-accent">{{ $t('hero.titleAccent') }}</span>
          </h1>
          <p class="hero-sub">{{ $t('hero.subtitle') }}</p>
          <div class="hero-actions">
            <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer" class="btn btn--primary">
              <span class="material-symbols-outlined" style="font-size:18px">star</span>
              {{ $t('hero.ctaGitHub') }}
            </a>
            <a href="#get-started" class="btn btn--ghost">
              {{ $t('hero.ctaDocs') }}
            </a>
          </div>
          <div class="hero-stats font-mono">
            <div class="hero-stat">
              <span class="hero-stat-val">{{ $t('hero.stats.license.value') }}</span>
              <span class="hero-stat-lbl">{{ $t('hero.stats.license.label') }}</span>
            </div>
            <div class="hero-stat-sep"></div>
            <div class="hero-stat">
              <span class="hero-stat-val">{{ $t('hero.stats.community.value') }}</span>
              <span class="hero-stat-lbl">{{ $t('hero.stats.community.label') }}</span>
            </div>
            <div class="hero-stat-sep"></div>
            <div class="hero-stat">
              <span class="hero-stat-val">{{ $t('hero.stats.setup.value') }}</span>
              <span class="hero-stat-lbl">{{ $t('hero.stats.setup.label') }}</span>
            </div>
          </div>
        </div>
        <div class="hero-right">
          <div class="hero-terminal font-mono">
            <div class="term-bar">
              <span class="term-dot"></span><span class="term-dot"></span><span class="term-dot"></span>
              <span class="term-title">terminal</span>
            </div>
            <div class="term-body">
              <div class="term-line"><span class="t-prompt">$</span> git clone https://github.com/ignaciobecher/orkpad.git</div>
              <div class="term-line t-dim">Cloning into 'orkpad'...</div>
              <div class="term-line t-dim">done.</div>
              <div class="term-line"><span class="t-prompt">$</span> cd orkpad && docker compose up -d</div>
              <div class="term-line t-green">✔ mongo Running</div>
              <div class="term-line t-green">✔ backend Running</div>
              <div class="term-line t-green">✔ frontend Running</div>
              <div class="term-line"><span class="t-prompt">$</span> <span class="t-cursor">_</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- WORKFLOW -->
      <section id="workflow" class="section workflow">
        <div class="section-label font-mono">{{ $t('workflow.badge') }}</div>
        <h2 class="section-title">{{ $t('workflow.title') }}</h2>
        <p class="section-desc">{{ $t('workflow.description') }}</p>
        <div class="workflow-steps">
          <div class="wf-step" v-for="(step, i) in workflowSteps" :key="i">
            <span class="wf-num font-mono">0{{ i + 1 }}</span>
            <span class="material-symbols-outlined wf-icon">{{ step.icon }}</span>
            <h3 class="wf-title">{{ step.title }}</h3>
            <p class="wf-desc">{{ step.desc }}</p>
          </div>
        </div>
      </section>

      <!-- MID CTA -->
      <section class="mid-cta">
        <div class="mid-cta-inner">
          <span class="mid-cta-badge font-mono">{{ $t('midCta.badge') }}</span>
          <p>{{ $t('midCta.text') }}</p>
          <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer" class="btn btn--primary">
            {{ $t('midCta.button') }}
          </a>
        </div>
      </section>

      <!-- MODULES -->
      <section id="modules" class="section modules">
        <div class="section-label font-mono">{{ $t('modules.badge') }}</div>
        <h2 class="section-title">{{ $t('modules.title') }}</h2>
        <p class="section-desc">{{ $t('modules.description') }}</p>
        <div class="modules-grid">
          <div class="mod-card mod-card--wide">
            <span class="material-symbols-outlined mod-icon">dashboard</span>
            <h3>{{ $t('modules.hub.title') }}</h3>
            <p>{{ $t('modules.hub.desc') }}</p>
            <div class="mod-tags font-mono">
              <span>Kanban</span><span>CRM</span><span>Time Tracking</span><span>Agenda</span>
            </div>
          </div>
          <div class="mod-card">
            <span class="material-symbols-outlined mod-icon">payments</span>
            <h3>{{ $t('modules.finance.title') }}</h3>
            <p>{{ $t('modules.finance.desc') }}</p>
          </div>
          <div class="mod-card">
            <span class="material-symbols-outlined mod-icon">account_tree</span>
            <h3>{{ $t('modules.sales.title') }}</h3>
            <p>{{ $t('modules.sales.desc') }}</p>
          </div>
          <div class="mod-card mod-card--wide">
            <span class="material-symbols-outlined mod-icon">description</span>
            <h3>{{ $t('modules.wiki.title') }}</h3>
            <p>{{ $t('modules.wiki.desc') }}</p>
          </div>
        </div>
      </section>

      <!-- OPEN SOURCE -->
      <section id="open-source" class="section oss">
        <div class="section-label font-mono">{{ $t('openSource.badge') }}</div>
        <h2 class="section-title">{{ $t('openSource.title') }}</h2>
        <p class="section-desc">{{ $t('openSource.description') }}</p>
        <div class="oss-grid">
          <div class="oss-card" v-for="(item, i) in openSourceItems" :key="i">
            <span class="material-symbols-outlined oss-icon">{{ item.icon }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </section>

      <!-- GET STARTED -->
      <section id="get-started" class="section getting">
        <div class="section-label font-mono">{{ $t('getStarted.badge') }}</div>
        <h2 class="section-title">{{ $t('getStarted.title') }}</h2>
        <p class="section-desc">{{ $t('getStarted.description') }}</p>
        <div class="getting-steps">
          <div class="get-step" v-for="(step, i) in getStartedSteps" :key="i">
            <span class="get-num font-mono">0{{ i + 1 }}</span>
            <h3>{{ step.title }}</h3>
            <code class="get-code font-mono">{{ step.desc }}</code>
          </div>
        </div>
        <div class="getting-action">
          <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer" class="btn btn--primary">
            {{ $t('getStarted.button') }}
          </a>
        </div>
      </section>

      <!-- COMMUNITY -->
      <section id="community" class="section community">
        <div class="section-label font-mono">{{ $t('community.badge') }}</div>
        <h2 class="section-title">{{ $t('community.title') }}</h2>
        <p class="section-desc">{{ $t('community.description') }}</p>
        <div class="community-links">
          <a :href="GITHUB_ISSUES_URL" target="_blank" rel="noopener noreferrer" class="comm-link">
            <span class="material-symbols-outlined">bug_report</span>
            <span>{{ $t('community.links.issues') }}</span>
          </a>
          <a :href="GITHUB_DISCUSSIONS_URL" target="_blank" rel="noopener noreferrer" class="comm-link">
            <span class="material-symbols-outlined">forum</span>
            <span>{{ $t('community.links.discussions') }}</span>
          </a>
          <a :href="GITHUB_PROJECTS_URL" target="_blank" rel="noopener noreferrer" class="comm-link">
            <span class="material-symbols-outlined">map</span>
            <span>{{ $t('community.links.roadmap') }}</span>
          </a>
        </div>
      </section>

      <!-- SECURITY -->
      <section class="section security">
        <div class="security-split">
          <div class="security-left">
            <div class="section-label font-mono">{{ $t('security.badge') }}</div>
            <h2 class="section-title">{{ $t('security.title') }} <span class="hero-accent">{{ $t('security.titleAccent') }}</span></h2>
            <p class="section-desc">{{ $t('security.description') }}</p>
            <ul class="security-list">
              <li v-for="item in securityItemsList" :key="item.title">
                <span class="material-symbols-outlined" style="color:var(--color-primary)">check_circle</span>
                <div><strong>{{ item.title }}</strong> {{ item.desc }}</div>
              </li>
            </ul>
          </div>
          <div class="security-right">
            <div class="security-badge">
              <span class="material-symbols-outlined" style="font-size:48px;color:var(--color-primary)">lock</span>
              <span class="sb-val">100%</span>
              <span class="sb-lbl font-mono">{{ $t('security.visual.isolation') }}</span>
              <div class="sb-sep"></div>
              <div class="sb-items">
                <div class="sb-item font-mono" v-for="item in securityItems" :key="item">
                  <span class="material-symbols-outlined" style="font-size:14px;color:var(--color-primary)">shield</span>
                  {{ item }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ADVANCED -->
      <section class="section advanced">
        <h2 class="section-title">{{ $t('advanced.title') }}</h2>
        <p class="section-desc">{{ $t('advanced.description') }}</p>
        <div class="adv-grid">
          <div class="adv-item" v-for="(feat, i) in advancedFeatures" :key="i">
            <span class="material-symbols-outlined adv-icon">{{ feat.icon }}</span>
            <h4>{{ feat.title }}</h4>
            <p>{{ feat.desc }}</p>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="section faq">
        <h2 class="section-title">{{ $t('faq.title') }}</h2>
        <div class="faq-list">
          <div class="faq-item" v-for="(f, i) in faqs" :key="i" :class="{ open: openFaq === i }" @click="openFaq = openFaq === i ? null : i">
            <div class="faq-q">
              <span>{{ f.q }}</span>
              <span class="material-symbols-outlined">{{ openFaq === i ? 'remove' : 'add' }}</span>
            </div>
            <div v-if="openFaq === i" class="faq-a">{{ f.a }}</div>
          </div>
        </div>
      </section>

      <!-- FINAL CTA -->
      <section class="final-cta">
        <div class="fcta-inner">
          <span class="section-label font-mono" style="text-align:center;display:block;margin-bottom:24px">{{ $t('finalCta.badge') }}</span>
          <h2 class="hero-title" style="font-size:clamp(32px,5vw,52px)">{{ $t('finalCta.title') }}</h2>
          <p class="hero-sub" style="max-width:500px;margin:0 auto 40px">{{ $t('finalCta.subtitle') }}</p>
          <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--lg">
            <span class="material-symbols-outlined" style="font-size:18px">star</span>
            {{ $t('finalCta.button') }}
          </a>
          <p class="fcta-footnote font-mono">{{ $t('finalCta.footnote') }}</p>
        </div>
      </section>
    </main>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <w-logo :height="40" />
          <p class="footer-tagline">{{ $t('footer.tagline') }}</p>
        </div>
        <div class="footer-col">
          <div class="footer-heading font-mono">{{ $t('footer.product') }}</div>
          <a href="#modules">{{ $t('footer.links.features') }}</a>
          <a href="#get-started">{{ $t('footer.links.docs') }}</a>
        </div>
        <div class="footer-col">
          <div class="footer-heading font-mono">{{ $t('footer.community') }}</div>
          <a :href="GITHUB_REPO_URL" target="_blank" rel="noopener noreferrer">{{ $t('footer.links.github') }}</a>
          <a :href="GITHUB_ISSUES_URL" target="_blank" rel="noopener noreferrer">{{ $t('footer.links.issues') }}</a>
          <a :href="GITHUB_DISCUSSIONS_URL" target="_blank" rel="noopener noreferrer">{{ $t('footer.links.discussions') }}</a>
        </div>
        <div class="footer-col">
          <div class="footer-heading font-mono">{{ $t('footer.legal') }}</div>
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
    securityItemsList() {
      return [
        { title: this.$t('security.list.isolation.title'), desc: this.$t('security.list.isolation.desc') },
        { title: this.$t('security.list.export.title'), desc: this.$t('security.list.export.desc') },
        { title: this.$t('security.list.backups.title'), desc: this.$t('security.list.backups.desc') },
      ]
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
          if (entry.isIntersecting) entry.target.classList.add('in')
        })
      }, { threshold: 0.08 })
      document.querySelectorAll('.section, .mid-cta, .final-cta').forEach((el) => observer.observe(el))
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
/* ─── RESET / BASE ─── */
.landing {
  min-height: 100vh;
  background: var(--color-bg-base);
  color: var(--color-text-base);
  overflow-x: hidden;
}
.landing * { box-sizing: border-box; margin: 0; padding: 0; }

/* ─── SCROLL REVEAL ─── */
.section, .mid-cta, .final-cta {
  opacity: 0; transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.section.in, .mid-cta.in, .final-cta.in { opacity: 1; transform: translateY(0); }

/* ─── NAV ─── */
.nav {
  position: sticky; top: 0; z-index: 100;
  background: var(--color-bg-base);
  border-bottom: 1px solid var(--color-border);
}
.nav-inner {
  max-width: 1200px; margin: 0 auto; padding: 14px 24px;
  display: flex; align-items: center; justify-content: space-between;
}
.nav-brand { display: flex; align-items: center; }
.nav-links { display: flex; gap: 28px; }
@media (max-width: 900px) { .nav-links { display: none; } }
.nav-links a {
  font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--color-text-muted); text-decoration: none; transition: color 0.15s;
}
.nav-links a:hover { color: var(--color-primary); }
.nav-right { display: flex; align-items: center; gap: 16px; }
.nav-icon {
  background: none; border: none; cursor: pointer; color: var(--color-text-muted);
  font-size: 13px; font-family: var(--font-mono); padding: 4px 8px;
  transition: color 0.15s;
}
.nav-icon:hover { color: var(--color-text-base); }
.nav-gh {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--color-text-muted); text-decoration: none; transition: color 0.15s;
}
.nav-gh:hover { color: var(--color-primary); }
.nav-burger {
  display: none; background: none; border: none; cursor: pointer;
  color: var(--color-text-base);
}
@media (max-width: 900px) { .nav-burger { display: block; } }
.nav-mobile {
  display: flex; flex-direction: column; gap: 20px;
  padding: 20px 24px; border-top: 1px solid var(--color-border);
}
.nav-mobile a {
  font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--color-text-muted); text-decoration: none;
}
.nav-mobile a:hover { color: var(--color-primary); }

/* ─── SHARED ─── */
.section { max-width: 1200px; margin: 0 auto; padding: 120px 24px; }
.section-label {
  font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--color-primary); margin-bottom: 20px;
}
.section-title {
  font-size: clamp(28px, 4vw, 40px); font-weight: 800;
  line-height: 1.15; margin-bottom: 16px; letter-spacing: -0.03em;
}
.section-desc {
  font-size: 15px; color: var(--color-text-muted); line-height: 1.65;
  max-width: 540px; margin-bottom: 56px;
}
.hero-accent {
  background: linear-gradient(135deg, var(--color-primary), #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

/* ─── BUTTONS ─── */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em;
  text-transform: uppercase; text-decoration: none; cursor: pointer;
  padding: 14px 22px; border: none; transition: all 0.15s; white-space: nowrap;
}
.btn--primary { background: var(--color-primary); color: var(--color-bg-base); }
.btn--primary:hover { background: var(--color-primary-hover); }
.btn--ghost {
  background: transparent; color: var(--color-text-base);
  border: 1px solid var(--color-border);
}
.btn--ghost:hover { border-color: var(--color-primary); color: var(--color-primary); }
.btn--lg { padding: 16px 28px; font-size: 12px; }

/* ─── HERO ─── */
.hero {
  max-width: 1200px; margin: 0 auto; padding: 80px 24px 100px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
}
@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; padding: 60px 24px 80px; }
  .hero-right { display: none; }
}
.hero-eyebrow {
  font-size: 10px; letter-spacing: 0.15em; color: var(--color-text-muted);
  margin-bottom: 28px; display: flex; align-items: center; gap: 10px;
}
.dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--color-primary);
  display: inline-block;
}
.hero-title {
  font-size: clamp(36px, 5vw, 56px); font-weight: 800;
  line-height: 1.08; letter-spacing: -0.04em; margin-bottom: 20px;
}
.hero-sub {
  font-size: 16px; color: var(--color-text-muted); line-height: 1.65;
  max-width: 460px; margin-bottom: 36px;
}
.hero-actions { display: flex; gap: 12px; margin-bottom: 48px; }
@media (max-width: 480px) { .hero-actions { flex-direction: column; } }
.hero-stats { display: flex; gap: 28px; align-items: center; }
.hero-stat { display: flex; flex-direction: column; }
.hero-stat-val { font-size: 16px; font-weight: 700; }
.hero-stat-lbl { font-size: 10px; color: var(--color-text-muted); letter-spacing: 0.05em; }
.hero-stat-sep { width: 1px; height: 28px; background: var(--color-border); }

/* ─── TERMINAL ─── */
.hero-terminal {
  border: 1px solid var(--color-border); background: var(--color-bg-surface);
  overflow: hidden;
}
.term-bar {
  padding: 10px 14px; display: flex; align-items: center; gap: 6px;
  border-bottom: 1px solid var(--color-border); background: var(--color-bg-base);
}
.term-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-border); }
.term-title { font-size: 10px; color: var(--color-text-muted); margin-left: 8px; letter-spacing: 0.05em; }
.term-body { padding: 20px; font-size: 12px; line-height: 1.8; }
.term-line { white-space: nowrap; }
.t-prompt { color: var(--color-primary); margin-right: 8px; }
.t-dim { color: var(--color-text-disabled); }
.t-green { color: var(--color-success); }
.t-cursor { animation: blink 1s step-end infinite; }
@keyframes blink { 50% { opacity: 0; } }

/* ─── WORKFLOW ─── */
.workflow { border-top: 1px solid var(--color-border); }
.workflow-steps {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
}
@media (max-width: 868px) { .workflow-steps { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 520px) { .workflow-steps { grid-template-columns: 1fr; } }
.wf-step {
  padding: 28px; border: 1px solid var(--color-border);
  background: var(--color-bg-surface); transition: border-color 0.2s;
}
.wf-step:hover { border-color: var(--color-primary); }
.wf-num { font-size: 10px; color: var(--color-primary); display: block; margin-bottom: 16px; }
.wf-icon { font-size: 28px; color: var(--color-text-muted); margin-bottom: 12px; display: block; }
.wf-title { font-size: 16px; margin-bottom: 8px; }
.wf-desc { font-size: 13px; color: var(--color-text-muted); line-height: 1.6; }

/* ─── MID CTA ─── */
.mid-cta { max-width: 1200px; margin: 0 auto; padding: 0 24px 120px; }
.mid-cta-inner {
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 28px 36px; border: 1px solid var(--color-border);
  background: var(--color-bg-surface); flex-wrap: wrap;
}
.mid-cta-badge { font-size: 10px; letter-spacing: 0.2em; color: var(--color-primary); }
.mid-cta-inner p { font-size: 15px; font-weight: 600; flex: 1; min-width: 200px; margin: 0; }
@media (max-width: 640px) { .mid-cta-inner { flex-direction: column; text-align: center; } }

/* ─── MODULES ─── */
.modules { border-top: 1px solid var(--color-border); }
.modules-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
@media (max-width: 768px) { .modules-grid { grid-template-columns: 1fr; } }
.mod-card {
  padding: 32px; border: 1px solid var(--color-border);
  background: var(--color-bg-surface); transition: border-color 0.2s;
}
.mod-card:hover { border-color: var(--color-primary); }
.mod-card--wide { grid-column: span 2; }
@media (max-width: 768px) { .mod-card--wide { grid-column: span 1; } }
.mod-icon { font-size: 28px; color: var(--color-primary); margin-bottom: 16px; display: block; }
.mod-card h3 { font-size: 17px; margin-bottom: 8px; }
.mod-card p { font-size: 13px; color: var(--color-text-muted); line-height: 1.6; }
.mod-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px; }
.mod-tags span {
  font-size: 9px; padding: 3px 8px; letter-spacing: 0.08em;
  border: 1px solid var(--color-border); color: var(--color-text-muted);
}

/* ─── OPEN SOURCE ─── */
.oss { border-top: 1px solid var(--color-border); }
.oss-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
@media (max-width: 640px) { .oss-grid { grid-template-columns: 1fr; } }
.oss-card {
  padding: 28px; border: 1px solid var(--color-border);
  background: var(--color-bg-surface); transition: border-color 0.2s;
}
.oss-card:hover { border-color: var(--color-primary); }
.oss-icon { font-size: 28px; color: var(--color-primary); margin-bottom: 12px; display: block; }
.oss-card h3 { font-size: 15px; margin-bottom: 6px; }
.oss-card p { font-size: 13px; color: var(--color-text-muted); line-height: 1.6; }

/* ─── GET STARTED ─── */
.getting { border-top: 1px solid var(--color-border); }
.getting-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px; }
@media (max-width: 768px) { .getting-steps { grid-template-columns: 1fr; } }
.get-step {
  padding: 28px; border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
}
.get-num { font-size: 10px; color: var(--color-primary); display: block; margin-bottom: 16px; }
.get-step h3 { font-size: 16px; margin-bottom: 10px; }
.get-code {
  display: block; font-size: 11px; padding: 10px 12px;
  background: var(--color-bg-base); border: 1px solid var(--color-border);
  color: var(--color-text-muted); word-break: break-all;
}
.getting-action { display: flex; justify-content: center; }

/* ─── COMMUNITY ─── */
.community { border-top: 1px solid var(--color-border); }
.community-links { display: flex; gap: 16px; flex-wrap: wrap; }
.comm-link {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 24px; border: 1px solid var(--color-border);
  background: var(--color-bg-surface); text-decoration: none;
  color: var(--color-text-base); font-size: 14px; font-weight: 500;
  transition: border-color 0.2s;
}
.comm-link:hover { border-color: var(--color-primary); }
.comm-link .material-symbols-outlined { color: var(--color-primary); font-size: 20px; }

/* ─── SECURITY ─── */
.security { border-top: 1px solid var(--color-border); }
.security-split {
  display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
}
@media (max-width: 868px) { .security-split { grid-template-columns: 1fr; gap: 48px; } }
.security-list { list-style: none; margin-top: 28px; }
.security-list li {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 14px; line-height: 1.5; margin-bottom: 16px;
}
.security-list li .material-symbols-outlined { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
.security-badge {
  border: 1px solid var(--color-border); background: var(--color-bg-surface);
  padding: 40px; display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.sb-val { font-size: 48px; font-weight: 800; display: block; line-height: 1; }
.sb-lbl { font-size: 10px; letter-spacing: 0.1em; color: var(--color-text-muted); }
.sb-sep { width: 100%; height: 1px; background: var(--color-border); margin: 8px 0; }
.sb-items { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.sb-item { font-size: 11px; color: var(--color-text-muted); display: flex; align-items: center; gap: 8px; letter-spacing: 0.04em; }

/* ─── ADVANCED ─── */
.advanced { border-top: 1px solid var(--color-border); }
.adv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
@media (max-width: 868px) { .adv-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 520px) { .adv-grid { grid-template-columns: 1fr; } }
.adv-item { padding: 20px 0; border-bottom: 1px solid var(--color-border); }
.adv-icon { color: var(--color-primary); margin-bottom: 10px; display: block; }
.adv-item h4 { font-size: 14px; font-weight: 600; margin-bottom: 6px; }
.adv-item p { font-size: 13px; color: var(--color-text-muted); line-height: 1.6; }

/* ─── FAQ ─── */
.faq { max-width: 800px; border-top: 1px solid var(--color-border); }
.faq-list { margin-top: 40px; }
.faq-item { border-bottom: 1px solid var(--color-border); cursor: pointer; }
.faq-item:first-child { border-top: 1px solid var(--color-border); }
.faq-q {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 0; font-weight: 500; font-size: 14px; user-select: none;
}
.faq-q .material-symbols-outlined { font-size: 18px; color: var(--color-text-muted); flex-shrink: 0; }
.faq-item.open .faq-q { color: var(--color-primary); }
.faq-item.open .faq-q .material-symbols-outlined { color: var(--color-primary); }
.faq-a { font-size: 13px; color: var(--color-text-muted); line-height: 1.7; padding-bottom: 20px; }

/* ─── FINAL CTA ─── */
.final-cta {
  padding: 140px 24px; text-align: center;
  border-top: 1px solid var(--color-border);
}
.fcta-inner { max-width: 700px; margin: 0 auto; }
.fcta-footnote { font-size: 10px; color: var(--color-text-muted); letter-spacing: 0.1em; margin-top: 20px; }

/* ─── FOOTER ─── */
.footer { padding: 80px 24px 40px; border-top: 1px solid var(--color-border); }
.footer-inner {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 2fr repeat(3, 1fr); gap: 48px;
}
@media (max-width: 768px) { .footer-inner { grid-template-columns: 1fr; gap: 32px; } }
.footer-tagline { margin-top: 12px; color: var(--color-text-muted); font-size: 13px; line-height: 1.6; max-width: 220px; }
.footer-heading { font-size: 10px; letter-spacing: 0.12em; color: var(--color-text-muted); margin-bottom: 16px; }
.footer-col a {
  display: block; padding: 5px 0; color: var(--color-text-muted);
  text-decoration: none; font-size: 13px; transition: color 0.15s;
}
.footer-col a:hover { color: var(--color-primary); }
.footer-bottom {
  max-width: 1200px; margin: 48px auto 0; padding-top: 24px;
  border-top: 1px solid var(--color-border);
  display: flex; justify-content: space-between;
  font-size: 10px; color: var(--color-text-muted);
}
</style>
