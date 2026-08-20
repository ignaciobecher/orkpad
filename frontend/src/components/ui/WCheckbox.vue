<template>
  <div class="w-checkbox" :class="{ 'is-disabled': disabled, 'is-error': !!error }">
    <label class="checkbox-container">
      <input 
        type="checkbox" 
        :checked="modelValue" 
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        :disabled="disabled"
      />
      <span class="checkmark"></span>
      <span class="checkbox-label">
        <slot></slot>
      </span>
    </label>
    <span v-if="error" class="error-text">{{ error }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WCheckbox',
  props: {
    modelValue: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    error: { type: String, default: '' }
  },
  emits: ['update:modelValue']
})
</script>

<style scoped>
.w-checkbox {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-base);
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 20px;
  width: 20px;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-container:hover input ~ .checkmark {
  border-color: var(--color-primary);
}

.checkbox-container input:checked ~ .checkmark {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-label {
  flex-grow: 1;
}

.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.is-error .checkmark {
  border-color: var(--color-error);
}

.error-text {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--color-error);
}
</style>
