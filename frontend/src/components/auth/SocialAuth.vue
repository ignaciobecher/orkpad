<template>
  <div class="social-auth">
    <div class="social-divider">
      <span>{{ $t('auth.social.orContinueWith') }}</span>
    </div>

    <div class="social-buttons">
      <button type="button" class="social-btn github-btn" @click="loginWithGithub">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
          />
        </svg>
        <span>GitHub</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { baseURL } from '@/api/axios.config'

export default defineComponent({
  name: 'SocialAuth',
  props: {
    mode: {
      type: String as () => 'login' | 'register',
      default: 'login',
    },
  },
  methods: {
    loginWithGithub() {
      localStorage.setItem('github_auth_mode', this.mode)
      window.location.href = `${baseURL}/auth/github`
    },
  },
})
</script>

<style scoped>
.social-auth {
  margin-top: 24px;
}

.social-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
}

.social-divider::before,
.social-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--color-border);
}

.social-divider span {
  padding: 0 12px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.social-buttons {
  display: flex;
  gap: 12px;
}

@media (max-width: 480px) {
  .social-buttons {
    flex-direction: column;
  }
}

.social-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-base);
}

.social-btn:hover:not(:disabled) {
  background-color: var(--color-bg-base);
  border-color: var(--color-primary);
}

.social-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.google-btn svg {
  flex-shrink: 0;
}

.github-btn svg {
  color: var(--color-text-base);
}
</style>
