<template>
  <div ref="rootRef" class="w-remote-select" :class="{ 'is-open': isOpen, 'is-disabled': disabled }">
    <div
      class="w-remote-select__control"
      :class="{ 'has-error': !!error, 'has-value': !!selectedOption }"
      @click="handleControlClick"
    >
      <div class="w-remote-select__content">
        <input
          ref="inputRef"
          v-model="searchTerm"
          type="text"
          class="w-remote-select__input"
          :placeholder="computedPlaceholder"
          :disabled="disabled"
          @focus="openDropdown"
          @input="handleSearchInput"
        />
        <div v-if="selectedOption && !searchTerm" class="w-remote-select__selected">
          <span class="w-remote-select__selected-label">{{ selectedOption.label }}</span>
          <span v-if="selectedOption.description" class="w-remote-select__selected-description">
            {{ selectedOption.description }}
          </span>
        </div>
      </div>

      <button
        v-if="modelValue && !disabled"
        type="button"
        class="w-remote-select__clear"
        @click.stop="clearSelection"
      >
        <span class="material-symbols-outlined">close</span>
      </button>

      <span class="material-symbols-outlined w-remote-select__chevron">expand_more</span>
    </div>

    <div v-if="isOpen" class="w-remote-select__dropdown" @scroll="handleDropdownScroll">
      <div v-if="loading" class="w-remote-select__state">Buscando...</div>
      <div v-else-if="disabled" class="w-remote-select__state">{{ disabledMessage || 'Completa el campo anterior' }}</div>
      <button
        v-else-if="showCustomAction"
        type="button"
        class="w-remote-select__state w-remote-select__state--interactive"
        @click="selectCustomValue"
      >
        {{ customActionLabel }}
      </button>
      <button
        v-else-if="!options.length"
        type="button"
        class="w-remote-select__state w-remote-select__state--interactive"
        @click="fetchOptions(searchTerm)"
      >
        No se encontraron resultados
      </button>
      <template v-else>
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          class="w-remote-select__option"
          :class="{ 'is-active': option.value === modelValue }"
          @click="selectOption(option)"
        >
          <span class="w-remote-select__option-label">{{ option.label }}</span>
          <span v-if="option.description" class="w-remote-select__option-description">{{ option.description }}</span>
        </button>
        <div v-if="loadingMore" class="w-remote-select__state">Cargando más...</div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import type { RemoteOption } from '@/utils/remote-entity-options'

export default defineComponent({
  name: 'WRemoteSelect',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Buscar y seleccionar...'
    },
    searchPlaceholder: {
      type: String,
      default: 'Escribí para buscar...'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    disabledMessage: {
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: ''
    },
    allowCustom: {
      type: Boolean,
      default: false
    },
    customLabelPrefix: {
      type: String,
      default: 'Usar'
    },
    loadOptions: {
      type: Function as PropType<(_search: string, _formData: any, _page: number) => Promise<RemoteOption[]>>,
      required: true
    },
    pageSize: {
      type: Number,
      default: 5
    },
    loadOptionByValue: {
      type: Function as PropType<(_value: string) => Promise<RemoteOption | null>>,
      default: undefined
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isOpen: false,
      loading: false,
      loadingMore: false,
      searchTerm: '',
      options: [] as RemoteOption[],
      selectedOption: null as RemoteOption | null,
      debounceTimer: null as ReturnType<typeof setTimeout> | null,
      currentPage: 1,
      hasMore: true
    }
  },
  computed: {
    computedPlaceholder() {
      if (this.selectedOption && !this.isOpen) return ''
      return this.disabled ? this.placeholder : this.searchPlaceholder
    },
    showCustomAction() {
      if (!this.allowCustom) return false
      const trimmed = this.searchTerm.trim()
      if (!trimmed) return false
      return !this.options.some(option => option.label.toLowerCase() === trimmed.toLowerCase())
    },
    customActionLabel() {
      const trimmed = this.searchTerm.trim()
      if (!trimmed) return 'No se encontraron resultados'
      return `${this.customLabelPrefix} "${trimmed}"`
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      async handler(newValue: string) {
        if (!newValue) {
          this.selectedOption = null
          this.searchTerm = ''
          return
        }

        const existing = this.options.find(option => option.value === newValue)
        if (existing) {
          this.selectedOption = existing
          return
        }

        if (!this.loadOptionByValue) {
          this.selectedOption = { value: newValue, label: newValue }
          return
        }

        try {
          const option = await this.loadOptionByValue(newValue)
          this.selectedOption = option ?? { value: newValue, label: newValue, description: 'Personalizado' }
        } catch {
          this.selectedOption = { value: newValue, label: newValue, description: 'Personalizado' }
        }
      }
    },
    disabled(disabled: boolean) {
      if (disabled) {
        this.isOpen = false
        this.searchTerm = ''
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleDocumentClick)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleDocumentClick)
    if (this.debounceTimer) clearTimeout(this.debounceTimer)
  },
  methods: {
    handleDocumentClick(event: MouseEvent) {
      const root = this.$refs.rootRef as HTMLElement | undefined
      if (!root?.contains(event.target as Node)) {
        this.isOpen = false
        this.searchTerm = ''
      }
    },
    handleControlClick() {
      if (this.disabled) return
      this.openDropdown()
    },
    openDropdown() {
      if (this.disabled) return
      this.isOpen = true
      void this.fetchOptions(this.searchTerm)
      this.$nextTick(() => {
        const input = this.$refs.inputRef as HTMLInputElement | undefined
        input?.focus()
      })
    },
    handleSearchInput() {
      if (this.debounceTimer) clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        void this.fetchOptions(this.searchTerm)
      }, 250)
    },
    async fetchOptions(search: string) {
      if (this.disabled) {
        this.options = []
        return
      }

      this.loading = true
      this.currentPage = 1
      this.hasMore = true
      try {
        const results = await this.loadOptions(search, undefined, this.currentPage)
        this.options = results
        this.hasMore = results.length >= this.pageSize
      } catch {
        this.options = []
        this.hasMore = false
      } finally {
        this.loading = false
      }
    },
    async loadMore() {
      if (this.loadingMore || this.loading || !this.hasMore || this.disabled) return

      this.loadingMore = true
      const nextPage = this.currentPage + 1
      try {
        const results = await this.loadOptions(this.searchTerm, undefined, nextPage)
        this.currentPage = nextPage
        this.hasMore = results.length >= this.pageSize
        const existingValues = new Set(this.options.map(option => option.value))
        this.options = [...this.options, ...results.filter(option => !existingValues.has(option.value))]
      } catch {
        this.hasMore = false
      } finally {
        this.loadingMore = false
      }
    },
    handleDropdownScroll(event: Event) {
      const el = event.target as HTMLElement
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
        void this.loadMore()
      }
    },
    selectOption(option: RemoteOption) {
      this.selectedOption = option
      this.searchTerm = ''
      this.isOpen = false
      this.$emit('update:modelValue', option.value)
    },
    selectCustomValue() {
      const trimmed = this.searchTerm.trim()
      if (!trimmed) return
      this.selectOption({
        value: trimmed,
        label: trimmed,
        description: 'Personalizado'
      })
    },
    clearSelection() {
      this.selectedOption = null
      this.searchTerm = ''
      this.options = []
      this.$emit('update:modelValue', '')
    }
  }
})
</script>

<style scoped>
.w-remote-select {
  position: relative;
}

.w-remote-select__control {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 44px;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  transition: border-color 0.2s ease;
}

.w-remote-select__control.has-error {
  border-color: var(--color-error);
  background-color: rgba(239, 68, 68, 0.04);
}

.w-remote-select__control:hover,
.w-remote-select.is-open .w-remote-select__control {
  border-color: var(--color-primary);
}

.w-remote-select__content {
  position: relative;
  flex: 1;
  min-width: 0;
}

.w-remote-select__input {
  width: 100%;
  padding: 10px 42px 10px 12px;
  background: transparent;
  border: 0;
  color: var(--color-text-base);
  font-family: var(--font-body);
  font-size: 14px;
  outline: none;
}

.w-remote-select__selected {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 42px 8px 12px;
  pointer-events: none;
  overflow: hidden;
}

.w-remote-select__selected-label,
.w-remote-select__option-label {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.w-remote-select__selected-description,
.w-remote-select__option-description {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  color: var(--color-text-muted);
}

.w-remote-select__chevron,
.w-remote-select__clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

.w-remote-select__clear {
  right: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.w-remote-select__clear .material-symbols-outlined,
.w-remote-select__chevron {
  font-size: 18px;
}

.w-remote-select__dropdown {
  position: absolute;
  z-index: 30;
  top: calc(100% + 6px);
  width: 100%;
  max-height: 280px;
  overflow-y: auto;
  background: var(--color-bg-surface-highest);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
}

.w-remote-select__option,
.w-remote-select__state {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--color-border-subtle);
  overflow: hidden;
}

.w-remote-select__option {
  cursor: pointer;
}

.w-remote-select__option:hover,
.w-remote-select__option.is-active,
.w-remote-select__state--interactive:hover {
  background: rgba(91, 78, 255, 0.08);
}

.w-remote-select__state {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.w-remote-select__state--interactive {
  cursor: pointer;
}

.w-remote-select.is-disabled .w-remote-select__control {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
