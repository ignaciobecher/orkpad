<template>
  <button
    :class="[
      'w-btn',
      `w-btn--${variant}`,
      `w-btn--${size}`,
      { 'w-btn--loading': loading, 'w-btn--block': block }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="w-btn__spinner"></span>
    <slot v-else></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WButton',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value: string) => ['primary', 'secondary', 'ghost', 'danger', 'outline'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['md', 'lg'].includes(value)
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click']
})
</script>

<style scoped>
.w-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 36px;
  min-width: 80px;
  position: relative;
}

.w-btn--block {
  display: flex;
  width: 100%;
}

.w-btn--lg {
  height: 52px;
  padding: 0 28px;
  font-size: 13px;
  min-width: 120px;
}

.w-btn--primary {
  background-color: var(--color-primary);
  color: white;
}

.w-btn--primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.w-btn--secondary {
  background-color: var(--color-bg-surface-high);
  color: var(--color-text-base);
  border: 1px solid var(--color-border);
}

.w-btn--secondary:hover:not(:disabled) {
  background-color: var(--color-bg-surface-highest);
}

.w-btn--ghost {
  background-color: transparent;
  color: var(--color-text-muted);
}

.w-btn--ghost:hover:not(:disabled) {
  background-color: var(--color-bg-surface-highest);
  color: var(--color-text-base);
}

.w-btn--outline {
  background-color: transparent;
  color: var(--color-text-base);
  border: 1px solid var(--color-border);
}

.w-btn--outline:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.w-btn--danger {
  background-color: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
}

.w-btn--danger:hover:not(:disabled) {
  background-color: var(--color-error);
  color: white;
}

.w-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.w-btn__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
