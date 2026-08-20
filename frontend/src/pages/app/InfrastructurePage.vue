<template>
  <div class="infrastructure-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ $t('infrastructure.title') }}</h1>
        <div class="header-filters">
          <div class="search-box">
            <span class="material-symbols-outlined">search</span>
            <input type="text" v-model="filters.search" :placeholder="$t('infrastructure.searchPlaceholder')" @input="handleSearch" />
          </div>
        </div>
      </div>
      <div class="header-right">
        <w-button variant="primary" @click="openNewModal">
          <span class="material-symbols-outlined mr-2">add</span>
          {{ $t('infrastructure.new') }}
        </w-button>
      </div>
    </header>

    <section class="catalog-strip">
      <div class="catalog-strip__header">
        <span class="catalog-strip__title">CATÁLOGO BASE</span>
        <span class="catalog-strip__caption">IA, clouds, edge, bases de datos, observabilidad y pagos</span>
      </div>
      <div class="catalog-grid">
        <article v-for="provider in providerSuggestions" :key="provider.name" class="catalog-card">
          <span class="catalog-card__category">{{ provider.category }}</span>
          <h3 class="catalog-card__name">{{ provider.name }}</h3>
          <p class="catalog-card__services">{{ provider.services.slice(0, 4).join(' · ') }}</p>
        </article>
      </div>
    </section>

    <main class="page-content">
      <w-card class="no-padding">
        <w-table :headers="headers" :items="items" :loading="loading" :empty-message="$t('infrastructure.noRecords')">
          <template #item-provider="{ item }">
            <div class="resource-cell">
              <span class="resource-cell__primary">{{ item.provider || 'Sin proveedor' }}</span>
              <span v-if="item.type" class="resource-cell__secondary">{{ item.type }}</span>
            </div>
          </template>
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
import { mapActions, mapState } from 'pinia'
import WBadge from '@/components/ui/WBadge.vue'
import WButton from '@/components/ui/WButton.vue'
import WCard from '@/components/ui/WCard.vue'
import WCrudModal from '@/components/ui/WCrudModal.vue'
import WTable from '@/components/ui/WTable.vue'
import { useToast } from '@/composables/useToast'
import { useInfrastructureStore } from '@/stores/infrastructure.store'
import {
  getInfrastructureSuggestions,
  loadInfrastructureProviderOptionByValue,
  loadInfrastructureProviderOptions,
  loadInfrastructureTypeOptionByValue,
  loadInfrastructureTypeOptions
} from '@/utils/infrastructure-catalog'

export default defineComponent({
  name: 'InfrastructurePage',
  components: { WButton, WTable, WCard, WBadge, WCrudModal },
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      showCrudModal: false,
      crudData: {} as any,
      providerSuggestions: getInfrastructureSuggestions().slice(0, 12),
    }
  },
  computed: {
    ...mapState(useInfrastructureStore, ['items', 'loading', 'filters']),
    headers() {
      return [
        { key: 'name', label: this.$t('infrastructure.fields.name').toUpperCase() },
        { key: 'provider', label: 'PROVEEDOR / SERVICIO' },
        { key: 'status', label: this.$t('infrastructure.fields.status').toUpperCase() },
        { key: 'cost', label: this.$t('infrastructure.fields.cost').toUpperCase() },
        { key: 'actions', label: this.$t('common.actions').toUpperCase(), width: '100px' }
      ]
    },
    crudSchema() {
      return [
        { name: 'name', label: this.$t('infrastructure.fields.name'), type: 'text', required: true },
        {
          name: 'provider',
          label: this.$t('infrastructure.fields.provider'),
          type: 'remote-select',
          placeholder: 'Selecciona un proveedor',
          searchPlaceholder: 'Buscar proveedor o plataforma...',
          allowCustom: true,
          customLabelPrefix: 'Usar proveedor personalizado',
          loadOptions: loadInfrastructureProviderOptions,
          loadOptionByValue: loadInfrastructureProviderOptionByValue,
          resets: ['type']
        },
        {
          name: 'type',
          label: this.$t('infrastructure.fields.type'),
          type: 'remote-select',
          placeholder: 'Selecciona un servicio',
          searchPlaceholder: 'Buscar servicio o recurso...',
          dependsOn: 'provider',
          dependsOnMessage: 'Selecciona primero un proveedor',
          allowCustom: true,
          customLabelPrefix: 'Usar servicio personalizado',
          loadOptions: loadInfrastructureTypeOptions,
          loadOptionByValue: loadInfrastructureTypeOptionByValue
        },
        { name: 'status', label: this.$t('infrastructure.fields.status'), type: 'select', options: [
          { label: 'Running', value: 'RUNNING' },
          { label: 'Stopped', value: 'STOPPED' },
          { label: 'Error', value: 'ERROR' }
        ]},
        { name: 'cost', label: this.$t('infrastructure.fields.cost'), type: 'number' },
        { name: 'currency', label: this.$t('infrastructure.fields.currency'), type: 'text' }
      ]
    }
  },
  methods: {
    ...mapActions(useInfrastructureStore, ['fetchAll', 'create', 'update', 'remove']),
    handleSearch() {
      this.fetchAll()
    },
    openNewModal() {
      this.crudData = {
        currency: 'USD',
        status: 'RUNNING',
        provider: '',
        type: '',
      }
      this.showCrudModal = true
    },
    openEditModal(item: any) {
      this.crudData = {
        ...item,
        provider: item.provider || '',
        type: item.type || '',
      }
      this.showCrudModal = true
    },
    async confirmDelete(item: any) {
      if (confirm(this.$t('infrastructure.deleteConfirm'))) {
        await this.remove(item._id)
      }
    },
    async onSaveCrud(data: any) {
      const {
        _id,
        provider,
        type,
        ...rest
      } = data

      const resolvedProvider = (provider || '').trim()
      const resolvedType = (type || '').trim()

      const dto = {
        ...rest,
        provider: resolvedProvider || undefined,
        type: resolvedType || undefined
      }

      if (!dto.provider) {
        this.toast.warning('Selecciona un proveedor del catálogo o carga uno personalizado antes de guardar')
        return
      }

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
      if (status === 'RUNNING') return 'var(--color-success)'
      if (status === 'STOPPED') return 'var(--color-warning)'
      return 'var(--color-error)'
    }
  },
  mounted() {
    this.fetchAll()
  }
})
</script>

<style scoped>
.infrastructure-page { padding: 32px; flex-grow: 1; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.header-left { display: flex; align-items: center; gap: 32px; }
.header-filters { display: flex; align-items: center; gap: 16px; }
.page-title { font-family: var(--font-body); font-size: 24px; font-weight: 600; color: var(--color-text-base); }
.search-box { position: relative; width: 280px; }
.search-box span { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--color-text-muted); }
.search-box input { width: 100%; background-color: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 8px 12px 8px 36px; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-base); outline: none; }
@media (max-width: 1024px) {
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .infrastructure-page {
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
  .catalog-strip__header {
    flex-direction: column;
    align-items: flex-start;
  }
}

.catalog-strip { margin-bottom: 24px; padding: 20px; border: 1px solid var(--color-border); background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent); }
.catalog-strip__header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; gap: 16px; }
.catalog-strip__title { font-family: var(--font-mono); font-size: 11px; letter-spacing: var(--letter-spacing-caps); color: var(--color-text-muted); }
.catalog-strip__caption { font-family: var(--font-body); font-size: 13px; color: var(--color-text-subtle); }
.catalog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.catalog-card { padding: 14px; border: 1px solid var(--color-border-subtle); background: var(--color-bg-surface); min-height: 110px; }
.catalog-card__category { display: block; margin-bottom: 8px; font-family: var(--font-mono); font-size: 10px; letter-spacing: var(--letter-spacing-caps); color: var(--color-primary); text-transform: uppercase; }
.catalog-card__name { margin: 0 0 8px; font-family: var(--font-body); font-size: 15px; color: var(--color-text-base); }
.catalog-card__services { margin: 0; font-family: var(--font-body); font-size: 12px; line-height: 1.45; color: var(--color-text-muted); }
.infrastructure-page { padding: 32px; flex-grow: 1; min-width: 0; display: flex; flex-direction: column; }
.page-content { flex-grow: 1; min-width: 0; display: flex; flex-direction: column; }
.no-padding { display: flex; flex-direction: column; min-width: 0; }
.no-padding :deep(.w-card__body) { padding: 0 !important; display: flex; flex-direction: column; flex-grow: 1; min-width: 0; }
.mr-2 { margin-right: 8px; }
.table-actions { display: flex; gap: 8px; }
.action-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; display: flex; padding: 4px; }
.action-btn:hover { color: var(--color-text-base); }
.text-error { color: var(--color-error) !important; }

</style>
