<template>
  <div class="connections-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Integraciones</h1>
        <p class="page-subtitle">Conecta tus herramientas y servicios externos</p>
      </div>
    </header>

    <main class="page-content">
      <!-- Railway -->
      <div class="integration-card">
        <div class="integration-header">
          <div class="integration-icon railway-icon">
            <span class="material-symbols-outlined">rocket_launch</span>
          </div>
          <div class="integration-info">
            <h2 class="integration-name">Railway</h2>
            <p class="integration-description">Conecta tu cuenta de Railway para ver proyectos, servicios y deployments directamente desde Orkpad.</p>
          </div>
          <div class="integration-status">
            <w-badge v-if="railwayStore.isConnected" color="var(--color-success)">Conectado</w-badge>
            <w-badge v-else color="var(--color-text-muted)">Sin conectar</w-badge>
          </div>
        </div>

        <div class="integration-body">
          <div v-if="railwayStore.connection?.tokenInvalid" class="warning-banner">
            <span class="material-symbols-outlined">warning</span>
            Tu conexión a Railway necesita renovarse. Verificá que el token siga siendo válido.
          </div>

          <div v-if="railwayStore.loading && !railwayStore.connection" class="integration-loading">
            <span class="material-symbols-outlined loading-icon">progress_activity</span>
            <span>Cargando...</span>
          </div>

          <template v-else-if="railwayStore.isConnected && railwayStore.connection">
            <div class="connection-details">
              <div class="detail-row">
                <span class="detail-label">Token</span>
                <span class="detail-value mono">{{ railwayStore.connection!.token }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Conectado</span>
                <span class="detail-value">{{ formatDate(railwayStore.connection!.connectedAt) }}</span>
              </div>
              <div v-if="railwayStore.connection!.teamId" class="detail-row">
                <span class="detail-label">Team ID</span>
                <span class="detail-value mono">{{ railwayStore.connection!.teamId }}</span>
              </div>
            </div>
            <div class="integration-actions">
              <router-link to="/app/railway">
                <w-button variant="primary">
                  <span class="material-symbols-outlined mr-1">rocket_launch</span>
                  Ver Railway
                </w-button>
              </router-link>
              <w-button variant="ghost" @click="openConnectDrawer">
                <span class="material-symbols-outlined mr-1">edit</span>
                Actualizar token
              </w-button>
              <w-button variant="ghost" :loading="railwayStore.loading" @click="handleDisconnect">
                <span class="material-symbols-outlined mr-1">link_off</span>
                Desconectar
              </w-button>
            </div>
          </template>

          <template v-else>
            <p class="not-connected-hint">
              Para conectar Railway necesitás un token de API personal. Podés generarlo en
              <a href="https://railway.app/account/tokens" target="_blank" class="external-link">railway.app/account/tokens</a>.
            </p>
            <div class="integration-actions">
              <w-button variant="primary" @click="openConnectDrawer">
                <span class="material-symbols-outlined mr-1">add_link</span>
                Conectar Railway
              </w-button>
            </div>
          </template>
        </div>
      </div>

      <!-- Netlify -->
      <div class="integration-card">
        <div class="integration-header">
          <div class="integration-icon netlify-icon">
            <span class="material-symbols-outlined">language</span>
          </div>
          <div class="integration-info">
            <h2 class="integration-name">Netlify</h2>
            <p class="integration-description">Conecta tu cuenta de Netlify para ver sites, deploys y estado de builds directamente desde Orkpad.</p>
          </div>
          <div class="integration-status">
            <w-badge v-if="netlifyStore.isConnected" color="var(--color-success)">Conectado</w-badge>
            <w-badge v-else color="var(--color-text-muted)">Sin conectar</w-badge>
          </div>
        </div>

        <div class="integration-body">
          <div v-if="netlifyStore.connection?.tokenInvalid" class="warning-banner">
            <span class="material-symbols-outlined">warning</span>
            Tu conexión a Netlify necesita renovarse. Verificá que el token siga siendo válido.
          </div>

          <div v-if="netlifyStore.loading && !netlifyStore.connection" class="integration-loading">
            <span class="material-symbols-outlined loading-icon">progress_activity</span>
            <span>Cargando...</span>
          </div>

          <template v-else-if="netlifyStore.isConnected && netlifyStore.connection">
            <div class="connection-details">
              <div class="detail-row">
                <span class="detail-label">Token</span>
                <span class="detail-value mono">{{ netlifyStore.connection!.token }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Conectado</span>
                <span class="detail-value">{{ formatDate(netlifyStore.connection!.connectedAt) }}</span>
              </div>
            </div>
            <div class="integration-actions">
              <router-link to="/app/netlify">
                <w-button variant="primary">
                  <span class="material-symbols-outlined mr-1">language</span>
                  Ver Netlify
                </w-button>
              </router-link>
              <w-button variant="ghost" @click="openNetlifyDrawer">
                <span class="material-symbols-outlined mr-1">edit</span>
                Actualizar token
              </w-button>
              <w-button variant="ghost" :loading="netlifyStore.loading" @click="handleNetlifyDisconnect">
                <span class="material-symbols-outlined mr-1">link_off</span>
                Desconectar
              </w-button>
            </div>
          </template>

          <template v-else>
            <p class="not-connected-hint">
              Para conectar Netlify necesitás un personal access token. Podés generarlo en
              <a href="https://app.netlify.com/user/applications/personal" target="_blank" class="external-link">app.netlify.com/user/applications/personal</a>.
            </p>
            <div class="integration-actions">
              <w-button variant="primary" @click="openNetlifyDrawer">
                <span class="material-symbols-outlined mr-1">add_link</span>
                Conectar Netlify
              </w-button>
            </div>
          </template>
        </div>
      </div>

      <!-- GitHub (read-only, managed via OAuth) -->
      <div class="integration-card integration-card--readonly">
        <div class="integration-header">
          <div class="integration-icon github-icon">
            <span class="material-symbols-outlined">commit</span>
          </div>
          <div class="integration-info">
            <h2 class="integration-name">GitHub</h2>
            <p class="integration-description">La integración con GitHub se gestiona a través de OAuth. Iniciá sesión con GitHub para habilitar repositorios y actividad.</p>
          </div>
          <div class="integration-status">
            <w-badge color="var(--color-primary)">Via OAuth</w-badge>
          </div>
        </div>
      </div>

      <!-- Supabase (hidden for now) -->
      <div v-if="false" class="integration-card">
        <div class="integration-header">
          <div class="integration-icon supabase-icon">
            <span class="material-symbols-outlined">database</span>
          </div>
          <div class="integration-info">
            <h2 class="integration-name">Supabase</h2>
            <p class="integration-description">Conecta tus proyectos de Supabase para monitorear métricas de base de datos, conexiones, CPU, RAM y estado de la plataforma.</p>
          </div>
          <div class="integration-status">
            <w-badge v-if="supabaseStore.isConnected" color="var(--color-success)">Conectado</w-badge>
            <w-badge v-else color="var(--color-text-muted)">Sin conectar</w-badge>
          </div>
        </div>

        <div class="integration-body">
          <div v-if="supabaseStore.connection?.tokenInvalid" class="warning-banner">
            <span class="material-symbols-outlined">warning</span>
            Tu conexión a Supabase necesita renovarse. Verificá que las credenciales sigan siendo válidas.
          </div>

          <div v-if="supabaseStore.loading && !supabaseStore.connection" class="integration-loading">
            <span class="material-symbols-outlined loading-icon">progress_activity</span>
            <span>Cargando...</span>
          </div>

          <template v-else-if="supabaseStore.isConnected && supabaseStore.connection">
            <div class="connection-details">
              <div class="detail-row">
                <span class="detail-label">Access Token</span>
                <span class="detail-value mono">{{ supabaseStore.connection!.personalAccessToken }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Service Key</span>
                <span class="detail-value mono">{{ supabaseStore.connection!.serviceRoleKey }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Conectado</span>
                <span class="detail-value">{{ formatDate(supabaseStore.connection!.connectedAt!) }}</span>
              </div>
            </div>
            <div class="integration-actions">
              <router-link to="/app/supabase">
                <w-button variant="primary">
                  <span class="material-symbols-outlined mr-1">database</span>
                  Ver Supabase
                </w-button>
              </router-link>
              <w-button variant="ghost" @click="openSupabaseDrawer">
                <span class="material-symbols-outlined mr-1">edit</span>
                Actualizar credenciales
              </w-button>
              <w-button variant="ghost" :loading="supabaseStore.loading" @click="handleSupabaseDisconnect">
                <span class="material-symbols-outlined mr-1">link_off</span>
                Desconectar
              </w-button>
            </div>
          </template>

          <template v-else>
            <p class="not-connected-hint">
              Monitorea métricas en tiempo real de tus proyectos Supabase: CPU, RAM, conexiones Postgres, I/O y más.
              Necesitás dos credenciales: un <strong>Personal Access Token</strong> y la <strong>Service Role Key</strong> de cada proyecto.
            </p>
            <div class="integration-actions">
              <w-button variant="primary" @click="openSupabaseDrawer">
                <span class="material-symbols-outlined mr-1">add_link</span>
                Conectar Supabase
              </w-button>
            </div>
          </template>
        </div>
      </div>
    </main>

    <!-- Connect / Update Railway drawer -->
    <w-drawer v-model="drawerOpen" title="Conectar Railway" width="480px">
      <div class="drawer-body">

        <!-- Step-by-step guide -->
        <div class="setup-steps">
          <p class="setup-steps-title">Cómo conectar tu cuenta de Railway</p>

          <div class="setup-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <p class="step-title">Iniciá sesión en Railway</p>
              <p class="step-desc">Accedé a tu cuenta en Railway. Podés iniciar sesión con GitHub o email.</p>
              <a href="https://railway.app" target="_blank" class="step-link">
                <span class="material-symbols-outlined" style="font-size:14px">open_in_new</span>
                railway.app
              </a>
            </div>
          </div>

          <div class="setup-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <p class="step-title">Generá un API Token</p>
              <p class="step-desc">
                Hacé clic en tu <strong>avatar</strong> (arriba a la derecha) → <strong>Account Settings</strong> → <strong>Tokens</strong>.
                Hacé clic en <strong>"Create Token"</strong>, dale un nombre (ej: <code>Orkpad</code>) y copialo.
              </p>
              <div class="drawer-warning" style="margin-top:8px">
                <span class="material-symbols-outlined" style="font-size:14px;flex-shrink:0">warning</span>
                <span>No selecciones ningún <strong>workspace o team</strong> — dejá el scope en blanco para acceso completo.</span>
              </div>
              <a href="https://railway.app/account/tokens" target="_blank" class="step-link" style="margin-top:8px">
                <span class="material-symbols-outlined" style="font-size:14px">open_in_new</span>
                railway.app/account/tokens
              </a>
            </div>
          </div>

          <div class="setup-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <p class="step-title">Pegá el token y conectá</p>
              <p class="step-desc">
                El token comienza con <code>rly_</code>. Pegalo abajo y hacé clic en <strong>Conectar</strong>.
              </p>
            </div>
          </div>

          <div class="setup-step">
            <div class="step-number">4</div>
            <div class="step-content">
              <p class="step-title">Vinculá tus proyectos</p>
              <p class="step-desc">
                Andá al <strong>detalle de un proyecto</strong> → sección <strong>Railway</strong> → <strong>Vincular proyecto</strong>.
                Orkpad monitorea deployments cada 5 minutos.
              </p>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">API Token *</label>
          <input
            v-model="form.apiToken"
            type="password"
            class="form-input"
            placeholder="rly_xxxxxxxxxxxxxxxx"
            autocomplete="off"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Team ID <span class="optional-label">(opcional)</span></label>
          <input
            v-model="form.teamId"
            type="text"
            class="form-input"
            placeholder="team_xxxxxxxx"
          />
          <span class="form-hint">Solo necesario si querés usar un equipo específico de Railway en lugar de tu cuenta personal.</span>
        </div>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <w-button variant="ghost" @click="drawerOpen = false">Cancelar</w-button>
          <w-button
            variant="primary"
            :loading="railwayStore.connectLoading"
            :disabled="!form.apiToken.trim()"
            @click="handleConnect"
          >
            Conectar
          </w-button>
        </div>
      </template>
    </w-drawer>

    <!-- Connect / Update Netlify drawer -->
    <w-drawer v-model="netlifyDrawerOpen" title="Conectar Netlify" width="480px">
      <div class="drawer-body">

        <!-- Step-by-step guide -->
        <div class="setup-steps">
          <p class="setup-steps-title">Cómo conectar tu cuenta de Netlify</p>

          <div class="setup-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <p class="step-title">Iniciá sesión en Netlify</p>
              <p class="step-desc">
                Accedé a tu cuenta en Netlify. Podés iniciar sesión con GitHub, GitLab, Bitbucket o email.
              </p>
              <a href="https://app.netlify.com" target="_blank" class="step-link">
                <span class="material-symbols-outlined" style="font-size:14px">open_in_new</span>
                app.netlify.com
              </a>
            </div>
          </div>

          <div class="setup-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <p class="step-title">Generá un Personal Access Token</p>
              <p class="step-desc">
                Hacé clic en tu <strong>avatar</strong> (arriba a la derecha) → <strong>User settings</strong> → <strong>Applications</strong>.
                En la sección <strong>"Personal access tokens"</strong>, hacé clic en <strong>"New access token"</strong>,
                dale un nombre (ej: <code>Orkpad</code>) y copiá el token — solo se muestra una vez.
              </p>
              <a href="https://app.netlify.com/user/applications/personal" target="_blank" class="step-link">
                <span class="material-symbols-outlined" style="font-size:14px">open_in_new</span>
                app.netlify.com/user/applications/personal
              </a>
            </div>
          </div>

          <div class="setup-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <p class="step-title">Pegá el token y conectá</p>
              <p class="step-desc">
                El token comienza con <code>nfp_</code>. Pegalo en el campo de abajo y hacé clic en <strong>Conectar</strong>. Se verificará automáticamente.
              </p>
            </div>
          </div>

          <div class="setup-step">
            <div class="step-number">4</div>
            <div class="step-content">
              <p class="step-title">Vinculá tus proyectos con sites</p>
              <p class="step-desc">
                Una vez conectado, andá al <strong>detalle de un proyecto</strong> en Orkpad → sección <strong>Netlify</strong> → <strong>Vincular site</strong>.
                Orkpad monitorea los deploys automáticamente cada 5 minutos y te notifica si algo falla.
              </p>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Personal Access Token *</label>
          <input
            v-model="netlifyForm.apiToken"
            type="password"
            class="form-input"
            placeholder="nfp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            autocomplete="off"
          />
          <span class="form-hint">El token se almacena encriptado y nunca se expone completo en la interfaz.</span>
        </div>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <w-button variant="ghost" @click="netlifyDrawerOpen = false">Cancelar</w-button>
          <w-button
            variant="primary"
            :loading="netlifyStore.connectLoading"
            :disabled="!netlifyForm.apiToken.trim()"
            @click="handleNetlifyConnect"
          >
            Conectar
          </w-button>
        </div>
      </template>
    </w-drawer>

    <!-- Connect / Update Supabase drawer -->
    <w-drawer v-model="supabaseDrawerOpen" title="Conectar Supabase" width="480px">
      <div class="drawer-body">

        <!-- Step-by-step guide -->
        <div class="setup-steps">
          <p class="setup-steps-title">Cómo obtener tus credenciales</p>

          <div class="setup-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <p class="step-title">Obtené tu Personal Access Token</p>
              <p class="step-desc">
                Ingresá a tu cuenta de Supabase, hacé clic en tu avatar (arriba a la derecha) → <strong>Account</strong> → <strong>Access Tokens</strong>.
                Hacé clic en <strong>"Generate new token"</strong>, dale un nombre (ej: "Orkpad") y copialo.
              </p>
              <a href="https://supabase.com/dashboard/account/tokens" target="_blank" class="step-link">
                <span class="material-symbols-outlined" style="font-size:14px">open_in_new</span>
                supabase.com/dashboard/account/tokens
              </a>
            </div>
          </div>

          <div class="setup-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <p class="step-title">Obtené la Service Role Key de tu proyecto</p>
              <p class="step-desc">
                En el dashboard de Supabase, abrí tu proyecto → <strong>Project Settings</strong> → <strong>API</strong>.
                Copiá la clave que aparece en la sección <strong>"service_role"</strong> (secreta, empieza con <code>eyJ</code>).
              </p>
              <div class="step-warning">
                <span class="material-symbols-outlined" style="font-size:14px;flex-shrink:0">warning</span>
                <span>La Service Role Key bypasea Row Level Security. No la expongas en el frontend de tu app.</span>
              </div>
            </div>
          </div>

          <div class="setup-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <p class="step-title">Ingresá las credenciales abajo y conectá</p>
              <p class="step-desc">
                Una vez conectado, podés vincular cada proyecto de Supabase a un proyecto de Orkpad desde la pantalla de detalle del proyecto.
                El monitoreo de métricas se actualiza automáticamente cada 5 minutos.
              </p>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Personal Access Token *</label>
          <input
            v-model="supabaseForm.personalAccessToken"
            type="password"
            class="form-input"
            placeholder="sbp_xxxxxxxxxxxxxxxx"
            autocomplete="off"
          />
          <span class="form-hint">Token de cuenta personal desde Account → Access Tokens.</span>
        </div>

        <div class="form-group">
          <label class="form-label">Service Role Key *</label>
          <input
            v-model="supabaseForm.serviceRoleKey"
            type="password"
            class="form-input"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            autocomplete="off"
          />
          <span class="form-hint">Clave del proyecto desde Project Settings → API → service_role.</span>
        </div>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <w-button variant="ghost" @click="supabaseDrawerOpen = false">Cancelar</w-button>
          <w-button
            variant="primary"
            :loading="supabaseStore.connectLoading"
            :disabled="!supabaseForm.personalAccessToken.trim() || !supabaseForm.serviceRoleKey.trim()"
            @click="handleSupabaseConnect"
          >
            Conectar
          </w-button>
        </div>
      </template>
    </w-drawer>

    <!-- Railway disconnect confirmation -->
    <w-confirm-modal
      :is-open="confirmDisconnectOpen"
      title="Desconectar Railway"
      message="¿Estás seguro de que querés desconectar Railway? Los proyectos vinculados perderán el acceso a los datos de Railway."
      confirm-text="Desconectar"
      :is-danger="true"
      :loading="railwayStore.loading"
      @confirm="confirmDisconnect"
      @cancel="confirmDisconnectOpen = false"
    />

    <!-- Netlify disconnect confirmation -->
    <w-confirm-modal
      :is-open="confirmNetlifyDisconnectOpen"
      title="Desconectar Netlify"
      message="¿Estás seguro de que querés desconectar Netlify? Los proyectos vinculados perderán el acceso a los datos de deploys."
      confirm-text="Desconectar"
      :is-danger="true"
      :loading="netlifyStore.loading"
      @confirm="confirmNetlifyDisconnect"
      @cancel="confirmNetlifyDisconnectOpen = false"
    />

    <!-- Google disconnect confirmation -->
    <w-confirm-modal
      :is-open="confirmGoogleDisconnectOpen"
      title="Desconectar Google"
      message="¿Estás seguro de que querés desconectar tu cuenta de Google? No podrás enviar emails de campaña desde Gmail ni sincronizar Calendar."
      confirm-text="Desconectar"
      :is-danger="true"
      :loading="googleStore.loading"
      @confirm="confirmGoogleDisconnect"
      @cancel="confirmGoogleDisconnectOpen = false"
    />

    <!-- Supabase disconnect confirmation -->
    <w-confirm-modal
      :is-open="confirmSupabaseDisconnectOpen"
      title="Desconectar Supabase"
      message="¿Estás seguro de que querés desconectar Supabase? Los proyectos vinculados dejarán de recibir métricas."
      confirm-text="Desconectar"
      :is-danger="true"
      :loading="supabaseStore.loading"
      @confirm="confirmSupabaseDisconnect"
      @cancel="confirmSupabaseDisconnectOpen = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRailwayStore } from '@/stores/railway.store'
import { useGoogleStore } from '@/stores/google.store'
import { useNetlifyStore } from '@/stores/netlify.store'
import { useSupabaseStore } from '@/stores/supabase.store'
import WBadge from '@/components/ui/WBadge.vue'
import WButton from '@/components/ui/WButton.vue'
import WDrawer from '@/components/ui/WDrawer.vue'
import WConfirmModal from '@/components/ui/WConfirmModal.vue'

export default defineComponent({
  name: 'ConnectionsPage',
  components: { WBadge, WButton, WDrawer, WConfirmModal },
  setup() {
    const railwayStore = useRailwayStore()
    const googleStore = useGoogleStore()
    const netlifyStore = useNetlifyStore()
    const supabaseStore = useSupabaseStore()
    const drawerOpen = ref(false)
    const confirmDisconnectOpen = ref(false)
    const confirmGoogleDisconnectOpen = ref(false)
    const netlifyDrawerOpen = ref(false)
    const confirmNetlifyDisconnectOpen = ref(false)
    const supabaseDrawerOpen = ref(false)
    const confirmSupabaseDisconnectOpen = ref(false)
    const form = ref({ apiToken: '', teamId: '' })
    const netlifyForm = ref({ apiToken: '' })
    const supabaseForm = ref({ personalAccessToken: '', serviceRoleKey: '' })

    return {
      railwayStore, googleStore, netlifyStore, supabaseStore,
      drawerOpen, confirmDisconnectOpen, confirmGoogleDisconnectOpen,
      netlifyDrawerOpen, confirmNetlifyDisconnectOpen,
      supabaseDrawerOpen, confirmSupabaseDisconnectOpen,
      form, netlifyForm, supabaseForm,
    }
  },
  methods: {
    formatDate(iso: string) {
      return new Date(iso).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    openConnectDrawer() {
      this.form = { apiToken: '', teamId: '' }
      this.drawerOpen = true
    },
    async handleConnect() {
      try {
        await this.railwayStore.connect({
          apiToken: this.form.apiToken.trim(),
          teamId: this.form.teamId.trim() || undefined,
        })
        this.drawerOpen = false
      } catch {
        // toast shown in store
      }
    },
    handleDisconnect() {
      this.confirmDisconnectOpen = true
    },
    async confirmDisconnect() {
      try {
        await this.railwayStore.disconnect()
      } finally {
        this.confirmDisconnectOpen = false
      }
    },
    async confirmGoogleDisconnect() {
      try {
        await this.googleStore.disconnect()
      } finally {
        this.confirmGoogleDisconnectOpen = false
      }
    },
    openSupabaseDrawer() {
      this.supabaseForm = { personalAccessToken: '', serviceRoleKey: '' }
      this.supabaseDrawerOpen = true
    },
    async handleSupabaseConnect() {
      try {
        await this.supabaseStore.connect({
          personalAccessToken: this.supabaseForm.personalAccessToken.trim(),
          serviceRoleKey: this.supabaseForm.serviceRoleKey.trim(),
        })
        this.supabaseDrawerOpen = false
      } catch {
        // toast shown in store
      }
    },
    handleSupabaseDisconnect() {
      this.confirmSupabaseDisconnectOpen = true
    },
    async confirmSupabaseDisconnect() {
      try {
        await this.supabaseStore.disconnect()
      } finally {
        this.confirmSupabaseDisconnectOpen = false
      }
    },
    openNetlifyDrawer() {
      this.netlifyForm = { apiToken: '' }
      this.netlifyDrawerOpen = true
    },
    async handleNetlifyConnect() {
      try {
        await this.netlifyStore.connect({ apiToken: this.netlifyForm.apiToken.trim() })
        this.netlifyDrawerOpen = false
      } catch {
        // toast shown in store
      }
    },
    handleNetlifyDisconnect() {
      this.confirmNetlifyDisconnectOpen = true
    },
    async confirmNetlifyDisconnect() {
      try {
        await this.netlifyStore.disconnect()
      } finally {
        this.confirmNetlifyDisconnectOpen = false
      }
    },
  },
  mounted() {
    this.railwayStore.fetchConnection()
    this.googleStore.fetchStatus()
    this.netlifyStore.fetchConnection()
    this.supabaseStore.fetchConnection()
  },
})
</script>

<style scoped>
.connections-page {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.page-title {
  font-family: var(--font-body);
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-base);
}

.page-subtitle {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 4px;
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
}

.integration-card {
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
}

.integration-card--readonly {
  opacity: 0.7;
}

.integration-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.integration-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.railway-icon {
  background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
}

.railway-icon .material-symbols-outlined {
  font-size: 22px;
}

.netlify-icon {
  background-color: color-mix(in srgb, #00c7b7 12%, transparent);
  color: #00c7b7;
}

.netlify-icon .material-symbols-outlined {
  font-size: 22px;
}

.github-icon {
  background-color: var(--color-bg-surface-high);
  color: var(--color-text-muted);
}

.github-icon .material-symbols-outlined {
  font-size: 22px;
}

.google-icon {
  background-color: color-mix(in srgb, #ea4335 12%, transparent);
  color: #ea4335;
}

.google-icon .material-symbols-outlined {
  font-size: 22px;
}

.integration-info {
  flex: 1;
  min-width: 0;
}

.integration-name {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-base);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.integration-description {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 4px;
  line-height: 1.5;
}

.integration-status {
  flex-shrink: 0;
  padding-top: 2px;
}

.integration-body {
  padding: 20px 24px;
}

.integration-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.loading-icon {
  animation: spin 1s linear infinite;
  font-size: 16px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.connection-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background-color: var(--color-bg-surface-high);
  border: 1px solid var(--color-border);
}

.detail-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.detail-label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  min-width: 80px;
  flex-shrink: 0;
}

.detail-value {
  font-size: 13px;
  color: var(--color-text-base);
}

.detail-value.mono {
  font-family: var(--font-mono);
  font-size: 12px;
}

.not-connected-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 16px;
  line-height: 1.5;
}

.external-link {
  color: var(--color-primary);
  text-decoration: none;
}

.external-link:hover {
  text-decoration: underline;
}

.integration-actions {
  display: flex;
  gap: 8px;
}

/* Drawer */
.drawer-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.drawer-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.optional-label {
  color: var(--color-text-disabled);
  text-transform: none;
  letter-spacing: 0;
  font-size: 10px;
}

.form-input {
  background-color: var(--color-bg-surface-high);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 10px 12px;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--color-primary);
}

.form-hint {
  font-size: 11px;
  color: var(--color-text-muted);
}

.drawer-warning {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: color-mix(in srgb, var(--color-warning) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-warning) 30%, transparent);
  padding: 10px 12px;
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.drawer-warning .material-symbols-outlined {
  color: var(--color-warning);
  margin-top: 1px;
}

.drawer-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 16px 24px;
}

.mr-1 {
  margin-right: 4px;
}

.warning-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
  background: rgba(239, 68, 68, 0.08);
  color: var(--color-error);
  font-size: 13px;
  border: 1px solid var(--color-error);
}

.supabase-icon {
  background-color: color-mix(in srgb, #3ecf8e 12%, transparent);
  color: #3ecf8e;
}

.supabase-icon .material-symbols-outlined {
  font-size: 22px;
}

/* Setup step-by-step */
.setup-steps {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-surface-high);
  padding: 16px;
}

.setup-steps-title {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 14px;
}

.setup-step {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.setup-step:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.step-number {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: color-mix(in srgb, #3ecf8e 15%, transparent);
  color: #3ecf8e;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.step-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-base);
  line-height: 1.4;
}

.step-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.55;
}

.step-desc code {
  font-family: var(--font-mono);
  font-size: 11px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 1px 4px;
  color: var(--color-primary);
}

.step-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-primary);
  text-decoration: none;
  margin-top: 4px;
}

.step-link:hover {
  text-decoration: underline;
}

.step-warning {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: color-mix(in srgb, var(--color-warning) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-warning) 25%, transparent);
  padding: 8px 10px;
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-top: 6px;
}

.step-warning .material-symbols-outlined {
  color: var(--color-warning);
  margin-top: 1px;
}
</style>
