<template>
  <div class="projects-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ $t('projects.title') }}</h1>
        <div class="header-filters">
          <div class="search-box">
            <span class="material-symbols-outlined">search</span>
            <input type="text" v-model="filters.search" :placeholder="$t('projects.searchPlaceholder')" @input="handleSearch" />
          </div>
          <select v-model="filters.status" class="filter-select" @change="onFilterChange">
            <option value="">{{ $t('projects.status.all') }}</option>
            <option value="active">{{ $t('projects.status.active') }}</option>
            <option value="completed">{{ $t('projects.status.completed') }}</option>
            <option value="on-hold">{{ $t('projects.status.onHold') }}</option>
          </select>
        </div>
      </div>
      <div class="header-right">
        <w-button variant="primary" @click="openNewModal">
          <span class="material-symbols-outlined mr-2">add</span>
          {{ $t('projects.newProject') }}
        </w-button>
      </div>
    </header>

    <main class="page-content">
      <w-card class="no-padding">
        <w-table :headers="headers" :items="formattedItems" :loading="loading" :empty-message="$t('projects.noProjects')">
          <template #item-clientId="{ item }">
            <span>{{ getClientLabel(item.clientId) }}</span>
          </template>
          <template #item-status="{ item }">
            <w-badge :color="getStatusColor(item.status)">{{ item.status }}</w-badge>
          </template>
          <template #item-actions="{ item }">
            <div class="table-actions">
              <button class="action-btn" @click.stop="$router.push({ name: 'project-detail', params: { id: item._id } })" :title="$t('projects.viewDetail')">
                <span class="material-symbols-outlined">open_in_new</span>
              </button>
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

      <div v-if="!loading && formattedItems.length === 0" class="empty-cta">
        <p class="empty-cta-text">{{ $t('projects.emptyHint') }}</p>
        <w-button variant="primary" @click="openNewModal">
          <span class="material-symbols-outlined mr-2">add</span>
          {{ $t('projects.newProject') }}
        </w-button>
      </div>
    </main>

    <w-crud-modal v-model="showCrudModal" :schema="crudSchema" :initial-data="crudData" :loading="loading" @save="onSaveCrud" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useProjectsStore } from '@/stores/projects.store'
import { CURRENCIES } from '@/constants/currencies'
import WButton from '@/components/ui/WButton.vue'
import WTable from '@/components/ui/WTable.vue'
import WCard from '@/components/ui/WCard.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WCrudModal from '@/components/ui/WCrudModal.vue'
import { loadClientOptionById, loadClientOptions } from '@/utils/remote-entity-options'
import { formatDate, formatCalendarDate } from '@/utils/date'

export default defineComponent({
  name: 'ProjectsPage',
  components: { WButton, WTable, WCard, WBadge, WCrudModal },
  data() {
    return {
      showCrudModal: false,
      crudData: {} as any,
      clientLabels: {} as Record<string, string>
    }
  },
  computed: {
    ...mapState(useProjectsStore, ['items', 'loading', 'filters']),
    crudSchema() {
      return [
        { name: 'name', label: this.$t('projects.fields.name'), type: 'text', required: true },
        {
          name: 'clientId',
          label: this.$t('projects.fields.client'),
          type: 'remote-select',
          placeholder: this.$t('projects.fields.clientPlaceholder'),
          searchPlaceholder: this.$t('projects.fields.clientSearch'),
          loadOptions: loadClientOptions,
          loadOptionByValue: loadClientOptionById
        },
        { name: 'description', label: this.$t('projects.fields.description'), type: 'textarea' },
        { name: 'startDate', label: this.$t('projects.fields.start'), type: 'date' },
        { name: 'endDate', label: this.$t('projects.fields.end'), type: 'date' },
        { name: 'budget', label: this.$t('projects.fields.budget'), type: 'number' },
        { name: 'currency', label: this.$t('projects.fields.currency'), type: 'select', options: CURRENCIES.map((c) => ({ label: c.code, value: c.code })) },
        { name: 'billingType', label: this.$t('projects.fields.billingType'), type: 'select', options: [
          { label: this.$t('projects.billing.single'), value: 'single' },
          { label: this.$t('projects.billing.installments'), value: 'installments' }
        ]},
        { name: 'installmentsCount', label: this.$t('projects.fields.installmentsCount'), type: 'number' },
        { name: 'status', label: this.$t('projects.fields.status'), type: 'select', options: [
          { label: this.$t('projects.status.active'), value: 'active' },
          { label: this.$t('projects.status.completed'), value: 'completed' },
          { label: this.$t('projects.status.onHold'), value: 'on-hold' },
          { label: this.$t('clients.archived'), value: 'archived' }
        ]}
      ]
    },
    headers() {
      return [
        { key: 'name', label: this.$t('projects.fields.name').toUpperCase() },
        { key: 'clientId', label: this.$t('projects.fields.client').toUpperCase() },
        { key: 'status', label: this.$t('projects.fields.status').toUpperCase() },
        { key: 'startDateFormatted', label: this.$t('projects.fields.start').toUpperCase() },
        { key: 'endDateFormatted', label: this.$t('projects.fields.end').toUpperCase() },
        { key: 'actions', label: this.$t('common.actions').toUpperCase(), width: '100px' }
      ]
    },
    formattedItems() {
      return this.items.map((item: any) => ({
        ...item,
        startDateFormatted: item.startDate ? formatCalendarDate(item.startDate) : '—',
        endDateFormatted: item.endDate ? formatCalendarDate(item.endDate) : '—',
      }))
    }
  },
  methods: {
    ...mapActions(useProjectsStore, ['fetchAll', 'setFilters', 'create', 'update', 'remove']),
    async loadRelationLabels() {
      const ids = [...new Set(this.items.map(item => item.clientId).filter(Boolean))]
      await Promise.all(ids.map(async (id) => {
        if (this.clientLabels[id]) return
        const option = await loadClientOptionById(id).catch(() => null)
        if (option) this.clientLabels[id] = option.label
      }))
    },
    getClientLabel(clientId?: string) {
      if (!clientId) return this.$t('projects.noClient')
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
      this.crudData = {}
      this.showCrudModal = true
    },
    openEditModal(item: any) {
      this.crudData = { ...item }
      this.showCrudModal = true
    },
    async confirmDelete(item: any) {
      if (confirm(this.$t('projects.deleteConfirm'))) {
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
        case 'active': return 'var(--color-primary)'
        case 'completed': return 'var(--color-success)'
        case 'on-hold': return 'var(--color-warning)'
        default: return 'var(--color-text-muted)'
      }
    }
  },
  mounted() {
    this.refreshPage()
    // Deep link from the onboarding checklist (?new=1): open the create
    // modal directly so a new user manages something in one click.
    if (this.$route.query.new) {
      this.openNewModal()
      const { new: _dropped, ...rest } = this.$route.query
      this.$router.replace({ query: rest })
    }
  }
})
</script>

<style scoped>
.projects-page { padding: 32px; flex-grow: 1; min-width: 0; display: flex; flex-direction: column; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; flex-shrink: 0; }
.header-left { display: flex; align-items: center; gap: 32px; }
.page-title { font-family: var(--font-body); font-size: 24px; font-weight: 600; color: var(--color-text-base); }
.header-filters { display: flex; align-items: center; gap: 16px; }
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

@media (max-width: 1024px) {
  .header-left { flex-direction: column; align-items: flex-start; gap: 12px; }
}
@media (max-width: 768px) {
  .projects-page { padding: 16px; }
  .page-header { flex-direction: column; align-items: stretch; gap: 16px; margin-bottom: 20px; }
  .header-left { flex-direction: column; align-items: flex-start; gap: 12px; }
  .header-filters { flex-direction: column; align-items: stretch; }
  .search-box { width: 100%; }
  .filter-select { width: 100%; }
}

</style>
