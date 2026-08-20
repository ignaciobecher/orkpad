<template>
  <div class="clients-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ $t('clients.title') }}</h1>
        <div class="header-filters">
          <div class="search-box">
            <span class="material-symbols-outlined">search</span>
            <input type="text" v-model="filters.search" :placeholder="$t('clients.searchPlaceholder')" @input="handleSearch" />
          </div>
          <select v-model="filters.status" class="filter-select" @change="onFilterChange">
            <option value="">{{ $t('clients.allStatus') }}</option>
            <option value="active">{{ $t('clients.active') }}</option>
            <option value="archived">{{ $t('clients.archived') }}</option>
          </select>
        </div>
      </div>
      <div class="header-right">
        <w-button variant="primary" @click="openNewClientModal">
          <span class="material-symbols-outlined mr-2">person_add</span>
          {{ $t('clients.newClient') }}
        </w-button>
      </div>
    </header>

    <main class="page-content">
      <w-card class="no-padding">
        <w-table
          :headers="headers"
          :items="items"
          :loading="loading"
          :empty-message="$t('clients.noClients')"
          @row-click="viewClient"
        >
          <template #item-name="{ item }">
            <div class="client-name-cell">
              <w-avatar :name="item.name" :size="24" class="mr-2" />
              <span>{{ item.name }}</span>
            </div>
          </template>
          <template #item-status="{ item }">
            <w-badge :color="getStatusColor(item.status)">{{ item.status }}</w-badge>
          </template>
          <template #item-actions="{ item }">
            <div class="table-actions">
              <button class="action-btn" @click.stop="editClient(item)">
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

    <!-- Client Detail Drawer -->
    <w-drawer v-model="showDrawer" :title="selectedClient?.name || ''" width="450px">
      <client-360-view v-if="selectedClient" :client="selectedClient" />
      <template #footer>
        <div class="drawer-footer-actions">
          <w-button variant="secondary" block @click="showDrawer = false">{{ $t('clients.close') }}</w-button>
          <w-button variant="primary" block @click="editClient(selectedClient!)">{{ $t('clients.editProfile') }}</w-button>
        </div>
      </template>
    </w-drawer>

    <!-- CRUD Modal -->
    <w-crud-modal v-model="showCrudModal" :schema="crudSchema" :initial-data="crudData" :loading="loading" @save="onSaveCrud" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useClientsStore } from '@/stores/clients.store'
import { formatCurrency } from '@/utils/currency'
import WButton from '@/components/ui/WButton.vue'
import WTable from '@/components/ui/WTable.vue'
import WCard from '@/components/ui/WCard.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WAvatar from '@/components/ui/WAvatar.vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import WCrudModal from '@/components/ui/WCrudModal.vue'
import Client360View from '@/components/clients/Client360View.vue'

export default defineComponent({
  name: 'ClientsPage',
  components: { WButton, WTable, WCard, WBadge, WAvatar, WDrawer, Client360View, WCrudModal },
  data() {
    return {
      showDrawer: false,
      showCrudModal: false,
      crudData: {} as any
    }
  },
  computed: {
    ...mapState(useClientsStore, ['items', 'loading', 'filters', 'selected']),
    selectedClient() {
      return this.selected
    },
    crudSchema() {
      return [
        { name: 'name', label: this.$t('clients.fields.name'), type: 'text', required: true },
        { name: 'email', label: this.$t('clients.fields.email'), type: 'text' },
        { name: 'phone', label: this.$t('clients.fields.phone'), type: 'text' },
        { name: 'address', label: this.$t('clients.fields.address'), type: 'text' },
        { name: 'notes', label: this.$t('clients.fields.notes'), type: 'textarea' },
        { name: 'status', label: this.$t('clients.fields.status'), type: 'select', options: [
          { label: this.$t('clients.active'), value: 'active' },
          { label: this.$t('clients.archived'), value: 'archived' }
        ]}
      ]
    },
    headers() {
      return [
        { key: 'name', label: this.$t('clients.fields.name').toUpperCase() },
        { key: 'email', label: this.$t('clients.fields.email').toUpperCase() },
        { key: 'phone', label: this.$t('clients.fields.phone').toUpperCase() },
        { key: 'status', label: this.$t('clients.fields.status').toUpperCase() },
        { key: 'actions', label: this.$t('common.actions').toUpperCase(), width: '100px' }
      ]
    }
  },
  methods: {
    ...mapActions(useClientsStore, ['fetchAll', 'setFilters', 'fetchById', 'remove', 'create', 'update']),
    formatCurrency,
    handleSearch() {
      this.fetchAll()
    },
    onFilterChange() {
      this.fetchAll()
    },
    viewClient(client: any) {
      this.fetchById(client._id)
      this.showDrawer = true
    },
    editClient(client: any) {
      this.crudData = { ...client }
      this.showCrudModal = true
    },
    confirmDelete(client: any) {
      if (confirm(this.$t('clients.deleteConfirm', { name: client.name }))) {
        this.remove(client._id)
      }
    },
    openNewClientModal() {
      this.crudData = { status: 'active' }
      this.showCrudModal = true
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
      switch (status) {
        case 'active': return 'var(--color-success)'
        case 'archived': return 'var(--color-text-muted)'
        default: return 'var(--color-text-muted)'
      }
    }
  },
  mounted() {
    this.fetchAll()
  }
})
</script>

<style scoped>
.clients-page {
  padding: 32px;
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .clients-page {
    padding: 16px;
  }
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-shrink: 0;
  width: 100%;
}

@media (max-width: 1024px) {
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

@media (max-width: 768px) {
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
  .filter-select {
    width: 100%;
  }
  .header-right {
    width: 100%;
  }
  .header-right :deep(.w-button) {
    width: 100%;
  }
}

.page-title {
  font-family: var(--font-body);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
}

.header-filters {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  position: relative;
  width: 280px;
}

.search-box span {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--color-text-muted);
}

.search-box input {
  width: 100%;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 8px 12px 8px 36px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-base);
  outline: none;
}

.filter-select {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-base);
  outline: none;
}

.page-content {
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.no-padding {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.no-padding :deep(.w-card__body) {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
}

.client-name-cell {
  display: flex;
  align-items: center;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  padding: 4px;
}

.action-btn:hover {
  color: var(--color-text-base);
}

.text-error {
  color: var(--color-error) !important;
}

.drawer-footer-actions {
  display: flex;
  gap: 12px;
  padding: 16px;
}

.mr-2 { margin-right: 8px; }

</style>
