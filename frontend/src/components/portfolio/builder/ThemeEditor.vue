<script setup lang="ts">
import type { PortfolioTheme } from '@/api/portfolio/portfolio-builder.types'

defineProps<{ theme: PortfolioTheme }>()
const emit = defineEmits<{ update: [theme: Partial<PortfolioTheme>] }>()

const PRESETS = [
  '#2563EB', '#7C3AED', '#059669', '#DC2626',
  '#D97706', '#0891B2', '#DB2777', '#65A30D',
]

function set(key: keyof PortfolioTheme, value: string) {
  emit('update', { [key]: value })
}
</script>

<template>
  <div class="te">
    <div class="te__group">
      <label class="te__label">Color primario</label>
      <div class="te__presets">
        <button
          v-for="color in PRESETS"
          :key="color"
          class="te__dot"
          :class="{ 'te__dot--active': theme.primaryColor === color }"
          :style="{ background: color }"
          @click="set('primaryColor', color)"
        />
        <input
          type="color"
          class="te__color-picker"
          :value="theme.primaryColor"
          @input="set('primaryColor', ($event.target as HTMLInputElement).value)"
          title="Color personalizado"
        />
      </div>
    </div>

    <div class="te__group">
      <label class="te__label">Esquema de color</label>
      <div class="te__row">
        <label
          class="te__opt"
          :class="{ 'te__opt--active': theme.colorScheme === 'dark' }"
        >
          <input type="radio" :checked="theme.colorScheme === 'dark'" @change="set('colorScheme', 'dark')" />
          <span class="mdi mdi-weather-night"></span> Oscuro
        </label>
        <label
          class="te__opt"
          :class="{ 'te__opt--active': theme.colorScheme === 'light' }"
        >
          <input type="radio" :checked="theme.colorScheme === 'light'" @change="set('colorScheme', 'light')" />
          <span class="mdi mdi-white-balance-sunny"></span> Claro
        </label>
      </div>
    </div>

    <div class="te__group">
      <label class="te__label">Tipografía</label>
      <div class="te__row">
        <label class="te__opt" :class="{ 'te__opt--active': theme.fontFamily === 'inter' }">
          <input type="radio" :checked="theme.fontFamily === 'inter'" @change="set('fontFamily', 'inter')" />
          Inter
        </label>
        <label class="te__opt" :class="{ 'te__opt--active': theme.fontFamily === 'jetbrains-mono' }">
          <input type="radio" :checked="theme.fontFamily === 'jetbrains-mono'" @change="set('fontFamily', 'jetbrains-mono')" />
          Mono
        </label>
        <label class="te__opt" :class="{ 'te__opt--active': theme.fontFamily === 'system' }">
          <input type="radio" :checked="theme.fontFamily === 'system'" @change="set('fontFamily', 'system')" />
          Sistema
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.te {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.te__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.te__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.te__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.te__dot {
  width: 22px;
  height: 22px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.15s;
}
.te__dot--active {
  border-color: #fff;
  outline: 2px solid var(--color-primary);
}
.te__color-picker {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--color-border);
  cursor: pointer;
  background: none;
}
.te__row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.te__opt {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  font-size: 12px;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.15s;
}
.te__opt input {
  display: none;
}
.te__opt--active {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.08);
}
</style>
