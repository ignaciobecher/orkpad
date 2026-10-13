<template>
  <transition name="fade">
    <div v-if="isOpen" class="modal-overlay w95-dialog-overlay" @click.self="onCancel">
      <div class="modal-container w95-window">
        <div class="w95-titlebar">
          <span class="title-text">{{ title }}</span>
          <div class="w95-titlebar-buttons">
            <button class="w95-title-btn" @click="onCancel" title="Cerrar"><span class="tbtn-close" aria-hidden="true">×</span></button>
          </div>
        </div>
        <div class="modal-body">
          <win-icon :name="isDanger ? 'error' : 'question'" :size="32" alt="" />
          <p class="modal-message">{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button class="w95-btn" @click="onCancel">
            {{ cancelText || $t('common.cancel', 'Cancelar') }}
          </button>
          <button
            class="w95-btn w95-btn--default"
            @click="onConfirm"
            :disabled="loading"
          >
            <span v-if="loading">...</span>
            <span v-else>{{ confirmText || $t('common.confirm', 'Aceptar') }}</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import WinIcon from '@/components/win95/WinIcon.vue'

export default defineComponent({
  name: 'WConfirmModal',
  components: { WinIcon },
  props: {
    isOpen: { type: Boolean, required: true },
    title: { type: String, default: 'Confirmación' },
    message: { type: String, required: true },
    confirmText: { type: String },
    cancelText: { type: String },
    isDanger: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  },
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    const onConfirm = () => emit('confirm')
    const onCancel = () => emit('cancel')
    return { onConfirm, onCancel }
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-base);
  letter-spacing: 0.1em;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
}

.modal-body {
  padding: 24px 20px;
}

.modal-message {
  font-size: 14px;
  color: var(--color-text-subtle);
  line-height: 1.6;
}

.modal-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: rgba(255, 255, 255, 0.02);
  border-top: 1px solid var(--color-border);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
}

.btn-danger {
  background-color: var(--color-error);
}

.btn-danger:hover {
  background-color: #d32f2f;
}

.btn-secondary {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 8px 16px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  border-color: var(--color-text-muted);
  color: var(--color-text-base);
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .modal-overlay {
position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6000;
  padding: 16px;
}

html[data-appearance="win95"] .modal-container {
width: 90%;
  max-width: 380px;
  padding: 2px;
}

html[data-appearance="win95"] .modal-body {
padding: 14px 12px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: var(--w95-face);
}

html[data-appearance="win95"] .tbtn-close {
font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  font-weight: bold;
  line-height: 1;
  color: #000;
}

html[data-appearance="win95"] .modal-message {
font-size: 12px;
  color: #000;
  line-height: 1.5;
  margin: 0;
}

html[data-appearance="win95"] .modal-footer {
padding: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background: var(--w95-face);
  border-top: 1px solid var(--w95-shadow);
}

html[data-appearance="win95"] .fade-enter-active, html[data-appearance="win95"] .fade-leave-active {
transition: opacity 0.12s ease;
}

html[data-appearance="win95"] .fade-enter-from, html[data-appearance="win95"] .fade-leave-to {
opacity: 0;
}
</style>
