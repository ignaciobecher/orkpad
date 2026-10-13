<template>
  <div class="w95-desktop" @click="closeStart">
    <w-top-loading-bar />
    <win-desktop-icons />

    <!-- Ventana activa estilo Win95 (oculta si está minimizada: ver escritorio) -->
    <win-window
      v-if="currentWin && !currentWin.minimized"
      :key="currentWin.route"
      :win="currentWin"
      :status-left="statusLeft"
      status-right="ORKPAD95"
    >
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </win-window>

    <!-- Ventanas minimizadas siguen en taskbar vía store -->
    <win-start-menu @click.stop />
    <win-taskbar @click.stop />
    <w-toast-container />
    <onboarding-modal />
    <setup-checklist />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import WinWindow from '@/components/win95/WinWindow.vue'
import WinTaskbar from '@/components/win95/WinTaskbar.vue'
import WinStartMenu from '@/components/win95/WinStartMenu.vue'
import WinDesktopIcons from '@/components/win95/WinDesktopIcons.vue'
import WToastContainer from '@/components/ui/WToastContainer.vue'
import WTopLoadingBar from '@/components/ui/WTopLoadingBar.vue'
import OnboardingModal from '@/components/onboarding/OnboardingModal.vue'
import SetupChecklist from '@/components/onboarding/SetupChecklist.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useBrandingStore } from '@/stores/branding.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useWin95Store } from '@/stores/win95.store'

export default defineComponent({
  name: 'WinDesktopLayout',
  components: {
    WinWindow,
    WinTaskbar,
    WinStartMenu,
    WinDesktopIcons,
    WToastContainer,
    WTopLoadingBar,
    OnboardingModal,
    SetupChecklist,
  },
  setup() {
    const route = useRoute()
    const win95 = useWin95Store()
    const authStore = useAuthStore()
    const brandingStore = useBrandingStore()
    const onboardingStore = useOnboardingStore()
    const notificationsStore = useNotificationsStore()
    return { route, win95, authStore, brandingStore, onboardingStore, notificationsStore }
  },
  computed: {
    currentWin() {
      const name = String(this.route.name || 'dashboard')
      return this.win95.windows.find((w) => w.route === name)
    },
    statusLeft(): string {
      const p = this.route.path || ''
      return `C:\\ORKPAD\\${String(this.route.name || '').toUpperCase()}  —  ${p}`
    },
  },
  methods: {
    closeStart() {
      this.win95.toggleStart(false)
    },
  },
  watch: {
    '$route.name': {
      immediate: true,
      handler(name) {
        if (name) this.win95.ensureWindow(String(name))
      },
    },
    'authStore.user': {
      immediate: true,
      handler(user) {
        if (user) {
          this.brandingStore.fetch()
          this.onboardingStore.checkAndShow(user._id)
          this.onboardingStore.maybeShowWelcome(this.authStore.justLoggedInFirstTime)
          this.authStore.justLoggedInFirstTime = false
          this.notificationsStore.fetchUnreadCount()
        }
      },
    },
  },
})
</script>

<style scoped>
.w95-desktop {
  min-height: 100vh;
  background: var(--w95-teal);
  padding-bottom: var(--w95-taskbar-height);
  overflow: hidden;
}
</style>
