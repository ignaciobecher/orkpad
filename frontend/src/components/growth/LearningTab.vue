<template>
  <div class="learning-tab">
    <div class="tab-actions">
      <w-button variant="primary" @click="openCreateModal">
        <span class="material-symbols-outlined mr-2">add</span>
        Nuevo recurso
      </w-button>
    </div>

    <w-card class="no-padding">
      <div v-if="store.loading" class="loading-row">
        <span class="material-symbols-outlined spinning">sync</span>
        Cargando recursos...
      </div>
      <w-empty-state
        v-else-if="store.resources.length === 0"
        title="Sin recursos"
        message="Agregá un libro, video o curso que quieras seguir."
      >
        <template #action>
          <w-button variant="primary" @click="openCreateModal">Crear recurso</w-button>
        </template>
      </w-empty-state>
      <div v-else>
        <learning-resource-card
          v-for="resource in store.resources"
          :key="resource._id"
          :resource="resource"
          @log="onLogProgress"
          @edit="openEditModal"
          @remove="confirmRemove"
        />
      </div>
    </w-card>

    <learning-resource-modal
      v-model="showModal"
      :initial-data="editingResource"
      :loading="store.loading"
      @save="onSave"
    />

    <w-confirm-modal
      :is-open="showConfirmRemove"
      title="Eliminar recurso"
      message="¿Seguro que querés eliminar este recurso? Se perderá su historial de progreso."
      is-danger
      @confirm="doRemove"
      @cancel="showConfirmRemove = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useLearningStore } from '@/stores/learning.store'
import WButton from '@/components/ui/WButton.vue'
import WCard from '@/components/ui/WCard.vue'
import WEmptyState from '@/components/ui/WEmptyState.vue'
import WConfirmModal from '@/components/ui/WConfirmModal.vue'
import LearningResourceCard from './LearningResourceCard.vue'
import LearningResourceModal from './LearningResourceModal.vue'
import type { LearningResource } from '@/api/learning/learning.types'

export default defineComponent({
  name: 'LearningTab',
  components: { WButton, WCard, WEmptyState, WConfirmModal, LearningResourceCard, LearningResourceModal },
  setup() {
    const store = useLearningStore()
    return { store }
  },
  data() {
    return {
      showModal: false,
      editingResource: null as LearningResource | null,
      showConfirmRemove: false,
      removeTargetId: null as string | null,
    }
  },
  async mounted() {
    await this.store.fetchResources()
  },
  methods: {
    openCreateModal() {
      this.editingResource = null
      this.showModal = true
    },
    openEditModal(resource: LearningResource) {
      this.editingResource = resource
      this.showModal = true
    },
    async onSave(payload: any) {
      if (payload._id) {
        const { _id, ...dto } = payload
        await this.store.updateResource(_id, dto)
      } else {
        await this.store.createResource(payload)
      }
      this.showModal = false
    },
    async onLogProgress(id: string, unitsLogged: number) {
      if (!unitsLogged || unitsLogged <= 0) return
      await this.store.logProgress(id, unitsLogged)
    },
    confirmRemove(id: string) {
      this.removeTargetId = id
      this.showConfirmRemove = true
    },
    async doRemove() {
      if (this.removeTargetId) await this.store.removeResource(this.removeTargetId)
      this.showConfirmRemove = false
      this.removeTargetId = null
    },
  },
})
</script>

<style scoped>
.learning-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tab-actions {
  display: flex;
  justify-content: flex-end;
}

.loading-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 32px;
  justify-content: center;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.mr-2 {
  margin-right: 8px;
}
</style>
