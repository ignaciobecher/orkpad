<template>
  <div class="w95-desktop-icons">
    <button
      v-for="d in icons"
      :key="d.key"
      class="w95-dicon"
      :class="{ 'w95-dicon--active': d.route && win95.activeRoute === d.route }"
      @click="open(d)"
      @dblclick="open(d)"
    >
      <win-icon :name="d.icon" :size="32" :alt="d.label" />
      <span class="w95-dicon-label">{{ d.label }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useWin95Store } from '@/stores/win95.store'
import { showToast } from '@/composables/useToast'
import WinIcon from './WinIcon.vue'

export default defineComponent({
  name: 'WinDesktopIcons',
  components: { WinIcon },
  setup() {
    const win95 = useWin95Store()
    const router = useRouter()
    function open(d: { route: string; label: string }) {
      if (!d.route) {
        showToast('La papelera está vacía', 'info')
        return
      }
      win95.ensureWindow(d.route)
      win95.focus(d.route)
      router.push({ name: d.route as never }).catch(() => {})
    }
    return { win95, open }
  },
  computed: {
    icons() {
      return [
        { key: 'pc', route: 'dashboard', label: 'Mi PC', icon: 'computer' },
        { key: 'projects', route: 'projects', label: this.$t('sidebar.items.projects', 'Proyectos'), icon: 'briefcase' },
        { key: 'tasks', route: 'tasks', label: this.$t('sidebar.items.tasks', 'Tareas'), icon: 'check' },
        { key: 'finance', route: 'finance', label: 'Finanzas', icon: 'calculator' },
        { key: 'notes', route: 'notes', label: 'Bloc', icon: 'note' },
        { key: 'mail', route: 'notifications', label: 'Correo', icon: 'mail' },
        { key: 'bin', route: '', label: 'Papelera', icon: 'recycle' },
      ]
    },
  },
})
</script>

<style scoped>
/* El icono va pelado sobre el teal, como en Win95 real (sin caja gris) */
.w95-dicon :deep(.win-icon) {
  filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.4));
}
</style>
