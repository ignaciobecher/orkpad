<template>
  <div class="leads-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Leads</h1>
        <div class="header-filters">
          <div class="search-box">
            <span class="material-symbols-outlined">search</span>
            <input
              type="text"
              v-model="filters.search"
              placeholder="Buscar leads..."
              @input="handleSearch"
            />
          </div>
          <select v-model="filters.status" class="filter-select" @change="applyFilters">
            <option value="">Todos los estados</option>
            <option value="new">Nuevo</option>
            <option value="contacted">Contactado</option>
            <option value="qualified">Calificado</option>
            <option value="disqualified">Descartado</option>
            <option value="converted">Convertido</option>
          </select>
          <select v-model="filters.source" class="filter-select" @change="applyFilters">
            <option value="">Todas las fuentes</option>
            <option value="web">Web</option>
            <option value="manual">Manual</option>
            <option value="import">Importado</option>
          </select>
          <select v-model="filters.emailSource" class="filter-select" @change="applyFilters">
            <option value="">Todo origen email</option>
            <option value="homepage">Homepage</option>
            <option value="contact_page">Página contacto</option>
            <option value="about_page">About</option>
            <option value="inferred">Inferido</option>
            <option value="manual">Manual</option>
          </select>
          <label class="toggle-label">
            <input type="checkbox" v-model="filters.hasEmail" @change="applyFilters" />
            Con email
          </label>
        </div>
      </div>
      <div class="header-right">
        <router-link to="/app/leads/campaigns">
          <w-button variant="secondary">
            <span class="material-symbols-outlined mr-2">mark_email_read</span>
            Ver campañas
          </w-button>
        </router-link>
      </div>
    </header>

    <main class="page-content">
      <w-card class="no-padding">
        <w-table
          :headers="headers"
          :items="items"
          :loading="loading"
          empty-message="No hay leads. Agregá tu primer lead manualmente o importalo."
          @row-click="viewLead"
        >
          <template #item-name="{ item }">
            <div class="lead-name-cell">
              <span class="lead-name">{{ item.name }}</span>
              <span v-if="item.city" class="lead-city">{{ item.city }}</span>
            </div>
          </template>
          <template #item-score="{ item }">
            <div class="score-cell">
              <div class="score-bar" :style="{ width: item.score + '%', background: getScoreColor(item.score) }"></div>
              <span class="score-label">{{ item.score }}</span>
            </div>
          </template>
          <template #item-email="{ item }">
            <div v-if="item.email" class="email-cell">
              <span class="email-text" :title="item.email">{{ item.email }}</span>
              <span v-if="item.emailSource" class="email-origin-badge" :title="getEmailSourceLabel(item.emailSource)">
                {{ getEmailSourceIcon(item.emailSource) }}
              </span>
              <span
                v-if="item.emailConfidence"
                class="email-confidence-dot"
                :style="{ background: getEmailConfidenceColor(item.emailConfidence) }"
                :title="'Confianza: ' + item.emailConfidence"
              ></span>
            </div>
            <span v-else class="email-empty">—</span>
          </template>
          <template #item-opportunities="{ item }">
            <div class="opportunity-badges">
              <span
                v-for="opp in item.opportunities.slice(0, 2)"
                :key="opp"
                class="opp-badge"
              >{{ getOpportunityLabel(opp) }}</span>
              <span v-if="item.opportunities.length > 2" class="opp-more">
                +{{ item.opportunities.length - 2 }}
              </span>
            </div>
          </template>
          <template #item-status="{ item }">
            <w-badge :color="getStatusColor(item.status)">{{ getStatusLabel(item.status) }}</w-badge>
          </template>
          <template #item-contact="{ item }">
            <div class="contact-icons">
              <a v-if="item.phone" :href="'tel:' + item.phone" @click.stop class="contact-icon" title="Teléfono">
                <span class="material-symbols-outlined">call</span>
              </a>
              <a v-if="item.whatsapp" :href="'https://wa.me/' + item.whatsapp.replace(/\D/g,'')" target="_blank" @click.stop class="contact-icon" title="WhatsApp">
                <span class="material-symbols-outlined">chat</span>
              </a>
              <a v-if="item.website" :href="item.website" target="_blank" @click.stop class="contact-icon" title="Sitio web">
                <span class="material-symbols-outlined">language</span>
              </a>
            </div>
          </template>
          <template #item-actions="{ item }">
            <div class="table-actions">
              <button class="action-btn" @click.stop="viewLead(item)" title="Ver detalle">
                <span class="material-symbols-outlined">open_in_new</span>
              </button>
              <button class="action-btn text-error" @click.stop="confirmDelete(item)" title="Eliminar">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </template>
        </w-table>
      </w-card>

      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="page <= 1" @click="changePage(page - 1)">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useLeadsStore } from '@/stores/leads.store'
import WButton from '@/components/ui/WButton.vue'
import WTable from '@/components/ui/WTable.vue'
import WCard from '@/components/ui/WCard.vue'
import WBadge from '@/components/ui/WBadge.vue'

export default defineComponent({
  name: 'LeadsPage',
  components: { WButton, WTable, WCard, WBadge },
  data() {
    return {
      filters: {
        search: '',
        status: '',
        source: '',
        searchId: '' as string | undefined,
        hasEmail: false,
        emailSource: '',
      },
      searchTimeout: null as ReturnType<typeof setTimeout> | null,
    }
  },
  computed: {
    ...mapState(useLeadsStore, ['items', 'loading', 'total', 'page', 'totalPages']),
    headers() {
      return [
        { key: 'name', label: 'NEGOCIO' },
        { key: 'score', label: 'SCORE', width: '120px' },
        { key: 'email', label: 'EMAIL', width: '220px' },
        { key: 'opportunities', label: 'OPORTUNIDADES' },
        { key: 'status', label: 'ESTADO', width: '130px' },
        { key: 'contact', label: 'CONTACTO', width: '100px' },
        { key: 'actions', label: '', width: '80px' },
      ]
    },
  },
  methods: {
    ...mapActions(useLeadsStore, ['fetchAll', 'setFilters', 'setPage', 'remove']),
    handleSearch() {
      if (this.searchTimeout) clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => this.applyFilters(), 400)
    },
    applyFilters() {
      this.setFilters({
        search: this.filters.search || undefined,
        status: (this.filters.status as any) || undefined,
        source: (this.filters.source as any) || undefined,
        searchId: this.filters.searchId || undefined,
        hasEmail: this.filters.hasEmail || undefined,
        emailSource: (this.filters.emailSource as any) || undefined,
      })
    },
    viewLead(lead: any) {
      this.$router.push(`/app/leads/${lead._id}`)
    },
    confirmDelete(lead: any) {
      if (confirm(`¿Eliminar el lead "${lead.name}"?`)) {
        this.remove(lead._id)
      }
    },
    changePage(p: number) {
      this.setPage(p)
    },
    getScoreColor(score: number) {
      if (score >= 60) return 'var(--color-success)'
      if (score >= 30) return 'var(--color-warning)'
      return 'var(--color-text-muted)'
    },
    getStatusColor(status: string) {
      const map: Record<string, string> = {
        new: 'var(--color-primary)',
        contacted: 'var(--color-warning)',
        qualified: 'var(--color-success)',
        disqualified: 'var(--color-text-muted)',
        converted: '#10b981',
      }
      return map[status] ?? 'var(--color-text-muted)'
    },
    getStatusLabel(status: string) {
      const map: Record<string, string> = {
        new: 'Nuevo',
        contacted: 'Contactado',
        qualified: 'Calificado',
        disqualified: 'Descartado',
        converted: 'Convertido',
      }
      return map[status] ?? status
    },
    getOpportunityLabel(opp: string) {
      const map: Record<string, string> = {
        no_website: 'Sin web',
        bad_seo: 'Mal SEO',
        no_social: 'Sin redes',
        no_https: 'Sin HTTPS',
        outdated_web: 'Web vieja',
        no_email: 'Sin email',
      }
      return map[opp] ?? opp
    },
    getEmailSourceIcon(source: string) {
      const map: Record<string, string> = {
        homepage: '🏠',
        contact_page: '📄',
        about_page: 'ℹ️',
        inferred: '✨',
        manual: '✏️',
      }
      return map[source] ?? '📧'
    },
    getEmailSourceLabel(source: string) {
      const map: Record<string, string> = {
        homepage: 'Extraído de la homepage',
        contact_page: 'Extraído de página de contacto',
        about_page: 'Extraído de página about',
        inferred: 'Inferido por patrón',
        manual: 'Cargado manualmente',
      }
      return map[source] ?? source
    },
    getEmailConfidenceColor(confidence: string) {
      const map: Record<string, string> = {
        high: 'var(--color-success)',
        medium: 'var(--color-warning)',
        low: 'var(--color-error)',
      }
      return map[confidence] ?? 'var(--color-text-muted)'
    },
  },
  mounted() {
    const searchId = this.$route.query.searchId as string | undefined
    if (searchId) {
      this.filters.searchId = searchId
      this.fetchAll({ searchId })
    } else {
      this.fetchAll()
    }
  },
  watch: {
    '$route.query.searchId'(newId: string | undefined) {
      this.filters.searchId = newId || undefined
      this.applyFilters()
    },
  },
})
</script>

<style scoped>
.leads-page {
  padding: 32px;
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .leads-page { padding: 16px; }
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-shrink: 0;
  width: 100%;
  gap: 16px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.page-title {
  font-family: var(--font-body);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
}

.header-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  width: 240px;
}

.search-box span {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--color-text-muted);
}

.search-box input {
  width: 100%;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 8px 12px 8px 36px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-base);
  outline: none;
}

.filter-select {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-base);
  outline: none;
}

.page-content {
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.no-padding { display: flex; flex-direction: column; min-width: 0; }
.no-padding :deep(.w-card__body) {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
}

.lead-name-cell { display: flex; flex-direction: column; gap: 2px; }
.lead-name { font-size: 13px; color: var(--color-text-base); }
.lead-city { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }

.score-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.score-bar {
  height: 4px;
  border-radius: 2px;
  flex: 1;
  max-width: 60px;
  transition: width 0.3s;
}
.score-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  min-width: 20px;
}

.opportunity-badges { display: flex; gap: 4px; flex-wrap: wrap; }
.opp-badge {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-text-muted);
}
.opp-more {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-text-muted);
  padding: 2px 4px;
}

.email-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 200px;
}
.email-text {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-base);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.email-origin-badge {
  font-size: 12px;
  flex-shrink: 0;
}
.email-confidence-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.email-empty {
  color: var(--color-text-disabled);
  font-family: var(--font-mono);
  font-size: 11px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  cursor: pointer;
  white-space: nowrap;
}

.contact-icons { display: flex; gap: 8px; }
.contact-icon {
  color: var(--color-text-muted);
  display: flex;
  font-size: 16px;
}
.contact-icon:hover { color: var(--color-primary); }
.contact-icon span { font-size: 16px; }

.table-actions { display: flex; gap: 4px; }
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

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px;
}
.page-btn {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  cursor: pointer;
  display: flex;
  padding: 4px 8px;
}
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); }

.mr-2 { margin-right: 8px; }
</style>
