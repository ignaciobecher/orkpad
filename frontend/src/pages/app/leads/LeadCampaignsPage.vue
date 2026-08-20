<template>
  <div class="campaigns-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Campañas</h1>
        <p class="page-subtitle">Gestioná tus campañas de contacto con leads</p>
      </div>
      <div class="header-right">
        <w-button variant="primary" @click="openNewCampaign">
          <span class="material-symbols-outlined mr-2">add</span>
          Nueva campaña
        </w-button>
      </div>
    </header>

    <div v-if="loading && items.length === 0" class="loading-state">
      <w-loading-skeleton />
    </div>

    <div v-else-if="items.length === 0" class="empty-state-wrapper">
      <w-empty-state message="No hay campañas aún. Creá tu primera campaña para empezar a contactar leads." />
    </div>

    <div v-else class="campaigns-grid">
      <div v-for="campaign in items" :key="campaign._id" class="campaign-card">
        <div class="campaign-header">
          <div class="campaign-type-icon">
            <span class="material-symbols-outlined">{{ getTypeIcon(campaign.type) }}</span>
          </div>
          <div class="campaign-info">
            <p class="campaign-name">{{ campaign.name }}</p>
            <p v-if="campaign.description" class="campaign-desc">{{ campaign.description }}</p>
          </div>
          <div class="campaign-status">
            <w-badge :color="getStatusColor(campaign.status)">{{ getStatusLabel(campaign.status) }}</w-badge>
          </div>
        </div>

        <div class="campaign-stats">
          <div class="stat-item">
            <span class="stat-value">{{ campaign.totalSent }}</span>
            <span class="stat-label">Enviados</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ campaign.totalOpened }}</span>
            <span class="stat-label">Abiertos</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ campaign.totalReplied }}</span>
            <span class="stat-label">Respondidos</span>
          </div>
        </div>

        <div class="campaign-footer">
          <span class="campaign-type-label">{{ getTypeLabel(campaign.type) }}</span>
          <div class="campaign-actions">
            <button class="action-btn" @click="editCampaign(campaign)" title="Editar">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button
              class="action-btn"
              @click="toggleStatus(campaign)"
              :title="campaign.status === 'active' ? 'Pausar' : 'Activar'"
            >
              <span class="material-symbols-outlined">{{ campaign.status === 'active' ? 'pause' : 'play_arrow' }}</span>
            </button>
            <button class="action-btn text-error" @click="confirmDelete(campaign)" title="Eliminar">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingCampaign ? 'Editar campaña' : 'Nueva campaña' }}</h2>
          <button class="modal-close" @click="showModal = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Nombre *</label>
            <input v-model="modalForm.name" class="form-input" placeholder="ej: Ferreterías sin web — Mayo" required />
          </div>
          <div class="form-group">
            <label class="form-label">Descripción</label>
            <input v-model="modalForm.description" class="form-input" placeholder="Descripción opcional" />
          </div>
          <div class="form-group">
            <label class="form-label">Tipo de campaña</label>
            <select v-model="modalForm.type" class="form-select">
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div class="form-group" v-if="modalForm.type === 'email'">
            <label class="form-label">Asunto del email</label>
            <input v-model="modalForm.template.subject" class="form-input" placeholder="Asunto del mensaje" />
          </div>
          <div class="form-group">
            <label class="form-label">Mensaje / Template *</label>
            <textarea
              v-model="modalForm.template.body"
              class="form-textarea"
              placeholder="Hola {{name}}, me puse en contacto porque..."
              rows="6"
            ></textarea>
            <p class="form-hint">Podés usar {{name}} para personalizar el nombre del negocio</p>
          </div>
        </div>
        <div class="modal-footer">
          <w-button variant="secondary" @click="showModal = false">Cancelar</w-button>
          <w-button variant="primary" :loading="loading" @click="saveCampaign">
            {{ editingCampaign ? 'Guardar cambios' : 'Crear campaña' }}
          </w-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useLeadCampaignsStore } from '@/stores/lead-campaigns.store'
import type { LeadCampaign } from '@/api/lead-campaigns/lead-campaigns.types'
import WButton from '@/components/ui/WButton.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WLoadingSkeleton from '@/components/ui/WLoadingSkeleton.vue'
import WEmptyState from '@/components/ui/WEmptyState.vue'

const defaultForm = () => ({
  name: '',
  description: '',
  type: 'email' as 'email' | 'whatsapp' | 'manual',
  template: { subject: '', body: '' },
})

export default defineComponent({
  name: 'LeadCampaignsPage',
  components: { WButton, WBadge, WLoadingSkeleton, WEmptyState },
  data() {
    return {
      showModal: false,
      editingCampaign: null as LeadCampaign | null,
      modalForm: defaultForm(),
    }
  },
  computed: {
    ...mapState(useLeadCampaignsStore, ['items', 'loading']),
  },
  methods: {
    ...mapActions(useLeadCampaignsStore, ['fetchAll', 'create', 'update', 'remove']),
    openNewCampaign() {
      this.editingCampaign = null
      this.modalForm = defaultForm()
      this.showModal = true
    },
    editCampaign(campaign: LeadCampaign) {
      this.editingCampaign = campaign
      this.modalForm = {
        name: campaign.name,
        description: campaign.description ?? '',
        type: campaign.type,
        template: { subject: campaign.template.subject ?? '', body: campaign.template.body },
      }
      this.showModal = true
    },
    async saveCampaign() {
      if (!this.modalForm.name || !this.modalForm.template.body) return
      try {
        if (this.editingCampaign) {
          await this.update(this.editingCampaign._id, this.modalForm)
        } else {
          await this.create(this.modalForm)
        }
        this.showModal = false
      } catch {
        // error toast from store
      }
    },
    async toggleStatus(campaign: LeadCampaign) {
      const newStatus = campaign.status === 'active' ? 'paused' : 'active'
      await this.update(campaign._id, { status: newStatus })
    },
    async confirmDelete(campaign: LeadCampaign) {
      if (confirm(`¿Eliminar la campaña "${campaign.name}"?`)) {
        await this.remove(campaign._id)
      }
    },
    getTypeIcon(type: string) {
      const map: Record<string, string> = { email: 'mail', whatsapp: 'chat', manual: 'person' }
      return map[type] ?? 'campaign'
    },
    getTypeLabel(type: string) {
      const map: Record<string, string> = { email: 'Email', whatsapp: 'WhatsApp', manual: 'Manual' }
      return map[type] ?? type
    },
    getStatusColor(status: string) {
      const map: Record<string, string> = {
        draft: 'var(--color-text-muted)',
        active: 'var(--color-success)',
        paused: 'var(--color-warning)',
        completed: 'var(--color-primary)',
      }
      return map[status] ?? 'var(--color-text-muted)'
    },
    getStatusLabel(status: string) {
      const map: Record<string, string> = {
        draft: 'Borrador',
        active: 'Activa',
        paused: 'Pausada',
        completed: 'Completada',
      }
      return map[status] ?? status
    },
  },
  mounted() {
    this.fetchAll()
  },
})
</script>

<style scoped>
.campaigns-page {
  padding: 32px;
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 768px) {
  .campaigns-page { padding: 16px; }
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title { font-size: 24px; font-weight: 600; color: var(--color-text-base); }
.page-subtitle { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; }

.campaigns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.campaign-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.campaign-header { display: flex; align-items: flex-start; gap: 12px; }
.campaign-type-icon {
  width: 36px;
  height: 36px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.campaign-type-icon span { font-size: 18px; color: var(--color-text-muted); }
.campaign-info { flex: 1; }
.campaign-name { font-size: 14px; font-weight: 500; color: var(--color-text-base); }
.campaign-desc { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }

.campaign-stats {
  display: flex;
  gap: 0;
  border: 1px solid var(--color-border);
}
.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-right: 1px solid var(--color-border);
}
.stat-item:last-child { border-right: none; }
.stat-value { font-size: 20px; font-weight: 600; color: var(--color-text-base); }
.stat-label { font-family: var(--font-mono); font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; }

.campaign-footer { display: flex; align-items: center; justify-content: space-between; }
.campaign-type-label { font-family: var(--font-mono); font-size: 10px; color: var(--color-text-muted); }

.campaign-actions { display: flex; gap: 4px; }
.action-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  padding: 4px;
}
.action-btn:hover { color: var(--color-text-base); }
.text-error { color: var(--color-error) !important; }

.loading-state, .empty-state-wrapper { padding: 32px 0; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-border);
}

.modal-title { font-size: 16px; font-weight: 600; color: var(--color-text-base); }
.modal-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
}
.modal-close:hover { color: var(--color-text-base); }

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-family: var(--font-mono); font-size: 10px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.form-input, .form-select, .form-textarea {
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  font-size: 13px;
  color: var(--color-text-base);
  outline: none;
  font-family: var(--font-body);
}

.form-textarea { resize: vertical; }
.form-hint { font-family: var(--font-mono); font-size: 10px; color: var(--color-text-muted); }

.mr-1 { margin-right: 4px; }
.mr-2 { margin-right: 8px; }
</style>
