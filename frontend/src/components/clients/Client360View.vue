<template>
  <div class="client-360">
    <div class="tabs-header">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'info' }" 
        @click="activeTab = 'info'"
      >
        Información
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'projects' }" 
        @click="activeTab = 'projects'"
      >
        Proyectos
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'invoices' }" 
        @click="activeTab = 'invoices'"
      >
        Facturación
      </button>
    </div>

    <div class="tab-content">
      <!-- Info Tab -->
      <div v-if="activeTab === 'info'" class="summary-section">
        <div class="info-group">
          <label>{{ $t('clients.fields.email') }}</label>
          <p>{{ client.email || '—' }}</p>
        </div>
        <div class="info-group">
          <label>{{ $t('clients.fields.phone') }}</label>
          <p>{{ client.phone || '—' }}</p>
        </div>
        <div class="info-group">
          <label>{{ $t('clients.fields.address') }}</label>
          <p>{{ client.address || '—' }}</p>
        </div>
        <div class="info-group">
          <label>{{ $t('clients.fields.notes') }}</label>
          <p class="notes-text">{{ client.notes || '—' }}</p>
        </div>
        <div class="info-group">
          <label>{{ $t('clients.fields.status') }}</label>
          <p class="status-value">{{ client.status }}</p>
        </div>
      </div>

      <!-- Projects Tab -->
      <div v-if="activeTab === 'projects'" class="list-section">
        <div v-if="loading" class="list-loading">
          <span class="material-symbols-outlined spinning">sync</span>
        </div>
        <div v-else-if="projects.length === 0" class="list-empty">
          <span class="material-symbols-outlined">folder_off</span>
          <p>No hay proyectos asociados</p>
        </div>
        <div v-else class="project-list">
          <div v-for="project in projects" :key="project._id" class="project-item">
            <div class="project-info">
              <span class="project-name">{{ project.name }}</span>
              <span class="project-status" :class="project.status">{{ project.status }}</span>
            </div>
            <div class="project-meta">
              <span>{{ formatCalendarDate(project.startDate) }}</span>
              <span class="project-budget">{{ formatCurrency(project.budget) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoices Tab -->
      <div v-if="activeTab === 'invoices'" class="list-section">
        <div v-if="loading" class="list-loading">
          <span class="material-symbols-outlined spinning">sync</span>
        </div>
        <div v-else-if="invoices.length === 0" class="list-empty">
          <span class="material-symbols-outlined">receipt_long</span>
          <p>No hay facturas registradas</p>
        </div>
        <div v-else class="invoice-list">
          <div v-for="invoice in invoices" :key="invoice._id" class="invoice-item">
            <div class="invoice-main">
              <span class="invoice-number">{{ invoice.number || 'N/A' }}</span>
              <span class="invoice-total" :class="invoice.type">{{ formatCurrency(invoice.total) }}</span>
            </div>
            <div class="invoice-sub">
              <span class="invoice-date">{{ formatCalendarDate(invoice.issueDate) }}</span>
              <span class="invoice-status-badge" :class="invoice.status">{{ invoice.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue'
import { projectsApi } from '@/api/projects/projects.api'
import { invoicesApi } from '@/api/invoices/invoices.api'
import { formatCurrency } from '@/utils/currency'
import { formatCalendarDate } from '@/utils/date'

export default defineComponent({
  name: 'Client360View',
  props: {
    client: {
      type: Object as PropType<any>,
      required: true
    }
  },
  setup(props) {
    const activeTab = ref('info')
    const projects = ref<any[]>([])
    const invoices = ref<any[]>([])
    const loading = ref(false)

    const fetchData = async () => {
      if (!props.client?._id) return
      loading.value = true
      try {
        const [projRes, invRes] = await Promise.all([
          projectsApi.getAll({ clientId: props.client._id }),
          invoicesApi.getAll({ clientId: props.client._id })
        ])
        projects.value = projRes.data.data
        invoices.value = invRes.data.data
      } catch (err) {
        console.error('Error fetching client 360 data:', err)
      } finally {
        loading.value = false
      }
    }

    watch(() => props.client?._id, fetchData, { immediate: true })

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '—'
      const date = new Date(dateStr)
      return date.toLocaleDateString()
    }

    return {
      activeTab,
      projects,
      invoices,
      loading,
      formatCurrency,
      formatDate,
      formatCalendarDate
    }
  }
})
</script>

<style scoped>
.client-360 {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tabs-header {
  display: flex;
  gap: 16px;
  padding: 0 24px;
  border-bottom: 1px solid var(--color-border);
}

.tab-btn {
  padding: 12px 0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--color-text-base);
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.summary-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-group label {
  display: block;
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}

.info-group p {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-base);
  margin: 0;
}

.notes-text {
  white-space: pre-wrap;
  line-height: 1.5;
}

.status-value {
  text-transform: capitalize;
  color: var(--color-primary) !important;
  font-weight: 600;
}

.list-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-loading, .list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--color-text-muted);
  gap: 12px;
}

.spinning { animation: spin 2s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.project-item, .invoice-item {
  padding: 16px;
  background: var(--color-bg-surface-highest);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-info, .invoice-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-name, .invoice-number {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-base);
}

.project-status {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.project-status.active { background: rgba(16, 185, 129, 0.1); color: var(--color-success); }
.project-status.completed { background: rgba(59, 130, 246, 0.1); color: var(--color-primary); }

.project-meta, .invoice-sub {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-muted);
}

.invoice-total.income { color: var(--color-success); font-weight: 600; }
.invoice-total.expense { color: var(--color-error); font-weight: 600; }

.invoice-status-badge {
  font-family: var(--font-mono);
  font-size: 9px;
  padding: 1px 6px;
  border-radius: 3px;
  text-transform: uppercase;
}

.invoice-status-badge.paid, .invoice-status-badge.collected { background: rgba(16, 185, 129, 0.1); color: var(--color-success); }
.invoice-status-badge.pending, .invoice-status-badge.sent { background: rgba(245, 158, 11, 0.1); color: var(--color-warning); }
.invoice-status-badge.overdue { background: rgba(239, 68, 68, 0.1); color: var(--color-error); }
</style>
