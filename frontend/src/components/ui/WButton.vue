<template>
  <button
    :class="[
      'w-btn w95-btn',
      `w-btn--${variant}`,
      `w-btn--${size}`,
      { 'w-btn--loading': loading, 'w-btn--block': block, 'w95-btn--default': variant === 'primary' }
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

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .w-btn {
display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  min-height: 23px;
  min-width: 75px;
  padding: 4px 14px;
  background: var(--w95-face);
  color: #000;
  border: 2px solid;
  border-color: var(--w95-highlight) var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-highlight);
  box-shadow: inset 1px 1px 0 var(--w95-face-light), inset -1px -1px 0 var(--w95-shadow);
  cursor: pointer;
  border-radius: 0;
  text-transform: none;
  letter-spacing: 0;
  height: auto;
  position: relative;
  user-select: none;
}

html[data-appearance="win95"] .w-btn:active:not(:disabled) {
border-color: var(--w95-darkshadow) var(--w95-highlight) var(--w95-highlight) var(--w95-darkshadow);
  box-shadow: inset 1px 1px 0 var(--w95-shadow);
  padding: 5px 13px 3px 15px;
}

html[data-appearance="win95"] .w-btn:focus-visible {
outline: 1px dotted #000;
  outline-offset: -4px;
}

html[data-appearance="win95"] .w-btn--block {
display: flex;
  width: 100%;
}

html[data-appearance="win95"] .w-btn--lg {
min-height: 28px;
  padding: 5px 20px;
  font-size: 12px;
  min-width: 100px;
}

html[data-appearance="win95"] .w-btn--primary {
font-weight: bold;
  box-shadow: inset 1px 1px 0 var(--w95-highlight), inset -1px -1px 0 var(--w95-shadow), 0 0 0 1px #000;
}

html[data-appearance="win95"] .w-btn--secondary, html[data-appearance="win95"] .w-btn--outline {
background: var(--w95-face);
  color: #000;
}

html[data-appearance="win95"] .w-btn--ghost {
background: var(--w95-face);
  color: #000;
  border-color: var(--w95-highlight) var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-highlight);
}

html[data-appearance="win95"] .w-btn--danger {
background: var(--w95-face);
  color: var(--w95-error);
  border: 2px solid;
  border-color: var(--w95-highlight) var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-highlight);
}

html[data-appearance="win95"] .w-btn:disabled {
color: var(--w95-shadow);
  text-shadow: 1px 1px 0 var(--w95-highlight);
  cursor: not-allowed;
}

html[data-appearance="win95"] .w-btn__spinner {
width: 12px;
  height: 12px;
  border: 2px solid var(--w95-shadow);
  border-top-color: var(--w95-navy);
  border-radius: 0;
  animation: w95-spin 0.8s linear infinite;
}

@keyframes w95-spin {
to { transform: rotate(360deg); }
}
</style>
