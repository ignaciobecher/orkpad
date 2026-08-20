<template>
  <div class="products-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ $t('products.title') }}</h1>
        <div class="header-filters">
          <div class="search-box">
            <span class="material-symbols-outlined">search</span>
            <input type="text" v-model="filters.search" :placeholder="$t('products.searchPlaceholder')" @input="handleSearch" />
          </div>
        </div>
      </div>
      <div class="header-right">
        <w-button variant="primary" @click="openNewModal">
          <span class="material-symbols-outlined mr-2">add</span>
          {{ $t('products.new') }}
        </w-button>
      </div>
    </header>

    <main class="page-content">
      <w-card class="no-padding">
        <w-table :headers="headers" :items="items" :loading="loading" :empty-message="$t('products.noRecords')">
          <template #item-status="{ item }">
            <w-badge v-if="item.status" :color="getStatusColor(item.status)">{{ item.status }}</w-badge>
          </template>
          <template #item-actions="{ item }">
            <div class="table-actions">
              <button class="action-btn" @click.stop="openEditModal(item)">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button class="action-btn text-error" @click.stop="confirmDelete(item)">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </template>
        </w-table>
      </w-card>
    </main>

    <w-crud-modal v-model="showCrudModal" :schema="crudSchema" :initial-data="crudData" :loading="loading" @save="onSaveCrud" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useProductsStore } from '@/stores/products.store'
import WButton from '@/components/ui/WButton.vue'
import WTable from '@/components/ui/WTable.vue'
import WCard from '@/components/ui/WCard.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WCrudModal from '@/components/ui/WCrudModal.vue'

export default defineComponent({
  name: 'ProductsPage',
  components: { WButton, WTable, WCard, WBadge, WCrudModal },
  data() {
    return {
      showCrudModal: false,
      crudData: {} as any
    }
  },
  computed: {
    ...mapState(useProductsStore, ['items', 'loading', 'filters']),
    headers() {
      return [
        { key: 'name', label: this.$t('products.fields.name').toUpperCase() },
        { key: 'type', label: this.$t('products.fields.type').toUpperCase() },
        { key: 'status', label: this.$t('products.fields.status').toUpperCase() },
        { key: 'price', label: this.$t('products.fields.price').toUpperCase() },
        { key: 'actions', label: this.$t('common.actions').toUpperCase(), width: '100px' }
      ]
    },
    crudSchema() {
      return [
        { name: 'name', label: this.$t('products.fields.name'), type: 'text', required: true },
        { name: 'description', label: this.$t('products.fields.description'), type: 'textarea' },
        { name: 'price', label: this.$t('products.fields.price'), type: 'number' },
        { name: 'currency', label: this.$t('products.fields.currency'), type: 'text' },
        { name: 'type', label: this.$t('products.fields.type'), type: 'select', options: [
          { label: this.$t('products.types.service'), value: 'service' },
          { label: this.$t('products.types.digital'), value: 'digital' },
          { label: this.$t('products.types.physical'), value: 'physical' }
        ]},
        { name: 'status', label: this.$t('products.fields.status'), type: 'select', options: [
          { label: this.$t('clients.active'), value: 'active' },
          { label: this.$t('clients.archived'), value: 'archived' }
        ]}
      ]
    }
  },
  methods: {
    ...mapActions(useProductsStore, ['fetchAll', 'setFilters', 'create', 'update', 'remove']),
    handleSearch() {
      this.fetchAll()
    },
    openNewModal() {
      this.crudData = { status: 'active' }
      this.showCrudModal = true
    },
    openEditModal(item: any) {
      this.crudData = { ...item }
      this.showCrudModal = true
    },
    confirmDelete(item: any) {
      if (confirm(this.$t('products.deleteConfirm'))) {
        this.remove(item._id)
      }
    },
    async onSaveCrud(data: any) {
      const { _id, ...dto } = data
      try {
        if (_id) {
          await this.update(_id, dto)
        } else {
          await this.create(dto)
        }
        this.showCrudModal = false
      } catch {
        // error toast is shown by the store
      }
    },
    getStatusColor(status: string) {

      if (status === 'active') return 'var(--color-success)';
      return 'var(--color-text-muted)';
    
    }
  },
  mounted() {
    this.fetchAll()
  }
})
</script>

<style scoped>
.products-page { padding: 32px; flex-grow: 1; min-width: 0; display: flex; flex-direction: column; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; flex-shrink: 0; }
.header-left { display: flex; align-items: center; gap: 32px; }
.header-filters { display: flex; align-items: center; gap: 16px; }
.page-title { font-family: var(--font-body); font-size: 24px; font-weight: 600; color: var(--color-text-base); }
.search-box { position: relative; width: 280px; }
.search-box span { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--color-text-muted); }
.search-box input { width: 100%; background-color: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 8px 12px 8px 36px; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-base); outline: none; }

.page-content { flex-grow: 1; min-width: 0; display: flex; flex-direction: column; }
.no-padding { display: flex; flex-direction: column; min-width: 0; }
.no-padding :deep(.w-card__body) { padding: 0 !important; display: flex; flex-direction: column; flex-grow: 1; min-width: 0; }

.mr-2 { margin-right: 8px; }
.table-actions { display: flex; gap: 8px; }
.action-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; display: flex; padding: 4px; }
.action-btn:hover { color: var(--color-text-base); }
.text-error { color: var(--color-error) !important; }

@media (max-width: 1024px) {
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .products-page {
    padding: 16px;
  }
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    margin-bottom: 24px;
  }
  .header-filters {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  .search-box {
    width: 100%;
  }
  .header-right {
    width: 100%;
  }
  .header-right :deep(.w-button) {
    width: 100%;
  }
}



</style>
