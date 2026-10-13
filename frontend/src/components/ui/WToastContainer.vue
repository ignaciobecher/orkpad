<template>
  <div class="toast-container">
    <transition-group name="toast-list">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-message w95-toast w95-outset"
        :class="`toast-${toast.type}`"
        @click="removeToast(toast.id)"
      >
        <span class="toast-titlebar">{{ toastTitle(toast.type) }}</span>
        <div class="toast-row">
          <win-icon :name="toastIcon(toast.type)" :size="32" :alt="toast.type" />
          <span class="toast-text">{{ toast.message }}</span>
          <button class="w95-title-btn" @click.stop="removeToast(toast.id)" title="Cerrar"><span class="tbtn-close" aria-hidden="true">×</span></button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useToast } from '@/composables/useToast'
import WinIcon from '@/components/win95/WinIcon.vue'

export default defineComponent({
  name: 'WToastContainer',
  components: { WinIcon },
  setup() {
    const { toasts, removeToast } = useToast()
    const toastTitle = (type: string) => {
      switch (type) {
        case 'success': return 'Éxito'
        case 'error': return 'Error'
        case 'warning': return 'Aviso'
        default: return 'Orkpad95'
      }
    }
    const toastIcon = (type: string) => {
      switch (type) {
        case 'success': return 'check'
        case 'error': return 'error'
        case 'warning': return 'warning'
        default: return 'info'
      }
    }
    return { toasts, removeToast, toastTitle, toastIcon }
  }
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
  pointer-events: none;
  max-width: 400px;
}

.toast-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  pointer-events: auto;
  cursor: pointer;
  background-color: var(--color-bg-surface-highest);
  color: var(--color-text-base);
}

.toast-success { border-left: 4px solid var(--color-success); }
.toast-error   { border-left: 4px solid var(--color-error); }
.toast-warning { border-left: 4px solid var(--color-warning); }
.toast-info    { border-left: 4px solid var(--color-primary); }

.toast-icon {
  font-size: 18px;
  flex-shrink: 0;
}
.toast-success .toast-icon { color: var(--color-success); }
.toast-error   .toast-icon { color: var(--color-error); }
.toast-warning .toast-icon { color: var(--color-warning); }
.toast-info    .toast-icon { color: var(--color-primary); }

.toast-text { flex: 1; line-height: 1.4; }

.toast-close {
  font-size: 16px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.25s ease;
}
.toast-list-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.toast-list-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .toast-container {
position: fixed;
  bottom: calc(var(--w95-taskbar-height) + 10px);
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 9999;
  pointer-events: none;
  max-width: 340px;
}

html[data-appearance="win95"] .toast-message {
pointer-events: auto;
  cursor: pointer;
  min-width: 260px;
  padding: 2px 2px 6px 2px;
}

html[data-appearance="win95"] .toast-titlebar {
display: block;
  background: linear-gradient(90deg, var(--w95-navy), var(--w95-navy-light));
  color: #fff;
  font-size: 11px;
  font-weight: bold;
  padding: 2px 6px;
  margin-bottom: 6px;
}

html[data-appearance="win95"] .toast-row {
display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 6px;
}

html[data-appearance="win95"] .toast-ico {
flex-shrink: 0;
}

html[data-appearance="win95"] .tbtn-close {
font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  font-weight: bold;
  line-height: 1;
  color: #000;
}

html[data-appearance="win95"] .toast-text {
flex: 1; line-height: 1.3; font-size: 12px; color: #000;
}

html[data-appearance="win95"] .toast-list-enter-active, html[data-appearance="win95"] .toast-list-leave-active {
transition: all 0.15s ease;
}

html[data-appearance="win95"] .toast-list-enter-from {
opacity: 0;
  transform: translateY(8px);
}

html[data-appearance="win95"] .toast-list-leave-to {
opacity: 0;
  transform: translateY(8px);
}
</style>
