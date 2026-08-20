<template>
  <div class="project-detail">
    <header class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="$router.push({ name: 'projects' })">
          <span class="material-symbols-outlined">arrow_back</span>
          <span>{{ $t('projects.detail.back') }}</span>
        </button>
        <template v-if="overview">
          <div class="project-title-row">
            <h1 class="page-title">{{ overview.project.name }}</h1>
            <w-badge :color="getStatusColor(overview.project.status)">{{ overview.project.status }}</w-badge>
          </div>
          <p v-if="overview.project.description" class="project-meta">{{ overview.project.description }}</p>
          <div class="project-dates">
            <span v-if="overview.project.startDate">
              <span class="material-symbols-outlined">calendar_today</span>
              {{ formatDate(overview.project.startDate) }}
            </span>
            <span v-if="overview.project.endDate">
              <span class="material-symbols-outlined">event</span>
              {{ formatDate(overview.project.endDate) }}
            </span>
            <span v-if="overview.project.budget">
              <span class="material-symbols-outlined">payments</span>
              {{ formatMoney(overview.project.budget, overview.project.currency) }}
            </span>
          </div>
        </template>
      </div>

      <div v-if="overview" class="header-right">
        <div class="public-link-box">
          <span class="mono-label">Link de proyecto</span>
          <div v-if="overview.project.publicToken" class="link-row">
            <span v-if="linkStatus?.linkVisibility === 'private'" class="link-private-badge">
              <span class="material-symbols-outlined" style="font-size:12px">lock</span>
              Privado
            </span>
            <span v-else class="link-active-badge">
              <span class="material-symbols-outlined" style="font-size:12px">public</span>
              Público
            </span>
            <button class="icon-btn" @click="copyPublicLink" title="Copiar link">
              <span class="material-symbols-outlined">content_copy</span>
            </button>
            <button class="icon-btn" @click="openLinkDrawer" title="Configurar link">
              <span class="material-symbols-outlined">settings</span>
            </button>
            <button class="icon-btn icon-btn--danger" @click="handleRevokeLink" title="Revocar link">
              <span class="material-symbols-outlined">link_off</span>
            </button>
          </div>
          <w-button v-else variant="ghost" @click="handleGenerateLink" :disabled="linkLoading">
            <span class="material-symbols-outlined mr-1">link</span>
            Generar link
          </w-button>
        </div>
      </div>

      <!-- Link settings drawer -->
      <w-drawer v-model="linkDrawerOpen" title="Configuración del link" width="440px">
        <div class="link-drawer-body" v-if="linkStatus !== null">
          <!-- Current state summary -->
          <div class="link-status-row">
            <span class="mono-label">Estado actual</span>
            <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
              <span v-if="linkStatus.linkVisibility === 'private'" class="link-private-badge">
                <span class="material-symbols-outlined" style="font-size:12px">lock</span>
                Privado
              </span>
              <span v-else class="link-active-badge">
                <span class="material-symbols-outlined" style="font-size:12px">public</span>
                Público
              </span>
              <code class="link-url-preview" @click="copyPublicLink" title="Copiar">
                /p/{{ linkStatus.publicToken?.substring(0, 12) }}…
                <span class="material-symbols-outlined" style="font-size:11px;vertical-align:middle">content_copy</span>
              </code>
            </div>
          </div>

          <div class="link-divider" />

          <!-- Set private credentials -->
          <div class="link-section">
            <h3 class="link-section-title">
              <span class="material-symbols-outlined" style="font-size:16px">lock</span>
              Acceso privado
            </h3>
            <p class="link-section-desc">
              Protege el link con usuario y contraseña. Solo quienes tengan las credenciales podrán ver el proyecto.
            </p>

            <div v-if="linkStatus.hasCredential" class="credential-current">
              <span class="mono-label">Usuario activo:</span>
              <code class="cred-username">{{ linkStatus.username }}</code>
              <div style="display:flex;gap:8px;margin-top:12px">
                <w-button variant="ghost" size="sm" @click="showRotateConfirm = true" :disabled="credLoading">
                  <span class="material-symbols-outlined mr-1">refresh</span>
                  Rotar contraseña
                </w-button>
                <w-button variant="ghost" size="sm" style="color:var(--color-error)" @click="handleRemoveCredential" :disabled="credLoading">
                  <span class="material-symbols-outlined mr-1">lock_open</span>
                  Hacer público
                </w-button>
              </div>
            </div>

            <div v-if="showRotateConfirm" class="rotate-confirm-box">
              <p style="font-size:13px;margin:0 0 12px">Se generará una nueva contraseña aleatoria. Cópiala ahora — no se mostrará de nuevo.</p>
              <div v-if="rotatedPassword" class="rotated-password-box">
                <code>{{ rotatedPassword }}</code>
                <button class="icon-btn" @click="copyRotatedPassword" title="Copiar">
                  <span class="material-symbols-outlined">content_copy</span>
                </button>
              </div>
              <div style="display:flex;gap:8px" v-if="!rotatedPassword">
                <w-button variant="ghost" size="sm" @click="showRotateConfirm = false">Cancelar</w-button>
                <w-button variant="primary" size="sm" @click="handleRotateCredential" :disabled="credLoading">Confirmar rotación</w-button>
              </div>
              <w-button v-else variant="ghost" size="sm" @click="showRotateConfirm = false; rotatedPassword = ''">Cerrar</w-button>
            </div>

            <div v-if="!linkStatus.hasCredential" class="credential-form">
              <div class="form-field">
                <label>Usuario</label>
                <input
                  v-model="credForm.username"
                  type="text"
                  placeholder="cliente"
                  autocomplete="off"
                  :class="{ 'input-invalid': credUsernameTouched && !credForm.username }"
                  @blur="credUsernameTouched = true"
                />
                <span v-if="credUsernameTouched && !credForm.username" class="w-input-error">
                  El usuario es obligatorio
                </span>
              </div>
              <div class="form-field">
                <label>Contraseña</label>
                <div class="password-input-row">
                  <input
                    v-model="credForm.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="mín. 8 caracteres"
                    autocomplete="new-password"
                    :class="{ 'input-invalid': credPasswordTouched && credForm.password.length > 0 && credForm.password.length < 8 }"
                    @blur="credPasswordTouched = true"
                  />
                  <button class="icon-btn" @click="showPassword = !showPassword" type="button">
                    <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
                <span v-if="credPasswordTouched && credForm.password.length > 0 && credForm.password.length < 8" class="w-input-error">
                  Faltan {{ 8 - credForm.password.length }} caracteres
                </span>
                <span v-else-if="credPasswordTouched && !credForm.password" class="w-input-error">
                  La contraseña es obligatoria
                </span>
              </div>
              <w-button variant="primary" size="sm" @click="handleSetCredential" :disabled="credLoading || !credForm.username || credForm.password.length < 8" style="margin-top:4px">
                <span class="material-symbols-outlined mr-1">lock</span>
                Activar acceso privado
              </w-button>
            </div>
          </div>
        </div>
        <div v-else class="link-drawer-body" style="display:flex;justify-content:center;padding:40px">
          <span class="material-symbols-outlined loading-icon">progress_activity</span>
        </div>
      </w-drawer>
    </header>

    <div v-if="loading && !overview" class="loading-state">
      <span class="material-symbols-outlined loading-icon">progress_activity</span>
    </div>

    <template v-if="overview">
      <section class="kpi-strip">
        <w-kpi-card :title="$t('projects.detail.taskTotal')" :value="overview.taskStats.total" />
        <w-kpi-card :title="$t('projects.detail.taskDone')" :value="overview.taskStats.done" />
        <w-kpi-card :title="$t('projects.detail.taskInProgress')" :value="overview.taskStats.inProgress" />
        <w-kpi-card :title="$t('projects.detail.taskOverdue')" :value="overview.taskStats.overdue" />
        <w-kpi-card :title="$t('projects.detail.invoicePaid')" :value="formatMoney(overview.invoiceStats.paid, overview.project.currency)" />
        <w-kpi-card :title="$t('projects.detail.invoicePending')" :value="formatMoney(overview.invoiceStats.pending, overview.project.currency)" />
      </section>

      <!-- GitHub Section -->
      <section class="github-section">
        <div class="section-header" style="margin-bottom: 12px;">
          <span class="material-symbols-outlined" style="font-size:16px;color:var(--color-text-muted)">commit</span>
          <h2 class="section-title">GitHub</h2>
          <span v-if="connectedRepos.length" class="section-count">{{ connectedRepos.length }}</span>
          <w-button variant="ghost" style="margin-left:auto" @click="openRepoDrawer">
            <span class="material-symbols-outlined mr-1">add_link</span>
            Conectar repo
          </w-button>
        </div>

        <w-card>
          <div v-if="!connectedRepos.length" class="github-hint">Sin repositorios vinculados</div>
          <div v-for="repo in connectedRepos" :key="`${repo.owner}/${repo.repo}`" class="github-connected-row">
            <span class="material-symbols-outlined" style="font-size:16px;color:var(--color-text-muted)">commit</span>
            <a :href="repo.htmlUrl" target="_blank" class="github-repo-link">{{ repo.owner }}/{{ repo.repo }}</a>
            <div style="display:flex;gap:6px;margin-left:auto">
              <w-button variant="ghost" @click="$router.push({ name: 'project-github', params: { id: projectId }, query: { owner: repo.owner, repo: repo.repo } })">
                <span class="material-symbols-outlined mr-1">open_in_new</span>
                Ver actividad
              </w-button>
              <w-button variant="ghost" @click="handleDisconnectRepo(repo)" :disabled="githubStore.loading">
                Desconectar
              </w-button>
            </div>
          </div>
        </w-card>
      </section>

      <!-- Railway Section -->
      <section class="railway-section">
        <div class="section-header" style="margin-bottom: 12px;">
          <span class="material-symbols-outlined" style="font-size:16px;color:var(--color-text-muted)">rocket_launch</span>
          <h2 class="section-title">Railway</h2>
          <w-button variant="ghost" style="margin-left:auto" @click="openRailwayDrawer">
            <span class="material-symbols-outlined mr-1">{{ railwayProjectId ? 'edit' : 'add_link' }}</span>
            {{ railwayProjectId ? 'Cambiar proyecto' : 'Vincular proyecto' }}
          </w-button>
          <w-button v-if="railwayProjectId" variant="ghost" @click="$router.push({ name: 'project-railway', params: { id: projectId } })">
            <span class="material-symbols-outlined mr-1">open_in_new</span>
            Ver deployments
          </w-button>
          <w-button v-if="railwayProjectId" variant="ghost" :loading="railwayStore.loading" @click="handleUnlinkRailway">
            Desvincular
          </w-button>
        </div>

        <w-card>
          <div v-if="!railwayProjectId" class="github-hint">Sin proyecto Railway vinculado</div>
          <div v-else class="railway-linked-row">
            <span class="material-symbols-outlined" style="font-size:16px;color:var(--color-text-muted)">rocket_launch</span>
            <span class="github-repo-link">{{ linkedRailwayName }}</span>
            <w-badge color="var(--color-success)" style="margin-left:auto">Vinculado</w-badge>
          </div>
        </w-card>
      </section>

      <!-- Netlify Section -->
      <section class="railway-section">
        <div class="section-header" style="margin-bottom: 12px;">
          <span class="material-symbols-outlined" style="font-size:16px;color:#00c7b7">language</span>
          <h2 class="section-title">Netlify</h2>
          <w-button variant="ghost" style="margin-left:auto" @click="openNetlifyDrawer">
            <span class="material-symbols-outlined mr-1">{{ netlifySiteId ? 'edit' : 'add_link' }}</span>
            {{ netlifySiteId ? 'Cambiar site' : 'Vincular site' }}
          </w-button>
          <w-button v-if="netlifySiteId" variant="ghost" @click="$router.push({ name: 'project-netlify', params: { id: projectId } })">
            <span class="material-symbols-outlined mr-1">open_in_new</span>
            Ver deploys
          </w-button>
          <w-button v-if="netlifySiteId" variant="ghost" :loading="netlifyStore.loading" @click="handleUnlinkNetlify">
            Desvincular
          </w-button>
        </div>

        <w-card>
          <div v-if="!netlifySiteId" class="github-hint">Sin site de Netlify vinculado</div>
          <div v-else class="railway-linked-row">
            <span class="material-symbols-outlined" style="font-size:16px;color:#00c7b7">language</span>
            <span class="github-repo-link">{{ linkedNetlifySiteName }}</span>
            <w-badge color="var(--color-success)" style="margin-left:auto">Vinculado</w-badge>
          </div>
        </w-card>
      </section>

      <!-- Supabase Section -->
      <section class="railway-section">
        <div class="section-header" style="margin-bottom: 12px;">
          <span class="material-symbols-outlined" style="font-size:16px;color:#3ecf8e">database</span>
          <h2 class="section-title">Supabase</h2>
          <w-button variant="ghost" style="margin-left:auto" @click="openSupabaseDrawer">
            <span class="material-symbols-outlined mr-1">{{ supabaseProjectRef ? 'edit' : 'add_link' }}</span>
            {{ supabaseProjectRef ? 'Cambiar proyecto' : 'Vincular proyecto' }}
          </w-button>
          <w-button v-if="supabaseProjectRef" variant="ghost" :loading="supabaseStore.loading" @click="handleUnlinkSupabase">
            Desvincular
          </w-button>
        </div>

        <w-card>
          <div v-if="!supabaseProjectRef" class="github-hint">Sin proyecto Supabase vinculado</div>
          <div v-else class="railway-linked-row">
            <span class="material-symbols-outlined" style="font-size:16px;color:#3ecf8e">database</span>
            <span class="github-repo-link">{{ supabaseProjectRef }}</span>
            <w-badge color="var(--color-success)" style="margin-left:auto">Vinculado</w-badge>
          </div>
        </w-card>
      </section>

      <!-- Supabase project selector drawer -->
      <w-drawer v-model="supabaseDrawerOpen" title="Vincular proyecto Supabase" width="420px">
        <div class="repo-drawer-body">
          <div v-if="!supabaseStore.isConnected" class="feed-empty">
            Supabase no está conectado en este workspace.
            <router-link to="/app/integrations" class="github-repo-link" style="display:block;margin-top:8px">Ir a Integraciones →</router-link>
          </div>
          <template v-else>
            <div class="repo-search-box">
              <span class="material-symbols-outlined">search</span>
              <input
                v-model="supabaseSearch"
                type="text"
                placeholder="Buscar proyecto Supabase..."
                class="repo-search-input"
              />
            </div>
            <div v-if="supabaseStore.projectsLoading" class="feed-empty">Cargando proyectos...</div>
            <div v-else-if="supabaseStore.error" class="feed-empty" style="color:var(--color-error)">
              Error: {{ supabaseStore.error }}.
            </div>
            <div v-else-if="!supabaseStore.supabaseProjects.length" class="feed-empty">No se encontraron proyectos de Supabase.</div>
            <div v-else-if="!filteredSupabaseProjects.length" class="feed-empty">Sin resultados para "{{ supabaseSearch }}"</div>
            <div
              v-for="sp in filteredSupabaseProjects"
              :key="sp.ref"
              class="repo-item"
              :class="{ selected: selectedSupabaseProject?.ref === sp.ref }"
              @click="selectedSupabaseProject = sp"
            >
              <span class="material-symbols-outlined" style="font-size:16px;color:#3ecf8e">database</span>
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:500">{{ sp.name }}</div>
                <div style="font-family:var(--font-mono);font-size:11px;color:var(--color-text-muted)">{{ sp.ref }} · {{ sp.region }}</div>
              </div>
            </div>
          </template>
        </div>
        <template #footer>
          <div style="display:flex;gap:8px;justify-content:flex-end;padding:16px">
            <w-button variant="ghost" @click="supabaseDrawerOpen = false">Cancelar</w-button>
            <w-button variant="primary" :disabled="!selectedSupabaseProject || supabaseStore.loading" @click="handleLinkSupabase">
              Vincular
            </w-button>
          </div>
        </template>
      </w-drawer>

      <!-- Netlify site selector drawer -->
      <w-drawer v-model="netlifyDrawerOpen" title="Vincular site de Netlify" width="420px">
        <div class="repo-drawer-body">
          <div v-if="!netlifyStore.isConnected" class="feed-empty">
            Netlify no está conectado en este workspace.
            <router-link to="/app/integrations" class="github-repo-link" style="display:block;margin-top:8px">Ir a Integraciones →</router-link>
          </div>
          <template v-else>
            <div class="repo-search-box">
              <span class="material-symbols-outlined">search</span>
              <input
                v-model="netlifySearch"
                type="text"
                placeholder="Buscar site de Netlify..."
                class="repo-search-input"
              />
            </div>
            <div v-if="netlifyStore.sitesLoading" class="feed-empty">Cargando sites...</div>
            <div v-else-if="netlifyStore.error" class="feed-empty" style="color:var(--color-error)">
              Error: {{ netlifyStore.error }}.
            </div>
            <div v-else-if="!netlifyStore.sites.length" class="feed-empty">No se encontraron sites de Netlify.</div>
            <div v-else-if="!filteredNetlifySites.length" class="feed-empty">Sin resultados para "{{ netlifySearch }}"</div>
            <div
              v-for="site in filteredNetlifySites"
              :key="site.id"
              class="repo-item"
              :class="{ selected: selectedNetlifySite?.id === site.id }"
              @click="selectedNetlifySite = site"
            >
              <span class="material-symbols-outlined" style="font-size:16px;color:#00c7b7">language</span>
              <div style="display:flex;flex-direction:column;gap:2px;min-width:0">
                <span class="repo-item-name">{{ site.name }}</span>
                <span style="font-family:var(--font-mono);font-size:10px;color:var(--color-text-muted)">{{ site.url }}</span>
              </div>
            </div>
          </template>
        </div>
        <template #footer>
          <div style="display:flex;gap:8px;justify-content:flex-end;padding:16px">
            <w-button variant="ghost" @click="netlifyDrawerOpen = false">Cancelar</w-button>
            <w-button variant="primary" :disabled="!selectedNetlifySite || netlifyStore.loading" @click="handleLinkNetlify">
              Vincular
            </w-button>
          </div>
        </template>
      </w-drawer>

      <!-- Railway project selector drawer -->
      <w-drawer v-model="railwayDrawerOpen" title="Vincular proyecto Railway" width="420px">
        <div class="repo-drawer-body">
          <div v-if="!railwayStore.isConnected" class="feed-empty">
            Railway no está conectado en este workspace.
            <router-link to="/app/integrations" class="github-repo-link" style="display:block;margin-top:8px">Ir a Integraciones →</router-link>
          </div>
          <template v-else>
            <div class="repo-search-box">
              <span class="material-symbols-outlined">search</span>
              <input
                v-model="railwaySearch"
                type="text"
                placeholder="Buscar proyecto Railway..."
                class="repo-search-input"
              />
            </div>
            <div v-if="railwayStore.projectsLoading" class="feed-empty">Cargando proyectos...</div>
            <div v-else-if="railwayStore.error" class="feed-empty" style="color:var(--color-error)">
              Error: {{ railwayStore.error }}.
              <span style="display:block;margin-top:6px;color:var(--color-text-muted)">
                Asegurate de usar un token de cuenta completa (sin workspace seleccionado) en
                <a href="https://railway.app/account/tokens" target="_blank" style="color:var(--color-primary)">railway.app/account/tokens</a>.
              </span>
            </div>
            <div v-else-if="!railwayStore.railwayProjects.length" class="feed-empty">No se encontraron proyectos de Railway.</div>
            <div v-else-if="!filteredRailwayProjects.length" class="feed-empty">Sin resultados para "{{ railwaySearch }}"</div>
            <div
              v-for="rp in filteredRailwayProjects"
              :key="rp.id"
              class="repo-item"
              :class="{ selected: selectedRailwayProject?.id === rp.id }"
              @click="selectedRailwayProject = rp"
            >
              <span class="material-symbols-outlined" style="font-size:16px">rocket_launch</span>
              <span class="repo-item-name">{{ rp.name }}</span>
            </div>
          </template>
        </div>
        <template #footer>
          <div style="display:flex;gap:8px;justify-content:flex-end;padding:16px">
            <w-button variant="ghost" @click="railwayDrawerOpen = false">Cancelar</w-button>
            <w-button variant="primary" :disabled="!selectedRailwayProject || railwayStore.loading" @click="handleLinkRailway">
              Vincular
            </w-button>
          </div>
        </template>
      </w-drawer>

      <!-- Repo selector drawer -->
      <w-drawer v-model="repoDrawerOpen" title="Conectar repositorio GitHub" width="420px">
        <div class="repo-drawer-body">
          <div class="repo-search-box">
            <span class="material-symbols-outlined">search</span>
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
            <span class="material-symbols-outlined" style="font-size:16px">{{ repo.private ? 'lock' : 'public' }}</span>
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

      <div class="detail-grid">
        <section class="detail-section">
          <div class="section-header">
            <h2 class="section-title">{{ $t('projects.detail.pendingTasks') }}</h2>
            <span class="section-count">{{ overview.pendingTasks.length }}</span>
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
                <span :class="{ 'text-error': isOverdue(item.dueDate) }">{{ item.dueDate ? formatDate(item.dueDate) : '—' }}</span>
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
                <span :class="{ 'text-error': isOverdue(item.dueDate) }">{{ item.dueDate ? formatDate(item.dueDate) : '—' }}</span>
              </template>
            </w-table>
          </w-card>
        </section>

        <section class="detail-section full-width">
          <div class="section-header">
            <h2 class="section-title">{{ $t('projects.detail.invoices') }}</h2>
            <span class="section-count">{{ overview.invoices.length }}</span>
          </div>
          <w-card class="no-padding">
            <w-table :headers="invoiceHeaders" :items="overview.invoices" :empty-message="$t('projects.detail.noInvoices')">
              <template #item-status="{ item }">
                <w-badge :color="getInvoiceStatusColor(item.status)">{{ item.status }}</w-badge>
              </template>
              <template #item-total="{ item }">
                {{ formatMoney(item.total, item.currency) }}
              </template>
              <template #item-dueDate="{ item }">
                {{ item.dueDate ? formatDate(item.dueDate) : '—' }}
              </template>
            </w-table>
          </w-card>
        </section>

        <section v-if="overview.documents && overview.documents.length > 0" class="detail-section full-width">
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
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useProjectsStore } from '@/stores/projects.store'
import { useGithubStore } from '@/stores/github.store'
import { useRailwayStore } from '@/stores/railway.store'
import { useNetlifyStore } from '@/stores/netlify.store'
import { useSupabaseStore } from '@/stores/supabase.store'
import type { SupabaseProject } from '@/api/supabase/supabase.types'
import type { NetlifySite } from '@/api/netlify/netlify.types'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/date'
import WButton from '@/components/ui/WButton.vue'
import WCard from '@/components/ui/WCard.vue'
import WTable from '@/components/ui/WTable.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WKpiCard from '@/components/ui/WKpiCard.vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import type { GithubRepo } from '@/api/github/github.api'

export default defineComponent({
  name: 'ProjectDetailPage',
  components: { WButton, WCard, WTable, WBadge, WKpiCard, WDrawer },
  data() {
    return {
      linkLoading: false,
      linkDrawerOpen: false,
      credLoading: false,
      credForm: { username: '', password: '' },
      credUsernameTouched: false,
      credPasswordTouched: false,
      showPassword: false,
      showRotateConfirm: false,
      rotatedPassword: '',
      repoDrawerOpen: false,
      repoSearch: '',
      selectedRepo: null as GithubRepo | null,
      githubStore: useGithubStore(),
      railwayStore: useRailwayStore(),
      railwayDrawerOpen: false,
      railwaySearch: '',
      selectedRailwayProject: null as { id: string; name: string } | null,
      netlifyStore: useNetlifyStore(),
      netlifyDrawerOpen: false,
      netlifySearch: '',
      selectedNetlifySite: null as NetlifySite | null,
      supabaseStore: useSupabaseStore(),
      supabaseDrawerOpen: false,
      supabaseSearch: '',
      selectedSupabaseProject: null as SupabaseProject | null,
    }
  },
  computed: {
    ...mapState(useProjectsStore, ['overview', 'loading', 'linkStatus', 'linkStatusLoading']),
    projectId(): string {
      return this.$route.params.id as string
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
    railwayProjectId(): string | null {
      return (this.overview?.project as any)?.railwayProjectId ?? null
    },
    linkedRailwayName(): string {
      if (!this.railwayProjectId) return ''
      const found = this.railwayStore.railwayProjects.find((p) => p.id === this.railwayProjectId)
      return found?.name ?? this.railwayProjectId
    },
    filteredRailwayProjects() {
      const q = this.railwaySearch.toLowerCase().trim()
      if (!q) return this.railwayStore.railwayProjects
      return this.railwayStore.railwayProjects.filter((p) => p.name.toLowerCase().includes(q))
    },
    netlifySiteId(): string | null {
      return (this.overview?.project as any)?.netlifySiteId ?? null
    },
    linkedNetlifySiteName(): string {
      if (!this.netlifySiteId) return ''
      const found = this.netlifyStore.sites.find((s) => s.id === this.netlifySiteId)
      return found?.name ?? this.netlifySiteId
    },
    filteredNetlifySites() {
      const q = this.netlifySearch.toLowerCase().trim()
      if (!q) return this.netlifyStore.sites
      return this.netlifyStore.sites.filter((s) => s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q))
    },
    supabaseProjectRef(): string | null {
      return (this.overview?.project as any)?.supabaseProjectRef ?? null
    },
    filteredSupabaseProjects() {
      const q = this.supabaseSearch.toLowerCase().trim()
      if (!q) return this.supabaseStore.supabaseProjects
      return this.supabaseStore.supabaseProjects.filter(
        (p) => p.name.toLowerCase().includes(q) || p.ref.toLowerCase().includes(q),
      )
    },
    taskHeaders() {
      return [
        { key: 'title', label: this.$t('tasks.fields.title').toUpperCase() },
        { key: 'status', label: this.$t('projects.fields.status').toUpperCase() },
        { key: 'priority', label: this.$t('tasks.fields.priority').toUpperCase() },
        { key: 'dueDate', label: this.$t('tasks.fields.due').toUpperCase() },
      ]
    },
    invoiceHeaders() {
      return [
        { key: 'number', label: this.$t('finance.fields.number').toUpperCase() },
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
      'generatePublicLink',
      'revokePublicLink',
      'fetchLinkStatus',
      'setLinkCredential',
      'removeLinkCredential',
      'rotateLinkCredential',
    ]),
    formatDate,
    formatMoney(amount: number | undefined, currency?: string) {
      if (amount === undefined || amount === null) return '—'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        maximumFractionDigits: 0,
      }).format(amount)
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
    async handleGenerateLink() {
      this.linkLoading = true
      try {
        await this.generatePublicLink(this.projectId)
      } finally {
        this.linkLoading = false
      }
    },
    async handleRevokeLink() {
      if (!confirm(this.$t('projects.detail.revokeConfirm'))) return
      await this.revokePublicLink(this.projectId)
    },
    copyPublicLink() {
      const token = this.overview?.project?.publicToken
      if (!token) return
      const url = `${window.location.origin}/p/${token}`
      navigator.clipboard.writeText(url)
      useToast().success(this.$t('projects.detail.linkCopied'))
    },
    async openLinkDrawer() {
      this.showRotateConfirm = false
      this.rotatedPassword = ''
      this.credForm = { username: '', password: '' }
      this.credUsernameTouched = false
      this.credPasswordTouched = false
      this.linkDrawerOpen = true
      await this.fetchLinkStatus(this.projectId)
    },
    async handleSetCredential() {
      if (!this.credForm.username || this.credForm.password.length < 8) return
      this.credLoading = true
      try {
        await this.setLinkCredential(this.projectId, this.credForm)
        this.credForm = { username: '', password: '' }
        this.credUsernameTouched = false
        this.credPasswordTouched = false
      } finally {
        this.credLoading = false
      }
    },
    async handleRemoveCredential() {
      if (!confirm('¿Hacer el link público nuevamente? Cualquiera con el link podrá acceder sin contraseña.')) return
      this.credLoading = true
      try {
        await this.removeLinkCredential(this.projectId)
      } finally {
        this.credLoading = false
      }
    },
    async handleRotateCredential() {
      this.credLoading = true
      try {
        this.rotatedPassword = await this.rotateLinkCredential(this.projectId)
      } finally {
        this.credLoading = false
      }
    },
    copyRotatedPassword() {
      navigator.clipboard.writeText(this.rotatedPassword)
      useToast().success('Contraseña copiada')
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
    async handleDisconnectRepo(repo: { owner: string; repo: string }) {
      if (!confirm(`¿Desconectar ${repo.owner}/${repo.repo} de este proyecto?`)) return
      await this.githubStore.disconnectRepo(this.projectId, repo.owner, repo.repo)
      await this.fetchOverview(this.projectId)
    },
    async openRailwayDrawer() {
      this.selectedRailwayProject = null
      this.railwaySearch = ''
      this.railwayDrawerOpen = true
      if (!this.railwayStore.connection) {
        await this.railwayStore.fetchConnection()
      }
      if (this.railwayStore.isConnected) {
        await this.railwayStore.fetchProjects()
      }
    },
    async handleLinkRailway() {
      if (!this.selectedRailwayProject) return
      await this.railwayStore.linkProject(this.projectId, { railwayProjectId: this.selectedRailwayProject.id })
      this.railwayDrawerOpen = false
      await this.fetchOverview(this.projectId)
    },
    async handleUnlinkRailway() {
      if (!confirm('¿Desvincular el proyecto de Railway de este proyecto?')) return
      await this.railwayStore.unlinkProject(this.projectId)
      await this.fetchOverview(this.projectId)
    },
    async openNetlifyDrawer() {
      this.selectedNetlifySite = null
      this.netlifySearch = ''
      this.netlifyDrawerOpen = true
      if (!this.netlifyStore.connection) {
        await this.netlifyStore.fetchConnection()
      }
      if (this.netlifyStore.isConnected) {
        await this.netlifyStore.fetchSites()
      }
    },
    async handleLinkNetlify() {
      if (!this.selectedNetlifySite) return
      await this.netlifyStore.linkProject(this.projectId, { netlifySiteId: this.selectedNetlifySite.id })
      this.netlifyDrawerOpen = false
      await this.fetchOverview(this.projectId)
    },
    async handleUnlinkNetlify() {
      if (!confirm('¿Desvincular el site de Netlify de este proyecto?')) return
      await this.netlifyStore.unlinkProject(this.projectId)
      await this.fetchOverview(this.projectId)
    },
    async openSupabaseDrawer() {
      this.selectedSupabaseProject = null
      this.supabaseSearch = ''
      this.supabaseDrawerOpen = true
      if (!this.supabaseStore.connection) {
        await this.supabaseStore.fetchConnection()
      }
      if (this.supabaseStore.isConnected) {
        await this.supabaseStore.fetchProjects()
      }
    },
    async handleLinkSupabase() {
      if (!this.selectedSupabaseProject) return
      await this.supabaseStore.linkProject(this.projectId, {
        supabaseProjectRef: this.selectedSupabaseProject.ref,
      })
      this.supabaseDrawerOpen = false
      await this.fetchOverview(this.projectId)
    },
    async handleUnlinkSupabase() {
      if (!confirm('¿Desvincular el proyecto de Supabase?')) return
      await this.supabaseStore.unlinkProject(this.projectId)
      await this.fetchOverview(this.projectId)
    },
  },
  async mounted() {
    await this.fetchOverview(this.projectId)
    await this.railwayStore.fetchConnection()
    await this.netlifyStore.fetchConnection()
    await this.supabaseStore.fetchConnection()
    if (this.overview?.project?.publicToken) {
      this.fetchLinkStatus(this.projectId)
    }
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
.project-dates .material-symbols-outlined { font-size: 14px; }

.header-right { flex-shrink: 0; }

.public-link-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  border: 1px solid var(--color-border);
  padding: 12px 16px;
  background: var(--color-bg-surface);
}

.mono-label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.link-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.link-active-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  color: var(--color-success);
  border: 1px solid var(--color-success);
  padding: 2px 8px;
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

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.detail-section { display: flex; flex-direction: column; gap: 12px; }
.detail-section.full-width { grid-column: 1 / -1; }

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
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
.railway-section { margin-bottom: 24px; flex-shrink: 0; }

.railway-linked-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.link-private-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
  padding: 2px 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.link-drawer-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.link-status-row { display: flex; flex-direction: column; }

.link-url-preview {
  font-family: var(--font-mono);
  font-size: 11px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-muted);
}
.link-url-preview:hover { color: var(--color-text-base); border-color: var(--color-primary); }

.link-divider {
  border: none;
  border-top: 1px solid var(--color-border);
}

.link-section { display: flex; flex-direction: column; gap: 12px; }

.link-section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.link-section-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.5;
}

.credential-current {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cred-username {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
}

.credential-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-field input {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 10px 12px;
  color: var(--color-text-base);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.form-field input:focus { border-color: var(--color-primary); }
.form-field input.input-invalid { border-color: var(--color-error); }

.w-input-error {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-error);
  text-transform: uppercase;
}

.password-input-row {
  display: flex;
  align-items: center;
  position: relative;
}
.password-input-row input { padding-right: 40px; }
.password-input-row .icon-btn {
  position: absolute;
  right: 8px;
}

.rotate-confirm-box {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rotated-password-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-success);
  border-radius: 6px;
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

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
  .header-right { width: 100%; }
  .public-link-box { align-items: stretch; }
  .kpi-strip { grid-template-columns: repeat(2, 1fr); }
}
</style>
