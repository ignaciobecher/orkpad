<template>
  <transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="onCancel">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title font-mono uppercase">{{ title }}</div>
          <button class="close-btn" @click="onCancel">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="modal-message">{{ message }}</p>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary font-mono uppercase" @click="onCancel">
            {{ cancelText || $t('common.cancel', 'Cancelar') }}
          </button>
          <button 
            class="btn-primary font-mono uppercase" 
            :class="{ 'btn-danger': isDanger }"
            @click="onConfirm"
            :disabled="loading"
          >
            <span v-if="loading" class="material-symbols-outlined rotating">sync</span>
            <span v-else>{{ confirmText || $t('common.confirm', 'Confirmar') }}</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WConfirmModal',
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
