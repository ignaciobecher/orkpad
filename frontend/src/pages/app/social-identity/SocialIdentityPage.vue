<template>
  <div class="social-identity-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Identidad de Redes</h1>
        <span class="accounts-count">{{ store.summary.length }} cuentas</span>
      </div>
      <div class="header-right">
        <w-button variant="primary" @click="openCreate">
          <span class="material-symbols-outlined mr-2">add</span>
          Nueva cuenta
        </w-button>
      </div>
    </header>

    <main class="page-content">
      <div v-if="store.loading && !store.summary.length" class="state-message">
        <span class="material-symbols-outlined spinning">sync</span>
        Cargando cuentas...
      </div>

      <w-empty-state
        v-else-if="!store.summary.length"
        title="Todavía no creaste cuentas"
        message="Definí la identidad estratégica de cada red social que manejás"
      >
        <template #icon>
          <span class="material-symbols-outlined">fingerprint</span>
        </template>
        <template #action>
          <w-button variant="primary" @click="openCreate">
            <span class="material-symbols-outlined mr-2">add</span>
            Primera cuenta
          </w-button>
        </template>
      </w-empty-state>

      <div v-else class="accounts-grid">
        <social-account-card
          v-for="account in store.summary"
          :key="account.id"
          :account="account"
          @view="goToDetail"
          @register-week="openMetrics"
        />
      </div>
    </main>

    <social-account-form-modal v-model="showFormModal" @save="onSaveForm" />

    <w-drawer v-model="showMetricsModal" title="Registrar semana" width="440px">
      <add-metric-form
        v-if="metricsAccountId"
        :loading="store.loading"
        @submit="onSubmitMetrics"
      />
    </w-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSocialIdentityStore } from '@/stores/social-identity.store'
import WButton from '@/components/ui/WButton.vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import WEmptyState from '@/components/ui/WEmptyState.vue'
import SocialAccountCard from '@/components/social-identity/SocialAccountCard.vue'
import SocialAccountFormModal from '@/components/social-identity/SocialAccountFormModal.vue'
import AddMetricForm from '@/components/social-identity/AddMetricForm.vue'
import type { CreateSocialAccountDto, AddWeeklyMetricDto, SocialAccountSummary } from '@/api/social-identity/social-identity.types'

export default defineComponent({
  name: 'SocialIdentityPage',
  components: { WButton, WDrawer, WEmptyState, SocialAccountCard, SocialAccountFormModal, AddMetricForm },
  setup() {
    const store = useSocialIdentityStore()
    const router = useRouter()

    const showFormModal = ref(false)
    const showMetricsModal = ref(false)
    const metricsAccountId = ref<string | null>(null)

    onMounted(() => {
      store.fetchSummary()
    })

    function openCreate() {
      showFormModal.value = true
    }

    function goToDetail(account: SocialAccountSummary) {
      router.push({ name: 'social-identity-detail', params: { id: account.id } })
    }

    function openMetrics(account: SocialAccountSummary) {
      metricsAccountId.value = account.id
      showMetricsModal.value = true
    }

    async function onSaveForm(dto: CreateSocialAccountDto) {
      try {
        await store.createAccount(dto)
        showFormModal.value = false
      } catch {
        // error toast shown by the store
      }
    }

    async function onSubmitMetrics(dto: AddWeeklyMetricDto) {
      if (!metricsAccountId.value) return
      try {
        await store.addMetric(metricsAccountId.value, dto)
        showMetricsModal.value = false
        metricsAccountId.value = null
      } catch {
        // error toast shown by the store
      }
    }

    return {
      store,
      showFormModal,
      showMetricsModal,
      metricsAccountId,
      openCreate,
      goToDetail,
      openMetrics,
      onSaveForm,
      onSubmitMetrics,
    }
  },
})
</script>

<style scoped>
.social-identity-page { padding: 24px 32px; display: flex; flex-direction: column; gap: 24px; min-height: 100%; }

.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.header-left { display: flex; align-items: baseline; gap: 12px; }
.page-title { font-family: var(--font-mono); font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: -0.02em; color: var(--color-text-base); margin: 0; }
.accounts-count { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); }
.header-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.state-message { display: flex; align-items: center; gap: 8px; justify-content: center; padding: 48px; color: var(--color-text-muted); font-family: var(--font-mono); font-size: 12px; }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
</style>
