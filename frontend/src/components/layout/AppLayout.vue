<template>
  <div class="app-layout">
    <w-top-loading-bar />
    <app-sidebar />
    <div class="app-main-wrapper">
      <app-topbar />
      <main class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    <w-toast-container />
    <onboarding-modal />
    <setup-checklist />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
import WToastContainer from '../ui/WToastContainer.vue'
import WTopLoadingBar from '../ui/WTopLoadingBar.vue'
import OnboardingModal from '../onboarding/OnboardingModal.vue'
import SetupChecklist from '../onboarding/SetupChecklist.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useBrandingStore } from '@/stores/branding.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { useNotificationsStore } from '@/stores/notifications.store'

export default defineComponent({
  name: 'AppLayout',
  components: {
    AppSidebar,
    AppTopbar,
    WToastContainer,
    WTopLoadingBar,
    OnboardingModal,
    SetupChecklist,
  },
  setup() {
    return {
      authStore: useAuthStore(),
      onboardingStore: useOnboardingStore(),
      notificationsStore: useNotificationsStore(),
    }
  },
  watch: {
    'authStore.user': {
      immediate: true,
      handler(user) {
        if (user) {
          useBrandingStore().fetch()
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
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg-base);
}

.app-main-wrapper {
  flex-grow: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

@media (max-width: 1024px) {
  .app-main-wrapper {
    margin-left: 0;
  }
}

.app-content {
  padding-top: var(--topbar-height);
  flex-grow: 1;
  min-height: calc(100vh - var(--topbar-height));
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
