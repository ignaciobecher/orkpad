<template>
  <div class="privacy-page" :class="themeClass">
    <header class="privacy-header">
      <div class="privacy-header-inner">
        <router-link to="/" class="privacy-back">
          <span class="material-symbols-outlined">arrow_back</span>
          {{ $t('privacy.back') }}
        </router-link>
        <w-logo :height="36" />
      </div>
    </header>

    <main class="privacy-main">
      <div class="privacy-container">
        <div class="privacy-hero">
          <h1 class="privacy-title">{{ $t('privacy.title') }}</h1>
          <p class="privacy-meta">{{ $t('privacy.lastUpdated') }}</p>
          <p class="privacy-intro">{{ $t('privacy.intro') }}</p>
        </div>

        <nav class="privacy-toc">
          <div class="toc-label font-mono">{{ $t('privacy.toc') }}</div>
          <ol>
            <li><a href="#data-we-collect">{{ $t('privacy.tocItems.dataWeCollect') }}</a></li>
            <li><a href="#how-we-use">{{ $t('privacy.tocItems.howWeUse') }}</a></li>
            <li><a href="#third-parties">{{ $t('privacy.tocItems.thirdParties') }}</a></li>
            <li><a href="#cookies">{{ $t('privacy.tocItems.cookies') }}</a></li>
            <li><a href="#push-notifications">{{ $t('privacy.tocItems.pushNotifications') }}</a></li>
            <li><a href="#security">{{ $t('privacy.tocItems.security') }}</a></li>
            <li><a href="#your-rights">{{ $t('privacy.tocItems.yourRights') }}</a></li>
            <li><a href="#retention">{{ $t('privacy.tocItems.retention') }}</a></li>
            <li><a href="#children">{{ $t('privacy.tocItems.children') }}</a></li>
            <li><a href="#changes">{{ $t('privacy.tocItems.changes') }}</a></li>
            <li><a href="#contact">{{ $t('privacy.tocItems.contact') }}</a></li>
          </ol>
        </nav>

        <section id="data-we-collect" class="privacy-section">
          <h2>{{ $t('privacy.s1.title') }}</h2>
          <p>{{ $t('privacy.s1.intro') }}</p>
          <h3>{{ $t('privacy.s1.accountTitle') }}</h3>
          <p>{{ $t('privacy.s1.accountText') }}</p>
          <h3>{{ $t('privacy.s1.workspaceTitle') }}</h3>
          <p>{{ $t('privacy.s1.workspaceText') }}</p>
          <h3>{{ $t('privacy.s1.usageTitle') }}</h3>
          <p>{{ $t('privacy.s1.usageText') }}</p>
          <h3>{{ $t('privacy.s1.integrationsTitle') }}</h3>
          <p>{{ $t('privacy.s1.integrationsText') }}</p>
        </section>

        <section id="how-we-use" class="privacy-section">
          <h2>{{ $t('privacy.s2.title') }}</h2>
          <ul>
            <li><strong>{{ $t('privacy.s2.service') }}</strong> {{ $t('privacy.s2.serviceText') }}</li>
            <li><strong>{{ $t('privacy.s2.auth') }}</strong> {{ $t('privacy.s2.authText') }}</li>
            <li><strong>{{ $t('privacy.s2.emails') }}</strong> {{ $t('privacy.s2.emailsText') }}</li>
            <li><strong>{{ $t('privacy.s2.sync') }}</strong> {{ $t('privacy.s2.syncText') }}</li>
            <li><strong>{{ $t('privacy.s2.improvement') }}</strong> {{ $t('privacy.s2.improvementText') }}</li>
          </ul>
          <p>{{ $t('privacy.s2.noSell') }}</p>
        </section>

        <section id="third-parties" class="privacy-section">
          <h2>{{ $t('privacy.s3.title') }}</h2>
          <p>{{ $t('privacy.s3.intro') }}</p>
          <div class="provider-grid">
            <div class="provider-card">
              <div class="provider-name font-mono">GOOGLE</div>
              <p>{{ $t('privacy.s3.googleDesc') }}</p>
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" class="provider-link">
                {{ $t('privacy.s3.googleLink') }} <span class="material-symbols-outlined">open_in_new</span>
              </a>
            </div>
            <div class="provider-card">
              <div class="provider-name font-mono">GITHUB</div>
              <p>{{ $t('privacy.s3.githubDesc') }}</p>
              <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer" class="provider-link">
                {{ $t('privacy.s3.githubLink') }} <span class="material-symbols-outlined">open_in_new</span>
              </a>
            </div>
            <div class="provider-card">
              <div class="provider-name font-mono">RAILWAY</div>
              <p>{{ $t('privacy.s3.railwayDesc') }}</p>
              <a href="https://railway.com/legal/privacy" target="_blank" rel="noopener noreferrer" class="provider-link">
                {{ $t('privacy.s3.railwayLink') }} <span class="material-symbols-outlined">open_in_new</span>
              </a>
            </div>
            <div class="provider-card">
              <div class="provider-name font-mono">RESEND</div>
              <p>{{ $t('privacy.s3.resendDesc') }}</p>
              <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" class="provider-link">
                {{ $t('privacy.s3.resendLink') }} <span class="material-symbols-outlined">open_in_new</span>
              </a>
            </div>
            <div class="provider-card">
              <div class="provider-name font-mono">MONGODB ATLAS</div>
              <p>{{ $t('privacy.s3.mongoDesc') }}</p>
              <a href="https://www.mongodb.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" class="provider-link">
                {{ $t('privacy.s3.mongoLink') }} <span class="material-symbols-outlined">open_in_new</span>
              </a>
            </div>
          </div>
        </section>

        <section id="cookies" class="privacy-section">
          <h2>{{ $t('privacy.s4.title') }}</h2>
          <p>{{ $t('privacy.s4.intro') }}</p>
          <ul>
            <li><strong>{{ $t('privacy.s4.session') }}</strong> {{ $t('privacy.s4.sessionText') }}</li>
            <li><strong>{{ $t('privacy.s4.prefs') }}</strong> {{ $t('privacy.s4.prefsText') }}</li>
            <li><strong>{{ $t('privacy.s4.noTracking') }}</strong> {{ $t('privacy.s4.noTrackingText') }}</li>
          </ul>
          <p>{{ $t('privacy.s4.clear') }}</p>
        </section>

        <section id="push-notifications" class="privacy-section">
          <h2>{{ $t('privacy.s5.title') }}</h2>
          <p>{{ $t('privacy.s5.p1') }}</p>
          <p>{{ $t('privacy.s5.p2') }}</p>
          <p>{{ $t('privacy.s5.p3') }}</p>
        </section>

        <section id="security" class="privacy-section">
          <h2>{{ $t('privacy.s6.title') }}</h2>
          <p>{{ $t('privacy.s6.intro') }}</p>
          <ul>
            <li><strong>{{ $t('privacy.s6.isolation') }}</strong> {{ $t('privacy.s6.isolationText') }}</li>
            <li><strong>{{ $t('privacy.s6.transit') }}</strong> {{ $t('privacy.s6.transitText') }}</li>
            <li><strong>{{ $t('privacy.s6.hashing') }}</strong> {{ $t('privacy.s6.hashingText') }}</li>
            <li><strong>{{ $t('privacy.s6.tokens') }}</strong> {{ $t('privacy.s6.tokensText') }}</li>
            <li><strong>{{ $t('privacy.s6.dbEncryption') }}</strong> {{ $t('privacy.s6.dbEncryptionText') }}</li>
          </ul>
          <p>{{ $t('privacy.s6.disclaimer') }}</p>
        </section>

        <section id="your-rights" class="privacy-section">
          <h2>{{ $t('privacy.s7.title') }}</h2>
          <p>{{ $t('privacy.s7.intro') }}</p>
          <ul>
            <li><strong>{{ $t('privacy.s7.access') }}</strong> {{ $t('privacy.s7.accessText') }}</li>
            <li><strong>{{ $t('privacy.s7.correction') }}</strong> {{ $t('privacy.s7.correctionText') }}</li>
            <li><strong>{{ $t('privacy.s7.deletion') }}</strong> {{ $t('privacy.s7.deletionText') }}</li>
            <li><strong>{{ $t('privacy.s7.export') }}</strong> {{ $t('privacy.s7.exportText') }}</li>
            <li><strong>{{ $t('privacy.s7.objection') }}</strong> {{ $t('privacy.s7.objectionText') }}</li>
            <li><strong>{{ $t('privacy.s7.revoke') }}</strong> {{ $t('privacy.s7.revokeText') }}</li>
          </ul>
          <p>
            {{ $t('privacy.s7.contact', { email: 'hello@orkpad.com' }) }}
          </p>
        </section>

        <section id="retention" class="privacy-section">
          <h2>{{ $t('privacy.s8.title') }}</h2>
          <p>{{ $t('privacy.s8.p1') }}</p>
          <p>{{ $t('privacy.s8.p2') }}</p>
        </section>

        <section id="children" class="privacy-section">
          <h2>{{ $t('privacy.s9.title') }}</h2>
          <p>{{ $t('privacy.s9.text', { email: 'hello@orkpad.com' }) }}</p>
        </section>

        <section id="changes" class="privacy-section">
          <h2>{{ $t('privacy.s10.title') }}</h2>
          <p>{{ $t('privacy.s10.p1') }}</p>
          <p>{{ $t('privacy.s10.p2') }}</p>
        </section>

        <section id="contact" class="privacy-section">
          <h2>{{ $t('privacy.s11.title') }}</h2>
          <p>{{ $t('privacy.s11.text') }}</p>
          <div class="contact-block font-mono">
            <div><span class="contact-label">{{ $t('privacy.s11.company') }}</span> Comunidad de Orkpad</div>
            <div><span class="contact-label">{{ $t('privacy.s11.product') }}</span> Orkpad</div>
            <div>
              <span class="contact-label">{{ $t('privacy.s11.email') }}</span>
              <a href="mailto:hello@orkpad.com">hello@orkpad.com</a>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import WLogo from '@/components/ui/WLogo.vue'
import { useUIStore } from '@/stores/ui.store'

export default defineComponent({
  name: 'PrivacyPolicyPage',
  components: { WLogo },
  setup() {
    const uiStore = useUIStore()
    const themeClass = computed(() => (uiStore.theme === 'dark' ? 'theme-dark' : 'theme-light'))
    return { themeClass }
  },
})
</script>

<style scoped lang="scss">
.privacy-page {
  min-height: 100vh;
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-sans, 'Inter', sans-serif);
}

.privacy-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-base);
  backdrop-filter: blur(8px);
}

.privacy-header-inner {
  max-width: 860px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.privacy-back {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.15s;

  .material-symbols-outlined {
    font-size: 18px;
  }

  &:hover {
    color: var(--text-primary);
  }
}

.privacy-main {
  padding: 48px 24px 96px;
}

.privacy-container {
  max-width: 860px;
  margin: 0 auto;
}

.privacy-hero {
  margin-bottom: 48px;
  padding-bottom: 48px;
  border-bottom: 1px solid var(--border-subtle);
}

.privacy-title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.privacy-meta {
  font-size: 13px;
  color: var(--text-muted, var(--text-secondary));
  margin-bottom: 20px;
}

.privacy-intro {
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* Table of contents */
.privacy-toc {
  background: var(--bg-surface, var(--bg-elevated));
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 48px;

  .toc-label {
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--text-muted, var(--text-secondary));
    margin-bottom: 12px;
  }

  ol {
    list-style: decimal;
    padding-left: 20px;
    margin: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 24px;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }

  a {
    font-size: 14px;
    color: var(--color-primary, #7c3aed);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

/* Sections */
.privacy-section {
  margin-bottom: 56px;
  scroll-margin-top: 80px;

  h2 {
    font-size: 1.35rem;
    font-weight: 700;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-subtle);
  }

  h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 20px 0 8px;
    color: var(--text-secondary);
  }

  p {
    font-size: 15px;
    line-height: 1.75;
    color: var(--text-secondary);
    margin-bottom: 12px;
  }

  ul,
  ol {
    padding-left: 20px;
    margin-bottom: 12px;

    li {
      font-size: 15px;
      line-height: 1.75;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }
  }

  a {
    color: var(--color-primary, #7c3aed);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

/* Provider cards */
.provider-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.provider-card {
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 20px;

  .provider-name {
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--text-muted, var(--text-secondary));
    margin-bottom: 10px;
  }

  p {
    font-size: 13px;
    margin-bottom: 12px;
  }
}

.provider-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;

  .material-symbols-outlined {
    font-size: 14px;
  }
}

/* Contact block */
.contact-block {
  background: var(--bg-surface, var(--bg-elevated));
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 16px;

  .contact-label {
    display: inline-block;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--text-muted, var(--text-secondary));
    width: 72px;
  }

  a {
    color: var(--color-primary, #7c3aed);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
