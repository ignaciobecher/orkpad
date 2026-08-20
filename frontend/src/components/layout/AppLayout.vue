<template>
  <div class="app-layout">
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
    <support-fab />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
import WToastContainer from '../ui/WToastContainer.vue'
import OnboardingModal from '../onboarding/OnboardingModal.vue'
import SetupChecklist from '../onboarding/SetupChecklist.vue'
import SupportFab from '../support/SupportFab.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { useMessagingStore } from '@/stores/messaging.store'
import { useNotificationsStore } from '@/stores/notifications.store'

export default defineComponent({
  name: 'AppLayout',
  components: {
    AppSidebar,
    AppTopbar,
    WToastContainer,
    OnboardingModal,
    SetupChecklist,
    SupportFab,
  },
  setup() {
    return {
      authStore: useAuthStore(),
      onboardingStore: useOnboardingStore(),
      messagingStore: useMessagingStore(),
      notificationsStore: useNotificationsStore(),
    }
  },
  watch: {
    'authStore.user': {
      immediate: true,
      handler(user) {
        if (user) {
          this.onboardingStore.checkAndShow(user._id)
          this.onboardingStore.maybeShowWelcome(this.authStore.justLoggedInFirstTime)
          this.authStore.justLoggedInFirstTime = false
          this.messagingStore.fetchConversations()
          this.messagingStore.connectSocket()
          this.notificationsStore.fetchUnreadCount()
        }
      },
    },
  },
  beforeUnmount() {
    this.messagingStore.disconnectSocket()
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
