<template>
  <template v-if="showFab">
    <button class="support-fab" @click="supportStore.togglePanel()">
      <span class="material-symbols-outlined">{{ supportStore.panelOpen ? 'close' : 'chat' }}</span>
      <span v-if="!supportStore.panelOpen && supportStore.myUnreadCount > 0" class="support-fab__badge">
        {{ supportStore.myUnreadCount }}
      </span>
    </button>
    <support-chat-panel />
  </template>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useSupportStore } from '@/stores/support.store'
import { isAdminUser } from '@/utils/admin'
import SupportChatPanel from './SupportChatPanel.vue'

export default defineComponent({
  name: 'SupportFab',
  components: { SupportChatPanel },
  setup() {
    const authStore = useAuthStore()
    const supportStore = useSupportStore()

    const showFab = computed(() => authStore.isAuthenticated && !isAdminUser(authStore.user?._id))

    watch(
      () => authStore.user,
      (user) => {
        if (user && !isAdminUser(user._id)) {
          supportStore.connectSocket()
        }
      },
      { immediate: true },
    )

    return { supportStore, showFab }
  },
})
</script>

<style scoped>
.support-fab {
  position: fixed;
  bottom: 24px;
  right: 88px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  z-index: 9998;
}

.support-fab:hover {
  background-color: var(--color-primary-hover);
}

.support-fab__badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 50%;
  background-color: var(--color-error);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
