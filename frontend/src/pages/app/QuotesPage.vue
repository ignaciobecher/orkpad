<template>
  <div class="quotes-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Presupuestos</h1>
        <div class="header-filters">
          <div class="search-box">
            <span class="material-symbols-outlined">search</span>
            <input type="text" v-model="filters.search" placeholder="Buscar presupuestos..." @input="onSearch" />
          </div>
          <select v-model="filters.status" class="filter-select" @change="onFilterChange">
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="sent">Enviado</option>
            <option value="accepted">Aceptado</option>
            <option value="rejected">Rechazado</option>
            <option value="expired">Vencido</option>
          </select>
        </div>
      </div>
      <div class="header-right">
        <w-button variant="primary" @click="openNewQuote">
          <span class="material-symbols-outlined mr-2">add</span>
          Nuevo Presupuesto
        </w-button>
      </div>
    </header>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <w-card class="summary-card accepted">
        <div class="summary-icon"><span class="material-symbols-outlined">check_circle</span></div>
        <div class="summary-content">
          <span class="summary-label">Aceptados</span>
          <span class="summary-value">{{ formatCurrency(totalAccepted) }}</span>
        </div>
      </w-card>
      <w-card class="summary-card pending">
        <div class="summary-icon"><span class="material-symbols-outlined">hourglass_empty</span></div>
        <div class="summary-content">
          <span class="summary-label">En curso</span>
          <span class="summary-value">{{ formatCurrency(totalPending) }}</span>
        </div>
      </w-card>
      <w-card class="summary-card total-count">
        <div class="summary-icon"><span class="material-symbols-outlined">description</span></div>
        <div class="summary-content">
          <span class="summary-label">Total presupuestos</span>
          <span class="summary-value">{{ total }}</span>
        </div>
      </w-card>
    </div>

    <!-- Table -->
    <main class="page-content">
      <w-card class="no-padding">
        <w-table :headers="headers" :items="items" :loading="loading" empty-message="No hay presupuestos aún">
          <template #item-title="{ item }">
            <div class="title-cell">
              <span class="quote-title">{{ item.title }}</span>
              <span v-if="item.number" class="quote-number">{{ item.number }}</span>
            </div>
          </template>
          <template #item-clientId="{ item }">
            <span>{{ item.clientName || getClientLabel(item.clientId) || '-' }}</span>
          </template>
          <template #item-status="{ item }">
            <w-badge :color="getStatusColor(item.status)">{{ getStatusLabel(item.status) }}</w-badge>
          </template>
          <template #item-total="{ item }">
            <span class="total-amount">{{ formatCurrency(item.total, item.currency) }}</span>
          </template>
          <template #item-issueDate="{ item }">
            <span>{{ formatDate(item.issueDate) }}</span>
          </template>
          <template #item-actions="{ item }">
            <div class="table-actions">
              <button
                v-if="item.status === 'accepted'"
                class="action-btn action-btn--convert"
                title="Convertir a Factura"
                @click.stop="handleConvertToInvoice(item)"
              >
                <span class="material-symbols-outlined">receipt_long</span>
              </button>
              <button class="action-btn" title="Descargar PDF" @click.stop="handleDownloadPdf(item)">
                <span class="material-symbols-outlined">picture_as_pdf</span>
              </button>
              <button class="action-btn" title="Editar" @click.stop="openEditQuote(item)">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button class="action-btn text-error" title="Eliminar" @click.stop="confirmDelete(item)">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </template>
        </w-table>
      </w-card>

      <div v-if="!loading && items.length === 0" class="empty-cta">
        <p class="empty-cta-text">Cotizá tu primer trabajo para un cliente y seguilo hasta que lo acepte.</p>
        <w-button variant="primary" @click="openNewQuote">
          <span class="material-symbols-outlined mr-2">add</span>
          Nuevo Presupuesto
        </w-button>
      </div>
    </main>

    <!-- Quote Builder Modal -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
          <div class="quote-modal">
            <div class="modal-header">
              <h2 class="modal-title">{{ editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto' }}</h2>
              <button class="modal-close" @click="closeModal">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="modal-body">
              <!-- Tabs -->
              <div class="modal-tabs">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  :class="['tab-btn', { 'tab-btn--active': activeTab === tab.id }]"
                  @click="activeTab = tab.id"
                >
                  <span class="material-symbols-outlined">{{ tab.icon }}</span>
                  {{ tab.label }}
                </button>
              </div>

              <div class="tab-content">
                <!-- TAB: General -->
                <div v-show="activeTab === 'general'" class="form-grid">
                  <div class="form-field full-width">
                    <label class="field-label">Título del presupuesto *</label>
                    <input v-model="form.title" class="field-input" placeholder="Ej: Desarrollo web para Acme Corp" />
                  </div>
                  <div class="form-field">
                    <label class="field-label">Número</label>
                    <input v-model="form.number" class="field-input" placeholder="Q-2024-001" />
                  </div>
                  <div class="form-field">
                    <label class="field-label">Estado</label>
                    <select v-model="form.status" class="field-input">
                      <option value="draft">Borrador</option>
                      <option value="sent">Enviado</option>
                      <option value="accepted">Aceptado</option>
                      <option value="rejected">Rechazado</option>
                      <option value="expired">Vencido</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label class="field-label">Fecha de emisión</label>
                    <input v-model="form.issueDate" type="date" class="field-input" />
                  </div>
                  <div class="form-field">
                    <label class="field-label">Válido hasta</label>
                    <input v-model="form.expiresAt" type="date" class="field-input" />
                  </div>
                  <div class="form-field">
                    <label class="field-label">Moneda</label>
                    <select v-model="form.currency" class="field-input">
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="ARS">ARS</option>
                      <option value="BRL">BRL</option>
                      <option value="CLP">CLP</option>
                      <option value="MXN">MXN</option>
                      <option value="COP">COP</option>
                      <option value="UYU">UYU</option>
                    </select>
                  </div>
                  <div class="form-field full-width">
                    <label class="field-label">Alcance del proyecto</label>
                    <textarea v-model="form.scope" class="field-input" rows="2" placeholder="Descripción del alcance..." />
                  </div>
                  <div class="form-field full-width">
                    <label class="field-label">Entregables</label>
                    <textarea v-model="form.deliverables" class="field-input" rows="2" placeholder="Lista de entregables..." />
                  </div>
                </div>

                <!-- TAB: Client / Relations -->
                <div v-show="activeTab === 'client'" class="form-grid">
                  <div class="form-section-title full-width">Datos del cliente</div>
                  <div class="form-field">
                    <label class="field-label">Nombre del cliente</label>
                    <input v-model="form.clientName" class="field-input" placeholder="Nombre o empresa" />
                  </div>
                  <div class="form-field">
                    <label class="field-label">Email del cliente</label>
                    <input v-model="form.clientEmail" type="email" class="field-input" placeholder="cliente@email.com" />
                  </div>
                  <div class="form-field full-width">
                    <label class="field-label">Dirección del cliente</label>
                    <input v-model="form.clientAddress" class="field-input" placeholder="Dirección completa" />
                  </div>
                  <div class="form-section-title full-width">Vincular a proyecto/cliente</div>
                  <div class="form-field">
                    <label class="field-label">Cliente (CRM)</label>
                    <select v-model="form.clientId" class="field-input" @change="onClientChange">
                      <option value="">— Sin vincular —</option>
                      <option v-for="c in clientOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label class="field-label">Proyecto</label>
                    <select v-model="form.projectId" class="field-input">
                      <option value="">— Sin vincular —</option>
                      <option v-for="p in projectOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
                    </select>
                  </div>
                </div>

                <!-- TAB: Freelancer -->
                <div v-show="activeTab === 'freelancer'" class="form-grid">
                  <div class="form-section-title full-width">Tus datos (aparecen en el PDF)</div>
                  <div class="form-field">
                    <label class="field-label">Nombre / Empresa</label>
                    <input v-model="form.freelancerName" class="field-input" placeholder="Tu nombre o empresa" />
                  </div>
                  <div class="form-field">
                    <label class="field-label">Email</label>
                    <input v-model="form.freelancerEmail" type="email" class="field-input" placeholder="tu@email.com" />
                  </div>
                  <div class="form-field">
                    <label class="field-label">Teléfono</label>
                    <input v-model="form.freelancerPhone" class="field-input" placeholder="0000-0000" />
                  </div>
                  <div class="form-field">
                    <label class="field-label">Sitio web</label>
                    <input v-model="form.freelancerWebsite" class="field-input" placeholder="www.tusitio.com" />
                  </div>
                  <div class="form-field full-width">
                    <label class="field-label">Dirección</label>
                    <input v-model="form.freelancerAddress" class="field-input" placeholder="Ciudad, País" />
                  </div>
                </div>

                <!-- TAB: Items -->
                <div v-show="activeTab === 'items'" class="items-tab">
                  <div class="items-mode-toggle">
                    <button :class="['mode-btn', { active: itemsMode === 'flat' }]" @click="itemsMode = 'flat'">
                      Lista simple
                    </button>
                    <button :class="['mode-btn', { active: itemsMode === 'sections' }]" @click="itemsMode = 'sections'">
                      Por secciones
                    </button>
                  </div>

                  <!-- Flat items -->
                  <div v-if="itemsMode === 'flat'">
                    <div class="items-header">
                      <span class="col-desc">Descripción</span>
                      <span class="col-unit">Unidad</span>
                      <span class="col-qty">Cant.</span>
                      <span class="col-price">P. Unit.</span>
                      <span class="col-amount">Importe</span>
                      <span class="col-actions"></span>
                    </div>
                    <div v-for="(item, idx) in form.items" :key="idx" class="item-row">
                      <input v-model="item.description" class="field-input" placeholder="Descripción" @input="recalcItem(item)" />
                      <input v-model="item.unit" class="field-input" placeholder="hs" />
                      <input v-model.number="item.quantity" type="number" min="0" step="0.01" class="field-input" @input="recalcItem(item)" />
                      <input v-model.number="item.unitPrice" type="number" min="0" step="0.01" class="field-input" @input="recalcItem(item)" />
                      <input v-model.number="item.amount" type="number" min="0" step="0.01" class="field-input amount-field" />
                      <button class="remove-btn" @click="removeItem(form.items, idx)">
                        <span class="material-symbols-outlined">remove_circle</span>
                      </button>
                    </div>
                    <button class="add-row-btn" @click="addItem(form.items)">
                      <span class="material-symbols-outlined">add</span> Agregar ítem
                    </button>
                  </div>

                  <!-- Sections mode -->
                  <div v-if="itemsMode === 'sections'">
                    <div v-for="(section, si) in form.sections" :key="si" class="section-block">
                      <div class="section-header">
                        <div class="section-header-inputs">
                          <input v-model="section.title" class="field-input section-title-input" placeholder="Título de sección (ej: Diseño UI/UX)" />
                          <input v-model="section.description" class="field-input section-desc-input" placeholder="Descripción opcional" />
                        </div>
                        <button class="remove-btn" @click="form.sections.splice(si, 1)">
                          <span class="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                      <div class="items-header">
                        <span class="col-desc">Descripción</span>
                        <span class="col-unit">Unidad</span>
                        <span class="col-qty">Cant.</span>
                        <span class="col-price">P. Unit.</span>
                        <span class="col-amount">Importe</span>
                        <span class="col-actions"></span>
                      </div>
                      <div v-for="(item, ii) in section.items" :key="ii" class="item-row">
                        <input v-model="item.description" class="field-input" placeholder="Descripción" @input="recalcItem(item)" />
                        <input v-model="item.unit" class="field-input" placeholder="hs" />
                        <input v-model.number="item.quantity" type="number" min="0" step="0.01" class="field-input" @input="recalcItem(item)" />
                        <input v-model.number="item.unitPrice" type="number" min="0" step="0.01" class="field-input" @input="recalcItem(item)" />
                        <input v-model.number="item.amount" type="number" min="0" step="0.01" class="field-input amount-field" />
                        <button class="remove-btn" @click="removeItem(section.items, ii)">
                          <span class="material-symbols-outlined">remove_circle</span>
                        </button>
                      </div>
                      <button class="add-row-btn" @click="addItem(section.items)">
                        <span class="material-symbols-outlined">add</span> Agregar ítem
                      </button>
                    </div>
                    <button class="add-section-btn" @click="addSection">
                      <span class="material-symbols-outlined">add_box</span> Agregar sección
                    </button>
                  </div>

                  <!-- Totals preview -->
                  <div class="totals-preview">
                    <div class="totals-row">
                      <span>Subtotal</span>
                      <span>{{ formatCurrency(computedSubtotal, form.currency) }}</span>
                    </div>
                    <div class="totals-row">
                      <label>Descuento (%)</label>
                      <input v-model.number="form.discountPercent" type="number" min="0" max="100" step="0.01" class="small-input" />
                    </div>
                    <div class="totals-row">
                      <label>Impuesto (%)</label>
                      <input v-model.number="form.taxRate" type="number" min="0" max="100" step="0.01" class="small-input" />
                    </div>
                    <div class="totals-row total-row">
                      <span>TOTAL</span>
                      <span>{{ formatCurrency(computedTotal, form.currency) }}</span>
                    </div>
                  </div>
                </div>

                <!-- TAB: Notes & Terms -->
                <div v-show="activeTab === 'notes'" class="form-grid">
                  <div class="form-field full-width">
                    <label class="field-label">Notas</label>
                    <textarea v-model="form.notes" class="field-input" rows="4" placeholder="Condiciones, aclaraciones o notas adicionales..." />
                  </div>
                  <div class="form-field full-width">
                    <label class="field-label">Condiciones de pago</label>
                    <textarea v-model="form.paymentTerms" class="field-input" rows="3" placeholder="Ej: 50% al inicio, 50% al finalizar. Transferencia bancaria." />
                  </div>
                  <div class="form-field full-width">
                    <label class="field-label">Nota de validez</label>
                    <input v-model="form.validityNote" class="field-input" placeholder="Ej: Este presupuesto es válido por 30 días desde su emisión." />
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-secondary" @click="closeModal">Cancelar</button>
              <div class="footer-right">
                <button v-if="editingId" class="btn-pdf" @click="handleDownloadPdfFromModal" title="Generar PDF">
                  <span class="material-symbols-outlined">picture_as_pdf</span>
                  PDF
                </button>
                <button class="btn-primary" :disabled="loading" @click="saveQuote">
                  {{ loading ? 'Guardando...' : (editingId ? 'Guardar cambios' : 'Crear presupuesto') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useQuotesStore } from '@/stores/quotes.store'
import { formatCurrency } from '@/utils/currency'
import { loadClientOptions, loadProjectOptions } from '@/utils/remote-entity-options'
import WButton from '@/components/ui/WButton.vue'
import WTable from '@/components/ui/WTable.vue'
import WCard from '@/components/ui/WCard.vue'
import WBadge from '@/components/ui/WBadge.vue'

const emptyForm = () => ({
  title: '',
  number: '',
  status: 'draft' as const,
  issueDate: new Date().toISOString().split('T')[0],
  expiresAt: '',
  currency: 'USD',
  clientId: '',
  projectId: '',
  taskIds: [] as string[],
  clientName: '',
  clientEmail: '',
  clientAddress: '',
  freelancerName: '',
  freelancerEmail: '',
  freelancerPhone: '',
  freelancerAddress: '',
  freelancerWebsite: '',
  sections: [] as any[],
  items: [] as any[],
  taxRate: 0,
  discountPercent: 0,
  notes: '',
  paymentTerms: '',
  validityNote: '',
  scope: '',
  deliverables: '',
})

export default defineComponent({
  name: 'QuotesPage',
  components: { WButton, WTable, WCard, WBadge },
  data() {
    return {
      showModal: false,
      editingId: null as string | null,
      activeTab: 'general',
      itemsMode: 'flat' as 'flat' | 'sections',
      form: emptyForm(),
      clientLabels: {} as Record<string, string>,
      clientOptions: [] as { value: string; label: string }[],
      projectOptions: [] as { value: string; label: string }[],
      tabs: [
        { id: 'general', label: 'General', icon: 'info' },
        { id: 'client', label: 'Cliente', icon: 'person' },
        { id: 'freelancer', label: 'Mis datos', icon: 'badge' },
        { id: 'items', label: 'Ítems', icon: 'receipt_long' },
        { id: 'notes', label: 'Notas', icon: 'note' },
      ],
    }
  },
  computed: {
    ...mapState(useQuotesStore, ['items', 'loading', 'total', 'totalAccepted', 'totalPending', 'filters']),
    headers() {
      return [
        { key: 'title', label: 'TÍTULO' },
        { key: 'clientId', label: 'CLIENTE' },
        { key: 'status', label: 'ESTADO', width: '120px' },
        { key: 'issueDate', label: 'FECHA', width: '120px' },
        { key: 'total', label: 'TOTAL', width: '140px' },
        { key: 'actions', label: 'ACCIONES', width: '120px' },
      ]
    },
    computedSubtotal(): number {
      if (this.itemsMode === 'sections') {
        return this.form.sections
          .flatMap((s: any) => s.items || [])
          .reduce((sum: number, i: any) => sum + (i.amount || 0), 0)
      }
      return this.form.items.reduce((sum: number, i: any) => sum + (i.amount || 0), 0)
    },
    computedTotal(): number {
      const sub = this.computedSubtotal
      const discount = sub * ((this.form.discountPercent || 0) / 100)
      const taxable = sub - discount
      const tax = taxable * ((this.form.taxRate || 0) / 100)
      return taxable + tax
    },
  },
  methods: {
    ...mapActions(useQuotesStore, ['fetchAll', 'setFilters', 'create', 'update', 'remove', 'downloadPdf', 'convertToInvoice']),
    formatCurrency(amount: number, currency?: string) {
      return formatCurrency(amount, currency)
    },
    formatDate(date: string) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })
    },
    onSearch() {
      this.setFilters({ search: this.filters.search })
    },
    onFilterChange() {
      this.setFilters({ status: this.filters.status })
    },
    getStatusLabel(status: string) {
      const map: Record<string, string> = {
        draft: 'Borrador', sent: 'Enviado', accepted: 'Aceptado', rejected: 'Rechazado', expired: 'Vencido',
      }
      return map[status] || status
    },
    getStatusColor(status: string) {
      const map: Record<string, string> = {
        draft: 'var(--color-text-muted)',
        sent: 'var(--color-primary)',
        accepted: 'var(--color-success)',
        rejected: 'var(--color-error)',
        expired: 'var(--color-warning)',
      }
      return map[status] || 'var(--color-text-muted)'
    },
    getClientLabel(clientId?: string) {
      if (!clientId) return '-'
      return this.clientLabels[clientId] || clientId
    },
    async loadClientLabels() {
      const ids = [...new Set(this.items.map((q) => q.clientId).filter(Boolean))] as string[]
      await Promise.all(
        ids.map(async (id) => {
          if (this.clientLabels[id]) return
          const opts = await loadClientOptions('').catch(() => [])
          const found = opts.find((o) => o.value === id)
          if (found) this.clientLabels[id] = found.label
        })
      )
    },
    async openNewQuote() {
      this.form = emptyForm()
      this.editingId = null
      this.activeTab = 'general'
      this.itemsMode = 'flat'
      this.showModal = true
      await this.loadRemoteOptions()
    },
    async openEditQuote(item: any) {
      this.form = {
        title: item.title || '',
        number: item.number || '',
        status: item.status || 'draft',
        issueDate: item.issueDate ? new Date(item.issueDate).toISOString().split('T')[0] : '',
        expiresAt: item.expiresAt ? new Date(item.expiresAt).toISOString().split('T')[0] : '',
        currency: item.currency || 'USD',
        clientId: item.clientId || '',
        projectId: item.projectId || '',
        taskIds: item.taskIds || [],
        clientName: item.clientName || '',
        clientEmail: item.clientEmail || '',
        clientAddress: item.clientAddress || '',
        freelancerName: item.freelancerName || '',
        freelancerEmail: item.freelancerEmail || '',
        freelancerPhone: item.freelancerPhone || '',
        freelancerAddress: item.freelancerAddress || '',
        freelancerWebsite: item.freelancerWebsite || '',
        sections: JSON.parse(JSON.stringify(item.sections || [])),
        items: JSON.parse(JSON.stringify(item.items || [])),
        taxRate: item.taxRate || 0,
        discountPercent: item.discountPercent || 0,
        notes: item.notes || '',
        paymentTerms: item.paymentTerms || '',
        validityNote: item.validityNote || '',
        scope: item.scope || '',
        deliverables: item.deliverables || '',
      }
      this.itemsMode = (item.sections?.length > 0) ? 'sections' : 'flat'
      this.editingId = item._id
      this.activeTab = 'general'
      this.showModal = true
      await this.loadRemoteOptions(item.clientId)
    },
    closeModal() {
      this.showModal = false
      this.editingId = null
    },
    async loadRemoteOptions(clientId?: string) {
      const clients = await loadClientOptions('').catch(() => [])
      this.clientOptions = clients
      const projects = await loadProjectOptions('', { clientId }).catch(() => [])
      this.projectOptions = projects
    },
    async onClientChange() {
      const projects = await loadProjectOptions('', { clientId: this.form.clientId }).catch(() => [])
      this.projectOptions = projects
      this.form.projectId = ''
    },
    addItem(list: any[]) {
      list.push({ description: '', unit: '', quantity: 1, unitPrice: 0, amount: 0 })
    },
    removeItem(list: any[], idx: number) {
      list.splice(idx, 1)
    },
    addSection() {
      this.form.sections.push({ title: '', description: '', items: [] })
    },
    recalcItem(item: any) {
      if (item.quantity != null && item.unitPrice != null) {
        item.amount = Math.round((item.quantity * item.unitPrice) * 100) / 100
      }
    },
    async saveQuote() {
      if (!this.form.title?.trim()) {
        alert('El título es obligatorio')
        return
      }
      const dto: any = { ...this.form }
      if (!dto.clientId) delete dto.clientId
      if (!dto.projectId) delete dto.projectId
      if (!dto.expiresAt) delete dto.expiresAt
      if (this.itemsMode === 'sections') {
        dto.items = []
      } else {
        dto.sections = []
      }

      try {
        if (this.editingId) {
          await this.update(this.editingId, dto)
        } else {
          await this.create(dto)
        }
        await this.loadClientLabels()
        this.closeModal()
      } catch {
        // error shown by store
      }
    },
    async handleDownloadPdf(item: any) {
      await this.downloadPdf(item._id, item.title)
    },
    async handleDownloadPdfFromModal() {
      if (!this.editingId) return
      const title = this.form.title
      await this.downloadPdf(this.editingId, title)
    },
    async confirmDelete(item: any) {
      if (confirm(`¿Eliminar el presupuesto "${item.title}"?`)) {
        await this.remove(item._id)
      }
    },
    async handleConvertToInvoice(item: any) {
      if (confirm(`¿Convertir "${item.title}" a factura borrador en Finanzas?`)) {
        await this.convertToInvoice(item._id)
      }
    },
  },
  async mounted() {
    await this.fetchAll()
    await this.loadClientLabels()
  },
})
</script>

<style scoped>
.quotes-page { padding: 32px; flex-grow: 1; min-width: 0; display: flex; flex-direction: column; }

/* Header */
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; flex-shrink: 0; }
.header-left { display: flex; align-items: center; gap: 32px; }
.page-title { font-family: var(--font-body); font-size: 24px; font-weight: 600; color: var(--color-text-base); }
.header-filters { display: flex; align-items: center; gap: 16px; }
.search-box { position: relative; width: 260px; }
.search-box span { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--color-text-muted); }
.search-box input { width: 100%; background-color: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 8px 12px 8px 36px; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-base); outline: none; }
.filter-select { background-color: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 8px 12px; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-base); outline: none; }

/* Summary */
.summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; flex-shrink: 0; }
.summary-card { display: flex; align-items: center; gap: 20px; padding: 24px; border: 1px solid var(--color-border); }
.summary-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); }
.summary-icon span { font-size: 24px; }
.summary-content { display: flex; flex-direction: column; }
.summary-label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 1px; }
.summary-value { font-family: var(--font-body); font-size: 24px; font-weight: 600; color: var(--color-text-base); margin-top: 4px; }
.summary-card.accepted .summary-icon { color: var(--color-success); background: rgba(16,185,129,0.1); }
.summary-card.pending .summary-icon { color: var(--color-warning); background: rgba(245,158,11,0.1); }
.summary-card.total-count .summary-icon { color: var(--color-primary); background: rgba(37,99,235,0.1); }

/* Table */
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
.title-cell { display: flex; flex-direction: column; gap: 2px; }
.quote-title { font-weight: 500; color: var(--color-text-base); }
.quote-number { font-family: var(--font-mono); font-size: 10px; color: var(--color-text-muted); }
.total-amount { font-weight: 600; color: var(--color-text-base); }
.table-actions { display: flex; gap: 8px; }
.action-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; display: flex; padding: 4px; }
.action-btn:hover { color: var(--color-text-base); }
.action-btn.text-error:hover { color: var(--color-error); }
.action-btn--convert:hover { color: var(--color-success); }
.mr-2 { margin-right: 8px; }

/* Modal backdrop */
.modal-backdrop { position: fixed; inset: 0; background: var(--color-overlay); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* Quote modal */
.quote-modal { background: var(--color-bg-surface); border: 1px solid var(--color-border); width: 100%; max-width: 860px; max-height: 88vh; display: flex; flex-direction: column; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--color-border); flex-shrink: 0; }
.modal-title { font-family: var(--font-body); font-size: 18px; font-weight: 600; color: var(--color-text-base); }
.modal-close { background: none; border: none; color: var(--color-text-muted); cursor: pointer; display: flex; padding: 4px; }
.modal-close:hover { color: var(--color-text-base); }

/* Tabs */
.modal-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--color-border); padding: 0 24px; flex-shrink: 0; background: var(--color-bg-base); }
.tab-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--color-text-muted); cursor: pointer; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 12px 16px; transition: color 0.15s, border-color 0.15s; }
.tab-btn span { font-size: 16px; }
.tab-btn:hover { color: var(--color-text-base); }
.tab-btn--active { color: var(--color-primary); border-bottom-color: var(--color-primary); }

/* Modal body */
.modal-body { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
.tab-content { padding: 24px; flex: 1; }

/* Form grid */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-field.full-width { grid-column: 1 / -1; }
.form-section-title { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--color-text-muted); padding-bottom: 8px; border-bottom: 1px solid var(--color-border-subtle); }
.field-label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-muted); }
.field-input { background: var(--color-bg-surface-low); border: 1px solid var(--color-border); padding: 8px 12px; font-family: var(--font-mono); font-size: 12px; color: var(--color-text-base); outline: none; width: 100%; box-sizing: border-box; }
.field-input:focus { border-color: var(--color-border-focus); }
textarea.field-input { resize: vertical; }

/* Items tab */
.items-tab { display: flex; flex-direction: column; gap: 16px; }
.items-mode-toggle { display: flex; gap: 0; border: 1px solid var(--color-border); width: fit-content; }
.mode-btn { background: none; border: none; padding: 7px 16px; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); cursor: pointer; }
.mode-btn.active { background: var(--color-bg-surface-high); color: var(--color-text-base); }
.items-header { display: grid; grid-template-columns: 1fr 60px 60px 90px 90px 32px; gap: 6px; font-family: var(--font-mono); font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: var(--color-text-muted); padding: 6px 0 4px; border-bottom: 1px solid var(--color-border-subtle); }
.item-row { display: grid; grid-template-columns: 1fr 60px 60px 90px 90px 32px; gap: 6px; margin-bottom: 6px; }
.amount-field { font-weight: 600; }
.remove-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; }
.remove-btn:hover { color: var(--color-error); }
.add-row-btn { display: flex; align-items: center; gap: 6px; background: none; border: 1px dashed var(--color-border); color: var(--color-text-muted); cursor: pointer; font-family: var(--font-mono); font-size: 11px; padding: 7px 12px; margin-top: 4px; width: fit-content; }
.add-row-btn:hover { color: var(--color-text-base); border-color: var(--color-text-muted); }
.add-section-btn { display: flex; align-items: center; gap: 6px; background: none; border: 1px dashed var(--color-primary); color: var(--color-primary); cursor: pointer; font-family: var(--font-mono); font-size: 11px; padding: 8px 16px; margin-top: 8px; }
.add-section-btn:hover { background: rgba(37,99,235,0.06); }

/* Sections */
.section-block { border: 1px solid var(--color-border-subtle); padding: 14px; margin-bottom: 16px; }
.section-header { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px; }
.section-header-inputs { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.section-title-input { font-weight: 600; }
.section-desc-input { font-size: 11px; }

/* Totals */
.totals-preview { border-top: 1px solid var(--color-border); padding-top: 16px; margin-top: 8px; display: flex; flex-direction: column; gap: 8px; max-width: 320px; align-self: flex-end; width: 100%; }
.totals-row { display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 12px; color: var(--color-text-muted); }
.totals-row.total-row { color: var(--color-text-base); font-size: 14px; font-weight: 600; border-top: 1px solid var(--color-border); padding-top: 8px; margin-top: 4px; }
.small-input { background: var(--color-bg-surface-low); border: 1px solid var(--color-border); padding: 4px 8px; font-family: var(--font-mono); font-size: 12px; color: var(--color-text-base); outline: none; width: 80px; text-align: right; }

/* Modal footer */
.modal-footer { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-top: 1px solid var(--color-border); flex-shrink: 0; }
.footer-right { display: flex; align-items: center; gap: 10px; }
.btn-secondary { background: none; border: 1px solid var(--color-border); color: var(--color-text-muted); cursor: pointer; font-family: var(--font-mono); font-size: 11px; padding: 9px 20px; text-transform: uppercase; letter-spacing: 0.5px; }
.btn-secondary:hover { color: var(--color-text-base); border-color: var(--color-text-muted); }
.btn-primary { background: var(--color-primary); border: none; color: #ffffff; cursor: pointer; font-family: var(--font-mono); font-size: 11px; padding: 9px 20px; text-transform: uppercase; letter-spacing: 0.5px; }
.btn-primary:hover { background: var(--color-primary-hover); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-pdf { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid var(--color-border); color: var(--color-text-muted); cursor: pointer; font-family: var(--font-mono); font-size: 11px; padding: 9px 16px; text-transform: uppercase; letter-spacing: 0.5px; }
.btn-pdf:hover { color: var(--color-text-base); border-color: var(--color-text-muted); }
.btn-pdf span { font-size: 16px; }

@media (max-width: 768px) {
  .quotes-page { padding: 16px; }
  .page-header { flex-direction: column; align-items: stretch; gap: 16px; margin-bottom: 24px; }
  .header-left { flex-direction: column; align-items: stretch; gap: 12px; }
  .summary-cards { grid-template-columns: 1fr; gap: 12px; }
  .form-grid { grid-template-columns: 1fr; }
  .modal-tabs { overflow-x: auto; }
  .items-header, .item-row { grid-template-columns: 1fr 50px 60px 75px 32px; }
  .items-header .col-price, .item-row input:nth-child(4) { display: none; }
}
</style>
