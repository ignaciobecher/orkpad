<template>
  <div class="toast-container">
    <transition-group name="toast-list">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-message"
        :class="`toast-${toast.type}`"
        @click="removeToast(toast.id)"
      >
        <span class="material-symbols-outlined toast-icon">{{ getIcon(toast.type) }}</span>
        <span class="toast-text">{{ toast.message }}</span>
        <span class="material-symbols-outlined toast-close">close</span>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useToast } from '@/composables/useToast'

export default defineComponent({
  name: 'WToastContainer',
  setup() {
    const { toasts, removeToast } = useToast()

    const getIcon = (type: string) => {
      switch (type) {
        case 'success': return 'check_circle'
        case 'error': return 'error'
        case 'warning': return 'warning'
        default: return 'info'
      }
    }

    return { toasts, removeToast, getIcon }
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
