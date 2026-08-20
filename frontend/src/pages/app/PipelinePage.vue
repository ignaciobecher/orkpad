<template>
  <div class="pipeline-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ $t('pipeline.title') }}</h1>
        <div class="view-toggles">
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'kanban' }" 
            @click="viewMode = 'kanban'"
            title="Vista Kanban"
          >
            <span class="material-symbols-outlined">view_kanban</span>
          </button>
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'table' }" 
            @click="viewMode = 'table'"
            title="Vista Tabla"
          >
            <span class="material-symbols-outlined">table_chart</span>
          </button>
        </div>
      </div>
      <div class="header-right">
        <div class="header-filters">
          <div class="search-box">
            <span class="material-symbols-outlined">search</span>
            <input type="text" v-model="filters.search" :placeholder="$t('pipeline.searchPlaceholder')" @input="handleSearch" />
          </div>
        </div>
        <w-button variant="primary" @click="openNewModal">
          <span class="material-symbols-outlined mr-2">add</span>
          {{ $t('pipeline.new') }}
        </w-button>
      </div>
    </header>

    <!-- KPI Section -->
    <div class="kpi-section">
      <w-kpi-card
        title="VALOR TOTAL"
        :value="formatCurrency(totalValue)"
        icon="payments"
        trend="+12%"
        color="var(--color-primary)"
      />
      <w-kpi-card
        title="NEGOCIOS GANADOS"
        :value="wonCount.toString()"
        icon="trophy"
        :sub-value="formatCurrency(wonValue)"
        color="var(--color-success)"
      />
      <w-kpi-card
        title="TASA DE CONVERSIÓN"
        :value="conversionRate + '%'"
        icon="insights"
        color="var(--color-warning)"
      />
      <w-kpi-card
        title="EN PROCESO"
        :value="activeCount.toString()"
        icon="hourglass_empty"
        color="var(--color-info)"
      />
    </div>

    <main class="page-content">
      <!-- Kanban View -->
      <div v-if="viewMode === 'kanban'" class="kanban-container">
        <div class="kanban-board">
          <div v-for="stage in stages" :key="stage.id" class="kanban-column">
            <div class="column-header">
              <div class="stage-info">
                <span class="stage-name">{{ stage.label }}</span>
                <span class="stage-count">{{ dealsByStage[stage.id]?.length || 0 }}</span>
              </div>
              <div class="stage-value">{{ formatCurrency(stageValue(stage.id)) }}</div>
            </div>

            <draggable
              v-model="dealsByStage[stage.id]"
              group="pipeline"
              item-key="_id"
              class="column-cards"
              :delay="150"
              :delay-on-touch-only="true"
              @change="onDealMove($event, stage.id)"
            >
              <template #item="{ element: deal }">
                <div class="deal-card" @click="openEditModal(deal)">
                  <div class="deal-header">
                    <span class="deal-title">{{ deal.title }}</span>
                    <span class="deal-value">{{ formatCurrency(deal.value) }}</span>
                  </div>
                  <div class="deal-client">
                    <span class="material-symbols-outlined">person</span>
                    {{ getClientLabel(deal.clientId) }}
                  </div>
                  <div class="deal-footer">
                    <div v-if="deal.expectedCloseDate" class="deal-date" :class="{ overdue: isOverdue(deal.expectedCloseDate) }">
                      <span class="material-symbols-outlined">calendar_today</span>
                      {{ formatDate(deal.expectedCloseDate) }}
                    </div>
                    <div class="deal-actions">
                      <button class="mini-action" @click.stop="confirmDelete(deal)">
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <w-card v-else class="no-padding">
        <w-table :headers="headers" :items="items" :loading="loading" :empty-message="$t('pipeline.noRecords')">
          <template #item-clientId="{ item }">
            <span>{{ getClientLabel(item.clientId) }}</span>
          </template>
          <template #item-value="{ item }">
            <span class="font-mono font-bold">{{ formatCurrency(item.value) }}</span>
          </template>
          <template #item-stage="{ item }">
            <w-badge :color="getStatusColor(item.stage)">{{ $t(`pipeline.stages.${item.stage}`) }}</w-badge>
          </template>
          <template #item-expectedCloseDate="{ item }">
            <span>{{ formatDate(item.expectedCloseDate) }}</span>
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

    <w-crud-modal 
      v-model="showCrudModal" 
      :schema="crudSchema" 
      :initial-data="crudData" 
      :loading="loading" 
      class="professional-modal"
      @save="onSaveCrud" 
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { mapState, mapActions } from 'pinia'
import draggable from 'vuedraggable'
import { usePipelineStore } from '@/stores/pipeline.store'
import WButton from '@/components/ui/WButton.vue'
import WTable from '@/components/ui/WTable.vue'
import WCard from '@/components/ui/WCard.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WKpiCard from '@/components/ui/WKpiCard.vue'
import WCrudModal from '@/components/ui/WCrudModal.vue'
import { loadClientOptionById, loadClientOptions } from '@/utils/remote-entity-options'
import { formatCurrency } from '@/utils/currency'

export default defineComponent({
  name: 'PipelinePage',
  components: { WButton, WTable, WCard, WBadge, WCrudModal, WKpiCard, draggable },
  setup() {
    const store = usePipelineStore()
    const viewMode = ref('kanban')
    const dealsByStage = ref<Record<string, any[]>>({})
    const clientLabels = ref<Record<string, string>>({})

    const stages = [
      { id: 'lead', label: 'Prospecto' },
      { id: 'contacted', label: 'Contactado' },
      { id: 'proposal', label: 'Propuesta' },
      { id: 'won', label: 'Ganado' },
      { id: 'lost', label: 'Perdido' }
    ]

    const initializeKanban = () => {
      const groups: Record<string, any[]> = {}
      stages.forEach(s => groups[s.id] = [])
      store.items.forEach(deal => {
        const stageId = deal.stage || 'lead'
        if (groups[stageId]) groups[stageId].push(deal)
      })
      dealsByStage.value = groups
    }

    watch(() => store.items, initializeKanban, { immediate: true })

    const totalValue = computed(() => store.items.reduce((sum, item) => sum + (item.value || 0), 0))
    const wonValue = computed(() => store.items.filter(i => i.stage === 'won').reduce((sum, i) => sum + (i.value || 0), 0))
    const wonCount = computed(() => store.items.filter(i => i.stage === 'won').length)
    const activeCount = computed(() => store.items.filter(i => !['won', 'lost'].includes(i.stage)).length)
    const conversionRate = computed(() => {
      if (store.items.length === 0) return 0
      const closed = store.items.filter(i => ['won', 'lost'].includes(i.stage)).length
      if (closed === 0) return 0
      return Math.round((wonCount.value / closed) * 100)
    })

    const stageValue = (stageId: string) => {
      return (dealsByStage.value[stageId] || []).reduce((sum, i) => sum + (i.value || 0), 0)
    }

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleDateString()
    }

    const isOverdue = (dateStr: string) => {
      const date = new Date(dateStr)
      return date < new Date() && date.toDateString() !== new Date().toDateString()
    }

    const onDealMove = async (evt: any, newStage: string) => {
      if (evt.added) {
        const deal = evt.added.element
        try {
          await store.update(deal._id, { stage: newStage })
        } catch {
          initializeKanban() // Rollback
        }
      }
    }

    return {
      viewMode,
      stages,
      dealsByStage,
      totalValue,
      wonValue,
      wonCount,
      activeCount,
      conversionRate,
      clientLabels,
      stageValue,
      formatDate,
      isOverdue,
      onDealMove,
      formatCurrency
    }
  },
  data() {
    return {
      showCrudModal: false,
      crudData: {} as any
    }
  },
  computed: {
    ...mapState(usePipelineStore, ['items', 'loading', 'filters']),
    headers() {
      return [
        { key: 'title', label: 'TÍTULO' },
        { key: 'clientId', label: 'CLIENTE' },
        { key: 'stage', label: 'ETAPA' },
        { key: 'value', label: 'VALOR' },
        { key: 'expectedCloseDate', label: 'CIERRE ESTIMADO' },
        { key: 'actions', label: 'ACCIONES', width: '100px' }
      ]
    },
    crudSchema() {
      return [
        { name: 'title', label: 'Título del Negocio', type: 'text', required: true },
        {
          name: 'clientId',
          label: 'Cliente',
          type: 'remote-select',
          searchPlaceholder: 'Buscar cliente...',
          loadOptions: loadClientOptions,
          loadOptionByValue: loadClientOptionById
        },
        { name: 'value', label: 'Valor Estimado', type: 'number' },
        { name: 'currency', label: 'Moneda', type: 'text', placeholder: 'USD' },
        { name: 'stage', label: 'Etapa del Pipeline', type: 'select', options: [
          { label: 'Prospecto', value: 'lead' },
          { label: 'Contactado', value: 'contacted' },
          { label: 'Propuesta', value: 'proposal' },
          { label: 'Ganado', value: 'won' },
          { label: 'Perdido', value: 'lost' }
        ]},
        { name: 'expectedCloseDate', label: 'Fecha Estimada de Cierre', type: 'date' },
        { name: 'notes', label: 'Notas Adicionales', type: 'textarea' }
      ]
    }
  },
  methods: {
    ...mapActions(usePipelineStore, ['fetchAll', 'setFilters', 'create', 'update', 'remove']),
    async loadRelationLabels() {
      const ids = [...new Set(this.items.map(item => item.clientId).filter(Boolean))] as string[]
      await Promise.all(ids.map(async (id) => {
        if (this.clientLabels[id]) return
        const option = await loadClientOptionById(id).catch(() => null)
        if (option) this.clientLabels[id] = option.label
      }))
    },
    getClientLabel(clientId?: string) {
      if (!clientId) return 'Sin cliente'
      return this.clientLabels[clientId] || clientId
    },
    async refreshPage() {
      await this.fetchAll()
      await this.loadRelationLabels()
    },
    handleSearch() {
      this.refreshPage()
    },
    openNewModal() {
      this.crudData = { stage: 'lead', currency: 'USD' }
      this.showCrudModal = true
    },
    openEditModal(item: any) {
      this.crudData = { 
        ...item,
        expectedCloseDate: item.expectedCloseDate ? new Date(item.expectedCloseDate).toISOString().split('T')[0] : ''
      }
      this.showCrudModal = true
    },
    async confirmDelete(item: any) {
      if (confirm('¿Eliminar este negocio del pipeline?')) {
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
      if (status === 'won') return 'var(--color-success)';
      if (status === 'lost') return 'var(--color-error)';
      if (status === 'proposal') return 'var(--color-primary)';
      return 'var(--color-warning)';
    }
  },
  mounted() {
    this.refreshPage()
  }
})
</script>

<style scoped>
.pipeline-page { 
  padding: 24px 32px; 
  display: flex; 
  flex-direction: column; 
  gap: 32px;
  height: calc(100vh - var(--topbar-height));
  overflow: hidden;
}

.page-header { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }

.header-left { display: flex; align-items: center; gap: 24px; }
.page-title { font-family: var(--font-body); font-size: 24px; font-weight: 600; color: var(--color-text-base); }

.view-toggles {
  display: flex;
  background: var(--color-bg-surface-highest);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: var(--color-bg-surface);
  color: var(--color-primary);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-right { display: flex; align-items: center; gap: 16px; }
.header-filters { display: flex; align-items: center; gap: 16px; }

.search-box { position: relative; width: 240px; }
.search-box span { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--color-text-muted); }
.search-box input { width: 100%; background-color: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 8px 12px 8px 36px; font-family: var(--font-body); font-size: 13px; color: var(--color-text-base); outline: none; border-radius: 6px; }

.kpi-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  flex-shrink: 0;
}

.page-content { flex: 1; min-height: 0; display: flex; flex-direction: column; }

.kanban-container {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 16px;
}

.kanban-board {
  display: flex;
  gap: 20px;
  height: 100%;
  align-items: flex-start;
}

.kanban-column {
  flex-shrink: 0;
  width: 280px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.column-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  background: rgba(255,255,255,0.02);
}

.stage-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.stage-name {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-base);
  letter-spacing: 0.05em;
}

.stage-count {
  font-family: var(--font-mono);
  font-size: 10px;
  background: var(--color-bg-surface-highest);
  padding: 1px 6px;
  border-radius: 10px;
  color: var(--color-text-muted);
}

.stage-value {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
}

.column-cards {
  padding: 12px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 50px;
}

.deal-card {
  background: var(--color-bg-surface-highest);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.deal-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.deal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 10px;
}

.deal-title {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-base);
  line-height: 1.4;
}

.deal-value {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-success);
  white-space: nowrap;
}

.deal-client {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}

.deal-client .material-symbols-outlined { font-size: 14px; }

.deal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.deal-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
}

.deal-date.overdue { color: var(--color-error); }
.deal-date .material-symbols-outlined { font-size: 12px; }

.deal-actions { opacity: 0; transition: opacity 0.2s; }
.deal-card:hover .deal-actions { opacity: 1; }

.mini-action {
  background: none;
  border: none;
  color: var(--color-error);
  padding: 2px;
  cursor: pointer;
  border-radius: 4px;
}

.mini-action:hover { background: rgba(239, 68, 68, 0.1); }
.mini-action .material-symbols-outlined { font-size: 16px; }

.no-padding { padding: 0 !important; }
.mr-2 { margin-right: 8px; }

.table-actions { display: flex; gap: 8px; }
.action-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; display: flex; padding: 4px; }
.action-btn:hover { color: var(--color-text-base); }
.text-error { color: var(--color-error) !important; }

@media (max-width: 1400px) {
  .kpi-section { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .pipeline-page { padding: 16px; height: auto; overflow: visible; }
  .page-header { flex-direction: column; align-items: stretch; gap: 16px; }
  .kpi-section { grid-template-columns: 1fr; }
  .kanban-board { padding-bottom: 24px; }
}
</style>
