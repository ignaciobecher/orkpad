<template>
  <div class="detail-page">
    <div v-if="store.loading && !account" class="state-message">
      <span class="material-symbols-outlined spinning">sync</span>
      Cargando cuenta...
    </div>

    <template v-else-if="account">
      <header class="page-header">
        <button class="back-btn" @click="goBack">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <span class="account-emoji">{{ account.emoji || '📱' }}</span>
        <div class="header-info">
          <h1 class="page-title">{{ account.accountName }}</h1>
          <span class="account-handle">{{ account.handle }}</span>
        </div>
        <w-button variant="secondary" @click="showDuplicateModal = true">Duplicar cuenta</w-button>
      </header>

      <div class="tabs-header">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <identity-tab v-if="activeTab === 'identity'" :account="account" @save="onUpdate" />
        <audience-tab v-else-if="activeTab === 'audience'" :account="account" @save="onUpdate" />
        <pillars-tab v-else-if="activeTab === 'pillars'" :account="account" @add="onAddPillar" @remove="onRemovePillar" />
        <style-rules-tab v-else-if="activeTab === 'style'" :account="account" @save="onUpdate" />
        <templates-tab v-else-if="activeTab === 'templates'" :account="account" @add="onAddTemplate" @remove="onRemoveTemplate" />
        <prospecting-tab v-else-if="activeTab === 'prospecting'" :account="account" @save="onUpdate" />
        <metrics-tab v-else-if="activeTab === 'metrics'" :account="account" @add="onAddMetric" />
      </div>
    </template>

    <duplicate-account-modal v-model="showDuplicateModal" @duplicate="onDuplicate" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSocialIdentityStore } from '@/stores/social-identity.store'
import WButton from '@/components/ui/WButton.vue'
import IdentityTab from '@/components/social-identity/tabs/IdentityTab.vue'
import AudienceTab from '@/components/social-identity/tabs/AudienceTab.vue'
import PillarsTab from '@/components/social-identity/tabs/PillarsTab.vue'
import StyleRulesTab from '@/components/social-identity/tabs/StyleRulesTab.vue'
import TemplatesTab from '@/components/social-identity/tabs/TemplatesTab.vue'
import ProspectingTab from '@/components/social-identity/tabs/ProspectingTab.vue'
import MetricsTab from '@/components/social-identity/tabs/MetricsTab.vue'
import DuplicateAccountModal from '@/components/social-identity/DuplicateAccountModal.vue'
import type {
  UpdateSocialAccountDto,
  ContentPillar,
  MessageTemplate,
  AddWeeklyMetricDto,
} from '@/api/social-identity/social-identity.types'

const TABS = [
  { key: 'identity', label: 'Identidad' },
  { key: 'audience', label: 'Audiencia' },
  { key: 'pillars', label: 'Pilares' },
  { key: 'style', label: 'Estilo' },
  { key: 'templates', label: 'Templates' },
  { key: 'prospecting', label: 'Prospección' },
  { key: 'metrics', label: 'Métricas' },
]

export default defineComponent({
  name: 'SocialIdentityDetailPage',
  components: {
    WButton,
    IdentityTab,
    AudienceTab,
    PillarsTab,
    StyleRulesTab,
    TemplatesTab,
    ProspectingTab,
    MetricsTab,
    DuplicateAccountModal,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useSocialIdentityStore()
    const activeTab = ref('identity')
    const showDuplicateModal = ref(false)

    const accountId = computed(() => route.params.id as string)
    const account = computed(() => store.selected)

    onMounted(() => {
      store.fetchById(accountId.value)
    })

    function goBack() {
      router.push({ name: 'social-identity' })
    }

    async function onUpdate(dto: UpdateSocialAccountDto) {
      await store.updateAccount(accountId.value, dto)
    }

    async function onAddPillar(pillar: ContentPillar) {
      await store.addPillar(accountId.value, pillar)
    }

    async function onRemovePillar(pillarId: string) {
      await store.removePillar(accountId.value, pillarId)
    }

    async function onAddTemplate(template: MessageTemplate) {
      await store.addTemplate(accountId.value, template)
    }

    async function onRemoveTemplate(templateId: string) {
      await store.removeTemplate(accountId.value, templateId)
    }

    async function onAddMetric(dto: AddWeeklyMetricDto) {
      await store.addMetric(accountId.value, dto)
    }

    async function onDuplicate(payload: { platform: string; accountName: string }) {
      try {
        const duplicated = await store.duplicateAccount(accountId.value, payload.platform, payload.accountName)
        showDuplicateModal.value = false
        router.push({ name: 'social-identity-detail', params: { id: duplicated._id } })
      } catch {
        // error toast shown by the store
      }
    }

    return {
      store,
      account,
      activeTab,
      showDuplicateModal,
      TABS,
      goBack,
      onUpdate,
      onAddPillar,
      onRemovePillar,
      onAddTemplate,
      onRemoveTemplate,
      onAddMetric,
      onDuplicate,
    }
  },
})
</script>

<style scoped>
.detail-page { padding: 24px 32px; display: flex; flex-direction: column; gap: 24px; min-height: 100%; }

.state-message { display: flex; align-items: center; gap: 8px; justify-content: center; padding: 48px; color: var(--color-text-muted); font-family: var(--font-mono); font-size: 12px; }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.page-header { display: flex; align-items: center; gap: 12px; }
.back-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; display: flex; align-items: center; padding: 4px; }
.back-btn:hover { color: var(--color-text-base); }
.account-emoji { font-size: 24px; }
.header-info { flex: 1; display: flex; flex-direction: column; }
.page-title { font-family: var(--font-mono); font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: -0.02em; color: var(--color-text-base); margin: 0; }
.account-handle { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); }

.tabs-header { display: flex; gap: 4px; border-bottom: 1px solid var(--color-border); overflow-x: auto; }
.tab-btn {
  background: none; border: none; padding: 10px 14px; cursor: pointer; white-space: nowrap;
  font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--color-text-muted); border-bottom: 2px solid transparent; transition: all 0.15s;
}
.tab-btn:hover { color: var(--color-text-base); }
.tab-btn.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }

.tab-content { padding-top: 8px; }
</style>
