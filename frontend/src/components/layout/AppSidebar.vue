<template>
  <div v-if="uiStore.sidebarOpen" class="sidebar-overlay" @click="uiStore.closeSidebar"></div>
  <aside :class="['app-sidebar', { 'sidebar--open': uiStore.sidebarOpen }]">
    <div class="sidebar-header">
      <div class="brand">
        <w-logo :height="28" />
      </div>
      <button class="mobile-close-btn" @click="uiStore.closeSidebar">
        <span class="material-symbols-outlined">close</span>
      </button>
      <div class="version">V1.0.4-STABLE</div>
    </div>

    <nav class="sidebar-nav">
      <div v-for="section in navSections" :key="section.label" class="nav-section">
        <button class="section-toggle" @click="toggleSection(section.label)">
          <span class="section-label">{{ section.label }}</span>
          <span
            class="material-symbols-outlined section-chevron"
            :class="{ 'section-chevron--open': isSectionOpen(section.label) }"
          >
            chevron_right
          </span>
        </button>
        <div class="section-items" :class="{ 'section-items--open': isSectionOpen(section.label) }">
          <div>
            <router-link
              v-for="item in section.items"
              :key="item.to"
              :to="item.to"
              class="nav-item"
              active-class="nav-item--active"
              :exact="!!item.exact"
            >
              <span class="material-symbols-outlined nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.text }}</span>
              <span v-if="item.to === '/app/messaging' && unreadMessages > 0" class="nav-badge">{{
                unreadMessages > 99 ? '99+' : unreadMessages
              }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div
        v-if="!onboardingStore.isComplete"
        class="setup-progress-hint"
        @click="onboardingStore.markVisible(true)"
      >
        <span class="material-symbols-outlined setup-hint-icon">rocket_launch</span>
        <span class="setup-hint-text"
          >Setup {{ onboardingStore.completedCount }}/{{ onboardingStore.totalCount }} ✓</span
        >
      </div>
      <router-link to="/app/settings" class="nav-item" active-class="nav-item--active">
        <span class="material-symbols-outlined nav-icon">settings</span>
        <span class="nav-label">{{ $t('sidebar.items.settings') }}</span>
      </router-link>
      <div class="user-profile">
        <w-avatar :name="user.name" :size="32" class="mr-3" />
        <div class="user-info">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-role">{{ user.role }}</div>
        </div>
      </div>
      <button class="nav-item logout-btn" @click="isLogoutModalOpen = true">
        <span class="material-symbols-outlined nav-icon">logout</span>
        <span class="nav-label">{{ $t('sidebar.items.logout') }}</span>
      </button>
    </div>

    <!-- Logout Confirmation -->
    <w-confirm-modal
      :is-open="isLogoutModalOpen"
      :title="$t('sidebar.logout_confirm.title', 'Cerrar Sesión')"
      :message="
        $t(
          'sidebar.logout_confirm.message',
          '¿Estás seguro de que deseas cerrar sesión? Perderás el acceso a tus datos actuales.',
        )
      "
      :confirm-text="$t('sidebar.items.logout', 'Cerrar Sesión')"
      :is-danger="true"
      @confirm="handleLogout"
      @cancel="isLogoutModalOpen = false"
    />
  </aside>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { useUIStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { useMessagingStore } from '@/stores/messaging.store'
import WAvatar from '@/components/ui/WAvatar.vue'
import WConfirmModal from '@/components/ui/WConfirmModal.vue'
import WLogo from '@/components/ui/WLogo.vue'
import { isAdminUser } from '@/utils/admin'

export default defineComponent({
  name: 'AppSidebar',
  components: { WAvatar, WConfirmModal, WLogo },
  setup() {
    const uiStore = useUIStore()
    const authStore = useAuthStore()
    const onboardingStore = useOnboardingStore()
    const messagingStore = useMessagingStore()
    const isLogoutModalOpen = ref(false)

    const user = computed(() => authStore.user || { name: '...', role: '...' })
    const unreadMessages = computed(() => messagingStore.totalUnread)

    const openSections = ref<Set<string>>(new Set())

    function toggleSection(label: string) {
      if (openSections.value.has(label)) {
        openSections.value.delete(label)
      } else {
        openSections.value.add(label)
      }
    }

    function isSectionOpen(label: string) {
      return openSections.value.has(label)
    }

    return {
      uiStore,
      authStore,
      onboardingStore,
      messagingStore,
      user,
      isLogoutModalOpen,
      unreadMessages,
      openSections,
      toggleSection,
      isSectionOpen,
      isAdminUser,
    }
  },
  computed: {
    navSections() {
      const sections = [
        {
          label: this.$t('sidebar.sections.work'),
          items: [
            { text: this.$t('sidebar.items.dashboard'), to: '/app/dashboard', icon: 'dashboard' },
            { text: this.$t('sidebar.items.projects'), to: '/app/projects', icon: 'assignment' },
            { text: this.$t('sidebar.items.tasks'), to: '/app/tasks', icon: 'task_alt' },
            {
              text: this.$t('sidebar.items.timeTracking'),
              to: '/app/time-tracking',
              icon: 'timer',
            },
            {
              text: this.$t('sidebar.items.notes', 'Pizarra'),
              to: '/app/notes',
              icon: 'edit_note',
            },
          ],
        },
        {
          label: this.$t('sidebar.sections.clients'),
          items: [
            { text: this.$t('sidebar.items.clients'), to: '/app/clients', icon: 'group' },
            {
              text: this.$t('sidebar.items.messaging', 'Mensajes'),
              to: '/app/messaging',
              icon: 'chat',
            },
          ],
        },
        {
          label: this.$t('sidebar.sections.sales'),
          items: [
            { text: this.$t('sidebar.items.pipeline'), to: '/app/pipeline', icon: 'account_tree' },
            /*      { text: 'Portfolio', to: '/app/portfolio', icon: 'person_pin' }, */
          ],
        },
        {
          label: this.$t('sidebar.sections.prospection'),
          items: [
            { text: this.$t('sidebar.items.leads'), to: '/app/leads', icon: 'contacts', exact: true },
            { text: this.$t('sidebar.items.leadSearches'), to: '/app/leads/searches', icon: 'travel_explore' },
            { text: this.$t('sidebar.items.leadCampaigns'), to: '/app/leads/campaigns', icon: 'mark_email_read' },
          ]
        },
        {
          label: this.$t('sidebar.sections.planning'),
          items: [
            { text: 'Planner', to: '/app/planner', icon: 'view_day' },
            { text: this.$t('sidebar.items.agenda'), to: '/app/agenda', icon: 'calendar_month' },
            { text: this.$t('sidebar.items.growth', 'Crecimiento'), to: '/app/growth', icon: 'rocket_launch' },
          ],
        },
        {
          label: this.$t('sidebar.sections.finance'),
          items: [
            { text: this.$t('sidebar.items.finance'), to: '/app/finance', icon: 'payments' },
            {
              text: this.$t('sidebar.items.quotes', 'Presupuestos'),
              to: '/app/quotes',
              icon: 'request_quote',
            },
          ],
        },
        {
          label: this.$t('sidebar.sections.operations'),
          items: [
            { text: this.$t('sidebar.items.myProducts'), to: '/app/products', icon: 'inventory_2' },
            {
              text: this.$t('sidebar.items.subscriptions'),
              to: '/app/subscriptions',
              icon: 'rebase_edit',
            },
            {
              text: this.$t('sidebar.items.infrastructure'),
              to: '/app/infrastructure',
              icon: 'terminal',
            },
          ],
        },
        {
          label: this.$t('sidebar.sections.monitoring', 'Monitoreo infra'),
          items: [
            {
              text: this.$t('sidebar.items.monitoringOverview', 'Resumen'),
              to: '/app/monitoring',
              icon: 'monitor_heart',
            },
            {
              text: 'Railway',
              to: '/app/railway',
              icon: 'rocket_launch',
            },
            {
              text: 'Netlify',
              to: '/app/netlify',
              icon: 'language',
            },
            // { text: this.$t('sidebar.items.supabase', 'Supabase'), to: '/app/supabase', icon: 'database' }, // hidden for now
            {
              text: this.$t('sidebar.items.integrations', 'Integraciones'),
              to: '/app/integrations',
              icon: 'electrical_services',
            },
          ],
        },
        {
          label: this.$t('sidebar.sections.knowledge'),
          items: [
            { text: this.$t('sidebar.items.docs'), to: '/app/docs', icon: 'description' },
            { text: 'Academia', to: '/app/resources', icon: 'school' },
          ],
        },
        {
          label: 'Marketing',
          items: [
            { text: 'Dashboard', to: '/app/marketing', icon: 'insights' },
            { text: 'Calendario', to: '/app/marketing/calendar', icon: 'calendar_month' },
            { text: 'Ideas', to: '/app/marketing/ideas', icon: 'lightbulb' },
            { text: 'Prompts', to: '/app/marketing/prompts', icon: 'auto_awesome' },
            { text: 'Posts', to: '/app/marketing/posts', icon: 'campaign' },
            { text: 'Identidad de Redes', to: '/app/social-identity', icon: 'fingerprint' },
          ],
        },
      ]

      if (this.isAdminUser(this.user?._id)) {
        sections.push({
          label: 'Admin',
          items: [{ text: 'Usuarios', to: '/app/admin-users', icon: 'admin_panel_settings' }],
        })
      }

      return sections
    },
  },
  methods: {
    async handleLogout() {
      await this.authStore.logout()
      this.$router.push('/login')
    },
    openSectionForRoute() {
      const currentPath = this.$route?.path
      if (!currentPath) return
      for (const section of this.navSections) {
        if (section.items.some((item: { to: string }) => currentPath.startsWith(item.to))) {
          this.openSections.add(section.label)
        }
      }
    },
  },
  watch: {
    $route() {
      this.uiStore.closeSidebar()
      this.openSectionForRoute()
    },
  },
  mounted() {
    this.openSectionForRoute()
  },
})
</script>

<style scoped>
.app-sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background-color: var(--color-bg-base);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: transform 0.3s ease;
}

@media (max-width: 1024px) {
  .app-sidebar {
    transform: translateX(-100%);
  }
  .sidebar--open {
    transform: translateX(0);
  }
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-overlay);
  z-index: 99;
}

.sidebar-header {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mobile-close-btn {
  display: none;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
}

@media (max-width: 1024px) {
  .mobile-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-text {
  font-family: var(--font-body);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-base);
  letter-spacing: -0.05em;
}

.brand-square {
  width: 16px;
  height: 16px;
  background-color: var(--color-primary);
}

.version {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-disabled);
  margin-top: 4px;
}

.sidebar-nav {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 0 24px 0;
}

.nav-section {
  margin-bottom: 2px;
}

.section-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 8px 24px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  transition:
    background 0.15s,
    color 0.15s;
}

.section-toggle:hover {
  background-color: var(--color-bg-surface-highest);
  color: var(--color-text-base);
}

.section-label {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.section-chevron {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.section-chevron--open {
  transform: rotate(90deg);
}

.section-items {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease;
  overflow: hidden;
}

.section-items--open {
  grid-template-rows: 1fr;
}

.section-items > * {
  min-height: 0;
  overflow: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 24px;
  color: var(--color-text-muted);
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  transition: all 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.nav-item:hover {
  background-color: var(--color-bg-surface-highest);
  color: var(--color-text-base);
}

.nav-item--active {
  background-color: var(--color-primary) !important;
  color: white !important;
}

.nav-icon {
  font-size: 18px;
}

.sidebar-footer {
  padding: 16px 0;
  border-top: 1px solid var(--color-border);
}

.user-profile {
  display: flex;
  align-items: center;
  padding: 16px 24px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-base);
}

.user-role {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-primary);
  margin-top: 2px;
}

.logout-btn {
  color: var(--color-error);
}

.logout-btn:hover {
  background-color: rgba(239, 68, 68, 0.05);
  color: var(--color-error);
}

.mr-3 {
  margin-right: 12px;
}

.nav-badge {
  margin-left: auto;
  background: var(--color-primary);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  font-family: var(--font-mono);
  line-height: 16px;
}

.nav-item--active .nav-badge {
  background: white;
  color: var(--color-primary);
}

.setup-progress-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 24px;
  cursor: pointer;
  color: var(--color-primary);
  transition: background 0.15s;
}

.setup-progress-hint:hover {
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
}

.setup-hint-icon {
  font-size: 16px;
}

.setup-hint-text {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
