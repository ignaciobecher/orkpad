<template>
  <div class="agenda-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ $t('agenda.title') }}</h1>
      </div>
      <div class="header-right">
        <w-button variant="primary" @click="openNewModal">
          <span class="material-symbols-outlined mr-2">add</span>
          {{ $t('agenda.new') }}
        </w-button>
      </div>
    </header>

    <main class="page-content">
      <w-calendar
        :events="items"
        @date-click="handleDateClick"
        @event-click="openEditModal"
      />
    </main>

    <!-- Orkpad event modal -->
    <w-crud-modal
      v-model="showCrudModal"
      :schema="crudSchema"
      :initial-data="crudData"
      :loading="loading"
      @save="onSaveCrud"
    />

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useAgendaStore } from '@/stores/agenda.store'
import { useTasksStore } from '@/stores/tasks.store'
import { useProjectsStore } from '@/stores/projects.store'
import { useClientsStore } from '@/stores/clients.store'
import WButton from '@/components/ui/WButton.vue'
import WCalendar from '@/components/ui/WCalendar.vue'
import WCrudModal from '@/components/ui/WCrudModal.vue'
import { format } from 'date-fns'

export default defineComponent({
  name: 'AgendaPage',
  components: { WButton, WCalendar, WCrudModal },
  data() {
    return {
      showCrudModal: false,
      crudData: {} as any,
    }
  },
  computed: {
    ...mapState(useAgendaStore, ['items', 'loading', 'filters']),
    crudSchema() {
      return [
        { name: 'title', label: this.$t('agenda.fields.title'), type: 'text', required: true },
        { name: 'startTime', label: this.$t('agenda.fields.start'), type: 'datetime-local', required: true },
        { name: 'endTime', label: this.$t('agenda.fields.end'), type: 'datetime-local' },
        { name: 'type', label: this.$t('agenda.fields.type'), type: 'select', options: [
          { label: this.$t('agenda.types.meeting'), value: 'meeting' },
          { label: this.$t('agenda.types.reminder'), value: 'reminder' },
          { label: this.$t('agenda.types.task'), value: 'task' },
          { label: this.$t('agenda.types.appointment'), value: 'appointment' },
          { label: this.$t('agenda.types.shift'), value: 'shift' }
        ]},
        { name: 'color', label: this.$t('agenda.fields.color'), type: 'color' },
        { name: 'description', label: this.$t('agenda.fields.description'), type: 'textarea' },
        { 
          name: 'linkedType', 
          label: this.$t('agenda.link.entityType'), 
          type: 'select', 
          options: [
            { label: this.$t('agenda.link.task'), value: 'task' },
            { label: this.$t('agenda.link.project'), value: 'project' },
            { label: this.$t('agenda.link.client'), value: 'client' }
          ]
        },
        { 
          name: 'linkedId', 
          label: this.$t('agenda.link.entityId'), 
          type: 'remote-select',
          dependsOn: 'linkedType',
          placeholder: this.$t('agenda.link.placeholder'),
          loadOptions: async (search: string, formData: any) => {
            if (formData.linkedType === 'task') {
              const store = useTasksStore()
              await store.fetchAll({ search })
              return store.items.map(i => ({ label: i.title, value: i._id }))
            }
            if (formData.linkedType === 'project') {
              const store = useProjectsStore()
              await store.fetchAll({ search })
              return store.items.map(i => ({ label: i.name, value: i._id }))
            }
            if (formData.linkedType === 'client') {
              const store = useClientsStore()
              await store.fetchAll({ search })
              return store.items.map(i => ({ label: i.name, value: i._id }))
            }
            return []
          }
        }
      ]
    }
  },
  methods: {
    ...mapActions(useAgendaStore, ['fetchAll', 'create', 'update', 'remove']),
    handleDateClick(date: Date) {
      this.crudData = { 
        startTime: format(date, "yyyy-MM-dd'T'HH:00"),
        endTime: format(date, "yyyy-MM-dd'T'HH:00"),
        color: '#2563EB',
        type: 'meeting'
      }
      this.showCrudModal = true
    },
    openNewModal() {
      this.handleDateClick(new Date())
    },
    openEditModal(item: any) {
      // Prepare linked fields if they exist in the links array
      const linked = item.links?.[0]
      this.crudData = { 
        ...item,
        startTime: item.startTime ? format(new Date(item.startTime), "yyyy-MM-dd'T'HH:mm") : '',
        endTime: item.endTime ? format(new Date(item.endTime), "yyyy-MM-dd'T'HH:mm") : '',
        linkedType: linked?.entityType || '',
        linkedId: linked?.entityId || ''
      }
      this.showCrudModal = true
    },
    async onSaveCrud(data: any) {
      const { _id, linkedType, linkedId, ...dto } = data
      
      // Process links
      if (linkedType && linkedId) {
        dto.links = [{ entityType: linkedType, entityId: linkedId }]
      } else {
        dto.links = []
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
    }
  },
  mounted() {
    this.fetchAll()
  }
})
</script>

<style scoped>
.agenda-page { padding: 32px; display: flex; flex-direction: column; height: calc(100vh - var(--topbar-height)); overflow: hidden; min-width: 0; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-shrink: 0; gap: 16px; flex-wrap: wrap; }
.header-left { display: flex; flex-direction: column; gap: 8px; }

@media (max-width: 768px) {
  .agenda-page { padding: 16px; }
  .page-header { flex-direction: column; align-items: stretch; }
  .header-right :deep(.w-button) { width: 100%; }
}

.page-title { font-family: var(--font-body); font-size: 24px; font-weight: 600; color: var(--color-text-base); }
.page-content { flex-grow: 1; min-height: 0; min-width: 0; display: flex; flex-direction: column; }
.mr-2 { margin-right: 8px; }

</style>

