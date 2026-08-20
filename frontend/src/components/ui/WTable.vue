<template>
  <div class="w-table-container">
    <table class="w-table">
      <thead>
        <tr>
          <th v-for="header in headers" :key="header.key" :style="{ width: header.width }">
            {{ header.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-if="loading">
          <tr v-for="i in 5" :key="`skeleton-${i}`">
            <td v-for="header in headers" :key="`skeleton-td-${header.key}`">
              <div class="skeleton-bar"></div>
            </td>
          </tr>
        </template>
        <template v-else-if="items.length === 0">
          <tr>
            <td :colspan="headers.length" class="text-center py-10 text-muted">
              {{ emptyMessage || $t('common.noResults') }}
            </td>
          </tr>
        </template>
        <template v-else>
          <tr v-for="(item, index) in items" :key="item.id || index" @click="$emit('row-click', item)">
            <td v-for="header in headers" :key="header.key">
              <slot :name="`item-${header.key}`" :item="item">
                {{ item[header.key] }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

interface Header {
  key: string
  label: string
  width?: string
}

export default defineComponent({
  name: 'WTable',
  props: {
    headers: {
      type: Array as PropType<Header[]>,
      required: true
    },
    items: {
      type: Array as PropType<any[]>,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    emptyMessage: {
      type: String,
      default: ''
    }
  },
  emits: ['row-click']
})
</script>

<style scoped>
.w-table-container {
  width: 100%;
  overflow-x: auto;
  min-width: 0;
}

.w-table {
  width: 100%;
  border-collapse: collapse;
}

@media (max-width: 640px) {
  .w-table-container {
    -webkit-overflow-scrolling: touch;
  }
  .w-table {
    min-width: 480px;
  }
}

.w-table thead th {
  background-color: var(--color-bg-base);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-caps);
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.w-table tbody tr {
  background-color: var(--color-bg-base);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.w-table tbody tr:nth-child(even) {
  background-color: var(--color-bg-surface);
}

.w-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.w-table tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-subtle);
  font-size: 13px;
  color: var(--color-text-base);
}

.skeleton-bar {
  height: 12px;
  background-color: var(--color-bg-surface-highest);
  animation: pulse 1.5s infinite ease-in-out;
  width: 100%;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.text-center { text-align: center; }
.py-10 { padding-top: 40px; padding-bottom: 40px; }
.text-muted { color: var(--color-text-muted); }
</style>
