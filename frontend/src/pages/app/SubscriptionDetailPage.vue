<template>
  <div class="subscription-detail">
    <!-- Header -->
    <header class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="$router.push({ name: 'subscriptions' })">
          <span class="material-symbols-outlined">arrow_back</span>
          <span>Volver a Suscripciones</span>
        </button>
        <template v-if="subscription">
          <div class="title-row">
            <h1 class="page-title">{{ subscription.planName }}</h1>
            <w-badge :color="getStatusColor(subscription.status)">{{ getStatusLabel(subscription.status) }}</w-badge>
          </div>
          <div class="subtitle-row">
            <span class="meta-item">
              <span class="material-symbols-outlined">person</span>
              {{ clientName }}
            </span>
            <span class="meta-item">
              <span class="material-symbols-outlined">autorenew</span>
              {{ subscription.billingCycle === 'monthly' ? 'Mensual' : 'Anual' }}
            </span>
            <span class="meta-item">
              <span class="material-symbols-outlined">payments</span>
              {{ formatMoney(subscription.price, subscription.currency) }}
            </span>
          </div>
        </template>
      </div>
      <div v-if="subscription" class="header-right">
        <w-button variant="ghost" @click="openEditModal">
          <span class="material-symbols-outlined mr-1">edit</span>
          Editar
        </w-button>
      </div>
    </header>

    <!-- Loading skeleton -->
    <div v-if="pageLoading && !subscription" class="loading-state">
      <span class="material-symbols-outlined loading-icon">progress_activity</span>
    </div>

    <template v-if="subscription">
      <!-- KPI Strip -->
      <section class="kpi-strip">
        <w-kpi-card
          title="Último Pago"
          :value="subscription.lastPaymentDate ? formatDate(subscription.lastPaymentDate) : '—'"
          icon="check_circle"
          color="var(--color-success)"
        />
        <w-kpi-card
          title="Próximo Vencimiento"
          :value="formatDate(subscription.nextBillingDate)"
          icon="event"
          :color="isOverdue(subscription.nextBillingDate) ? 'var(--color-error)' : isExpiringSoon(subscription.nextBillingDate) ? 'var(--color-warning)' : 'var(--color-primary)'"
        />
        <w-kpi-card
          title="Total Pagado"
          :value="formatMoney(totalPaid, subscription.currency)"
          icon="savings"
          color="var(--color-success)"
        />
        <w-kpi-card
          title="Períodos Pendientes"
          :value="pendingCount"
          icon="pending"
          :color="pendingCount > 0 ? 'var(--color-warning)' : 'var(--color-success)'"
        />
      </section>

      <!-- Payment Timeline -->
      <section class="timeline-section">
        <div class="section-header">
          <h2 class="section-title">Historial de Pagos</h2>
          <w-button variant="ghost" size="sm" @click="openAddPaymentModal">
            <span class="material-symbols-outlined mr-1">add</span>
            Agregar período
          </w-button>
        </div>

        <div v-if="paymentsLoading" class="loading-state">
          <span class="material-symbols-outlined loading-icon">progress_activity</span>
        </div>

        <div v-else-if="!payments.length" class="empty-timeline">
          <span class="material-symbols-outlined empty-icon">receipt_long</span>
          <p>No hay períodos registrados aún.</p>
          <w-button variant="primary" @click="openAddPaymentModal">
            <span class="material-symbols-outlined mr-1">add</span>
            Agregar primer período
          </w-button>
        </div>

        <div v-else class="payment-list">
          <div
            v-for="payment in payments"
            :key="payment._id"
            class="payment-row"
            :class="payment.status"
          >
            <div class="payment-left">
              <span class="payment-status-icon">
                <span v-if="payment.status === 'paid'" class="material-symbols-outlined icon-paid">check_circle</span>
                <span v-else class="material-symbols-outlined icon-pending">pending</span>
              </span>
              <div class="payment-info">
                <span class="payment-period">{{ payment.periodLabel }}</span>
                <span class="payment-due">Vence: {{ formatDate(payment.dueDate) }}</span>
                <span v-if="payment.paidAt" class="payment-paid-at">Pagado: {{ formatDate(payment.paidAt) }}</span>
                <span v-if="payment.notes" class="payment-notes">{{ payment.notes }}</span>
              </div>
            </div>
            <div class="payment-center">
              <span class="payment-amount">{{ formatMoney(payment.amount, payment.currency) }}</span>
            </div>
            <div class="payment-right">
              <w-button
                v-if="payment.status === 'pending'"
                variant="primary"
                size="sm"
                :loading="actionLoading === payment._id"
                @click="handleMarkPaid(payment)"
              >
                <span class="material-symbols-outlined mr-1">check</span>
                Marcar pagado
              </w-button>
              <w-button
                v-else
                variant="ghost"
                size="sm"
                :loading="actionLoading === payment._id"
                @click="handleMarkPending(payment)"
              >
                <span class="material-symbols-outlined mr-1">undo</span>
                Marcar pendiente
              </w-button>
              <button class="action-btn text-error" @click="handleDeletePayment(payment)" title="Eliminar período">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- Add Payment Modal -->
    <w-crud-modal
      v-model="showAddPaymentModal"
      :schema="paymentSchema"
      :initial-data="paymentData"
      :loading="paymentsLoading"
      @save="onSavePayment"
    />

    <!-- Edit Subscription Modal -->
    <w-crud-modal
      v-model="showEditModal"
      :schema="subscriptionSchema"
      :initial-data="subscriptionEditData"
      :loading="pageLoading"
      @save="onSaveSubscription"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { subscriptionsApi } from '@/api/subscriptions/subscriptions.api'
import { subscriptionPaymentsApi } from '@/api/subscriptions/subscription-payments.api'
import { useSubscriptionsStore } from '@/stores/subscriptions.store'
import type { Subscription, SubscriptionPayment } from '@/api/subscriptions/subscriptions.types'
import WButton from '@/components/ui/WButton.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WKpiCard from '@/components/ui/WKpiCard.vue'
import WCrudModal from '@/components/ui/WCrudModal.vue'
import { formatDate, isExpiringSoon } from '@/utils/date'
import {
  loadClientOptionById,
  loadClientOptions,
} from '@/utils/remote-entity-options'

export default defineComponent({
  name: 'SubscriptionDetailPage',
  components: { WButton, WBadge, WKpiCard, WCrudModal },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const toast = useToast()
    const store = useSubscriptionsStore()

    const subscriptionId = computed(() => route.params.id as string)
    const subscription = ref<Subscription | null>(null)
    const payments = ref<SubscriptionPayment[]>([])
    const clientName = ref('')
    const pageLoading = ref(false)
    const paymentsLoading = ref(false)
    const actionLoading = ref<string | null>(null)

    const showAddPaymentModal = ref(false)
    const showEditModal = ref(false)
    const paymentData = ref<Record<string, any>>({})
    const subscriptionEditData = ref<Record<string, any>>({})

    const totalPaid = computed(() =>
      payments.value
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    )

    const pendingCount = computed(() =>
      payments.value.filter(p => p.status === 'pending').length
    )

    const isOverdue = (date: string) => new Date(date) < new Date()

    const formatMoney = (cents: number, currency = 'USD') =>
      new Intl.NumberFormat('es-AR', { style: 'currency', currency: currency || 'USD' }).format((cents || 0) / 100)

    const getStatusColor = (status: string) => {
      if (status === 'active') return 'var(--color-success)'
      if (status === 'past_due') return 'var(--color-warning)'
      return 'var(--color-error)'
    }

    const getStatusLabel = (status: string) => {
      if (status === 'active') return 'Activo'
      if (status === 'past_due') return 'Vencido'
      if (status === 'canceled') return 'Cancelado'
      return status
    }

    async function loadSubscription() {
      pageLoading.value = true
      try {
        const { data } = await subscriptionsApi.getById(subscriptionId.value)
        subscription.value = data
        if (data.clientId) {
          const opt = await loadClientOptionById(data.clientId).catch(() => null)
          clientName.value = opt?.label ?? data.clientId
        }
      } catch {
        toast.error('No se pudo cargar la suscripción')
        router.push({ name: 'subscriptions' })
      } finally {
        pageLoading.value = false
      }
    }

    async function loadPayments() {
      paymentsLoading.value = true
      try {
        const { data } = await subscriptionPaymentsApi.getBySubscription(subscriptionId.value)
        payments.value = data
      } catch {
        toast.error('No se pudieron cargar los pagos')
      } finally {
        paymentsLoading.value = false
      }
    }

    async function handleMarkPaid(payment: SubscriptionPayment) {
      actionLoading.value = payment._id
      try {
        await subscriptionPaymentsApi.markPaid(subscriptionId.value, payment._id)
        await loadPayments()
        await loadSubscription()
        toast.success('Período marcado como pagado')
      } catch {
        toast.error('Error al marcar como pagado')
      } finally {
        actionLoading.value = null
      }
    }

    async function handleMarkPending(payment: SubscriptionPayment) {
      actionLoading.value = payment._id
      try {
        await subscriptionPaymentsApi.markPending(subscriptionId.value, payment._id)
        await loadPayments()
        await loadSubscription()
        toast.success('Período marcado como pendiente')
      } catch {
        toast.error('Error al marcar como pendiente')
      } finally {
        actionLoading.value = null
      }
    }

    async function handleDeletePayment(payment: SubscriptionPayment) {
      if (!confirm(`¿Eliminar el período "${payment.periodLabel}"?`)) return
      try {
        await subscriptionPaymentsApi.remove(subscriptionId.value, payment._id)
        await loadPayments()
        toast.success('Período eliminado')
      } catch {
        toast.error('Error al eliminar el período')
      }
    }

    function openAddPaymentModal() {
      paymentData.value = {
        amount: subscription.value?.price ?? 0,
        currency: subscription.value?.currency ?? 'USD',
      }
      showAddPaymentModal.value = true
    }

    async function onSavePayment(data: any) {
      try {
        await subscriptionPaymentsApi.create(subscriptionId.value, data)
        await loadPayments()
        await loadSubscription()
        showAddPaymentModal.value = false
        toast.success('Período agregado')
      } catch {
        toast.error('Error al agregar el período')
      }
    }

    function openEditModal() {
      subscriptionEditData.value = { ...subscription.value }
      showEditModal.value = true
    }

    async function onSaveSubscription(data: any) {
      const dto = { ...data }
      delete dto._id
      try {
        await store.update(subscriptionId.value, dto)
        await loadSubscription()
        showEditModal.value = false
      } catch {
        // toast shown by store
      }
    }

    const paymentSchema = [
      { name: 'periodLabel', label: 'Período', type: 'text', required: true, placeholder: 'ej. Mayo 2026' },
      { name: 'dueDate', label: 'Fecha de vencimiento', type: 'date', required: true },
      { name: 'amount', label: 'Monto', type: 'number', centsField: true },
      { name: 'currency', label: 'Moneda', type: 'text' },
      { name: 'notes', label: 'Notas', type: 'text' },
    ]

    const subscriptionSchema = [
      {
        name: 'clientId', label: 'Cliente', type: 'remote-select', required: true,
        searchPlaceholder: 'Buscar cliente...', loadOptions: loadClientOptions, loadOptionByValue: loadClientOptionById,
      },
      { name: 'planName', label: 'Plan', type: 'text', required: true },
      { name: 'nextBillingDate', label: 'Próxima factura', type: 'date', required: true },
      { name: 'price', label: 'Precio', type: 'number', centsField: true },
      { name: 'currency', label: 'Moneda', type: 'text' },
      { name: 'billingCycle', label: 'Ciclo', type: 'select', options: [
        { label: 'Mensual', value: 'monthly' }, { label: 'Anual', value: 'yearly' },
      ]},
      { name: 'status', label: 'Estado', type: 'select', options: [
        { label: 'Activo', value: 'active' }, { label: 'Vencido', value: 'past_due' }, { label: 'Cancelado', value: 'canceled' },
      ]},
    ]

    onMounted(async () => {
      await loadSubscription()
      await loadPayments()
    })

    return {
      subscription, payments, clientName, pageLoading, paymentsLoading, actionLoading,
      totalPaid, pendingCount,
      showAddPaymentModal, showEditModal, paymentData, subscriptionEditData,
      paymentSchema, subscriptionSchema,
      formatDate, formatMoney, isExpiringSoon, isOverdue, getStatusColor, getStatusLabel,
      handleMarkPaid, handleMarkPending, handleDeletePayment,
      openAddPaymentModal, onSavePayment, openEditModal, onSaveSubscription,
    }
  }
})
</script>

<style scoped>
.subscription-detail { padding: 32px; flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 32px; }

/* Header */
.page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-shrink: 0; }
.header-left { display: flex; flex-direction: column; gap: 8px; }
.back-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; color: var(--color-text-muted); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; padding: 0; margin-bottom: 4px; }
.back-btn:hover { color: var(--color-text-base); }
.back-btn .material-symbols-outlined { font-size: 16px; }
.title-row { display: flex; align-items: center; gap: 12px; }
.page-title { font-family: var(--font-body); font-size: 24px; font-weight: 600; color: var(--color-text-base); }
.subtitle-row { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.meta-item { display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 12px; color: var(--color-text-muted); }
.meta-item .material-symbols-outlined { font-size: 14px; }

/* KPI strip */
.kpi-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

/* Timeline */
.timeline-section { display: flex; flex-direction: column; gap: 16px; }
.section-header { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-family: var(--font-body); font-size: 16px; font-weight: 600; color: var(--color-text-base); }

.payment-list { display: flex; flex-direction: column; gap: 8px; }

.payment-row {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 20px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: border-color 0.15s;
}
.payment-row:hover { border-color: var(--color-border-strong, var(--color-primary)); }
.payment-row.paid { border-left: 3px solid var(--color-success); }
.payment-row.pending { border-left: 3px solid var(--color-warning); }

.payment-left { display: flex; align-items: flex-start; gap: 12px; flex: 1; min-width: 0; }
.payment-status-icon { flex-shrink: 0; margin-top: 2px; }
.icon-paid { color: var(--color-success); font-size: 20px; }
.icon-pending { color: var(--color-warning); font-size: 20px; }

.payment-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.payment-period { font-family: var(--font-body); font-size: 14px; font-weight: 600; color: var(--color-text-base); }
.payment-due { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); }
.payment-paid-at { font-family: var(--font-mono); font-size: 11px; color: var(--color-success); }
.payment-notes { font-family: var(--font-body); font-size: 12px; color: var(--color-text-muted); font-style: italic; margin-top: 2px; }

.payment-center { flex-shrink: 0; min-width: 100px; text-align: right; }
.payment-amount { font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--color-text-base); }

.payment-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.action-btn { background: none; border: none; cursor: pointer; display: flex; padding: 4px; color: var(--color-text-muted); }
.action-btn:hover { color: var(--color-error); }
.text-error { color: var(--color-error) !important; }

.empty-timeline { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 48px; background: var(--color-bg-surface); border: 1px dashed var(--color-border); border-radius: 8px; text-align: center; }
.empty-icon { font-size: 40px; color: var(--color-text-muted); }
.empty-timeline p { font-family: var(--font-body); color: var(--color-text-muted); }

.loading-state { display: flex; justify-content: center; padding: 48px; }
.loading-icon { font-size: 32px; color: var(--color-text-muted); animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.mr-1 { margin-right: 4px; }

@media (max-width: 1024px) {
  .kpi-strip { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .subscription-detail { padding: 16px; }
  .kpi-strip { grid-template-columns: 1fr; }
  .payment-row { flex-wrap: wrap; }
  .payment-center { min-width: auto; }
}
</style>
