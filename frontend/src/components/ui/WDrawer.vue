<template>
  <Teleport to="body">
    <div v-if="modelValue" class="w-drawer-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="w-drawer" :style="{ width }">
        <div class="w-drawer__header">
          <h2 class="w-drawer__title">{{ title }}</h2>
          <button class="w-drawer__close" @click="$emit('update:modelValue', false)">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="w-drawer__content">
          <slot></slot>
        </div>
        <div v-if="$slots.footer" class="w-drawer__footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WDrawer',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '400px'
    }
  },
  emits: ['update:modelValue']
})
</script>

<style scoped>
.w-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-overlay);
  display: flex;
  justify-content: flex-end;
  z-index: 1000;
}

.w-drawer {
  height: 100%;
  background-color: var(--color-bg-surface);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease-out;
}

@media (max-width: 768px) {
  .w-drawer {
    width: 100% !important;
  }
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.w-drawer__header {
  height: var(--topbar-height);
  padding: 0 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-bg-surface-low);
}

.w-drawer__title {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
}

.w-drawer__close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
}

.w-drawer__content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 24px;
}

.w-drawer__footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-surface-low);
}
</style>
