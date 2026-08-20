<template>
  <header class="app-topbar">
    <div class="topbar-left">
      <button class="hamburger-btn" @click="uiStore.toggleSidebar">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <div class="search-wrapper">
        <span class="material-symbols-outlined search-icon">search</span>
        <input 
          type="text" 
          v-model="searchQuery"
          @focus="isSearchFocused = true"
          @blur="handleSearchBlur"
          :placeholder="$t('topbar.search')" 
          class="search-input" 
        />
        
        <!-- Search Results Dropdown -->
        <div v-if="isSearchFocused && searchResults.length > 0" class="search-results custom-scrollbar">
          <div 
            v-for="result in searchResults" 
            :key="result.to" 
            class="search-result-item"
            @mousedown="navigateTo(result.to)"
          >
            <span class="material-symbols-outlined result-icon">{{ result.icon }}</span>
            <div class="result-text">
              <span class="result-label">{{ result.text }}</span>
              <span class="result-path">{{ result.section }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="topbar-right">
      <button @click="toggleLocale" class="topbar-lang-switch" :title="$i18n.locale === 'es' ? 'English' : 'Español'">
        {{ $i18n.locale === 'es' ? '🇺🇸' : '🇪🇸' }}
      </button>
      <button @click="uiStore.toggleTheme()" class="topbar-btn">
        <span class="material-symbols-outlined">{{ uiStore.theme === 'dark' ? 'light_mode' : 'dark_mode' }}</span>
      </button>
      <button @click="openHelp" class="topbar-btn">
        <span class="material-symbols-outlined">help</span>
      </button>
      <div class="relative">
        <button class="topbar-btn" @click.stop="toggleNotifications">
          <span class="material-symbols-outlined">notifications</span>
          <span v-if="notificationsStore.unreadCount > 0" class="notification-badge">{{ notificationsStore.unreadCount }}</span>
        </button>
        
        <NotificationDropdown 
          :is-open="isNotificationsOpen" 
          @close="isNotificationsOpen = false" 
        />
      </div>
      
      <div class="topbar-divider"></div>

      <div class="user-section" @click="$router.push('/app/settings')">
        <div class="user-text">
          <span class="user-name">{{ user.name }}</span>
          <span class="user-role">{{ user.role }}</span>
        </div>
        <div class="user-avatar-wrapper">
          <span v-if="!user.avatar" class="material-symbols-outlined user-icon">account_circle</span>
          <img v-else :src="user.avatar" class="user-avatar" />
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NotificationDropdown from './NotificationDropdown.vue'

export default defineComponent({
  name: 'AppTopbar',
  components: {
    NotificationDropdown
  },
  setup() {
    const uiStore = useUIStore()
    const authStore = useAuthStore()
    const notificationsStore = useNotificationsStore()
    const router = useRouter()
    const { t, locale } = useI18n()
    
    const isNotificationsOpen = ref(false)
    const searchQuery = ref('')
    const isSearchFocused = ref(false)

    const user = computed(() => authStore.user || { name: '...', role: '...', avatar: null })

    const toggleNotifications = () => {
      isNotificationsOpen.value = !isNotificationsOpen.value
    }

    const searchableItems = computed(() => [
      { text: t('sidebar.items.dashboard'), to: '/app/dashboard', icon: 'dashboard', section: t('sidebar.sections.work') },
      { text: t('sidebar.items.clients'), to: '/app/clients', icon: 'group', section: t('sidebar.sections.work') },
      { text: t('sidebar.items.projects'), to: '/app/projects', icon: 'assignment', section: t('sidebar.sections.work') },
      { text: t('sidebar.items.tasks'), to: '/app/tasks', icon: 'task_alt', section: t('sidebar.sections.work') },
      { text: t('sidebar.items.pipeline'), to: '/app/pipeline', icon: 'account_tree', section: t('sidebar.sections.sales') },
      { text: t('sidebar.items.finance'), to: '/app/finance', icon: 'payments', section: t('sidebar.sections.finance') },
      { text: t('sidebar.items.timeTracking'), to: '/app/time-tracking', icon: 'timer', section: t('sidebar.sections.finance') },
      { text: t('sidebar.items.myProducts'), to: '/app/products', icon: 'inventory_2', section: t('sidebar.sections.products') },
      { text: t('sidebar.items.subscriptions'), to: '/app/subscriptions', icon: 'rebase_edit', section: t('sidebar.sections.products') },
      { text: t('sidebar.items.infrastructure'), to: '/app/infrastructure', icon: 'terminal', section: t('sidebar.sections.products') },
      { text: t('sidebar.items.railway', 'Railway'), to: '/app/railway', icon: 'rocket_launch', section: t('sidebar.sections.products') },
      { text: t('sidebar.items.integrations', 'Integraciones'), to: '/app/integrations', icon: 'electrical_services', section: t('sidebar.sections.products') },
      { text: t('sidebar.items.notes', 'Pizarra'), to: '/app/notes', icon: 'edit_note', section: t('sidebar.sections.work') },
      { text: t('sidebar.items.docs'), to: '/app/docs', icon: 'description', section: t('sidebar.sections.knowledge') },
      { text: t('sidebar.items.agenda'), to: '/app/agenda', icon: 'calendar_month', section: t('sidebar.sections.knowledge') },
      { text: t('sidebar.items.settings'), to: '/app/settings', icon: 'settings', section: 'System' },
    ])

    const searchResults = computed(() => {
      if (!searchQuery.value) return []
      const q = searchQuery.value.toLowerCase()
      return searchableItems.value.filter(item => 
        item.text.toLowerCase().includes(q) || 
        item.section.toLowerCase().includes(q)
      ).slice(0, 5)
    })

    const navigateTo = (path: string) => {
      router.push(path)
      searchQuery.value = ''
      isSearchFocused.value = false
    }

    const handleSearchBlur = () => {
      // Use a small timeout to allow mousedown to trigger before blur closes dropdown
      setTimeout(() => {
        isSearchFocused.value = false
      }, 200)
    }

    const toggleLocale = () => {
      locale.value = locale.value === 'es' ? 'en' : 'es'
    }

    let pollInterval: ReturnType<typeof setInterval> | null = null

    const onWindowFocus = () => notificationsStore.fetchUnreadCount()

    onMounted(() => {
      notificationsStore.fetchUnreadCount()
      pollInterval = setInterval(() => notificationsStore.fetchUnreadCount(), 60_000)
      window.addEventListener('focus', onWindowFocus)
    })

    onUnmounted(() => {
      if (pollInterval) clearInterval(pollInterval)
      window.removeEventListener('focus', onWindowFocus)
    })

    const openHelp = () => {
      window.open('/help', '_blank')
    }

    return {
      uiStore,
      notificationsStore,
      user,
      isNotificationsOpen,
      toggleNotifications,
      searchQuery,
      isSearchFocused,
      searchResults,
      navigateTo,
      handleSearchBlur,
      toggleLocale,
      openHelp
    }
  }
})
</script>

<style scoped>
.app-topbar {
  height: var(--topbar-height);
  position: fixed;
  top: 0;
  left: var(--sidebar-width);
  right: 0;
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 90;
}

@media (max-width: 1024px) {
  .app-topbar {
    left: 0;
    padding: 0 16px;
  }
}

.hamburger-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: none;
  padding: 8px;
  margin-right: 8px;
}

@media (max-width: 1024px) {
  .hamburger-btn {
    display: flex;
  }
}

.topbar-left {
  display: flex;
  align-items: center;
}

.search-wrapper {
  position: relative;
  width: 256px;
}

@media (max-width: 640px) {
  .search-wrapper {
    display: none;
  }
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--color-text-muted);
}

.search-input {
  width: 100%;
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-border);
  padding: 6px 12px 6px 36px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-base);
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input::placeholder {
  color: var(--color-text-disabled);
}

.search-input:focus {
  border-color: var(--color-primary);
}

.search-results {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  max-height: 300px;
  overflow-y: auto;
  z-index: 110;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-result-item:hover {
  background-color: var(--color-bg-surface-highest);
}

.result-icon {
  font-size: 18px;
  color: var(--color-text-muted);
}

.result-text {
  display: flex;
  flex-direction: column;
}

.result-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-base);
  text-transform: uppercase;
}

.result-path {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-primary);
  text-transform: uppercase;
  opacity: 0.7;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.topbar-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  padding: 4px;
  transition: color 0.2s ease;
  position: relative;
}

.topbar-btn:hover {
  color: var(--color-text-base);
}

.topbar-lang-switch {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  font-size: 20px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.topbar-lang-switch:hover {
  background: var(--color-bg-surface-highest);
  transform: scale(1.1);
}

.relative {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: var(--color-error);
  color: white;
  font-family: var(--font-mono);
  font-size: 9px;
  padding: 1px 4px;
  min-width: 14px;
  text-align: center;
  line-height: 1.4;
  pointer-events: none;
}

.topbar-divider {
  width: 1px;
  height: 20px;
  background-color: var(--color-border);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.user-text {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

@media (max-width: 768px) {
  .user-text {
    display: none;
  }
}

.user-name {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-base);
}

.user-role {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-primary);
}

.user-icon {
  font-size: 20px;
  color: var(--color-text-muted);
}

.user-avatar-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-border);
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}
</style>
