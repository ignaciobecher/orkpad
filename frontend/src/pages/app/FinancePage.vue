<template>
  <div class="finance-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ $t('finance.title') }}</h1>
        <div class="header-filters">
          <div class="search-box">
            <span class="material-symbols-outlined">search</span>
            <input type="text" v-model="filters.search" :placeholder="$t('finance.searchPlaceholder')" @input="handleSearch" />
          </div>
          <select v-model="filters.type" class="filter-select" @change="onFilterChange">
            <option value="">{{ $t('finance.type.all') }}</option>
            <option value="income">{{ $t('finance.type.income') }}</option>
            <option value="expense">{{ $t('finance.type.expense') }}</option>
          </select>
          <select v-model="filters.status" class="filter-select" @change="onFilterChange">
            <option value="">{{ $t('finance.status.all') }}</option>
            <option value="draft">{{ $t('finance.status.draft') }}</option>
            <option value="pending">{{ $t('finance.status.pending') }}</option>
            <option value="sent">{{ $t('finance.status.sent') }}</option>
            <option value="paid">{{ $t('finance.status.paid') }}</option>
            <option value="collected">{{ $t('finance.status.collected') }}</option>
            <option value="overdue">{{ $t('finance.status.overdue') }}</option>
          </select>
        </div>
      </div>
      <div class="header-right">
        <w-button variant="primary" @click="openNewModal">
          <span class="material-symbols-outlined mr-2">add</span>
          {{ $t('finance.newInvoice') }}
        </w-button>
      </div>
    </header>

    <div class="summary-cards">
      <w-card class="summary-card income">
        <div class="summary-icon">
          <span class="material-symbols-outlined">trending_up</span>
        </div>
        <div class="summary-content">
          <span class="summary-label">{{ $t('finance.type.income') }}</span>
          <span class="summary-value">{{ formatCurrency(totalIncome) }}</span>
        </div>
      </w-card>
      <w-card class="summary-card expense">
        <div class="summary-icon">
          <span class="material-symbols-outlined">trending_down</span>
        </div>
        <div class="summary-content">
          <span class="summary-label">{{ $t('finance.type.expense') }}</span>
          <span class="summary-value">{{ formatCurrency(totalExpense) }}</span>
        </div>
      </w-card>
      <w-card class="summary-card balance" :class="{ 'positive': balance >= 0, 'negative': balance < 0 }">
        <div class="summary-icon">
          <span class="material-symbols-outlined">account_balance_wallet</span>
        </div>
        <div class="summary-content">
          <span class="summary-label">{{ $t('finance.balance') }}</span>
          <span class="summary-value">{{ formatCurrency(balance) }}</span>
        </div>
      </w-card>
    </div>

    <main class="page-content">
      <w-card class="no-padding">
        <w-table :headers="headers" :items="formattedItems" :loading="loading" :empty-message="$t('finance.noInvoices')">
          <template #item-type="{ item }">
            <div class="type-cell" :class="item.type || 'income'">
              <span class="material-symbols-outlined">
                {{ (item.type === 'expense') ? 'arrow_downward' : 'arrow_upward' }}
              </span>
              {{ $t(`finance.type.${item.type || 'income'}`) }}
            </div>
          </template>
          <template #item-clientId="{ item }">
            <span>{{ getClientLabel(item.clientId) }}</span>
          </template>
          <template #item-total="{ item }">
            <span :class="{ 'font-bold': true, 'text-success': item.type !== 'expense', 'text-error': item.type === 'expense' }">
              {{ (item.type === 'expense' ? '-' : '+') }} {{ formatCurrency(item.total) }}
            </span>
          </template>
          <template #item-status="{ item }">
            <w-badge :color="getStatusColor(item.status)">{{ item.status }}</w-badge>
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
import { mapState, mapActions, mapWritableState } from 'pinia'
import { useInvoicesStore } from '@/stores/invoices.store'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import WButton from '@/components/ui/WButton.vue'
import WTable from '@/components/ui/WTable.vue'
import WCard from '@/components/ui/WCard.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WCrudModal from '@/components/ui/WCrudModal.vue'
import {
  loadClientOptionById,
  loadClientOptions,
  loadProjectOptionById,
  loadProjectOptions
} from '@/utils/remote-entity-options'

export default defineComponent({
  name: 'FinancePage',
  components: { WButton, WTable, WCard, WBadge, WCrudModal },
  data() {
    return {
      showCrudModal: false,
      crudData: {} as any,
      clientLabels: {} as Record<string, string>
    }
  },
  computed: {
    ...mapState(useInvoicesStore, ['items', 'loading', 'totalIncome', 'totalExpense', 'balance']),
    ...mapWritableState(useInvoicesStore, ['filters']),
    crudSchema() {
      return [
        { 
          name: 'type', 
          label: this.$t('finance.fields.type'), 
          type: 'select', 
          required: true,
          options: [
            { label: this.$t('finance.type.income'), value: 'income' },
            { label: this.$t('finance.type.expense'), value: 'expense' }
          ]
        },
        { name: 'number', label: this.$t('finance.fields.number'), type: 'text' },
        {
          name: 'clientId',
          label: this.$t('finance.fields.client'),
          type: 'remote-select',
          searchPlaceholder: this.$t('clients.searchPlaceholder'),
          loadOptions: loadClientOptions,
          loadOptionByValue: loadClientOptionById,
          resets: ['projectId']
        },
        { name: 'issueDate', label: this.$t('finance.fields.issueDate'), type: 'date', required: true },
        {
          name: 'projectId',
          label: this.$t('finance.fields.project'),
          type: 'remote-select',
          searchPlaceholder: this.$t('finance.fields.projectPlaceholder'),
          dependsOn: 'clientId',
          dependsOnMessage: this.$t('finance.dependsOnClient'),
          loadOptions: loadProjectOptions,
          loadOptionByValue: loadProjectOptionById
        },
        { name: 'total', label: this.$t('finance.fields.total'), type: 'number', required: true },
        { name: 'currency', label: this.$t('finance.fields.currency'), type: 'text' },
        { name: 'notes', label: this.$t('finance.fields.notes'), type: 'textarea' },
        { name: 'status', label: this.$t('finance.fields.status'), type: 'select', options: [
          { label: this.$t('finance.status.draft'), value: 'draft' },
          { label: this.$t('finance.status.pending'), value: 'pending' },
          { label: this.$t('finance.status.sent'), value: 'sent' },
          { label: this.$t('finance.status.paid'), value: 'paid' },
          { label: this.$t('finance.status.collected'), value: 'collected' },
          { label: this.$t('finance.status.overdue'), value: 'overdue' },
          { label: this.$t('finance.status.cancelled'), value: 'cancelled' }
        ]}
      ]
    },
    headers() {
      return [
        { key: 'type', label: this.$t('finance.fields.type').toUpperCase(), width: '120px' },
        { key: 'number', label: this.$t('finance.fields.number').toUpperCase() },
        { key: 'clientId', label: this.$t('finance.fields.client').toUpperCase() },
        { key: 'status', label: this.$t('finance.fields.status').toUpperCase() },
        { key: 'issueDateFormatted', label: this.$t('finance.fields.emision').toUpperCase() },
        { key: 'total', label: this.$t('finance.fields.total').toUpperCase() },
        { key: 'actions', label: this.$t('common.actions').toUpperCase(), width: '100px' }
      ]
    },
    formattedItems() {
      return this.items.map((item: any) => ({
        ...item,
        issueDateFormatted: item.issueDate ? formatDate(item.issueDate) : '—',
      }))
    }
  },
  methods: {
    ...mapActions(useInvoicesStore, ['fetchAll', 'setFilters', 'create', 'update', 'remove']),
    formatCurrency,
    async loadRelationLabels() {
      const ids = [...new Set(this.items.map(item => item.clientId).filter(Boolean))]
      await Promise.all(ids.map(async (id) => {
        if (this.clientLabels[id]) return
        const option = await loadClientOptionById(id).catch(() => null)
        if (option) this.clientLabels[id] = option.label
      }))
    },
    getClientLabel(clientId?: string) {
      if (!clientId) return '-'
      return this.clientLabels[clientId] || clientId
    },
    async refreshPage() {
      await this.fetchAll()
      await this.loadRelationLabels()
    },
    handleSearch() {
      this.refreshPage()
    },
    onFilterChange() {
      this.refreshPage()
    },
    openNewModal() {
      this.crudData = { 
        type: 'income',
        status: 'paid',
        issueDate: new Date().toISOString().split('T')[0],
        currency: 'USD'
      }
      this.showCrudModal = true
    },
    openEditModal(item: any) {
      this.crudData = { 
        ...item,
        issueDate: item.issueDate ? new Date(item.issueDate).toISOString().split('T')[0] : ''
      }
      this.showCrudModal = true
    },
    async confirmDelete(item: any) {
      if (confirm(this.$t('finance.deleteConfirm'))) {
        await this.remove(item._id)
        await this.loadRelationLabels()
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
        await this.loadRelationLabels()
        this.showCrudModal = false
      } catch {
        // error toast is shown by the store
      }
    },
    getStatusColor(status: string) {
      switch (status) {
        case 'draft': return 'var(--color-text-muted)'
        case 'pending': return 'var(--color-warning)'
        case 'sent': return 'var(--color-primary)'
        case 'paid': return 'var(--color-success)'
        case 'collected': return 'var(--color-success)'
        case 'overdue': return 'var(--color-error)'
        case 'cancelled': return 'var(--color-text-disabled)'
        default: return 'var(--color-text-muted)'
      }
    }
  },
  mounted() {
    this.refreshPage()
  }
})
</script>

<style scoped>
.finance-page { padding: 32px; flex-grow: 1; min-width: 0; display: flex; flex-direction: column; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; flex-shrink: 0; }
.header-left { display: flex; align-items: center; gap: 32px; }
.page-title { font-family: var(--font-body); font-size: 24px; font-weight: 600; color: var(--color-text-base); }
.header-filters { display: flex; align-items: center; gap: 16px; }
.search-box { position: relative; width: 280px; }
.search-box span { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--color-text-muted); }
.search-box input { width: 100%; background-color: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 8px 12px 8px 36px; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-base); outline: none; }
.filter-select { background-color: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 8px 12px; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-base); outline: none; }

.page-content { flex-grow: 1; min-width: 0; display: flex; flex-direction: column; }
.no-padding { display: flex; flex-direction: column; min-width: 0; }
.no-padding :deep(.w-card__body) { padding: 0 !important; display: flex; flex-direction: column; flex-grow: 1; min-width: 0; }

.summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; flex-shrink: 0; }
.summary-card { display: flex; align-items: center; gap: 20px; padding: 24px; border: 1px solid var(--color-border); }
.summary-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); }
.summary-icon span { font-size: 24px; }
.summary-content { display: flex; flex-direction: column; }
.summary-label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 1px; }
.summary-value { font-family: var(--font-body); font-size: 24px; font-weight: 600; color: var(--color-text-base); margin-top: 4px; }

.summary-card.income .summary-icon { color: var(--color-success); background: rgba(16, 185, 129, 0.1); }
.summary-card.expense .summary-icon { color: var(--color-error); background: rgba(239, 68, 68, 0.1); }
.summary-card.balance.positive .summary-icon { color: var(--color-primary); background: rgba(91, 78, 255, 0.1); }
.summary-card.balance.negative .summary-icon { color: var(--color-error); background: rgba(239, 68, 68, 0.1); }

.type-cell { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; }
.type-cell span { font-size: 16px; }
.type-cell.income { color: var(--color-success); }
.type-cell.expense { color: var(--color-error); }

.mr-2 { margin-right: 8px; }
.font-bold { font-weight: 600; }
.text-success { color: var(--color-success); }
.text-error { color: var(--color-error) !important; }
.table-actions { display: flex; gap: 8px; }
.action-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; display: flex; padding: 4px; }
.action-btn:hover { color: var(--color-text-base); }

@media (max-width: 1024px) {
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .finance-page {
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
  .filter-select {
    width: 100%;
  }
  .header-right {
    width: 100%;
  }
  .header-right :deep(.w-button) {
    width: 100%;
  }
  .summary-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

</style>
