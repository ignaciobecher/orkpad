<template>
  <w-card class="no-padding">
    <table class="finance-grid">
      <thead>
        <tr>
          <th class="col-id">#</th>
          <th>{{ $t('projects.detail.gridConcept') }}</th>
          <th class="col-amount">{{ $t('projects.detail.gridAmount') }}</th>
          <th class="col-date">{{ $t('projects.detail.gridDueDate') }}</th>
          <th class="col-status">{{ $t('projects.fields.status') }}</th>
          <th class="col-date">{{ $t('projects.detail.gridPaidDate') }}</th>
          <th>{{ $t('projects.detail.gridMethod') }}</th>
          <th class="col-actions"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length">
          <td colspan="8" class="empty-row">{{ $t('projects.detail.noInvoices') }}</td>
        </tr>
        <tr v-for="row in rows" :key="row._id" :class="{ 'row-saving': savingIds.has(row._id) }">
          <td class="col-id">
            <w-badge v-if="row.installmentCount" color="var(--color-primary)">
              {{ row.installmentNumber }}/{{ row.installmentCount }}
            </w-badge>
            <span v-else class="text-muted">—</span>
          </td>
          <td>
            <input
              v-model="row.number"
              type="text"
              class="cell-input"
              placeholder="CUOTA NRO 1"
              @change="saveRow(row)"
            />
          </td>
          <td class="col-amount">
            <input
              v-model.number="row.total"
              type="number"
              min="0"
              step="0.01"
              class="cell-input cell-number"
              @change="saveRow(row)"
            />
          </td>
          <td class="col-date">
            <input
              v-model="row.dueDate"
              type="date"
              class="cell-input"
              @change="saveRow(row)"
            />
          </td>
          <td class="col-status">
            <select v-model="row.status" class="cell-input" @change="onStatusChange(row)">
              <option value="draft">{{ $t('finance.status.draft') }}</option>
              <option value="pending">{{ $t('finance.status.pending') }}</option>
              <option value="sent">{{ $t('finance.status.sent') }}</option>
              <option value="paid">{{ $t('finance.status.paid') }}</option>
              <option value="collected">{{ $t('finance.status.collected') }}</option>
              <option value="overdue">{{ $t('finance.status.overdue') }}</option>
              <option value="cancelled">{{ $t('finance.status.cancelled') }}</option>
            </select>
          </td>
          <td class="col-date">
            <input
              v-model="row.paidDate"
              type="date"
              class="cell-input"
              @change="saveRow(row)"
            />
          </td>
          <td>
            <select v-model="row.paymentMethod" class="cell-input" @change="saveRow(row)">
              <option value="">—</option>
              <option v-for="name in methodNames" :key="name" :value="name">{{ name }}</option>
            </select>
          </td>
          <td class="col-actions">
            <div class="row-actions">
              <span v-if="savingIds.has(row._id)" class="material-symbols-outlined spinning">sync</span>
              <button
                v-else-if="!isCollected(row)"
                class="action-btn"
                :title="$t('projects.detail.markPaid')"
                @click="markPaid(row)"
              >
                <span class="material-symbols-outlined">check_circle</span>
              </button>
              <button class="action-btn action-btn--danger" :title="$t('common.delete')" @click="removeRow(row)">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="draft" class="draft-row">
          <td class="col-id">
            <span class="text-muted">new</span>
          </td>
          <td>
            <div class="number-cell">
              <input
                v-model="draft.number"
                type="text"
                class="cell-input"
                :placeholder="$t('projects.detail.draftNumberPlaceholder')"
              />
              <button class="action-btn" :title="$t('projects.detail.autoNumber')" @click="draft.number = autoNumber()">
                <span class="material-symbols-outlined">auto_fix_high</span>
              </button>
            </div>
          </td>
          <td class="col-amount">
            <input
              v-model.number="draft.total"
              type="number"
              min="0"
              step="0.01"
              class="cell-input cell-number"
            />
          </td>
          <td class="col-date">
            <input v-model="draft.dueDate" type="date" class="cell-input" />
          </td>
          <td class="col-status">
            <select v-model="draft.status" class="cell-input">
              <option value="draft">{{ $t('finance.status.draft') }}</option>
              <option value="pending">{{ $t('finance.status.pending') }}</option>
              <option value="sent">{{ $t('finance.status.sent') }}</option>
              <option value="paid">{{ $t('finance.status.paid') }}</option>
              <option value="collected">{{ $t('finance.status.collected') }}</option>
              <option value="overdue">{{ $t('finance.status.overdue') }}</option>
              <option value="cancelled">{{ $t('finance.status.cancelled') }}</option>
            </select>
          </td>
          <td class="col-date">
            <input v-model="draft.paidDate" type="date" class="cell-input" />
          </td>
          <td>
            <select v-model="draft.paymentMethod" class="cell-input">
              <option value="">—</option>
              <option v-for="name in methodNames" :key="name" :value="name">{{ name }}</option>
            </select>
          </td>
          <td class="col-actions">
            <div class="row-actions">
              <button class="action-btn action-btn--save" :title="$t('common.save')" @click="saveDraft">
                <span class="material-symbols-outlined">check</span>
              </button>
              <button class="action-btn action-btn--danger" :title="$t('common.cancel')" @click="draft = null">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </w-card>

  <div class="grid-footer">
    <w-button variant="secondary" :loading="adding" @click="addRowAuto">
      <span class="material-symbols-outlined mr-1">auto_fix_high</span>
      {{ $t('projects.detail.addInstallmentAuto') }}
    </w-button>
    <w-button variant="ghost" @click="addRowManual">
      <span class="material-symbols-outlined mr-1">edit</span>
      {{ $t('projects.detail.addInstallmentManual') }}
    </w-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted } from 'vue'
import { invoicesApi } from '@/api/invoices/invoices.api'
import { useToast } from '@/composables/useToast'
import { usePaymentMethodsStore } from '@/stores/payment-methods.store'
import WCard from '@/components/ui/WCard.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WButton from '@/components/ui/WButton.vue'

interface GridRow {
  _id: string
  number?: string
  total?: number
  dueDate?: string
  status: string
  paidDate?: string
  paymentMethod?: string
  installmentNumber?: number | null
  installmentCount?: number | null
}

const EDITABLE = ['number', 'total', 'dueDate', 'status', 'paidDate', 'paymentMethod'] as const

function toRow(inv: any): GridRow {
  return {
    _id: inv._id,
    number: inv.number ?? '',
    total: inv.total ?? 0,
    dueDate: inv.dueDate ? String(inv.dueDate).slice(0, 10) : '',
    status: inv.status,
    paidDate: inv.paidDate ? String(inv.paidDate).slice(0, 10) : '',
    paymentMethod: inv.paymentMethod ?? '',
    installmentNumber: inv.installmentNumber ?? null,
    installmentCount: inv.installmentCount ?? null,
  }
}

export default defineComponent({
  name: 'ProjectFinanceGrid',
  components: { WCard, WBadge, WButton },
  props: {
    projectId: { type: String, required: true },
    clientId: { type: String, default: '' },
    currency: { type: String, default: 'USD' },
    invoices: { type: Array as () => any[], default: () => [] },
  },
  emits: ['changed'],
  setup(props, { emit }) {
    const toast = useToast()
    const paymentMethodsStore = usePaymentMethodsStore()
    const methodNames = computed(() => paymentMethodsStore.activeNames)
    const rows = ref<GridRow[]>([])
    const savingIds = ref<Set<string>>(new Set())
    const adding = ref(false)
    const draft = ref<GridRow | null>(null)

    watch(
      () => props.invoices,
      (list) => {
        rows.value = (list ?? []).map(toRow)
      },
      { immediate: true },
    )

    onMounted(() => {
      paymentMethodsStore.fetchAll()
    })

    function isCollected(row: GridRow) {
      return row.status === 'paid' || row.status === 'collected' || row.status === 'cancelled'
    }

    async function saveRow(row: GridRow) {
      if (savingIds.value.has(row._id)) return
      // Al cobrar, si no hay fecha se registra hoy (como en la planilla).
      if ((row.status === 'paid' || row.status === 'collected') && !row.paidDate) {
        row.paidDate = new Date().toISOString().split('T')[0]
      }
      const dto: Record<string, any> = {}
      for (const key of EDITABLE) {
        const v = (row as any)[key]
        dto[key] = v === '' ? null : v
      }
      savingIds.value.add(row._id)
      try {
        await invoicesApi.update(row._id, dto)
        emit('changed')
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Error al guardar')
        const fresh = props.invoices.find((i: any) => i._id === row._id)
        if (fresh) Object.assign(row, toRow(fresh))
      } finally {
        savingIds.value.delete(row._id)
      }
    }

    function onStatusChange(row: GridRow) {
      saveRow(row)
    }

    async function markPaid(row: GridRow) {
      row.status = 'paid'
      if (!row.paidDate) row.paidDate = new Date().toISOString().split('T')[0]
      await saveRow(row)
    }

    function autoNumber() {
      return `C-${Date.now().toString(36).toUpperCase()}`
    }

    function blankDraft(): GridRow {
      return {
        _id: '',
        number: '',
        total: 0,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        paidDate: '',
        paymentMethod: '',
        installmentNumber: null,
        installmentCount: null,
      }
    }

    async function addRowAuto() {
      adding.value = true
      try {
        await invoicesApi.create({
          type: 'income',
          status: 'pending',
          number: autoNumber(),
          clientId: props.clientId || undefined,
          projectId: props.projectId,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date().toISOString().split('T')[0],
          currency: props.currency,
          total: 0,
        } as any)
        emit('changed')
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Error al crear la factura')
      } finally {
        adding.value = false
      }
    }

    function addRowManual() {
      if (draft.value) return
      draft.value = blankDraft()
    }

    async function saveDraft() {
      if (!draft.value || adding.value) return
      if ((draft.value.status === 'paid' || draft.value.status === 'collected') && !draft.value.paidDate) {
        draft.value.paidDate = new Date().toISOString().split('T')[0]
      }
      adding.value = true
      try {
        await invoicesApi.create({
          type: 'income',
          status: draft.value.status || 'pending',
          number: draft.value.number?.trim() || autoNumber(),
          clientId: props.clientId || undefined,
          projectId: props.projectId,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: draft.value.dueDate || new Date().toISOString().split('T')[0],
          currency: props.currency,
          total: draft.value.total ?? 0,
          paidDate: draft.value.paidDate || undefined,
          paymentMethod: draft.value.paymentMethod?.trim() || undefined,
        } as any)
        draft.value = null
        emit('changed')
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Error al crear la factura')
      } finally {
        adding.value = false
      }
    }

    async function removeRow(row: GridRow) {
      if (!confirm('¿Eliminar esta fila?')) return
      try {
        await invoicesApi.remove(row._id)
        emit('changed')
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Error al eliminar')
      }
    }

    return { rows, savingIds, adding, draft, methodNames, isCollected, saveRow, onStatusChange, markPaid, addRowAuto, addRowManual, saveDraft, removeRow }
  },
})
</script>

<style scoped>
.finance-grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.finance-grid thead th {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  text-align: left;
  padding: 10px 8px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-surface-low);
  white-space: nowrap;
}

.finance-grid tbody td {
  padding: 4px;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.finance-grid tbody tr:last-child td {
  border-bottom: none;
}

.empty-row {
  text-align: center;
  color: var(--color-text-muted);
  padding: 24px !important;
}

.col-id {
  width: 64px;
  text-align: center;
}

.col-amount {
  width: 130px;
}

.col-date {
  width: 150px;
}

.col-status {
  width: 140px;
}

.col-actions {
  width: 76px;
}

.cell-input {
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 7px 8px;
  font-size: 13px;
  color: var(--color-text-base);
  outline: none;
  transition: border-color 0.15s ease, background-color 0.15s ease;
  box-sizing: border-box;
}

.cell-input:hover {
  border-color: var(--color-border);
}

.cell-input:focus {
  border-color: var(--color-primary);
  background: var(--color-bg-surface-high);
}

.cell-number {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

select.cell-input {
  cursor: pointer;
}

select.cell-input option {
  background: var(--color-bg-surface);
}

.row-actions {
  display: flex;
  gap: 2px;
  justify-content: flex-end;
  align-items: center;
}

.action-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: inline-flex;
  padding: 4px;
}

.action-btn:hover {
  color: var(--color-success);
}

.action-btn--danger:hover {
  color: var(--color-error);
}

.action-btn .material-symbols-outlined {
  font-size: 18px;
}

.row-saving {
  opacity: 0.6;
}

.spinning {
  animation: spin 1s linear infinite;
  font-size: 18px;
  color: var(--color-text-muted);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.grid-footer {
  display: flex;
  justify-content: flex-start;
  margin-top: 12px;
}

.mr-1 {
  margin-right: 4px;
}
</style>
