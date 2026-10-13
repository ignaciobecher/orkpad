<template>
  <div class="w-input-group">
    <label v-if="label" :for="id" class="w-label">{{ label }}</label>
    <div class="w-input-wrapper">
      <input
        :id="id"
        :type="currentType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete || undefined"
        class="w-input"
        :class="{ 'w-input--has-toggle': isPassword }"
        @input="onInput"
      />
      <button
        v-if="isPassword"
        type="button"
        class="w-input-toggle"
        :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        @click="showPassword = !showPassword"
      >
        <span class="w-input-toggle-text">{{ showPassword ? 'Ocultar' : 'Ver' }}</span>
      </button>
      <slot name="append"></slot>
    </div>
    <span v-if="error" class="w-input-error">{{ error }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: () => `input-${Math.random().toString(36).substr(2, 9)}`
    },
    error: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    autocomplete: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      showPassword: false,
    }
  },
  computed: {
    isPassword(): boolean {
      return this.type === 'password'
    },
    currentType(): string {
      if (this.isPassword) return this.showPassword ? 'text' : 'password'
      return this.type
    },
  },
  methods: {
    onInput(event: Event) {
      const target = event.target as HTMLInputElement
      this.$emit('update:modelValue', target.value)
    }
  }
})
</script>

<style scoped>
.w-input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-md);
}

.w-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.w-input {
  width: 100%;
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 10px 12px;
  outline: none;
  transition: border-color 0.2s ease;
}

@media (max-width: 768px) {
  .w-input {
    font-size: 16px;
  }
}

.w-input:focus {
  border-color: var(--color-primary);
}

.w-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.w-input--has-toggle {
  padding-right: 40px;
}

.w-input-toggle {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}

.w-input-toggle:hover {
  color: var(--color-text-base);
}

.w-input-toggle .material-symbols-outlined {
  font-size: 18px;
}

.w-input-error {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-error);
  margin-top: 4px;
  text-transform: uppercase;
}

.w-label {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  color: var(--color-text-muted);
  margin-bottom: 6px;
}
</style>

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .w-input-group {
display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  background: transparent;
}

html[data-appearance="win95"] .w-input-wrapper {
position: relative;
  display: flex;
  align-items: center;
}

html[data-appearance="win95"] .w-input {
width: 100%;
  background-color: #fff;
  border: 2px solid;
  border-color: var(--w95-shadow) var(--w95-highlight) var(--w95-highlight) var(--w95-shadow);
  box-shadow: inset 1px 1px 0 var(--w95-darkshadow);
  color: #000;
  font-family: Tahoma, Verdana, sans-serif;
  font-size: 12px;
  padding: 4px 6px;
  border-radius: 0;
  outline: none;
  text-transform: none;
  letter-spacing: 0;
}

@media (max-width: 768px) {
html[data-appearance="win95"] .w-input {
font-size: 12px;
}
}

html[data-appearance="win95"] .w-input:focus {
border-color: var(--w95-shadow) var(--w95-highlight) var(--w95-highlight) var(--w95-shadow);
  outline: 1px dotted #000;
  outline-offset: -3px;
}

html[data-appearance="win95"] .w-input:disabled {
background-color: var(--w95-face);
  color: var(--w95-shadow);
  cursor: not-allowed;
}

html[data-appearance="win95"] .w-input--has-toggle {
padding-right: 32px;
}

html[data-appearance="win95"] .w-input-toggle {
position: absolute;
  right: 4px;
  background: var(--w95-face);
  border: 2px solid;
  border-color: var(--w95-highlight) var(--w95-darkshadow) var(--w95-darkshadow) var(--w95-highlight);
  border-radius: 0;
  padding: 1px 3px;
  cursor: pointer;
  color: #000;
  display: flex;
  align-items: center;
}

html[data-appearance="win95"] .w-input-toggle:active {
border-color: var(--w95-darkshadow) var(--w95-highlight) var(--w95-highlight) var(--w95-darkshadow);
}

html[data-appearance="win95"] .w-input-toggle-text {
font-family: Tahoma, Verdana, sans-serif;
  font-size: 10px;
  line-height: 1.4;
}

html[data-appearance="win95"] .w-input-error {
font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  color: var(--w95-error);
  margin-top: 2px;
  text-transform: none;
  letter-spacing: 0;
}

html[data-appearance="win95"] .w-label {
font-family: Tahoma, Verdana, sans-serif;
  font-size: 11px;
  text-transform: none;
  letter-spacing: 0;
  color: #000;
  margin-bottom: 3px;
}
</style>
