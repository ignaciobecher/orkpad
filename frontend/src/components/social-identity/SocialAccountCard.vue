<template>
  <div class="account-card" :style="{ borderLeftColor: account.color || 'var(--color-primary)' }" @click="$emit('view', account)">
    <div class="account-card__header">
      <span class="account-card__emoji">{{ account.emoji || '📱' }}</span>
      <span class="account-card__name">{{ account.accountName }}</span>
    </div>

    <div class="account-card__meta">
      <w-badge>{{ PLATFORM_LABELS[account.platform] || account.platform }}</w-badge>
      <w-badge color="var(--color-text-muted)">{{ PURPOSE_LABELS[account.purpose] || account.purpose }}</w-badge>
    </div>

    <div class="account-card__followers">
      <span class="material-symbols-outlined">group</span>
      {{ account.followersCount }} seguidores
    </div>

    <div v-if="account.lastWeekMetrics" class="account-card__stats">
      <div class="stat">
        <span class="stat__value">{{ account.lastWeekMetrics.postsPublished }}</span>
        <span class="stat__label">Posts</span>
      </div>
      <div class="stat">
        <span class="stat__value">{{ account.lastWeekMetrics.messagesSent }}</span>
        <span class="stat__label">Mensajes</span>
      </div>
      <div class="stat">
        <span class="stat__value">{{ account.lastWeekMetrics.responsesReceived }}</span>
        <span class="stat__label">Respuestas</span>
      </div>
    </div>

    <div class="account-card__footer">
      <w-button variant="secondary" @click.stop="$emit('view', account)">Ver identidad</w-button>
      <w-button variant="ghost" @click.stop="$emit('register-week', account)">Registrar semana</w-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import WBadge from '@/components/ui/WBadge.vue'
import WButton from '@/components/ui/WButton.vue'
import type { SocialAccountSummary } from '@/api/social-identity/social-identity.types'

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  twitter: 'Twitter/X',
  youtube: 'YouTube',
  email: 'Email',
}

const PURPOSE_LABELS: Record<string, string> = {
  clients: 'Clientes',
  founders: 'Founders',
  devs: 'Devs',
  saas: 'SaaS',
  mixed: 'Mixto',
}

export default defineComponent({
  name: 'SocialAccountCard',
  components: { WBadge, WButton },
  props: {
    account: { type: Object as PropType<SocialAccountSummary>, required: true },
  },
  emits: ['view', 'register-week'],
  setup() {
    return { PLATFORM_LABELS, PURPOSE_LABELS }
  },
})
</script>

<style scoped>
.account-card {
  background: var(--color-bg-surface); border: 1px solid var(--color-border); border-left-width: 4px;
  border-radius: 8px; padding: 16px; cursor: pointer; transition: all 0.2s;
  display: flex; flex-direction: column; gap: 12px;
}
.account-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }

.account-card__header { display: flex; align-items: center; gap: 8px; }
.account-card__emoji { font-size: 20px; }
.account-card__name { font-family: var(--font-body); font-size: 14px; font-weight: 600; color: var(--color-text-base); }

.account-card__meta { display: flex; gap: 6px; flex-wrap: wrap; }

.account-card__followers { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); }
.account-card__followers .material-symbols-outlined { font-size: 14px; }

.account-card__stats { display: flex; gap: 16px; padding-top: 8px; border-top: 1px solid var(--color-border); }
.stat { display: flex; flex-direction: column; gap: 2px; }
.stat__value { font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--color-text-base); }
.stat__label { font-family: var(--font-mono); font-size: 9px; text-transform: uppercase; color: var(--color-text-muted); }

.account-card__footer { display: flex; gap: 8px; }
.account-card__footer .w-btn { flex: 1; }
</style>
