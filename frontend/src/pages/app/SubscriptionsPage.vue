<template>
  <div class="subscriptions-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ $t('subscriptions.title') }}</h1>
        <div class="header-filters">
          <div class="search-box">
            <span class="material-symbols-outlined">search</span>
            <input type="text" v-model="filters.search" placeholder="BUSCAR..." @input="handleSearch" />
          </div>
          <select v-model="filters.type" class="filter-select" @change="handleSearch">
            <option value="">Todo tipo</option>
            <option value="income">Ingresos</option>
            <option value="expense">Egresos</option>
          </select>
        </div>
      </div>
      <div class="header-right">
        <w-button variant="primary" @click="openNewModal">
          <span class="material-symbols-outlined mr-2">add</span>
          NUEVO
        </w-button>
      </div>
    </header>

    <main class="page-content">
      <w-card class="no-padding">
        <w-table
          :headers="headers"
          :items="items"
          :loading="loading"
          empty-message="No se encontraron registros."
          row-clickable
          @row-click="goToDetail"
        >
          <template #item-type="{ item }">
            <w-badge :color="item.type === 'expense' ? 'var(--color-warning)' : 'var(--color-success)'">
              {{ item.type === 'expense' ? 'Egreso' : 'Ingreso' }}
            </w-badge>
          </template>
          <template #item-clientId="{ item }">
            <span>{{ getClientLabel(item.clientId) }}</span>
          </template>
          <template #item-status="{ item }">
            <w-badge v-if="item.status" :color="getStatusColor(item.status)">{{ getStatusLabel(item.status) }}</w-badge>
          </template>
          <template #item-lastPaymentDate="{ item }">
            <span v-if="item.lastPaymentDate" class="date-cell">
              {{ formatDate(item.lastPaymentDate) }}
            </span>
            <span v-else class="text-muted">—</span>
          </template>
          <template #item-nextBillingDate="{ item }">
            <span
              v-if="item.nextBillingDate"
              class="date-cell"
              :class="{ 'text-warning': isExpiringSoon(item.nextBillingDate), 'text-error': isOverdue(item.nextBillingDate) }"
            >
              {{ formatDate(item.nextBillingDate) }}
            </span>
            <span v-else class="text-muted">—</span>
          </template>
          <template #item-price="{ item }">
            <span class="mono-value">{{ formatMoney(item.price, item.currency) }}</span>
          </template>
          <template #item-actions="{ item }">
            <div class="table-actions">
              <button class="action-btn" @click.stop="openEditModal(item)" title="Editar">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button class="action-btn text-error" @click.stop="confirmDelete(item)" title="Eliminar">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </template>
        </w-table>
      </w-card>

      <div v-if="!loading && items.length === 0" class="empty-cta">
        <p class="empty-cta-text">Cargá tu primer recurrente: cuotas de clientes o pagos como servidores.</p>
        <w-button variant="primary" @click="openNewModal">
          <span class="material-symbols-outlined mr-2">add</span>
          NUEVO
        </w-button>
      </div>
    </main>

    <w-crud-modal v-model="showCrudModal" :schema="crudSchema" :initial-data="crudData" :loading="loading" @save="onSaveCrud" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useSubscriptionsStore } from '@/stores/subscriptions.store'
import WButton from '@/components/ui/WButton.vue'
import WTable from '@/components/ui/WTable.vue'
import WCard from '@/components/ui/WCard.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WCrudModal from '@/components/ui/WCrudModal.vue'
import {
  loadClientOptionById,
  loadClientOptions,
} from '@/utils/remote-entity-options'
import { formatDate, isExpiringSoon } from '@/utils/date'

export default defineComponent({
  name: 'SubscriptionsPage',
  components: { WButton, WTable, WCard, WBadge, WCrudModal },
  data() {
    return {
      headers: [
        { key: 'planName', label: 'PLAN' },
        { key: 'type', label: 'TIPO' },
        { key: 'clientId', label: 'CLIENTE' },
        { key: 'status', label: 'ESTADO' },
        { key: 'billingCycle', label: 'CICLO' },
        { key: 'price', label: 'PRECIO' },
        { key: 'lastPaymentDate', label: 'ÚLTIMO PAGO' },
        { key: 'nextBillingDate', label: 'PRÓXIMO PAGO' },
        { key: 'actions', label: 'ACCIONES', width: '100px' }
      ],
      showCrudModal: false,
      crudData: {} as any,
      clientLabels: {} as Record<string, string>,
      crudSchema: [
        { name: 'type', label: 'Tipo', type: 'select', required: true, options: [
          { label: 'Ingreso (cuota de cliente)', value: 'income' },
          { label: 'Egreso (servidor, SaaS)', value: 'expense' }
        ]},
        {
          name: 'clientId',
          label: 'Cliente (solo ingresos)',
          type: 'remote-select',
          searchPlaceholder: 'Buscar cliente por nombre o email...',
          loadOptions: loadClientOptions,
          loadOptionByValue: loadClientOptionById
        },
        { name: 'planName', label: 'Plan', type: 'text', required: true },
        { name: 'nextBillingDate', label: 'Próxima factura', type: 'date', required: true },
        { name: 'price', label: 'Precio', type: 'number', centsField: true },
        { name: 'currency', label: 'Moneda', type: 'text' },
        { name: 'billingCycle', label: 'Ciclo', type: 'select', options: [
          { label: 'Mensual', value: 'monthly' },
          { label: 'Anual', value: 'yearly' }
        ]},
        { name: 'status', label: 'Estado', type: 'select', options: [
          { label: 'Activo', value: 'active' },
          { label: 'Vencido', value: 'past_due' },
          { label: 'Cancelado', value: 'canceled' }
        ]}
      ]
    }
  },
  computed: {
    ...mapState(useSubscriptionsStore, ['items', 'loading', 'filters'])
  },
  methods: {
    ...mapActions(useSubscriptionsStore, ['fetchAll', 'setFilters', 'create', 'update', 'remove']),
    formatDate,
    isExpiringSoon,
    isOverdue(date: string) {
      return new Date(date) < new Date()
    },
    formatMoney(cents: number, currency = 'USD') {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: currency || 'USD' }).format((cents || 0) / 100)
    },
    async loadRelationLabels() {
      const ids = [...new Set(this.items.map((item: any) => item.clientId).filter(Boolean))]
      await Promise.all(ids.map(async (id: any) => {
        if (this.clientLabels[id]) return
        const option = await loadClientOptionById(id).catch(() => null)
        if (option) this.clientLabels[id] = option.label
      }))
    },
    getClientLabel(clientId?: string) {
      if (!clientId) return 'Sin cliente'
      return this.clientLabels[clientId] || ''
    },
    getStatusColor(status: string) {
      if (status === 'active') return 'var(--color-success)'
      if (status === 'past_due') return 'var(--color-warning)'
      return 'var(--color-error)'
    },
    getStatusLabel(status: string) {
      if (status === 'active') return 'Activo'
      if (status === 'past_due') return 'Vencido'
      if (status === 'canceled') return 'Cancelado'
      return status
    },
    async refreshPage() {
      await this.fetchAll()
      await this.loadRelationLabels()
    },
    handleSearch() {
      this.refreshPage()
    },
    goToDetail(item: any) {
      this.$router.push({ name: 'subscription-detail', params: { id: item._id } })
    },
    openNewModal() {
      this.crudData = { type: 'income' }
      this.showCrudModal = true
    },
    openEditModal(item: any) {
      this.crudData = { ...item }
      this.showCrudModal = true
    },
    async confirmDelete(item: any) {
      if (confirm('¿Estás seguro de eliminar esta suscripción?')) {
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
        // error toast shown by store
      }
    }
  },
  mounted() {
    this.refreshPage()
  }
})
</script>

<style scoped>
.subscriptions-page { padding: 32px; flex-grow: 1; min-width: 0; display: flex; flex-direction: column; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; flex-shrink: 0; }
.header-left { display: flex; align-items: center; gap: 32px; }
.header-filters { display: flex; align-items: center; gap: 16px; }
.page-title { font-family: var(--font-body); font-size: 24px; font-weight: 600; color: var(--color-text-base); }
.search-box { position: relative; width: 280px; }
.search-box span { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--color-text-muted); }
.search-box input { width: 100%; background-color: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 8px 12px 8px 36px; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-base); outline: none; }
.filter-select { background-color: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 8px 12px; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-base); outline: none; }

.page-content { flex-grow: 1; min-width: 0; display: flex; flex-direction: column; }

.empty-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  padding: 20px;
  border: 1px dashed var(--color-border);
}

.empty-cta-text {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}
.no-padding { display: flex; flex-direction: column; min-width: 0; }
.no-padding :deep(.w-card__body) { padding: 0 !important; display: flex; flex-direction: column; flex-grow: 1; min-width: 0; }

.mr-2 { margin-right: 8px; }
.table-actions { display: flex; gap: 8px; }
.action-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; display: flex; padding: 4px; }
.action-btn:hover { color: var(--color-text-base); }
.text-error { color: var(--color-error) !important; }
.text-warning { color: var(--color-warning) !important; }
.text-muted { color: var(--color-text-muted); }
.date-cell { font-family: var(--font-mono); font-size: 12px; }
.mono-value { font-family: var(--font-mono); font-size: 12px; }

@media (max-width: 1024px) {
  .header-left { flex-direction: column; align-items: flex-start; gap: 12px; }
}
@media (max-width: 768px) {
  .subscriptions-page { padding: 16px; }
  .page-header { flex-direction: column; align-items: stretch; gap: 16px; margin-bottom: 20px; }
  .header-left { flex-direction: column; align-items: flex-start; gap: 12px; }
  .header-filters { flex-direction: column; align-items: stretch; }
  .search-box { width: 100%; }
}
</style>
