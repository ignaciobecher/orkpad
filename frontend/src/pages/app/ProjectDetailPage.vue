<template>
  <div class="project-detail">
    <header class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="$router.push({ name: 'projects' })">
          <span>←</span>
          <span>{{ $t('projects.detail.back') }}</span>
        </button>
        <template v-if="overview">
          <div class="project-title-row">
            <h1 class="page-title">{{ overview.project.name }}</h1>
            <w-badge :color="getStatusColor(overview.project.status)">{{ overview.project.status }}</w-badge>
            <w-badge v-if="overview.project.billingType === 'installments'" color="var(--color-primary)">
              {{ $t('projects.detail.billingInInstallments', { count: overview.project.installmentsCount }) }}
            </w-badge>
            <w-badge v-else color="var(--color-text-muted)">{{ $t('projects.detail.billingSingle') }}</w-badge>
          </div>
          <p v-if="overview.project.description" class="project-meta">{{ overview.project.description }}</p>
          <div class="project-dates">
            <span v-if="overview.project.startDate">
              <win-icon name="calendar" :size="16" />
              {{ formatCalendarDate(overview.project.startDate) }}
            </span>
            <span v-if="overview.project.endDate">
              <win-icon name="calendar" :size="16" />
              {{ formatCalendarDate(overview.project.endDate) }}
            </span>
            <span v-if="overview.project.actualEndDate">
              <win-icon name="calendar" :size="16" />
              Fin real: {{ formatCalendarDate(overview.project.actualEndDate) }}
            </span>
            <span v-if="overview.project.budget">
              <win-icon name="calculator" :size="16" />
              {{ formatMoney(overview.project.budget, overview.project.currency) }}
            </span>
          </div>
        </template>
      </div>

    </header>

    <div v-if="loading && !overview" class="loading-state">
      <win-icon name="hourglass" :size="32" class="loading-icon" />
    </div>

    <template v-if="overview">
      <section class="kpi-strip">
        <w-kpi-card :title="$t('projects.detail.taskTotal')" :value="overview.taskStats.total" />
        <w-kpi-card :title="$t('projects.detail.taskDone')" :value="overview.taskStats.done" />
        <w-kpi-card :title="$t('projects.detail.taskInProgress')" :value="overview.taskStats.inProgress" />
        <w-kpi-card :title="$t('projects.detail.taskOverdue')" :value="overview.taskStats.overdue" />
        <w-kpi-card :title="$t('projects.detail.hoursLogged')" :value="formatHours(overview.timeStats.totalMinutes)" />
        <w-kpi-card :title="$t('projects.detail.invoicePaid')" :value="moneyByCurrency('paid')" />
        <w-kpi-card :title="$t('projects.detail.invoicePending')" :value="moneyByCurrency('pending')" />
        <w-kpi-card :title="$t('projects.detail.invoiceOverdue')" :value="moneyByCurrency('overdue')" />
      </section>

      <!-- Detail tabs -->
      <div class="detail-tabs">
        <button
          v-for="tab in detailTabs"
          :key="tab.id"
          class="detail-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <win-icon :material="tab.icon" :size="16" />
          {{ tab.label }}
          <span v-if="tab.count !== null && tab.count !== undefined" class="detail-tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- TAB: RESUMEN -->
      <div v-if="activeTab === 'resumen'" class="detail-grid">
        <section class="detail-section">
          <div class="section-header">
            <h2 class="section-title">{{ $t('projects.detail.pendingTasks') }}</h2>
            <span class="section-count">{{ overview.pendingTasks.length }}</span>
          </div>
          <w-card class="no-padding">
            <w-table :headers="taskHeaders" :items="overview.pendingTasks.slice(0, 5)" :empty-message="$t('projects.detail.noTasks')">
              <template #item-status="{ item }">
                <w-badge :color="getTaskStatusColor(item.status)">{{ item.status }}</w-badge>
              </template>
              <template #item-priority="{ item }">
                <w-badge :color="getPriorityColor(item.priority)">{{ item.priority }}</w-badge>
              </template>
              <template #item-dueDate="{ item }">
                <span :class="{ 'text-error': isOverdue(item.dueDate) }">{{ item.dueDate ? formatCalendarDate(item.dueDate) : '—' }}</span>
              </template>
            </w-table>
          </w-card>
        </section>

        <section class="detail-section">
          <div class="section-header">
            <h2 class="section-title">{{ $t('projects.detail.recentInvoices') }}</h2>
            <span class="section-count">{{ overview.invoiceStats.total }}</span>
          </div>
          <w-card class="no-padding">
            <w-table :headers="invoiceMiniHeaders" :items="overview.invoices.slice(0, 5)" :empty-message="$t('projects.detail.noInvoices')">
              <template #item-status="{ item }">
                <w-badge :color="getInvoiceStatusColor(item.status)">{{ item.status }}</w-badge>
              </template>
              <template #item-installment="{ item }">
                <w-badge v-if="item.installmentCount" color="var(--color-primary)">
                  {{ item.installmentNumber }}/{{ item.installmentCount }}
                </w-badge>
                <span v-else class="text-muted">—</span>
              </template>
              <template #item-total="{ item }">
                {{ formatMoney(item.total, item.currency) }}
              </template>
              <template #item-dueDate="{ item }">
                {{ item.dueDate ? formatCalendarDate(item.dueDate) : '—' }}
              </template>
            </w-table>
          </w-card>
        </section>
      </div>

      <!-- TAB: TAREAS -->
      <div v-if="activeTab === 'tareas'" class="detail-grid">
        <section class="detail-section">
          <div class="section-header">
            <h2 class="section-title">{{ $t('projects.detail.pendingTasks') }}</h2>
            <span class="section-count">{{ overview.pendingTasks.length }}</span>
            <router-link to="/app/tasks" class="section-link">
              {{ $t('projects.detail.viewTasks') }}
              <span>→</span>
            </router-link>
          </div>
          <w-card class="no-padding">
            <w-table :headers="taskHeaders" :items="overview.pendingTasks" :empty-message="$t('projects.detail.noTasks')">
              <template #item-status="{ item }">
                <w-badge :color="getTaskStatusColor(item.status)">{{ item.status }}</w-badge>
              </template>
              <template #item-priority="{ item }">
                <w-badge :color="getPriorityColor(item.priority)">{{ item.priority }}</w-badge>
              </template>
              <template #item-dueDate="{ item }">
                <span :class="{ 'text-error': isOverdue(item.dueDate) }">{{ item.dueDate ? formatCalendarDate(item.dueDate) : '—' }}</span>
              </template>
            </w-table>
          </w-card>
        </section>

        <section class="detail-section">
          <div class="section-header">
            <h2 class="section-title">{{ $t('projects.detail.recentTasks') }}</h2>
          </div>
          <w-card class="no-padding">
            <w-table :headers="taskHeaders" :items="overview.recentTasks" :empty-message="$t('projects.detail.noTasks')">
              <template #item-status="{ item }">
                <w-badge :color="getTaskStatusColor(item.status)">{{ item.status }}</w-badge>
              </template>
              <template #item-priority="{ item }">
                <w-badge :color="getPriorityColor(item.priority)">{{ item.priority }}</w-badge>
              </template>
              <template #item-dueDate="{ item }">
                <span :class="{ 'text-error': isOverdue(item.dueDate) }">{{ item.dueDate ? formatCalendarDate(item.dueDate) : '—' }}</span>
              </template>
            </w-table>
          </w-card>
        </section>
      </div>

      <!-- TAB: FINANZAS -->
      <div v-if="activeTab === 'finanzas'" class="detail-grid">
        <section class="detail-section full-width">
          <w-card>
            <div class="billing-row">
              <div class="billing-info">
                <span class="mono-label">{{ $t('projects.detail.billingPlan') }}</span>
                <div class="billing-type">{{ billingLabel }}</div>
                <div v-if="isInstallments" class="billing-progress-text">
                  {{ collectedOfAgreedText() }}
                </div>
                <div v-if="isInstallments && overview.invoiceStats.agreed > 0" class="billing-progress-track">
                  <div class="billing-progress-fill" :style="{ width: Math.min(collectedPct, 100) + '%' }"></div>
                </div>
              </div>
              <w-button
                v-if="canGenerateInvoices"
                variant="primary"
                :loading="generatingInvoices"
                @click="handleGenerateInvoices"
              >
                <win-icon name="file-lines" :size="16" class="mr-1" />
                {{ $t('projects.detail.generateInvoices', { count: overview.project.installmentsCount }) }}
              </w-button>
            </div>
          </w-card>
        </section>

        <section class="detail-section full-width">
          <div class="finance-summary-cards">
            <w-kpi-card :title="$t('projects.detail.agreed')" :value="moneyByCurrency('agreed')" />
            <w-kpi-card :title="$t('projects.detail.collected')" :value="moneyByCurrency('paid')" />
            <w-kpi-card :title="$t('projects.detail.pending')" :value="moneyByCurrency('pendingOverdue')" />
            <w-kpi-card :title="$t('projects.detail.collectedPct')" :value="collectedPctText" />
            <w-kpi-card :title="$t('projects.detail.installmentsCount')" :value="overview.invoiceStats.installmentsTotal" />
            <w-kpi-card :title="$t('projects.detail.installmentsPending')" :value="overview.invoiceStats.installmentsPending" />
            <w-kpi-card :title="$t('projects.detail.nextDue')" :value="overview.invoiceStats.nextDueDate ? formatCalendarDate(overview.invoiceStats.nextDueDate) : '—'" />
          </div>
        </section>

        <section class="detail-section full-width">
          <div class="section-header">
            <h2 class="section-title">{{ $t('projects.detail.invoices') }}</h2>
            <span class="section-count">{{ overview.invoiceStats.total }}</span>
            <router-link to="/app/finance" class="section-link">
              {{ $t('projects.detail.viewInvoices') }}
              <span>→</span>
            </router-link>
          </div>
          <project-finance-grid
            :project-id="projectId"
            :client-id="overview.project.clientId"
            :currency="overview.project.currency"
            :invoices="overview.invoices"
            @changed="fetchOverview(projectId)"
          />
        </section>
      </div>

      <!-- TAB: ARCHIVOS -->
      <div v-if="activeTab === 'archivos'" class="detail-grid">
        <section class="detail-section full-width">
          <div class="section-header">
            <h2 class="section-title">{{ $t('projects.detail.documents') }}</h2>
            <span class="section-count">{{ overview.documents.length }}</span>
          </div>
          <w-card class="no-padding">
            <w-table :headers="docHeaders" :items="overview.documents" :empty-message="$t('projects.detail.noDocuments')">
              <template #item-tags="{ item }">
                <div class="tag-list">
                  <w-badge v-for="tag in item.tags" :key="tag" color="var(--color-text-muted)">{{ tag }}</w-badge>
                </div>
              </template>
            </w-table>
          </w-card>
        </section>
      </div>

      <!-- TAB: ACCESO CLIENTE -->
      <div v-if="activeTab === 'acceso'" class="detail-grid">
        <section class="detail-section full-width">
          <w-card>
            <client-access-section :project-id="projectId" />
          </w-card>
        </section>
      </div>

      <!-- TAB: GITHUB -->
      <div v-if="activeTab === 'github'">
        <section class="github-section">
          <div class="section-header" style="margin-bottom: 12px;">
            <win-icon name="console" :size="16" />
            <h2 class="section-title">GitHub</h2>
            <span v-if="connectedRepos.length" class="section-count">{{ connectedRepos.length }}</span>
            <w-button variant="ghost" style="margin-left:auto" @click="openRepoDrawer">
              <win-icon name="network" :size="16" class="mr-1" />
              Conectar repo
            </w-button>
          </div>

          <w-card>
            <div v-if="!connectedRepos.length" class="github-hint">Sin repositorios vinculados</div>
            <div v-for="repo in connectedRepos" :key="`${repo.owner}/${repo.repo}`" class="github-connected-row">
              <win-icon name="console" :size="16" />
              <a :href="repo.htmlUrl" target="_blank" class="github-repo-link">{{ repo.owner }}/{{ repo.repo }}</a>
              <div style="display:flex;gap:6px;margin-left:auto">
                <w-button variant="ghost" @click="$router.push({ name: 'project-github', params: { id: projectId }, query: { owner: repo.owner, repo: repo.repo } })">
                  <win-icon name="search" :size="16" class="mr-1" />
                  Ver actividad
                </w-button>
                <w-button variant="ghost" @click="handleDisconnectRepo(repo)" :disabled="githubStore.loading">
                  Desconectar
                </w-button>
              </div>
            </div>
          </w-card>
        </section>

        <!-- Repo selector drawer -->
        <w-drawer v-model="repoDrawerOpen" title="Conectar repositorio GitHub" width="420px">
          <div class="repo-drawer-body">
            <div class="repo-search-box">
              <win-icon name="search" :size="16" />
              <input
                v-model="repoSearch"
                type="text"
                placeholder="Buscar repositorio..."
                class="repo-search-input"
              />
            </div>
            <div v-if="githubStore.reposLoading" class="feed-empty">Cargando repositorios...</div>
            <div v-else-if="!githubStore.repos.length" class="feed-empty">No se encontraron repositorios. Asegurate de haber iniciado sesión con GitHub.</div>
            <div v-else-if="!filteredRepos.length" class="feed-empty">Sin resultados para "{{ repoSearch }}"</div>
            <div
              v-for="repo in filteredRepos"
              :key="repo.fullName"
              class="repo-item"
              :class="{ selected: selectedRepo?.fullName === repo.fullName }"
              @click="selectedRepo = repo"
            >
              <win-icon :material="repo.private ? 'lock' : 'public'" :size="16" />
              <span class="repo-item-name">{{ repo.fullName }}</span>
            </div>
          </div>
          <template #footer>
            <div style="display:flex;gap:8px;justify-content:flex-end;padding:16px">
              <w-button variant="ghost" @click="repoDrawerOpen = false">Cancelar</w-button>
              <w-button variant="primary" :disabled="!selectedRepo || githubStore.loading" @click="handleConnectRepo">
                Conectar
              </w-button>
            </div>
          </template>
        </w-drawer>
        <w-confirm-modal
          :is-open="showGenerateModal"
          title="Generar facturas"
          :message="$t('projects.detail.generateConfirm')"
          confirm-text="Generar"
          @confirm="handleGenerateInvoices"
          @cancel="showGenerateModal = false"
        />
        <w-confirm-modal
          :is-open="!!disconnectTarget"
          title="Desconectar repo"
          :message="`¿Desconectar ${disconnectTarget?.owner}/${disconnectTarget?.repo} de este proyecto?`"
          confirm-text="Desconectar"
          :is-danger="true"
          @confirm="handleDisconnectRepo(disconnectTarget)"
          @cancel="disconnectTarget = null"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useProjectsStore } from '@/stores/projects.store'
import { useGithubStore } from '@/stores/github.store'
import { useToast } from '@/composables/useToast'
import { formatDate, formatCalendarDate } from '@/utils/date'
import WButton from '@/components/ui/WButton.vue'
import WCard from '@/components/ui/WCard.vue'
import WTable from '@/components/ui/WTable.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WKpiCard from '@/components/ui/WKpiCard.vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import WConfirmModal from '@/components/ui/WConfirmModal.vue'
import ProjectFinanceGrid from '@/components/projects/ProjectFinanceGrid.vue'
import ClientAccessSection from '@/components/projects/ClientAccessSection.vue'
import WinIcon from '@/components/win95/WinIcon.vue'
import type { GithubRepo } from '@/api/github/github.api'

export default defineComponent({
  name: 'ProjectDetailPage',
  components: { WButton, WCard, WTable, WBadge, WKpiCard, WDrawer, ProjectFinanceGrid, WConfirmModal, WinIcon, ClientAccessSection },
  data() {
    return {
      repoDrawerOpen: false,
      repoSearch: '',
      selectedRepo: null as GithubRepo | null,
      githubStore: useGithubStore(),
      activeTab: 'resumen',
      generatingInvoices: false,
      showGenerateModal: false,
      disconnectTarget: null as { owner: string; repo: string } | null,
    }
  },
  computed: {
    ...mapState(useProjectsStore, ['overview', 'loading']),
    projectId(): string {
      return this.$route.params.id as string
    },
    detailTabs() {
      const stats = this.overview?.invoiceStats
      return [
        { id: 'resumen', label: this.$t('projects.detail.tabs.overview'), icon: 'dashboard', count: null },
        { id: 'tareas', label: this.$t('projects.detail.tabs.tasks'), icon: 'task_alt', count: this.overview?.pendingTasks.length ?? null },
        { id: 'finanzas', label: this.$t('projects.detail.tabs.finance'), icon: 'payments', count: stats?.total ?? null },
        { id: 'archivos', label: this.$t('projects.detail.tabs.files'), icon: 'description', count: this.overview?.documents.length ?? null },
        { id: 'github', label: 'GitHub', icon: 'commit', count: this.connectedRepos.length || null },
        { id: 'acceso', label: 'Acceso cliente', icon: 'group', count: null },
      ]
    },
    isInstallments(): boolean {
      return (this.overview?.project as any)?.billingType === 'installments'
    },
    billingLabel(): string {
      if (!this.isInstallments) return this.$t('projects.detail.billingSingle')
      const count = (this.overview?.project as any)?.installmentsCount ?? 0
      return this.$t('projects.detail.billingInInstallments', { count })
    },
    collectedPct(): number {
      const rows = this.currencyRows()
      const pcts = rows.map((r) => (!r.agreed || r.agreed <= 0 ? 0 : Math.round((r.paid / r.agreed) * 100)))
      return Math.max(0, ...pcts)
    },
    collectedPctText(): string {
      const rows = this.currencyRows()
      if (rows.length === 1) return this.collectedPct + '%'
      return rows
        .map((r) => (r.agreed > 0 ? Math.round((r.paid / r.agreed) * 100) : 0) + '%')
        .join(' + ')
    },
    hasInstallmentInvoices(): boolean {
      const list = this.overview?.invoices ?? []
      if (list.some((i: any) => i.installmentNumber != null || i.installmentCount)) return true
      // Same fallback as the backend stats: invoices without installment
      // markers still count when the project uses a billing plan.
      const project = this.overview?.project as any
      return project?.billingType === 'installments' && list.some((i: any) => i.status !== 'cancelled' && i.status !== 'draft')
    },
    canGenerateInvoices(): boolean {
      const project = this.overview?.project as any
      if (!project || project.billingType !== 'installments') return false
      if (!(project.installmentsCount >= 2)) return false
      if (!(project.budget > 0)) return false
      return !this.hasInstallmentInvoices
    },
    connectedRepos(): { owner: string; repo: string; defaultBranch: string; htmlUrl: string }[] {
      return (this.overview?.project as any)?.githubRepos ?? []
    },
    filteredRepos() {
      const q = this.repoSearch.toLowerCase().trim()
      const connected = new Set(this.connectedRepos.map((r: any) => `${r.owner}/${r.repo}`))
      const available = this.githubStore.repos.filter(r => !connected.has(`${r.owner}/${r.name}`))
      if (!q) return available
      return available.filter(r => r.fullName.toLowerCase().includes(q))
    },
    taskHeaders() {
      return [
        { key: 'title', label: this.$t('tasks.fields.title').toUpperCase() },
        { key: 'status', label: this.$t('projects.fields.status').toUpperCase() },
        { key: 'priority', label: this.$t('tasks.fields.priority').toUpperCase() },
        { key: 'dueDate', label: this.$t('tasks.fields.due').toUpperCase() },
      ]
    },
    invoiceMiniHeaders() {
      return [
        { key: 'number', label: this.$t('finance.fields.number').toUpperCase() },
        { key: 'installment', label: this.$t('projects.detail.installment').toUpperCase() },
        { key: 'status', label: this.$t('projects.fields.status').toUpperCase() },
        { key: 'total', label: this.$t('finance.fields.total') },
        { key: 'dueDate', label: this.$t('finance.fields.dueDate').toUpperCase() },
      ]
    },
    docHeaders() {
      return [
        { key: 'title', label: this.$t('docs.fields.title').toUpperCase() },
        { key: 'tags', label: this.$t('docs.fields.tags').toUpperCase() },
      ]
    },
  },
  methods: {
    ...mapActions(useProjectsStore, [
      'fetchOverview',
      'generateInvoices',
    ]),
    currencyRows(): { currency: string; agreed: number; paid: number; pending: number; overdue: number }[] {
      const s: any = this.overview?.invoiceStats
      if (s?.byCurrency?.length) return s.byCurrency
      const c = (this.overview?.project as any)?.currency ?? 'USD'
      return [{
        currency: c,
        agreed: s?.agreed ?? 0,
        paid: s?.paid ?? 0,
        pending: s?.pending ?? 0,
        overdue: s?.overdue ?? 0,
      }]
    },
    moneyByCurrency(key: 'agreed' | 'paid' | 'pending' | 'overdue' | 'pendingOverdue'): string {
      return this.currencyRows()
        .map((r) => this.formatMoney(key === 'pendingOverdue' ? r.pending + r.overdue : r[key], r.currency))
        .join(' + ')
    },
    collectedOfAgreedText(): string {
      return this.currencyRows()
        .map((r) => {
          const pct = r.agreed > 0 ? Math.round((r.paid / r.agreed) * 100) : 0
          return (this.$t('projects.detail.collectedOfAgreed', {
            collected: this.formatMoney(r.paid, r.currency),
            agreed: this.formatMoney(r.agreed, r.currency),
            pct,
          }) as string)
        })
        .join(' + ')
    },
    formatDate,
    formatCalendarDate,
    formatMoney(amount: number | undefined, currency?: string) {
      if (amount === undefined || amount === null) return '—'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        maximumFractionDigits: 0,
      }).format(amount)
    },
    formatHours(totalMinutes: number | undefined) {
      if (totalMinutes === undefined || totalMinutes === null) return '—'
      const hours = totalMinutes / 60
      return `${hours % 1 === 0 ? hours : hours.toFixed(1)} h`
    },
    getStatusColor(status: string) {
      if (status === 'active') return 'var(--color-primary)'
      if (status === 'completed') return 'var(--color-success)'
      if (status === 'on-hold') return 'var(--color-warning)'
      return 'var(--color-text-muted)'
    },
    getTaskStatusColor(status: string) {
      if (status === 'in-progress') return 'var(--color-primary)'
      if (status === 'done') return 'var(--color-success)'
      if (status === 'cancelled') return 'var(--color-error)'
      return 'var(--color-text-muted)'
    },
    getPriorityColor(priority: string) {
      if (priority === 'urgent' || priority === 'high') return 'var(--color-error)'
      if (priority === 'medium') return 'var(--color-warning)'
      return 'var(--color-success)'
    },
    getInvoiceStatusColor(status: string) {
      if (status === 'paid' || status === 'collected') return 'var(--color-success)'
      if (status === 'overdue') return 'var(--color-error)'
      if (status === 'sent' || status === 'pending') return 'var(--color-warning)'
      return 'var(--color-text-muted)'
    },
    isOverdue(dueDate?: string) {
      if (!dueDate) return false
      return new Date(dueDate) < new Date()
    },
    async openRepoDrawer() {
      this.selectedRepo = null
      this.repoSearch = ''
      this.repoDrawerOpen = true
      await this.githubStore.fetchRepos()
    },
    async handleConnectRepo() {
      if (!this.selectedRepo) return
      await this.githubStore.connectRepo(this.projectId, {
        owner: this.selectedRepo.owner,
        repo: this.selectedRepo.name,
        defaultBranch: this.selectedRepo.defaultBranch,
        htmlUrl: this.selectedRepo.htmlUrl,
      })
      this.repoDrawerOpen = false
      await this.fetchOverview(this.projectId)
      await Promise.all([
        this.githubStore.fetchCommits(this.projectId),
        this.githubStore.fetchPullRequests(this.projectId),
      ])
    },
    async handleGenerateInvoices() {
      if (!this.showGenerateModal) { this.showGenerateModal = true; return }
      this.showGenerateModal = false
      this.generatingInvoices = true
      try {
        await this.generateInvoices(this.projectId)
      } finally {
        this.generatingInvoices = false
      }
    },
    async handleDisconnectRepo(repo: { owner: string; repo: string }) {
      if (!this.disconnectTarget) { this.disconnectTarget = repo; return }
      repo = this.disconnectTarget
      this.disconnectTarget = null
      await this.githubStore.disconnectRepo(this.projectId, repo.owner, repo.repo)
      await this.fetchOverview(this.projectId)
    },
  },
  async mounted() {
    await this.fetchOverview(this.projectId)
  },
})
</script>

<style scoped>
.project-detail {
  padding: 32px;
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 24px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
  letter-spacing: 0.05em;
}
.back-btn:hover { color: var(--color-text-base); }
.back-btn .material-symbols-outlined { font-size: 16px; }

.project-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.page-title {
  font-family: var(--font-body);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
}

.project-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  max-width: 600px;
  line-height: 1.5;
}

.project-dates {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.project-dates span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}
.project-dates .material-symbols-outlined { font-size: 14px; font-family: 'Material Symbols Outlined'; }


.mono-label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}



.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  padding: 4px;
}
.icon-btn:hover { color: var(--color-text-base); }
.icon-btn--danger { color: var(--color-error); }
.icon-btn--danger:hover { opacity: 0.75; }

.loading-state {
  display: flex;
  justify-content: center;
  padding: 64px;
}

.loading-icon {
  animation: spin 1s linear infinite;
  font-size: 32px;
  color: var(--color-text-muted);
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.kpi-strip {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1px;
  background-color: var(--color-border);
  border: 1px solid var(--color-border);
  margin-bottom: 32px;
  flex-shrink: 0;
}

.finance-summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background-color: var(--color-border);
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.detail-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 24px;
  overflow-x: auto;
}

.detail-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  padding: 10px 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.detail-tab:hover {
  color: var(--color-text-base);
}

.detail-tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.detail-tab .material-symbols-outlined {
  font-size: 16px;
}

.detail-tab-count {
  font-size: 10px;
  padding: 1px 7px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-muted);
}

.detail-tab.active .detail-tab-count {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.billing-row {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.billing-info {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.billing-type {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-base);
}

.billing-progress-text {
  font-size: 12px;
  color: var(--color-text-muted);
}

.billing-progress-track {
  height: 6px;
  background: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
  margin-top: 4px;
}

.billing-progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.detail-section { display: flex; flex-direction: column; gap: 12px; }
.detail-section.full-width { grid-column: 1 / -1; }

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-primary);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-link:hover {
  text-decoration: underline;
}

.section-link .material-symbols-outlined {
  font-size: 14px;
}

.section-title {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}

.section-count {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 1px 6px;
}

.no-padding { display: flex; flex-direction: column; }
.no-padding :deep(.w-card__body) { padding: 0 !important; }

.tag-list { display: flex; gap: 4px; flex-wrap: wrap; }
.mr-1 { margin-right: 4px; }
.text-error { color: var(--color-error) !important; }

.github-section { margin-bottom: 24px; flex-shrink: 0; }















.github-connect-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.github-hint {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}
.github-connected-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.github-repo-link {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-primary);
  text-decoration: none;
}
.github-repo-link:hover { text-decoration: underline; }

.github-feeds {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.github-feed-col { display: flex; flex-direction: column; gap: 6px; }
.feed-title {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}
.feed-empty {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 8px 0;
}
.commit-row, .pr-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-border);
  min-width: 0;
}
.commit-sha {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.commit-msg, .pr-title {
  font-size: 12px;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}
.pr-number {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.commit-link {
  color: var(--color-text-muted);
  display: flex;
  flex-shrink: 0;
}
.commit-link:hover { color: var(--color-primary); }
.commit-link .material-symbols-outlined { font-size: 14px; }

.repo-drawer-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 0;
}

.repo-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 4px;
}
.repo-search-box .material-symbols-outlined {
  font-size: 18px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.repo-search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--color-text-base);
}
.repo-search-input::placeholder { color: var(--color-text-muted); }
.repo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  color: var(--color-text-base);
}
.repo-item:hover { background: var(--color-bg-surface); }
.repo-item.selected { background: var(--color-primary-subtle, #e8f0fe); color: var(--color-primary); }
.repo-item-name { font-family: var(--font-mono); font-size: 12px; }

@media (max-width: 768px) {
  .github-feeds { grid-template-columns: 1fr; }
}

@media (max-width: 1200px) {
  .kpi-strip { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .detail-grid { grid-template-columns: 1fr; }
  .kpi-strip { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .project-detail { padding: 16px; }
  .page-header { flex-direction: column; }
  .kpi-strip { grid-template-columns: repeat(2, 1fr); }
}
</style>

<!-- Win95: overrides encapsulados por data-appearance -->
<style>
html[data-appearance="win95"] .project-detail {
padding: 32px;
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

html[data-appearance="win95"] .page-header {
display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 24px;
  flex-shrink: 0;
}

html[data-appearance="win95"] .header-left {
display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

html[data-appearance="win95"] .back-btn {
display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
  letter-spacing: 0.05em;
}

html[data-appearance="win95"] .back-btn:hover {
color: var(--color-text-base);
}

html[data-appearance="win95"] .back-btn .material-symbols-outlined {
font-size: 16px;
}

html[data-appearance="win95"] .project-title-row {
display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

html[data-appearance="win95"] .page-title {
font-family: var(--font-body);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
}

html[data-appearance="win95"] .project-meta {
font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  max-width: 600px;
  line-height: 1.5;
}

html[data-appearance="win95"] .project-dates {
display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

html[data-appearance="win95"] .project-dates span {
display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

html[data-appearance="win95"] .project-dates .material-symbols-outlined {
font-size: 14px; font-family: 'Material Symbols Outlined';
}

html[data-appearance="win95"] .mono-label {
font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

html[data-appearance="win95"] .icon-btn {
background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  padding: 4px;
}

html[data-appearance="win95"] .icon-btn:hover {
color: var(--color-text-base);
}

html[data-appearance="win95"] .icon-btn--danger {
color: var(--color-error);
}

html[data-appearance="win95"] .icon-btn--danger:hover {
opacity: 0.75;
}

html[data-appearance="win95"] .loading-state {
display: flex;
  justify-content: center;
  padding: 64px;
}

html[data-appearance="win95"] .loading-icon {
animation: w95-spin 1s linear infinite;
  font-size: 32px;
  color: var(--color-text-muted);
}

@keyframes w95-spin {
from { transform: rotate(0deg); } to { transform: rotate(360deg); }
}

html[data-appearance="win95"] .kpi-strip {
display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1px;
  background-color: var(--color-border);
  border: 1px solid var(--color-border);
  margin-bottom: 32px;
  flex-shrink: 0;
}

html[data-appearance="win95"] .finance-summary-cards {
display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background-color: var(--color-border);
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

html[data-appearance="win95"] .detail-grid {
display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

html[data-appearance="win95"] .detail-tabs {
display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 24px;
  overflow-x: auto;
}

html[data-appearance="win95"] .detail-tab {
display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  padding: 10px 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s ease, border-color 0.15s ease;
}

html[data-appearance="win95"] .detail-tab:hover {
color: var(--color-text-base);
}

html[data-appearance="win95"] .detail-tab.active {
color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

html[data-appearance="win95"] .detail-tab .material-symbols-outlined {
font-size: 16px;
}

html[data-appearance="win95"] .detail-tab-count {
font-size: 10px;
  padding: 1px 7px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-muted);
}

html[data-appearance="win95"] .detail-tab.active .detail-tab-count {
border-color: var(--color-primary);
  color: var(--color-primary);
}

html[data-appearance="win95"] .billing-row {
display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

html[data-appearance="win95"] .billing-info {
flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

html[data-appearance="win95"] .billing-type {
font-size: 15px;
  font-weight: 600;
  color: var(--color-text-base);
}

html[data-appearance="win95"] .billing-progress-text {
font-size: 12px;
  color: var(--color-text-muted);
}

html[data-appearance="win95"] .billing-progress-track {
height: 10px;
  background: #fff;
  border: 1px solid;
  border-color: var(--w95-shadow) var(--w95-highlight) var(--w95-highlight) var(--w95-shadow);
  border-radius: 0;
  overflow: hidden;
  margin-top: 4px;
}

html[data-appearance="win95"] .billing-progress-fill {
height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
  transition: width 0.3s ease;
}

html[data-appearance="win95"] .detail-section {
display: flex; flex-direction: column; gap: 12px;
}

html[data-appearance="win95"] .detail-section.full-width {
grid-column: 1 / -1;
}

html[data-appearance="win95"] .section-header {
display: flex;
  align-items: center;
  gap: 8px;
}

html[data-appearance="win95"] .section-link {
display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-primary);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

html[data-appearance="win95"] .section-link:hover {
text-decoration: underline;
}

html[data-appearance="win95"] .section-link .material-symbols-outlined {
font-size: 14px;
}

html[data-appearance="win95"] .section-title {
font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}

html[data-appearance="win95"] .section-count {
font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 1px 6px;
}

html[data-appearance="win95"] .no-padding {
display: flex; flex-direction: column;
}

html[data-appearance="win95"] .no-padding .w-card__body {
padding: 0 !important;
}

html[data-appearance="win95"] .tag-list {
display: flex; gap: 4px; flex-wrap: wrap;
}

html[data-appearance="win95"] .mr-1 {
margin-right: 4px;
}

html[data-appearance="win95"] .text-error {
color: var(--color-error) !important;
}

html[data-appearance="win95"] .github-section {
margin-bottom: 24px; flex-shrink: 0;
}

html[data-appearance="win95"] .github-connect-row {
display: flex;
  align-items: center;
  gap: 12px;
}

html[data-appearance="win95"] .github-hint {
font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

html[data-appearance="win95"] .github-connected-row {
display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

html[data-appearance="win95"] .github-repo-link {
font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-primary);
  text-decoration: none;
}

html[data-appearance="win95"] .github-repo-link:hover {
text-decoration: underline;
}

html[data-appearance="win95"] .github-feeds {
display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

html[data-appearance="win95"] .github-feed-col {
display: flex; flex-direction: column; gap: 6px;
}

html[data-appearance="win95"] .feed-title {
font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

html[data-appearance="win95"] .feed-empty {
font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 8px 0;
}

html[data-appearance="win95"] .commit-row, html[data-appearance="win95"] .pr-row {
display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-border);
  min-width: 0;
}

html[data-appearance="win95"] .commit-sha {
font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

html[data-appearance="win95"] .commit-msg, html[data-appearance="win95"] .pr-title {
font-size: 12px;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

html[data-appearance="win95"] .pr-number {
font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

html[data-appearance="win95"] .commit-link {
color: var(--color-text-muted);
  display: flex;
  flex-shrink: 0;
}

html[data-appearance="win95"] .commit-link:hover {
color: var(--color-primary);
}

html[data-appearance="win95"] .commit-link .material-symbols-outlined {
font-size: 14px;
}

html[data-appearance="win95"] .repo-drawer-body {
display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 0;
}

html[data-appearance="win95"] .repo-search-box {
display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 4px;
}

html[data-appearance="win95"] .repo-search-box .material-symbols-outlined {
font-size: 18px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

html[data-appearance="win95"] .repo-search-input {
flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--color-text-base);
}

html[data-appearance="win95"] .repo-search-input::placeholder {
color: var(--color-text-muted);
}

html[data-appearance="win95"] .repo-item {
display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  color: var(--color-text-base);
}

html[data-appearance="win95"] .repo-item:hover {
background: var(--color-bg-surface);
}

html[data-appearance="win95"] .repo-item.selected {
background: var(--color-primary-subtle, #e8f0fe); color: var(--color-primary);
}

html[data-appearance="win95"] .repo-item-name {
font-family: var(--font-mono); font-size: 12px;
}

@media (max-width: 768px) {
html[data-appearance="win95"] .github-feeds {
grid-template-columns: 1fr;
}
}

@media (max-width: 1200px) {
html[data-appearance="win95"] .kpi-strip {
grid-template-columns: repeat(3, 1fr);
}
}

@media (max-width: 1024px) {
html[data-appearance="win95"] .detail-grid {
grid-template-columns: 1fr;
}
html[data-appearance="win95"] .kpi-strip {
grid-template-columns: repeat(2, 1fr);
}
}

@media (max-width: 768px) {
html[data-appearance="win95"] .project-detail {
padding: 16px;
}
html[data-appearance="win95"] .page-header {
flex-direction: column;
}
html[data-appearance="win95"] .kpi-strip {
grid-template-columns: repeat(2, 1fr);
}
}
</style>
