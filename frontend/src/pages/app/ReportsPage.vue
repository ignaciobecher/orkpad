<template>
  <div class="reports-page">
    <header class="reports-header">
      <div>
        <h1 class="page-title">Reportes</h1>
        <p class="page-sub">Finanzas, tareas, proyectos y horas del período</p>
      </div>
      <div class="reports-actions">
        <button class="btn-secondary" :disabled="!data || exporting" @click="doExport('csv')">
          <span class="material-symbols-outlined">download</span>
          CSV
        </button>
        <button class="btn-secondary" :disabled="!data || exporting" @click="doExport('pdf')">
          <span class="material-symbols-outlined">picture_as_pdf</span>
          PDF
        </button>
      </div>
    </header>

    <section class="filters-card">
      <label>Desde <input v-model="filters.from" type="date" /></label>
      <label>Hasta <input v-model="filters.to" type="date" /></label>
      <label>Cliente
        <select v-model="filters.clientId">
          <option value="">Todos</option>
          <option v-for="c in clients" :key="c._id" :value="c._id">{{ c.name }}</option>
        </select>
      </label>
      <label>Proyecto
        <select v-model="filters.projectId">
          <option value="">Todos</option>
          <option v-for="p in projects" :key="p._id" :value="p._id">{{ p.name }}</option>
        </select>
      </label>
      <button class="btn-primary" :disabled="loading" @click="load">
        {{ loading ? 'Cargando...' : 'Generar' }}
      </button>
    </section>

    <div v-if="loading" class="loading-state">
      <span class="material-symbols-outlined spinning">sync</span>
      Generando reporte...
    </div>

    <template v-else-if="data">
      <nav class="report-tabs">
        <button
          v-for="t in tabs"
          :key="t.id"
          :class="['report-tab', { 'report-tab--active': activeTab === t.id }]"
          @click="activeTab = t.id"
        >
          {{ t.label }}
        </button>
      </nav>

      <section v-if="activeTab === 'finanzas'" class="kpi-grid">
        <div v-for="t in data.finance.totals" :key="t.key" class="kpi">
          <span class="kpi-label">{{ t.label }}</span>
          <span class="kpi-value" :class="{ 'kpi-value--ok': t.key === 'collected', 'kpi-value--bad': t.key === 'overdue' }">
            <span v-for="(a, i) in t.amounts" :key="a.currency">{{ i > 0 ? ' + ' : '' }}{{ money(a.total, a.currency) }}</span>
            <span v-if="!t.amounts.length">—</span>
          </span>
        </div>
      </section>

      <section v-if="activeTab === 'finanzas'" class="report-table-wrap">
        <h3>Por cliente</h3>
        <table class="report-table">
          <thead><tr><th>Cliente</th><th>Moneda</th><th>Facturado</th><th>Cobrado</th><th>Pendiente</th></tr></thead>
          <tbody>
            <tr v-for="c in data.finance.byClient" :key="(c.clientId ?? 'none') + c.currency">
              <td>{{ c.name }}</td><td>{{ c.currency }}</td><td>{{ money(c.invoiced, c.currency) }}</td><td>{{ money(c.collected, c.currency) }}</td><td>{{ money(c.pending, c.currency) }}</td>
            </tr>
          </tbody>
        </table>
        <h3>Próximos vencimientos</h3>
        <table class="report-table">
          <thead><tr><th>N°</th><th>Monto</th><th>Estado</th><th>Vence</th></tr></thead>
          <tbody>
            <tr v-for="u in data.finance.upcoming" :key="u.id">
              <td>{{ u.number || '—' }}</td><td>{{ money(u.total, u.currency) }}</td><td>{{ statusLabel(u.status) }}</td><td>{{ fmtDate(u.dueDate) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-if="activeTab === 'tareas'" class="kpi-grid">
        <div class="kpi"><span class="kpi-label">Total</span><span class="kpi-value">{{ data.tasks.total }}</span></div>
        <div class="kpi"><span class="kpi-label">Hechas</span><span class="kpi-value kpi-value--ok">{{ data.tasks.done }}</span></div>
        <div class="kpi"><span class="kpi-label">En progreso</span><span class="kpi-value">{{ data.tasks.inProgress }}</span></div>
        <div class="kpi"><span class="kpi-label">Vencidas</span><span class="kpi-value kpi-value--bad">{{ data.tasks.overdue }}</span></div>
        <div v-for="p in data.tasks.byPriority" :key="p.priority" class="kpi">
          <span class="kpi-label">{{ p.priority }}</span><span class="kpi-value">{{ p.count }}</span>
        </div>
      </section>

      <section v-if="activeTab === 'proyectos'" class="report-table-wrap">
        <table class="report-table">
          <thead><tr><th>Proyecto</th><th>Presupuesto</th><th>Facturado</th><th>Cobrado</th><th>Avance</th></tr></thead>
          <tbody>
            <tr v-for="p in data.projects" :key="p.id">
              <td>{{ p.name }}</td><td>{{ money(p.budget, p.currency) }}</td><td>{{ money(p.invoiced, p.currency) }}</td><td>{{ money(p.collected, p.currency) }}</td><td>{{ p.progress }}%</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-if="activeTab === 'horas'" class="kpi-grid">
        <div class="kpi"><span class="kpi-label">Horas totales</span><span class="kpi-value">{{ hours(data.time.totalMinutes) }}</span></div>
        <div class="kpi"><span class="kpi-label">Facturables</span><span class="kpi-value">{{ hours(data.time.billableMinutes) }}</span></div>
        <div class="kpi"><span class="kpi-label">Monto facturable</span><span class="kpi-value">{{ billableByCurrency() }}</span></div>
      </section>
      <section v-if="activeTab === 'horas'" class="report-table-wrap">
        <table class="report-table">
          <thead><tr><th>Proyecto</th><th>Minutos</th><th>Facturables</th><th>Monto</th></tr></thead>
          <tbody>
            <tr v-for="r in data.time.byProject" :key="r.projectId ?? 'none'">
              <td>{{ projectName(r.projectId) }}</td><td>{{ r.minutes }}</td><td>{{ r.billableMinutes }}</td><td>{{ money(r.billableAmount, projectCurrency(r.projectId)) }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { reportsApi } from '@/api/reports/reports.api'
import { useClientsStore } from '@/stores/clients.store'
import { useProjectsStore } from '@/stores/projects.store'

export default defineComponent({
  name: 'ReportsPage',
  setup() {
    const clientsStore = useClientsStore()
    const projectsStore = useProjectsStore()
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const today = now.toISOString().slice(0, 10)

    const filters = ref({ from: firstDay, to: today, clientId: '', projectId: '' })
    const clients = ref<any[]>([])
    const projects = ref<any[]>([])
    const data = ref<any>(null)
    const loading = ref(false)
    const exporting = ref(false)
    const activeTab = ref('finanzas')
    const tabs = [
      { id: 'finanzas', label: 'Finanzas' },
      { id: 'tareas', label: 'Tareas' },
      { id: 'proyectos', label: 'Proyectos' },
      { id: 'horas', label: 'Horas' },
    ]

    onMounted(async () => {
      await Promise.all([
        clientsStore.fetchAll({ limit: 100 } as any).catch(() => {}),
        projectsStore.fetchAll().catch(() => {}),
      ])
      clients.value = clientsStore.items
      projects.value = projectsStore.items
      await load()
    })

    async function load() {
      loading.value = true
      try {
        const params: any = { from: filters.value.from, to: filters.value.to }
        if (filters.value.clientId) params.clientIds = [filters.value.clientId]
        if (filters.value.projectId) params.projectIds = [filters.value.projectId]
        const { data: res } = await reportsApi.summary(params)
        data.value = res
      } finally {
        loading.value = false
      }
    }

    async function doExport(kind: 'csv' | 'pdf') {
      exporting.value = true
      try {
        const params: any = { from: filters.value.from, to: filters.value.to }
        if (filters.value.clientId) params.clientIds = [filters.value.clientId]
        if (filters.value.projectId) params.projectIds = [filters.value.projectId]
        const res = await reportsApi.download(kind, params)
        const url = URL.createObjectURL(new Blob([res.data]))
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte.${kind}`
        a.click()
        URL.revokeObjectURL(url)
      } finally {
        exporting.value = false
      }
    }

    function money(n: number, currency = 'USD') {
      return new Intl.NumberFormat(currency === 'ARS' ? 'es-AR' : 'es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n ?? 0)
    }

    const STATUS_ES: Record<string, string> = {
      draft: 'Borrador', pending: 'Pendiente', sent: 'Enviada', paid: 'Pagada',
      collected: 'Cobrada', overdue: 'Vencida', cancelled: 'Cancelada',
    }

    function statusLabel(s: string) {
      return STATUS_ES[s] ?? s
    }

    function hours(min: number) {
      const h = Math.floor((min ?? 0) / 60)
      const m = Math.round((min ?? 0) % 60)
      return `${h}h ${m}m`
    }

    function fmtDate(iso?: string) {
      if (!iso) return '—'
      return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    function projectName(id: string | null) {
      if (!id) return 'Sin proyecto'
      return projects.value.find((p) => p._id === id)?.name ?? id
    }

    function projectCurrency(id: string | null) {
      if (!id) return 'USD'
      return (projects.value.find((p) => p._id === id) as any)?.currency ?? 'USD'
    }

    function billableByCurrency() {
      if (!data.value) return '—'
      const map = new Map<string, number>()
      for (const r of data.value.time.byProject) {
        const c = projectCurrency(r.projectId)
        map.set(c, (map.get(c) ?? 0) + (r.billableAmount ?? 0))
      }
      if (!map.size) return money(0)
      return [...map.entries()].map(([c, n]) => money(n, c)).join(' + ')
    }

    return {
      filters, clients, projects, data, loading, exporting, activeTab, tabs,
      load, doExport, money, hours, fmtDate, projectName, projectCurrency, billableByCurrency, statusLabel,
    }
  },
})
</script>

<style scoped>
.reports-page { padding: 32px; flex-grow: 1; min-width: 0; display: flex; flex-direction: column; }
.reports-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.page-title { font-family: var(--font-mono); font-size: 20px; font-weight: 700; text-transform: uppercase; margin: 0; }
.page-sub { color: var(--color-text-muted); font-size: 13px; margin: 4px 0 0; }
.reports-actions { display: flex; gap: 8px; }
.btn-secondary { display: flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; background: var(--color-bg-surface-low); border: 1px solid var(--color-border); color: var(--color-text-base); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; cursor: pointer; }
.btn-secondary:disabled { opacity: 0.5; cursor: default; }
.btn-primary { height: 36px; padding: 0 18px; background: var(--color-primary); border: none; color: #fff; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; cursor: pointer; }
.filters-card { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; background: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 16px; margin-bottom: 24px; }
.filters-card label { display: flex; flex-direction: column; gap: 4px; font-size: 11px; text-transform: uppercase; color: var(--color-text-muted); font-family: var(--font-mono); }
.filters-card input, .filters-card select { height: 36px; background: var(--color-bg-base); border: 1px solid var(--color-border); color: var(--color-text-base); padding: 0 10px; font-size: 13px; }
.loading-state { display: flex; align-items: center; gap: 10px; color: var(--color-text-muted); padding: 48px 0; }
.spinning { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.report-tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid var(--color-border); }
.report-tab { background: none; border: none; padding: 10px 16px; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--color-text-muted); cursor: pointer; border-bottom: 2px solid transparent; }
.report-tab--active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
.kpi { background: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; }
.kpi-label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--color-text-muted); }
.kpi-value { font-size: 20px; font-weight: 700; }
.kpi-value--ok { color: var(--color-success); }
.kpi-value--bad { color: var(--color-error); }
.report-table-wrap h3 { font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; margin: 24px 0 8px; }
.report-table { width: 100%; border-collapse: collapse; background: var(--color-bg-surface); }
.report-table th, .report-table td { border: 1px solid var(--color-border); padding: 8px 12px; font-size: 13px; text-align: left; }
.report-table th { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--color-text-muted); }
</style>
