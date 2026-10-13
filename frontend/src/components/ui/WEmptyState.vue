<template>
  <div class="w-empty-state">
    <div class="w-empty-state__icon">
      <slot name="icon">
        <win-icon name="envelope" :size="32" alt="" />
      </slot>
    </div>
    <h3 class="w-empty-state__title">{{ title }}</h3>
    <p class="w-empty-state__message">{{ message }}</p>
    <div v-if="$slots.action" class="w-empty-state__action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import WinIcon from '@/components/win95/WinIcon.vue'

export default defineComponent({
  name: 'WEmptyState',
  components: { WinIcon },
  props: {
    title: {
      type: String,
      default: 'No hay datos'
    },
    message: {
      type: String,
      default: 'Aún no se ha registrado información en esta sección.'
    }
  }
})
</script>

<style scoped>
.w-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.w-empty-state__icon {
  margin-bottom: 16px;
  color: var(--color-text-muted);
}

.w-empty-state__icon span {
  font-size: 48px;
}

.w-empty-state__title {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-base);
  margin-bottom: 8px;
}

.w-empty-state__message {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
  max-width: 320px;
  margin-bottom: 24px;
}

.w-empty-state__action {
  display: flex;
  gap: 12px;
}
</style>

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .w-empty-state {
display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  background: var(--w95-face);
  border-radius: 0;
}

html[data-appearance="win95"] .w-empty-state__icon {
margin-bottom: 8px;
  color: #000;
}

html[data-appearance="win95"] .w-empty-state__icon span {
font-size: 32px;
}

html[data-appearance="win95"] .w-empty-state__title {
font-family: Tahoma, Verdana, sans-serif;
  font-size: 14px;
  font-weight: bold;
  color: #000;
  margin-bottom: 4px;
  text-transform: none;
}

html[data-appearance="win95"] .w-empty-state__message {
font-family: Tahoma, Verdana, sans-serif;
  font-size: 12px;
  color: #000;
  max-width: 320px;
  margin-bottom: 8px;
}

html[data-appearance="win95"] .w-empty-state__action {
display: flex;
  gap: 8px;
}
</style>
