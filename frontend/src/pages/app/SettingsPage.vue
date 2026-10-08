<template>
  <div class="settings-page">
    <header class="page-header">
      <h1 class="page-title">{{ $t('settings.title') }}</h1>
    </header>

    <main class="settings-layout">

      <!-- Profile -->
      <w-card>
        <div class="settings-section">
          <h3 class="section-title">{{ $t('settings.profile') }}</h3>
          <div class="form-grid">
            <w-input :label="$t('settings.fields.name')" v-model="form.name" />
            <w-input :label="$t('settings.fields.phone')" v-model="form.phone" />
            <w-input :label="$t('settings.fields.email')" :model-value="user?.email ?? ''" disabled />
          </div>
          <w-button variant="primary" class="mt-4" :loading="profileLoading" @click="saveProfile">
            {{ $t('settings.saveChanges') }}
          </w-button>
        </div>
      </w-card>

      <!-- Apariencia / Marca blanca -->
      <w-card>
        <div class="settings-section">
          <h3 class="section-title">{{ $t('settings.branding.title') }}</h3>
          <p class="setting-description">{{ $t('settings.branding.description') }}</p>
          <div class="form-grid">
            <w-input :label="$t('settings.branding.agencyName')" v-model="brandForm.displayName" :placeholder="$t('settings.branding.agencyPlaceholder')" />
            <div>
              <label class="w-input-label">{{ $t('settings.branding.color') }}</label>
              <input v-model="brandForm.primaryColor" type="color" class="brand-color-input" />
            </div>
          </div>
          <div class="form-grid">
            <div>
              <label class="w-input-label">{{ $t('settings.branding.logo') }}</label>
              <div class="brand-logo-row">
                <img v-if="brandLogoPreview" :src="brandLogoPreview" alt="logo" class="brand-logo-preview" />
                <button v-if="!brandLogoPreview" class="btn-secondary" :disabled="brandLoading" @click="triggerLogoPicker">
                  {{ $t('settings.branding.upload') }}
                </button>
                <button v-else class="btn-secondary" :disabled="brandLoading" @click="removeBrandLogo">
                  {{ $t('settings.branding.remove') }}
                </button>
                <input ref="logoPicker" type="file" accept="image/png,image/jpeg" hidden @change="onLogoPicked" />
              </div>
            </div>
            <div>
              <label class="w-input-label">{{ $t('settings.branding.theme') }}</label>
              <select v-model="brandForm.defaultTheme" class="brand-select">
                <option :value="null">—</option>
                <option value="dark">{{ $t('settings.branding.themeDark') }}</option>
                <option value="light">{{ $t('settings.branding.themeLight') }}</option>
              </select>
            </div>
          </div>
          <w-button variant="primary" class="mt-4" :loading="brandLoading" @click="saveBranding">
            {{ $t('settings.saveChanges') }}
          </w-button>
          <p class="setting-description" style="margin-top:16px">{{ $t('settings.branding.agencySection') }}</p>
          <div class="form-grid">
            <w-input :label="$t('settings.branding.agencyEmail')" v-model="brandForm.agencyEmail" :placeholder="$t('settings.branding.agencyPlaceholder.email')" />
            <w-input :label="$t('settings.branding.agencyPhone')" v-model="brandForm.agencyPhone" :placeholder="$t('settings.branding.agencyPlaceholder.phone')" />
          </div>
          <div class="form-grid">
            <w-input :label="$t('settings.branding.agencyAddress')" v-model="brandForm.agencyAddress" :placeholder="$t('settings.branding.agencyPlaceholder.address')" />
            <w-input :label="$t('settings.branding.agencyWebsite')" v-model="brandForm.agencyWebsite" :placeholder="$t('settings.branding.agencyPlaceholder.website')" />
          </div>
          <div class="form-grid">
            <w-input :label="$t('settings.branding.taxId')" v-model="brandForm.taxId" :placeholder="$t('settings.branding.agencyPlaceholder.taxId')" />
          </div>
        </div>
      </w-card>

      <!-- Security / 2FA -->
      <w-card>
        <div class="settings-section">
          <h3 class="section-title">{{ $t('settings.security') }}</h3>
          <div class="setting-row">
            <div class="setting-info">
              <p class="setting-label">{{ $t('settings.twoFactor.label') }}</p>
              <p class="setting-description">{{ $t('settings.twoFactor.description') }}</p>
            </div>
            <div class="setting-actions">
              <w-badge :color="user?.twoFactorEnabled ? 'var(--color-success)' : 'var(--color-text-muted)'">
                {{ user?.twoFactorEnabled ? $t('settings.twoFactor.active') : $t('settings.twoFactor.inactive') }}
              </w-badge>
              <w-button v-if="!user?.twoFactorEnabled" variant="secondary" @click="initSetup2FA">
                {{ $t('settings.twoFactor.setup') }}
              </w-button>
              <w-button v-else variant="ghost" :loading="twoFALoading" @click="handleDisable2FA">
                {{ $t('settings.twoFactor.disable') }}
              </w-button>
            </div>
          </div>
        </div>
      </w-card>

      <!-- Biometric / WebAuthn -->
      <w-card v-if="webauthnSupported">
        <div class="settings-section">
          <h3 class="section-title">ACCESO BIOMÉTRICO</h3>

          <div v-if="webauthnCredentials.length === 0" class="setting-row">
            <div class="setting-info">
              <p class="setting-label">Sin dispositivos registrados</p>
              <p class="setting-description">Registrá tu huella digital o Face ID para iniciar sesión más rápido.</p>
            </div>
          </div>

          <template v-for="(cred, idx) in webauthnCredentials" :key="cred.credentialId">
            <div class="setting-row">
              <div class="setting-info">
                <p class="setting-label">{{ cred.deviceName }}</p>
                <p class="setting-description">Registrado el {{ formatDate(cred.registeredAt) }}</p>
              </div>
              <w-button variant="ghost" :loading="webauthnLoading" @click="handleRemoveCredential(cred.credentialId)">
                Eliminar
              </w-button>
            </div>
            <div v-if="idx < webauthnCredentials.length - 1" class="setting-divider"></div>
          </template>

          <div v-if="webauthnCredentials.length > 0" class="setting-divider"></div>

          <div class="setting-row">
            <div class="setting-info">
              <p class="setting-label">Agregar dispositivo biométrico</p>
              <p class="setting-description">Iniciá sesión con tu huella digital o Face ID en este dispositivo.</p>
            </div>
            <w-button variant="secondary" :loading="webauthnLoading" @click="handleRegisterBiometric">
              Registrar
            </w-button>
          </div>
        </div>
      </w-card>

      <!-- Notifications -->
      <w-card>
        <div class="settings-section">
          <h3 class="section-title">Notificaciones</h3>

          <div class="setting-row">
            <div class="setting-info">
              <p class="setting-label">Notificaciones push</p>
              <p class="setting-description">Recibí alertas en tu dispositivo incluso con la app cerrada.</p>
              <p v-if="pushPermission === 'denied'" class="setting-description warning-text">
                Permisos bloqueados. Habilitá las notificaciones desde la configuración del navegador.
              </p>
            </div>
            <div class="setting-actions">
              <w-badge v-if="pushSubscribed" color="var(--color-success)">Activas</w-badge>
              <w-button
                v-if="!pushSubscribed && pushPermission !== 'denied'"
                variant="secondary"
                :loading="pushLoading"
                :disabled="!pushSupported"
                @click="handleEnablePush"
              >Activar</w-button>
              <w-button
                v-if="pushSubscribed"
                variant="ghost"
                :loading="pushLoading"
                @click="handleDisablePush"
              >Desactivar</w-button>
            </div>
          </div>

          <div class="setting-divider"></div>
        </div>
      </w-card>

      <!-- My Data -->
      <w-card>
        <div class="settings-section">
          <h3 class="section-title">{{ $t('settings.paymentMethods.title') }}</h3>
          <p class="setting-description">{{ $t('settings.paymentMethods.description') }}</p>

          <div v-if="paymentMethodsStore.loading" class="loading-state">
            <span class="material-symbols-outlined spinning">sync</span>
            Cargando...
          </div>

          <ul v-else class="pm-list">
            <li
              v-for="m in paymentMethodsStore.items"
              :key="m._id"
              class="pm-row"
              :class="{ 'pm-row--inactive': !m.active }"
            >
              <template v-if="editingMethodId === m._id">
                <input
                  v-model="editingMethodName"
                  type="text"
                  class="pm-input"
                  @keyup.enter="saveRename(m)"
                />
                <div class="pm-row-actions">
                  <button class="action-btn" :title="$t('common.save')" @click="saveRename(m)">
                    <span class="material-symbols-outlined">check</span>
                  </button>
                  <button class="action-btn" :title="$t('common.cancel')" @click="cancelRename">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
              </template>
              <template v-else>
                <span class="pm-name">{{ m.name }}</span>
                <w-badge v-if="!m.active" color="var(--color-text-muted)">
                  {{ $t('settings.paymentMethods.inactive') }}
                </w-badge>
                <div class="pm-row-actions">
                  <button class="action-btn" :title="$t('common.edit')" @click="startRename(m)">
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                  <button
                    class="action-btn"
                    :title="m.active ? $t('settings.paymentMethods.disable') : $t('settings.paymentMethods.enable')"
                    @click="toggleMethod(m)"
                  >
                    <span class="material-symbols-outlined">{{ m.active ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                  <button class="action-btn action-btn--danger" :title="$t('common.delete')" @click="deleteMethod(m)">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </template>
            </li>
          </ul>

          <div class="pm-add">
            <w-input :label="$t('settings.paymentMethods.newPlaceholder')" v-model="newMethodName" @keyup.enter="addPaymentMethod" />
            <w-button variant="primary" :loading="pmLoading" :disabled="!newMethodName.trim()" @click="addPaymentMethod">
              {{ $t('settings.paymentMethods.add') }}
            </w-button>
          </div>
        </div>
      </w-card>

      <!-- My Data -->
      <w-card>
        <div class="settings-section">
          <h3 class="section-title">{{ $t('settings.myData') }}</h3>
          <div class="setting-row">
            <div class="setting-info">
              <p class="setting-label">{{ $t('settings.export.label') }}</p>
              <p class="setting-description">{{ $t('settings.export.description') }}</p>
            </div>
            <w-button variant="secondary" :loading="exportLoading" @click="handleExport">
              {{ $t('settings.export.btn') }}
            </w-button>
          </div>
        </div>
      </w-card>

      <!-- Danger Zone -->
      <w-card class="danger-card">
        <div class="settings-section">
          <h3 class="section-title danger-title">{{ $t('settings.dangerZone') }}</h3>
          <div class="setting-row">
            <div class="setting-info">
              <p class="setting-label">{{ $t('settings.deleteAccount.label') }}</p>
              <p class="setting-description">{{ $t('settings.deleteAccount.description') }}</p>
            </div>
            <w-button variant="ghost" class="danger-btn" @click="showDeleteDrawer = true">
              {{ $t('settings.deleteAccount.btn') }}
            </w-button>
          </div>
        </div>
      </w-card>
    </main>

    <!-- Register Biometric Drawer -->
    <w-drawer v-model="showBiometricDrawer" title="Registrar dispositivo biométrico" width="400px">
      <div class="drawer-body">
        <p class="setup-step">Ingresá un nombre para identificar este dispositivo.</p>
        <w-input
          label="Nombre del dispositivo"
          v-model="biometricDeviceName"
          placeholder="Ej: iPhone de trabajo"
        />
        <p v-if="webauthnError" class="error-msg">{{ webauthnError }}</p>
        <div class="drawer-actions">
          <w-button variant="primary" :loading="webauthnLoading" @click="confirmRegisterBiometric">
            Registrar con biometría
          </w-button>
        </div>
      </div>
    </w-drawer>

    <!-- 2FA Setup Drawer -->
    <w-drawer v-model="show2FADrawer" :title="$t('settings.twoFactor.setupTitle')" width="480px">
      <div class="drawer-body">
        <p class="setup-step">{{ $t('settings.twoFactor.step1') }}</p>
        <div class="qr-container">
          <img v-if="qrCode" :src="qrCode" alt="QR 2FA" class="qr-code" />
          <div v-else class="qr-placeholder">
            <span class="material-symbols-outlined rotating">sync</span>
          </div>
        </div>
        <p class="setup-step">{{ $t('settings.twoFactor.step2') }}</p>
        <w-input
          :label="$t('settings.twoFactor.codeLabel')"
          v-model="totpToken"
          placeholder="000000"
          maxlength="6"
        />
        <p v-if="twoFAError" class="error-msg">{{ twoFAError }}</p>
        <div class="drawer-actions">
          <w-button variant="primary" :loading="twoFALoading" :disabled="totpToken.length !== 6" @click="handleVerify2FA">
            {{ $t('settings.twoFactor.verifyBtn') }}
          </w-button>
        </div>
      </div>
    </w-drawer>

    <!-- Delete Account Drawer -->
    <w-drawer v-model="showDeleteDrawer" :title="$t('settings.deleteAccount.drawerTitle')" width="480px">
      <div class="drawer-body">
        <p class="delete-warning">{{ $t('settings.deleteAccount.warning') }}</p>
        <w-input
          :label="$t('settings.deleteAccount.confirmLabel')"
          v-model="deleteConfirmText"
          :placeholder="$t('settings.deleteAccount.confirmPlaceholder')"
        />
        <div class="drawer-actions">
          <w-button
            variant="ghost"
            class="danger-btn"
            :loading="deleteLoading"
            :disabled="deleteConfirmText !== $t('settings.deleteAccount.confirmWord')"
            @click="handleDeleteAccount"
          >
            {{ $t('settings.deleteAccount.confirmBtn') }}
          </w-button>
        </div>
      </div>
    </w-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/api/auth/auth.api'
import { showToast } from '@/composables/useToast'
import { usePushNotifications } from '@/composables/usePushNotifications'
import { usePaymentMethodsStore } from '@/stores/payment-methods.store'
import { useBrandingStore } from '@/stores/branding.store'
import { filesApi } from '@/api/files/files.api'
import { useWebAuthn } from '@/composables/useWebAuthn'
import type { WebAuthnCredentialInfo } from '@/api/auth/auth.types'
import WButton from '@/components/ui/WButton.vue'
import WCard from '@/components/ui/WCard.vue'
import WInput from '@/components/ui/WInput.vue'
import WBadge from '@/components/ui/WBadge.vue'
import WDrawer from '@/components/ui/WDrawer.vue'

export default defineComponent({
  name: 'SettingsPage',
  components: { WButton, WCard, WInput, WBadge, WDrawer },
  setup() {
    const { isSupported, isSubscribed, loading, permissionState, checkStatus, subscribe, unsubscribe } =
      usePushNotifications()
    const {
      isSupported: webauthnSupported,
      isPlatformAvailable: webauthnPlatformAvailable,
      isLoading: webauthnLoading,
      error: webauthnError,
      checkPlatformAvailability,
      registerCredential,
      getCredentials,
      removeCredential,
    } = useWebAuthn()
    return {
      paymentMethodsStore: usePaymentMethodsStore(),
      pushSupported: isSupported,
      pushSubscribed: isSubscribed,
      pushLoading: loading,
      pushPermission: permissionState,
      checkPushStatus: checkStatus,
      pushSubscribe: subscribe,
      pushUnsubscribe: unsubscribe,
      webauthnSupported,
      webauthnPlatformAvailable,
      webauthnLoading,
      webauthnError,
      checkWebAuthnPlatform: checkPlatformAvailability,
      registerCredential,
      getWebAuthnCredentials: getCredentials,
      removeWebAuthnCredential: removeCredential,
    }
  },
  data() {
    return {
      form: { name: '', phone: '' },
      profileLoading: false,
      brandForm: { displayName: '', primaryColor: '#5B4EFF', defaultTheme: null as 'dark' | 'light' | null, agencyEmail: '', agencyPhone: '', agencyAddress: '', agencyWebsite: '', taxId: '' },
      brandLogoFileId: null as string | null,
      brandLogoPreview: null as string | null,
      brandLoading: false,
      passwordForm: { current: '', next: '' },
      passwordLoading: false,
      passwordError: '',
      show2FADrawer: false,
      qrCode: '',
      totpToken: '',
      twoFALoading: false,
      twoFAError: '',
      exportLoading: false,
      showDeleteDrawer: false,
      deleteConfirmText: '',
      deleteLoading: false,
      webauthnCredentials: [] as WebAuthnCredentialInfo[],
      showBiometricDrawer: false,
      biometricDeviceName: '',
      newMethodName: '',
      editingMethodId: null as string | null,
      editingMethodName: '',
      pmLoading: false,
    }
  },
  computed: {
    ...mapState(useAuthStore, ['user']),
  },
  watch: {
    user: {
      immediate: true,
      handler(u) {
        if (u) {
          this.form.name = u.name ?? ''
          this.form.phone = u.phone ?? ''
        }
      },
    },
  },
  async mounted() {
    await this.checkPushStatus()
    await this.checkWebAuthnPlatform()
    if (this.webauthnPlatformAvailable) {
      await this.loadWebAuthnCredentials()
    }
    await this.paymentMethodsStore.fetchAll()
    await this.loadBranding()
  },
  methods: {
    ...mapActions(useAuthStore, ['fetchMe', 'logout']),

    async handleEnablePush() {
      await this.pushSubscribe()
    },

    async handleDisablePush() {
      await this.pushUnsubscribe()
    },

    async handleChangePassword() {
      this.passwordError = ''
      this.passwordLoading = true
      try {
        await authApi.changePassword({
          currentPassword: this.passwordForm.current,
          newPassword: this.passwordForm.next,
        })
        this.passwordForm = { current: '', next: '' }
        showToast(this.$t('settings.changePassword.success'), 'success')
      } catch (err: any) {
        this.passwordError = err.response?.data?.message ?? 'No se pudo cambiar la contraseña.'
      } finally {
        this.passwordLoading = false
      }
    },

    async loadBranding() {
      const store = useBrandingStore()
      if (!store.workspace) await store.fetch()
      const ws = store.workspace
      if (!ws) return
      this.brandForm.displayName = ws.displayName ?? ''
      this.brandForm.primaryColor = ws.primaryColor ?? '#5B4EFF'
      this.brandForm.defaultTheme = ws.defaultTheme ?? null
      this.brandForm.agencyEmail = (ws as any).agencyEmail ?? ''
      this.brandForm.agencyPhone = (ws as any).agencyPhone ?? ''
      this.brandForm.agencyAddress = (ws as any).agencyAddress ?? ''
      this.brandForm.agencyWebsite = (ws as any).agencyWebsite ?? ''
      this.brandForm.taxId = (ws as any).taxId ?? ''
      this.brandLogoFileId = ws.logoFileId ?? null
      this.brandLogoPreview = store.logoUrl
    },

    triggerLogoPicker() {
      ;(this.$refs.logoPicker as HTMLInputElement | undefined)?.click()
    },

    async onLogoPicked(e: Event) {
      const input = e.target as HTMLInputElement
      const file = input.files?.[0]
      input.value = ''
      if (!file) return
      this.brandLoading = true
      try {
        const { data } = await filesApi.upload(file)
        if (this.brandLogoFileId && this.brandLogoFileId !== data.id) {
          await filesApi.remove(this.brandLogoFileId).catch(() => {})
        }
        this.brandLogoFileId = data.id
        this.brandLogoPreview = `${this.filesBaseUrl()}/files/${data.id}`
      } catch {
        showToast(this.$t('settings.branding.saveError'), 'error')
      } finally {
        this.brandLoading = false
      }
    },

    filesBaseUrl() {
      return (import.meta.env.VITE_API_URL as string | undefined) || ''
    },

    async removeBrandLogo() {
      if (this.brandLogoFileId) {
        await filesApi.remove(this.brandLogoFileId).catch(() => {})
      }
      this.brandLogoFileId = null
      this.brandLogoPreview = null
    },

    async saveBranding() {
      this.brandLoading = true
      try {
        await useBrandingStore().save({
          displayName: this.brandForm.displayName?.trim() || null,
          logoFileId: this.brandLogoFileId,
          primaryColor: this.brandForm.primaryColor || null,
          defaultTheme: this.brandForm.defaultTheme,
          agencyEmail: this.brandForm.agencyEmail?.trim() || null,
          agencyPhone: this.brandForm.agencyPhone?.trim() || null,
          agencyAddress: this.brandForm.agencyAddress?.trim() || null,
          agencyWebsite: this.brandForm.agencyWebsite?.trim() || null,
          taxId: this.brandForm.taxId?.trim() || null,
        } as any)
        showToast(this.$t('settings.branding.saved'), 'success')
      } catch {
        showToast(this.$t('settings.branding.saveError'), 'error')
      } finally {
        this.brandLoading = false
      }
    },

    async saveProfile() {
      this.profileLoading = true
      try {
        await authApi.updateProfile(this.form)
        await this.fetchMe()
        showToast('Perfil actualizado correctamente.', 'success')
      } catch {
        showToast('No se pudo actualizar el perfil.', 'error')
      } finally {
        this.profileLoading = false
      }
    },

    async initSetup2FA() {
      this.qrCode = ''
      this.totpToken = ''
      this.twoFAError = ''
      this.show2FADrawer = true
      try {
        const { data } = await authApi.setup2FA()
        this.qrCode = data.qrCodeDataUrl
      } catch {
        showToast('No se pudo iniciar la configuración del 2FA.', 'error')
        this.show2FADrawer = false
      }
    },

    async handleVerify2FA() {
      this.twoFALoading = true
      this.twoFAError = ''
      try {
        await authApi.verify2FA(this.totpToken)
        await this.fetchMe()
        this.show2FADrawer = false
        showToast('2FA habilitado correctamente.', 'success')
      } catch (err: any) {
        this.twoFAError = err.response?.data?.message ?? 'Código incorrecto.'
      } finally {
        this.twoFALoading = false
      }
    },

    async handleDisable2FA() {
      if (!confirm(this.$t('settings.twoFactor.disableConfirm'))) return
      this.twoFALoading = true
      try {
        await authApi.disable2FA()
        await this.fetchMe()
        showToast('2FA deshabilitado.', 'success')
      } catch {
        showToast('No se pudo deshabilitar el 2FA.', 'error')
      } finally {
        this.twoFALoading = false
      }
    },

    async handleExport() {
      this.exportLoading = true
      try {
        const { data } = await authApi.exportData()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `orkpad-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      } catch {
        showToast('No se pudo exportar los datos.', 'error')
      } finally {
        this.exportLoading = false
      }
    },

    async addPaymentMethod() {
      const name = this.newMethodName.trim()
      if (!name || this.pmLoading) return
      this.pmLoading = true
      try {
        await this.paymentMethodsStore.create(name)
        this.newMethodName = ''
      } catch {
        showToast('No se pudo crear el método de pago.', 'error')
      } finally {
        this.pmLoading = false
      }
    },

    startRename(item: { _id: string; name: string }) {
      this.editingMethodId = item._id
      this.editingMethodName = item.name
    },

    cancelRename() {
      this.editingMethodId = null
      this.editingMethodName = ''
    },

    async saveRename(item: { _id: string }) {
      try {
        await this.paymentMethodsStore.rename(item as any, this.editingMethodName)
        this.cancelRename()
      } catch {
        showToast('No se pudo renombrar.', 'error')
      }
    },

    async toggleMethod(item: any) {
      try {
        await this.paymentMethodsStore.toggleActive(item)
      } catch {
        showToast('No se pudo actualizar.', 'error')
      }
    },

    async deleteMethod(item: { _id: string; name: string }) {
      if (!confirm(`¿Eliminar "${item.name}"? Las facturas existentes conservan el nombre como texto.`)) return
      try {
        await this.paymentMethodsStore.remove(item._id)
      } catch {
        showToast('No se pudo eliminar.', 'error')
      }
    },

    async handleDeleteAccount() {
      this.deleteLoading = true
      try {
        await authApi.deleteAccount()
        await this.logout()
        this.$router.push('/')
      } catch {
        showToast('No se pudo eliminar la cuenta.', 'error')
      } finally {
        this.deleteLoading = false
      }
    },

    async loadWebAuthnCredentials() {
      this.webauthnCredentials = await this.getWebAuthnCredentials()
    },

    handleRegisterBiometric() {
      this.biometricDeviceName = ''
      this.showBiometricDrawer = true
    },

    async confirmRegisterBiometric() {
      const success = await this.registerCredential(this.biometricDeviceName || undefined)
      if (success) {
        this.showBiometricDrawer = false
        await this.loadWebAuthnCredentials()
        showToast('Dispositivo biométrico registrado.', 'success')
      }
    },

    async handleRemoveCredential(credentialId: string) {
      if (!confirm('¿Eliminar esta credencial biométrica?')) return
      const success = await this.removeWebAuthnCredential(credentialId)
      if (success) {
        await this.loadWebAuthnCredentials()
        showToast('Credencial eliminada.', 'success')
      }
    },

    formatDate(dateStr: string): string {
      const d = new Date(dateStr)
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },
  },
})
</script>

<style scoped>
.settings-page {
  padding: 32px;
  flex-grow: 1;
  max-width: 760px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .settings-page { padding: 16px; }
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-family: var(--font-body);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-base);
}

.settings-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-section {
  padding: 8px 0;
}

.section-title {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-primary);
  margin-bottom: 20px;
}

.danger-title {
  color: var(--color-error);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
}

.mt-4 { margin-top: 16px; }

.totp-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 14px;
  background-color: rgba(91, 78, 255, 0.06);
  border: 1px solid rgba(91, 78, 255, 0.2);
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.totp-hint .material-symbols-outlined {
  font-size: 16px;
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 1px;
}

.error-msg {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-error);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

@media (max-width: 600px) {
  .setting-row { flex-direction: column; align-items: flex-start; }
}

.setting-info { flex: 1; }

.setting-label {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-base);
  margin-bottom: 4px;
}

.setting-description {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.setting-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.danger-card {
  border-color: rgba(239, 68, 68, 0.3) !important;
}

.danger-btn {
  color: var(--color-error) !important;
  border-color: var(--color-error) !important;
}

.danger-btn:hover {
  background-color: rgba(239, 68, 68, 0.06) !important;
}

/* Drawer content */
.drawer-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 0;
}

.setup-step {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.qr-container {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.qr-code {
  width: 200px;
  height: 200px;
  border: 1px solid var(--color-border);
}

.qr-placeholder {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.error-msg {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-error);
}

.delete-warning {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
  padding: 12px 16px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  background-color: rgba(239, 68, 68, 0.04);
}

.drawer-actions {
  margin-top: 4px;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.rotating {
  display: inline-block;
  animation: rotate 1s linear infinite;
}

.setting-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 20px 0;
}

.warning-text {
  color: var(--color-warning) !important;
  margin-top: 4px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--color-border);
  border-radius: 24px;
  transition: background-color 0.2s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--color-primary);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.toggle-switch input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.pm-list {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pm-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
}

.pm-row--inactive {
  opacity: 0.55;
}

.pm-name {
  flex: 1;
  font-size: 14px;
  color: var(--color-text-base);
}

.pm-input {
  flex: 1;
  background: var(--color-bg-surface-high);
  border: 1px solid var(--color-primary);
  color: var(--color-text-base);
  font-size: 14px;
  padding: 6px 10px;
  outline: none;
  min-width: 0;
}

.pm-row-actions {
  display: flex;
  gap: 2px;
  margin-left: auto;
}

.pm-add {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.pm-add > *:first-child {
  flex: 1;
}

.action-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: inline-flex;
  padding: 4px;
}

.action-btn:hover {
  color: var(--color-text-base);
}

.action-btn--danger:hover {
  color: var(--color-error);
}

.action-btn .material-symbols-outlined {
  font-size: 18px;
}

.w-input-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.brand-color-input {
  width: 100%;
  height: 40px;
  padding: 2px 4px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  cursor: pointer;
  box-sizing: border-box;
}

.brand-select {
  width: 100%;
  height: 40px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-size: 14px;
  padding: 0 12px;
  box-sizing: border-box;
}

.brand-logo-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo-preview {
  max-height: 48px;
  max-width: 180px;
  object-fit: contain;
  border: 1px solid var(--color-border);
  padding: 4px;
  background: var(--color-bg-surface);
}

.brand-textarea {
  width: 100%;
  min-height: 70px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-size: 13px;
  padding: 8px 12px;
  box-sizing: border-box;
  resize: vertical;
}

.ai-index-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 12px 0;
}

.ai-check {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.ai-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.ai-test-result {
  font-size: 12px;
  color: var(--color-text-muted);
}

.ai-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-top: 4px;
}

.ai-progress-track {
  flex: 1;
  height: 8px;
  background: var(--color-bg-surface-high);
  border: 1px solid var(--color-border);
}

.ai-progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.4s;
}

.ai-progress-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border);
  color: var(--color-text-base);
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--color-border-focus);
  background: var(--color-bg-surface-high);
}

.btn-secondary:disabled {
  opacity: 0.55;
  cursor: default;
}
</style>
