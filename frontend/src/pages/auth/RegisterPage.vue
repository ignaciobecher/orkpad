<template>
  <auth-layout>
    <div class="login-card">
      <div class="login-header">
        <div class="brand">
          <w-logo :height="52" />
        </div>
        <h2 class="login-title">{{ $t('auth.register.title') }}</h2>
      </div>

      <form class="login-form" @submit.prevent="handleRegister">
        <w-input
          v-model="form.name"
          :label="$t('auth.register.name')"
          placeholder="Ej: Juan Pérez"
          id="name"
          type="text"
        />
        <w-input
          v-model="form.email"
          :label="$t('auth.register.email')"
          placeholder="USUARIO@DOMINIO.COM"
          id="email"
          type="email"
        />
        <w-input
          v-model="form.password"
          :label="$t('auth.register.password')"
          type="password"
          placeholder="••••••••"
          id="password"
        />

        <div class="terms-section">
          <w-checkbox v-model="form.termsAccepted">
            {{ $t('auth.register.termsAccepted') }}
          </w-checkbox>
          <button type="button" class="read-terms-btn" @click="showTerms = true">
            {{ $t('auth.register.readTerms') }}
          </button>
        </div>

        <div v-if="error" class="error-notice">
          <span class="material-symbols-outlined">error</span>
          <span>{{ error }}</span>
        </div>

        <div class="login-actions">
          <w-button
            variant="primary"
            block
            :loading="loading"
            type="submit"
            :disabled="!form.termsAccepted"
          >
            {{ $t('auth.register.submit') }}
            <span class="material-symbols-outlined ml-2">arrow_forward</span>
          </w-button>
        </div>

        <div class="login-footer">
          <router-link to="/login" class="forgot-link"
            >{{ $t('auth.register.alreadyHaveAccount') }} {{ $t('auth.login.submit') }}</router-link
          >
        </div>
      </form>
    </div>

    <w-drawer v-model="showTerms" :title="$t('auth.register.terms.title')" width="550px">
      <div class="terms-content">
        <p class="terms-intro">{{ $t('auth.register.terms.intro') }}</p>

        <div v-for="(section, idx) in termsSections" :key="idx" class="terms-block">
          <h3>{{ section.title }}</h3>
          <p>{{ section.content }}</p>
        </div>

        <div class="terms-summary-box">
          <h3 class="summary-title">{{ $t('auth.register.terms.summary.title') }}</h3>
          <ul class="summary-list">
            <li v-for="(item, idx) in termsSummaryItems" :key="idx">
              <span class="material-symbols-outlined">check_circle</span>
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="terms-footer">
          <w-button variant="primary" block @click="showTerms = false">
            {{ $t('common.cancel') }}
          </w-button>
        </div>
      </div>
    </w-drawer>
  </auth-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import WButton from '@/components/ui/WButton.vue'
import WInput from '@/components/ui/WInput.vue'
import WCheckbox from '@/components/ui/WCheckbox.vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import WLogo from '@/components/ui/WLogo.vue'

export default defineComponent({
  name: 'RegisterPage',
  components: { AuthLayout, WButton, WInput, WCheckbox, WDrawer, WLogo },
  data() {
    return {
      showTerms: false,
      form: {
        name: '',
        email: '',
        password: '',
        termsAccepted: false,
      },
    }
  },
  computed: {
    ...mapState(useAuthStore, ['loading', 'error', 'pendingEmailVerification']),
    termsSections() {
      return this.$tm('auth.register.terms.sections') as any[]
    },
    termsSummaryItems() {
      return this.$tm('auth.register.terms.summary.items') as string[]
    },
  },
  methods: {
    ...mapActions(useAuthStore, ['register']),
    async handleRegister() {
      if (!this.form.termsAccepted) return
      try {
        await this.register(this.form)
        if (this.pendingEmailVerification) {
          this.$router.push('/auth/email-pending')
        } else {
          this.$router.push('/app/dashboard')
        }
      } catch {
        // error is stored in auth store and displayed via this.error
      }
    },
  },
})
</script>

<style scoped>
.login-card {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 40px;
  position: relative;
}

@media (max-width: 640px) {
  .login-card {
    padding: 24px;
    border: none;
    background: transparent;
  }
}

.login-header {
  margin-bottom: 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.brand-text {
  font-family: var(--font-body);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
  letter-spacing: -0.05em;
}

.brand-square {
  width: 16px;
  height: 16px;
  background-color: var(--color-primary);
}

.login-title {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-base);
}

.terms-section {
  margin-top: 24px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.read-terms-btn {
  background: none;
  border: none;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-primary);
  text-transform: uppercase;
  cursor: pointer;
  width: fit-content;
  padding: 4px 0;
  text-align: left;
}

@media (max-width: 640px) {
  .read-terms-btn {
    text-align: center;
    width: 100%;
    margin-bottom: 8px;
  }
}

.read-terms-btn:hover {
  text-decoration: underline;
}

.error-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background-color: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.3);
  margin-bottom: 16px;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-error);
}

.error-notice .material-symbols-outlined {
  font-size: 18px;
  flex-shrink: 0;
}

.login-actions {
  margin-top: 12px;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.forgot-link {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-decoration: none;
  text-transform: uppercase;
}

.forgot-link:hover {
  color: var(--color-primary);
}

.terms-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 0;
}

.terms-intro {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-base);
  line-height: 1.6;
}

.terms-block h3 {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
}

.terms-block p {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.terms-summary-box {
  background-color: rgba(91, 78, 255, 0.05);
  border: 1px solid rgba(91, 78, 255, 0.2);
  padding: 20px;
  border-radius: 8px;
  margin-top: 8px;
}

.summary-title {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  margin-bottom: 12px;
  letter-spacing: 0.05em;
}

.summary-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-base);
  line-height: 1.4;
}

.summary-list li span {
  font-size: 18px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.terms-footer {
  margin-top: 16px;
}

.ml-2 {
  margin-left: 8px;
}
</style>
