<template>
  <div v-if="win95.startOpen" class="w95-startmenu w95-outset" @click.stop>
    <div class="startmenu-inner">
      <div class="w95-startmenu-side">Orkpad<span class="side-95">95</span></div>
      <div class="startmenu-items">
        <div class="startmenu-group-label">Programas</div>
        <router-link
          v-for="item in mainItems"
          :key="item.to"
          :to="item.to"
          class="w95-startmenu-item"
          :class="{ 'w95-startmenu-item--active': isActive(item.route) }"
          @click="win95.toggleStart(false)"
        >
          <win-icon :name="item.icon" :size="32" :alt="item.text" />
          <span>{{ item.text }}</span>
        </router-link>
        <div class="w95-separator" style="margin: 4px 2px"></div>
        <div class="startmenu-group-label">Sistema</div>
        <router-link
          v-for="item in sysItems"
          :key="item.to"
          :to="item.to"
          class="w95-startmenu-item"
          @click="win95.toggleStart(false)"
        >
          <win-icon :name="item.icon" :size="32" :alt="item.text" />
          <span>{{ item.text }}</span>
        </router-link>
        <div class="w95-separator" style="margin: 4px 2px"></div>
        <button
          v-if="!onboardingStore.isComplete"
          class="w95-startmenu-item reopen-setup"
          @click="reopenSetup"
        >
          <win-icon name="dir-check" :size="32" alt="Asistente" />
          <span>Asistente de setup</span>
        </button>
        <button class="w95-startmenu-item close-all" @click="closeAllWindows">
          <win-icon name="file-lines" :size="32" alt="Cerrar ventanas" />
          <span>Cerrar todas las ventanas</span>
        </button>
        <button class="w95-startmenu-item logout" @click="askLogout">
          <win-icon name="shutdown" :size="32" :alt="$t('sidebar.items.logout', 'Apagar...')" />
          <span>{{ $t('sidebar.items.logout', 'Apagar...') }}</span>
        </button>
      </div>
    </div>
    <w-confirm-modal
      :is-open="showLogout"
      :title="$t('sidebar.logout_confirm.title', 'Apagar Windows')"
      :message="$t('sidebar.logout_confirm.message', '¿Estás seguro de que deseas cerrar sesión?')"
      :confirm-text="$t('sidebar.items.logout', 'Aceptar')"
      :is-danger="true"
      @confirm="doLogout"
      @cancel="showLogout = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useWin95Store } from '@/stores/win95.store'
import { useAuthStore } from '@/stores/auth.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import WConfirmModal from '@/components/ui/WConfirmModal.vue'
import WinIcon from './WinIcon.vue'

export default defineComponent({
  name: 'WinStartMenu',
  components: { WConfirmModal, WinIcon },
  setup() {
    const win95 = useWin95Store()
    const authStore = useAuthStore()
    const onboardingStore = useOnboardingStore()
    const showLogout = ref(false)
    return { win95, authStore, onboardingStore, showLogout }
  },
  computed: {
    mainItems() {
      return [
        { text: this.$t('sidebar.items.dashboard'), to: '/app/dashboard', icon: 'computer', route: 'dashboard' },
        { text: this.$t('sidebar.items.projects'), to: '/app/projects', icon: 'briefcase', route: 'projects' },
        { text: this.$t('sidebar.items.tasks'), to: '/app/tasks', icon: 'check', route: 'tasks' },
        { text: 'Planner', to: '/app/planner', icon: 'user-calendar', route: 'planner' },
        { text: this.$t('sidebar.items.agenda'), to: '/app/agenda', icon: 'calendar', route: 'agenda' },
        { text: this.$t('sidebar.items.clients'), to: '/app/clients', icon: 'users', route: 'clients' },
        { text: this.$t('sidebar.items.finance'), to: '/app/finance', icon: 'calculator', route: 'finance' },
        { text: this.$t('sidebar.items.quotes', 'Presupuestos'), to: '/app/quotes', icon: 'newspaper', route: 'quotes' },
      ]
    },
    sysItems() {
      return [
        { text: this.$t('sidebar.items.docs'), to: '/app/docs', icon: 'wordpad', route: 'docs' },
        { text: this.$t('sidebar.items.reports', 'Reportes'), to: '/app/reports', icon: 'chart', route: 'reports' },
        { text: this.$t('sidebar.items.integrations', 'Integraciones'), to: '/app/integrations', icon: 'network', route: 'integrations' },
        { text: this.$t('sidebar.items.settings'), to: '/app/settings', icon: 'settings', route: 'settings' },
      ]
    },
  },
  methods: {
    isActive(route: string) {
      return this.win95.activeRoute === route
    },
    closeAllWindows() {
      this.win95.closeAll('dashboard')
      this.win95.ensureWindow('dashboard')
      this.$router.push({ name: 'dashboard' as never }).catch(() => {})
    },
    reopenSetup() {
      this.win95.toggleStart(false)
      this.onboardingStore.markVisible(true)
    },
    askLogout() {
      this.showLogout = true
    },
    async doLogout() {
      this.showLogout = false
      this.win95.toggleStart(false)
      await this.authStore.logout()
      this.$router.push('/login')
    },
  },
})
</script>

<style scoped>
.startmenu-inner {
  display: flex;
  min-height: 200px;
}
.startmenu-items {
  flex: 1;
  padding: 2px;
}
.startmenu-group-label {
  font-size: 10px;
  color: var(--w95-shadow);
  padding: 4px 10px 2px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.side-95 {
  color: var(--w95-face);
  font-weight: bold;
}
.logout, .close-all, .reopen-setup {
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  font-family: inherit;
  font-size: inherit;
}
</style>
