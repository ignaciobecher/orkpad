<template>
  <div class="docs-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Archivos</h1>
      </div>
      <div class="header-right">
        <input ref="fileInput" type="file" class="hidden-file-input" accept=".md,.doc,.docx,.xls,.xlsx,.pdf,.png,.jpg,.jpeg,.gif,.webp" multiple @change="handleFileUpload" />
        <w-button variant="secondary" @click="openFolderModal = true">
          <span class="material-symbols-outlined mr-2">create_new_folder</span>
          NUEVA CARPETA
        </w-button>
        <w-button variant="primary" @click="triggerUpload">
          <span class="material-symbols-outlined mr-2">upload_file</span>
          SUBIR ARCHIVOS
        </w-button>
        <div class="view-toggle" role="group" aria-label="Vista">
          <button
            :class="['view-btn', { 'view-btn--active': explorerView === 'details' }]"
            title="Vista detalles"
            @click="setExplorerView('details')"
          >
            <span class="material-symbols-outlined">view_list</span>
          </button>
          <button
            :class="['view-btn', { 'view-btn--active': explorerView === 'icons' }]"
            title="Iconos grandes"
            @click="setExplorerView('icons')"
          >
            <span class="material-symbols-outlined">grid_view</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Barra tipo Explorador: atrás / adelante / subir / actualizar + ruta -->
    <div class="explorer-toolbar">
      <div class="nav-btns">
        <button class="nav-btn" :disabled="!canGoBack" title="Atrás" @click="goBack">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <button class="nav-btn" :disabled="!canGoForward" title="Adelante" @click="goForward">
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>
        <button class="nav-btn" :disabled="!currentFolderPath" title="Subir un nivel" @click="goUp">
          <span class="material-symbols-outlined">arrow_upward</span>
        </button>
        <button class="nav-btn" title="Actualizar" @click="refreshAll">
          <span class="material-symbols-outlined" :class="{ spinning: loading }">refresh</span>
        </button>
      </div>
      <div class="address-bar" @click.self="addressEditing = true">
        <span class="material-symbols-outlined address-icon">computer</span>
        <template v-if="!addressEditing">
          <button class="address-seg address-seg--root" @click="navigateToFolder('')">Este equipo</button>
          <template v-for="crumb in pathCrumbs" :key="crumb.id">
            <span class="material-symbols-outlined address-chev">chevron_right</span>
            <button class="address-seg" @click="navigateToFolder(crumb.id)">{{ crumb.label }}</button>
          </template>
        </template>
        <input
          v-else
          ref="addressInput"
          v-model="addressText"
          class="address-input"
          @keydown.enter.prevent="goToTypedPath"
          @keydown.esc="addressEditing = false"
          @blur="addressEditing = false"
        />
      </div>
      <div class="search-box">
        <span class="material-symbols-outlined">search</span>
        <input type="text" v-model="filters.search" placeholder="Buscar en esta carpeta..." @input="handleSearch" />
      </div>
    </div>

    <section class="explorer-shell">
      <aside class="explorer-sidebar">
        <div class="sidebar-header">ACCESO RÁPIDO</div>
        <button class="sidebar-item" :class="{ active: !currentFolderPath }" @click="navigateToFolder('')">
          <span class="material-symbols-outlined">home</span>
          <span>Inicio</span>
        </button>
        <div class="sidebar-header" style="margin-top:12px">CARPETAS</div>
        <button
          v-for="node in folderTree"
          :key="node.path"
          class="sidebar-item"
          :class="{ active: currentFolderPath === node.path }"
          :style="{ paddingLeft: (10 + node.depth * 16) + 'px' }"
          @click="toggleTreeNode(node)"
        >
          <span
            v-if="node.hasChildren"
            class="material-symbols-outlined tree-caret"
            @click.stop="toggleTreeExpand(node.path)"
          >{{ isExpanded(node.path) ? 'expand_more' : 'chevron_right' }}</span>
          <span v-else class="tree-caret tree-caret--leaf"></span>
          <span class="material-symbols-outlined">folder</span>
          <span class="sidebar-item__label">{{ node.name }}</span>
        </button>
      </aside>

      <main class="explorer-main" @click="closeContextMenu" @dragenter.prevent="onDragEnter" @dragover.prevent>
        <div
          v-if="dragActive"
          class="drop-overlay"
          @dragover.prevent
          @dragleave.prevent="dragActive = false"
          @drop.prevent="handleDrop"
        >
          <span class="material-symbols-outlined">upload_file</span>
          <p>Soltá para subir en {{ currentFolderPath || 'Inicio' }}</p>
        </div>
        <!-- Vista detalles -->
        <div v-if="explorerView === 'details'" class="details-wrap">
          <div class="details-head">
            <button class="details-col details-col--name" @click="toggleSort('name')">
              Nombre {{ sortArrow('name') }}
            </button>
            <button class="details-col" @click="toggleSort('date')">
              Fecha de modificación {{ sortArrow('date') }}
            </button>
            <button class="details-col" @click="toggleSort('type')">
              Tipo {{ sortArrow('type') }}
            </button>
            <button class="details-col details-col--num" @click="toggleSort('size')">
              Tamaño {{ sortArrow('size') }}
            </button>
          </div>
          <div v-if="loading && !allRows.length" class="details-loading">
            <span class="material-symbols-outlined spinning">sync</span>
            Cargando archivos...
          </div>
          <div v-else-if="!allRows.length" class="details-empty">Esta carpeta está vacía</div>
          <div
            v-for="row in sortedRows"
            :key="row.key"
            :class="['details-row', { 'details-row--selected': isSelected(row) }]"
            @click="selectRow(row)"
            @dblclick="openRow(row)"
            @contextmenu.prevent="openContextMenu($event, row)"
          >
            <span class="details-col details-col--name">
              <span class="material-symbols-outlined row-icon" :style="{ color: row.iconColor }">{{ row.icon }}</span>
              {{ row.name }}
            </span>
            <span class="details-col">{{ row.dateLabel }}</span>
            <span class="details-col">{{ row.typeLabel }}</span>
            <span class="details-col details-col--num">{{ row.sizeLabel }}</span>
          </div>
        </div>

        <!-- Vista iconos grandes -->
        <div v-else class="icons-wrap">
          <div v-if="loading && !allRows.length" class="details-loading">
            <span class="material-symbols-outlined spinning">sync</span>
            Cargando archivos...
          </div>
          <div v-else-if="!allRows.length" class="details-empty">Esta carpeta está vacía</div>
          <button
            v-for="row in sortedRows"
            :key="row.key"
            :class="['icon-tile', { 'icon-tile--selected': isSelected(row) }]"
            @click="selectRow(row)"
            @dblclick="openRow(row)"
            @contextmenu.prevent="openContextMenu($event, row)"
          >
            <span class="material-symbols-outlined icon-tile__icon" :style="{ color: row.iconColor }">{{ row.icon }}</span>
            <span class="icon-tile__name">{{ row.name }}</span>
          </button>
        </div>

        <!-- Barra de estado -->
        <div class="status-bar">
          <span>{{ statusText }}</span>
          <span v-if="selectedRow" class="status-bar__sel">1 seleccionado: {{ selectedRow.name }}</span>
          <span v-if="loading" class="status-bar__loading">
            <span class="material-symbols-outlined spinning">sync</span> Cargando...
          </span>
        </div>

        <!-- Menú contextual -->
        <div
          v-if="contextMenu.visible"
          class="context-menu"
          :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
        >
          <button class="context-item" @click="openRow(contextMenu.row); closeContextMenu()">
            <span class="material-symbols-outlined">open_in_new</span> Abrir
          </button>
          <button v-if="!contextMenu.row.isFolder" class="context-item" @click="downloadRow(contextMenu.row); closeContextMenu()">
            <span class="material-symbols-outlined">download</span> Descargar
          </button>
          <button class="context-item" @click="startRename(contextMenu.row); closeContextMenu()">
            <span class="material-symbols-outlined">edit</span> Renombrar
          </button>
          <button class="context-item context-item--danger" @click="askDelete(contextMenu.row); closeContextMenu()">
            <span class="material-symbols-outlined">delete</span> Eliminar
          </button>
        </div>
      </main>
    </section>

    <!-- Overlay subiendo archivos -->
    <div v-if="uploading" class="upload-overlay">
      <div class="upload-box">
        <span class="material-symbols-outlined spinning">sync</span>
        <p>Subiendo {{ uploadTotal }} archivo(s)... {{ uploadDone }}/{{ uploadTotal }}</p>
        <div class="upload-track"><div class="upload-fill" :style="{ width: uploadPct + '%' }"></div></div>
      </div>
    </div>

    <div v-if="openFolderModal" class="modal-overlay" @click.self="openFolderModal = false">
      <div class="modal-box">
        <h3 class="modal-title">Nueva carpeta</h3>
        <div class="modal-form">
          <label>Nombre</label>
          <input v-model="newFolderName" type="text" placeholder="Ej: Contratos, Finanzas, IA" @keydown.enter.prevent="createFolder" />
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="openFolderModal = false">Cancelar</button>
          <button class="btn-primary" :disabled="loading" @click="createFolder">Crear carpeta</button>
        </div>
      </div>
    </div>

    <div v-if="renameTarget" class="modal-overlay" @click.self="renameTarget = null">
      <div class="modal-box">
        <h3 class="modal-title">Renombrar {{ renameTarget.isFolder ? 'carpeta' : 'archivo' }}</h3>
        <div class="modal-form">
          <label>Nuevo nombre</label>
          <input v-model="renameName" type="text" @keydown.enter.prevent="confirmRename" />
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="renameTarget = null">Cancelar</button>
          <button class="btn-primary" :disabled="loading || !renameName.trim()" @click="confirmRename">Renombrar</button>
        </div>
      </div>
    </div>

    <div v-if="selectedDocument" class="modal-overlay" @click.self="selectedDocument = null">
      <div class="modal-box modal-box--large">
        <div class="doc-preview__header">
          <div>
            <h3 class="modal-title">{{ selectedDocument.title }}</h3>
            <p class="doc-preview__meta">{{ previewMeta }}</p>
          </div>
          <div class="doc-preview__actions">
            <button class="btn-secondary" @click="downloadSelectedDocument">Descargar</button>
            <button class="btn-secondary" @click="selectedDocument = null">Cerrar</button>
          </div>
        </div>

        <div class="doc-preview__body">
          <pre v-if="selectedDocumentPayload?.encoding === 'text'" class="doc-text-preview">{{ selectedDocumentPayload.text }}</pre>
          <div v-else class="doc-binary-preview">
            <span class="material-symbols-outlined">{{ selectedDocument ? getDocumentIcon(selectedDocument) : 'draft' }}</span>
            <p>Archivo importado correctamente.</p>
            <p class="doc-preview__hint">Puedes descargarlo desde aquí cuando lo necesites.</p>
          </div>
        </div>
      </div>
    </div>

    <w-confirm-modal
      :is-open="confirmDeleteOpen"
      title="Eliminar"
      :message="deleteMessage"
      confirm-text="Eliminar"
      :is-danger="true"
      @confirm="confirmDelete"
      @cancel="confirmDeleteOpen = false; deletingDoc = null"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'pinia'
import type { Document } from '@/api/docs/docs.types'
import WButton from '@/components/ui/WButton.vue'
import WConfirmModal from '@/components/ui/WConfirmModal.vue'
import { useDocsStore } from '@/stores/docs.store'
import {
  buildBreadcrumbs,
  fileToDocumentPayload,
  formatBytes,
  getAllFolderPaths,
  getDirectChildrenFolders,
  getDocumentIcon,
  getDocumentsInFolder,
  getFileExtension,
  getFileIconColor,
  getFileKindLabel,
  getStoredFileSize,
  isFileDocument,
  isFolderDocument,
  normalizeFolderPath,
  parseStoredFile,
  type StoredFilePayload,
} from '@/utils/docs-explorer'

interface ExplorerRow {
  key: string
  name: string
  isFolder: boolean
  docId: string | null
  icon: string
  iconColor: string
  dateLabel: string
  dateValue: number
  typeLabel: string
  sizeLabel: string
  sizeValue: number
}

interface TreeNode {
  path: string
  name: string
  depth: number
  hasChildren: boolean
}

const EXPLORER_VIEW_KEY = 'orkpad_explorer_view'

export default defineComponent({
  name: 'DocsPage',
  components: { WButton, WConfirmModal },
  data() {
    return {
      currentFolderPath: '',
      backStack: [] as string[],
      forwardStack: [] as string[],
      explorerView: (localStorage.getItem(EXPLORER_VIEW_KEY) || 'details') as 'details' | 'icons',
      addressEditing: false,
      addressText: '',
      openFolderModal: false,
      newFolderName: '',
      selectedKey: '',
      selectedDocId: '' as string | null,
      selectedFolderPath: '' as string | null,
      sortKey: 'name' as 'name' | 'date' | 'type' | 'size',
      sortDir: 1 as 1 | -1,
      expandedPaths: [] as string[],
      contextMenu: { visible: false, x: 0, y: 0, row: null as ExplorerRow | null },
      renameTarget: null as ExplorerRow | null,
      renameName: '',
      selectedDocument: null as Document | null,
      confirmDeleteOpen: false,
      deletingDoc: null as Document | null,
      uploading: false,
      uploadDone: 0,
      uploadTotal: 0,
      dragActive: false,
    }
  },
  computed: {
    ...mapState(useDocsStore, ['items', 'loading', 'filters']),
    pathCrumbs() {
      return buildBreadcrumbs(this.currentFolderPath).filter(c => c.id !== '')
    },
    canGoBack(): boolean {
      return this.backStack.length > 0
    },
    canGoForward(): boolean {
      return this.forwardStack.length > 0
    },
    folderTree(): TreeNode[] {
      const paths = getAllFolderPaths(this.items)
      const expanded = new Set(this.expandedPaths)
      const current = this.currentFolderPath
      const visible: TreeNode[] = []
      for (const path of paths) {
        const parts = path.split('/')
        const depth = parts.length - 1
        if (depth > 0) {
          const parent = parts.slice(0, -1).join('/')
          if (!expanded.has(parent) && !current.startsWith(parent + '/') && current !== parent) continue
        }
        const hasChildren = paths.some(p => p !== path && p.startsWith(path + '/'))
        visible.push({ path, name: parts[parts.length - 1], depth, hasChildren })
      }
      return visible
    },
    allRows(): ExplorerRow[] {
      const folders = getDirectChildrenFolders(this.items, this.currentFolderPath)
      const files = getDocumentsInFolder(this.items, this.currentFolderPath).filter(isFileDocument)
      const rows: ExplorerRow[] = folders.map(f => ({
        key: `folder:${f.id}`,
        name: f.name,
        isFolder: true,
        docId: this.folderDocId(f.id),
        icon: 'folder',
        iconColor: '#FFC107',
        dateLabel: '—',
        dateValue: 0,
        typeLabel: 'Carpeta',
        sizeLabel: `${f.itemCount} elementos`,
        sizeValue: -1,
      }))
      for (const doc of files) {
        const size = getStoredFileSize(doc)
        rows.push({
          key: `file:${doc._id}`,
          name: doc.title,
          isFolder: false,
          docId: doc._id,
          icon: getDocumentIcon(doc),
          iconColor: getFileIconColor(doc),
          dateLabel: this.formatDateTime(doc.createdAt),
          dateValue: new Date(doc.createdAt).getTime() || 0,
          typeLabel: getFileKindLabel(doc),
          sizeLabel: formatBytes(size),
          sizeValue: size ?? -1,
        })
      }
      return rows
    },
    sortedRows(): ExplorerRow[] {
      const rows = [...this.allRows]
      const dir = this.sortDir
      const byName = (a: ExplorerRow, b: ExplorerRow) => a.name.localeCompare(b.name) * dir
      rows.sort((a, b) => {
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
        switch (this.sortKey) {
          case 'date': return (a.dateValue - b.dateValue) * dir || byName(a, b)
          case 'type': return a.typeLabel.localeCompare(b.typeLabel) * dir || byName(a, b)
          case 'size': return (a.sizeValue - b.sizeValue) * dir || byName(a, b)
          default: return byName(a, b)
        }
      })
      return rows
    },
    selectedRow(): ExplorerRow | null {
      return this.sortedRows.find(r => r.key === this.selectedKey) ?? null
    },
    statusText(): string {
      const folders = this.allRows.filter(r => r.isFolder).length
      const files = this.allRows.length - folders
      const parts: string[] = []
      if (folders) parts.push(`${folders} carpeta(s)`)
      if (files || !folders) parts.push(`${files} archivo(s)`)
      return parts.join(', ')
    },
    uploadPct(): number {
      if (!this.uploadTotal) return 0
      return Math.round((this.uploadDone / this.uploadTotal) * 100)
    },
    selectedDocumentPayload(): StoredFilePayload | null {
      return this.selectedDocument ? parseStoredFile(this.selectedDocument) : null
    },
    previewMeta() {
      if (!this.selectedDocument || !this.selectedDocumentPayload) return 'Documento interno'
      const payload = this.selectedDocumentPayload
      const sizeKb = Math.max(1, Math.round(payload.size / 1024))
      return `${payload.extension.toUpperCase()} · ${sizeKb} KB · ${payload.mimeType}`
    },
    deleteMessage(): string {
      if (!this.deletingDoc) return ''
      return isFolderDocument(this.deletingDoc)
        ? `¿Eliminar la carpeta "${this.deletingDoc.title}" y todo su contenido?`
        : `¿Eliminar el archivo "${this.deletingDoc.title}"?`
    },
  },
  methods: {
    ...mapActions(useDocsStore, ['fetchAll', 'create', 'remove', 'update']),
    getDocumentIcon,
    formatDateTime(value: string) {
      return new Date(value).toLocaleString()
    },
    handleSearch() {
      this.fetchAll()
    },
    setExplorerView(view: 'details' | 'icons') {
      this.explorerView = view
      localStorage.setItem(EXPLORER_VIEW_KEY, view)
    },
    navigateToFolder(folderPath: string, pushHistory = true) {
      const target = normalizeFolderPath(folderPath)
      if (pushHistory && target !== this.currentFolderPath) {
        this.backStack.push(this.currentFolderPath)
        this.forwardStack = []
      }
      this.currentFolderPath = target
      this.selectedKey = ''
      this.selectedDocId = null
      this.selectedFolderPath = null
      // expande ancestros en el árbol
      const parts = target ? target.split('/') : []
      const ancestors: string[] = []
      for (let i = 1; i <= parts.length; i++) ancestors.push(parts.slice(0, i).join('/'))
      this.expandedPaths = [...new Set([...this.expandedPaths, ...ancestors])]
    },
    goBack() {
      if (!this.canGoBack) return
      this.forwardStack.push(this.currentFolderPath)
      this.currentFolderPath = this.backStack.pop() as string
      this.selectedKey = ''
    },
    goForward() {
      if (!this.canGoForward) return
      this.backStack.push(this.currentFolderPath)
      this.currentFolderPath = this.forwardStack.pop() as string
      this.selectedKey = ''
    },
    goUp() {
      if (!this.currentFolderPath) return
      const parts = this.currentFolderPath.split('/')
      parts.pop()
      this.navigateToFolder(parts.join('/'))
    },
    goToTypedPath() {
      this.navigateToFolder(this.addressText)
      this.addressEditing = false
    },
    refreshAll() {
      this.fetchAll()
    },
    toggleSort(key: 'name' | 'date' | 'type' | 'size') {
      if (this.sortKey === key) {
        this.sortDir = this.sortDir === 1 ? -1 : 1
      } else {
        this.sortKey = key
        this.sortDir = 1
      }
    },
    sortArrow(key: string) {
      if (this.sortKey !== key) return ''
      return this.sortDir === 1 ? '▲' : '▼'
    },
    toggleTreeNode(node: TreeNode) {
      if (node.hasChildren && this.currentFolderPath === node.path) {
        this.toggleTreeExpand(node.path)
      }
      this.navigateToFolder(node.path)
    },
    toggleTreeExpand(path: string) {
      const idx = this.expandedPaths.indexOf(path)
      if (idx >= 0) this.expandedPaths.splice(idx, 1)
      else this.expandedPaths.push(path)
    },
    isExpanded(path: string) {
      return this.expandedPaths.includes(path)
    },
    folderDocId(folderPath: string): string | null {
      const parts = folderPath.split('/')
      const name = parts[parts.length - 1]
      const parent = parts.slice(0, -1).join('/')
      const found = this.items.find(
        (d) => isFolderDocument(d) && d.title === name && normalizeFolderPath(d.folderId) === parent,
      )
      return found ? found._id : null
    },
    selectRow(row: ExplorerRow) {
      this.selectedKey = row.key
      this.selectedDocId = row.docId
      this.selectedFolderPath = row.isFolder ? this.childPath(row.name) : null
    },
    isSelected(row: ExplorerRow) {
      return row.key === this.selectedKey
    },
    childPath(name: string) {
      return normalizeFolderPath([this.currentFolderPath, name].filter(Boolean).join('/'))
    },
    openRow(row: ExplorerRow) {
      if (row.isFolder) {
        this.navigateToFolder(this.childPath(row.name))
        return
      }
      const doc = this.items.find((d) => d._id === row.docId)
      if (doc) this.selectedDocument = doc
    },
    openContextMenu(e: MouseEvent, row: ExplorerRow) {
      this.selectRow(row)
      const main = (e.currentTarget as HTMLElement)?.closest('.explorer-main') as HTMLElement | null
      const rect = main?.getBoundingClientRect()
      this.contextMenu = {
        visible: true,
        x: Math.min(e.clientX - (rect?.left ?? 0), Math.max(0, (rect?.width ?? 300) - 200)),
        y: e.clientY - (rect?.top ?? 0),
        row,
      }
    },
    closeContextMenu() {
      this.contextMenu.visible = false
    },
    downloadRow(row: ExplorerRow) {
      const doc = this.items.find((d) => d._id === row.docId)
      if (!doc) return
      this.selectedDocument = doc
      this.$nextTick(() => this.downloadSelectedDocument())
    },
    startRename(row: ExplorerRow) {
      this.renameTarget = row
      this.renameName = row.name
    },
    async confirmRename() {
      if (!this.renameTarget || !this.renameName.trim()) return
      const target = this.renameTarget
      const newName = this.renameName.trim()
      this.renameTarget = null
      if (target.isFolder) {
        await this.renameFolder(target.name, newName)
      } else if (target.docId) {
        await this.update(target.docId, { title: newName })
      }
    },
    async renameFolder(oldName: string, newName: string) {
      const oldPath = this.childPath(oldName)
      const parentParts = oldPath.split('/')
      parentParts.pop()
      const newPath = normalizeFolderPath([...parentParts, newName].join('/'))
      if (!newPath || newPath === oldPath) return
      // doc de la carpeta
      const folderDoc = this.items.find(
        (d) => isFolderDocument(d) && normalizeFolderPath(d.folderId) === parentParts.join('/') && d.title === oldName,
      )
      const ops: Promise<unknown>[] = []
      if (folderDoc) ops.push(this.update(folderDoc._id, { title: newName }))
      // hijos: reescribir prefijo de folderId
      for (const d of this.items) {
        const fid = normalizeFolderPath((d as any).folderId)
        if (fid === oldPath || fid.startsWith(oldPath + '/')) {
          ops.push(this.update(d._id, { folderId: newPath + fid.slice(oldPath.length) } as any))
        }
      }
      await Promise.all(ops)
      if (this.currentFolderPath === oldPath || this.currentFolderPath.startsWith(oldPath + '/')) {
        this.currentFolderPath = newPath + this.currentFolderPath.slice(oldPath.length)
      }
    },
    askDelete(row: ExplorerRow) {
      const doc = row.isFolder
        ? this.items.find(
            (d) => {
              const parts = this.childPath(row.name).split('/')
              const name = parts[parts.length - 1]
              const parent = parts.slice(0, -1).join('/')
              return isFolderDocument(d) && d.title === name && normalizeFolderPath(d.folderId) === parent
            },
          )
        : this.items.find((d) => d._id === row.docId)
      if (!doc) return
      this.deletingDoc = doc
      this.confirmDeleteOpen = true
    },
    async confirmDelete() {
      if (!this.deletingDoc) return
      const doc = this.deletingDoc
      if (isFolderDocument(doc)) {
        // borrado recursivo
        const folderPath = normalizeFolderPath([doc.folderId, doc.title].filter(Boolean).join('/'))
        const children = this.items.filter((d) => {
          const fid = normalizeFolderPath(d.folderId)
          return fid === folderPath || fid.startsWith(folderPath + '/')
        })
        for (const child of children) {
          await this.remove(child._id)
        }
        if (this.currentFolderPath === folderPath || this.currentFolderPath.startsWith(folderPath + '/')) {
          this.navigateToFolder('', false)
          this.backStack = []
          this.forwardStack = []
        }
      }
      await this.remove(doc._id)
      if (this.selectedDocument?._id === doc._id) this.selectedDocument = null
      this.deletingDoc = null
      this.confirmDeleteOpen = false
    },
    triggerUpload() {
      (this.$refs.fileInput as HTMLInputElement | undefined)?.click()
    },
    async createFolder() {
      const folderName = this.newFolderName.trim()
      if (!folderName) return
      await this.create({
        title: folderName,
        folderId: this.currentFolderPath,
        tags: ['system:folder']
      })
      this.newFolderName = ''
      this.openFolderModal = false
    },
    onDragEnter(e: DragEvent) {
      if (e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files')) {
        this.dragActive = true
      }
    },
    async handleDrop(e: DragEvent) {
      this.dragActive = false
      const allowed = ['md', 'doc', 'docx', 'xls', 'xlsx', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp']
      const dropped = Array.from(e.dataTransfer?.files ?? [])
      const files = dropped.filter((f) => allowed.includes(getFileExtension(f.name)))
      const skipped = dropped.length - files.length
      if (skipped > 0) {
        const { showToast } = await import('@/composables/useToast')
        showToast(`Se omitieron ${skipped} archivo(s) no soportados (solo documentos e imágenes)`, 'error')
      }
      if (!files.length || this.uploading) return
      this.uploading = true
      this.uploadDone = 0
      this.uploadTotal = files.length
      try {
        for (const file of files) {
          const payload = await fileToDocumentPayload(file)
          await this.create({
            title: file.name,
            folderId: this.currentFolderPath,
            tags: [
              'system:file',
              `extension:${getFileExtension(file.name)}`,
              `mime:${payload.mimeType}`
            ],
            content: JSON.stringify(payload)
          })
          this.uploadDone += 1
        }
      } finally {
        this.uploading = false
      }
    },
    async handleFileUpload(event: Event) {
      const input = event.target as HTMLInputElement
      const files = Array.from(input.files ?? [])
      if (!files.length) return
      this.uploading = true
      this.uploadDone = 0
      this.uploadTotal = files.length
      try {
        for (const file of files) {
          const payload = await fileToDocumentPayload(file)
          await this.create({
            title: file.name,
            folderId: this.currentFolderPath,
            tags: [
              'system:file',
              `extension:${getFileExtension(file.name)}`,
              `mime:${payload.mimeType}`
            ],
            content: JSON.stringify(payload)
          })
          this.uploadDone += 1
        }
      } finally {
        input.value = ''
        this.uploading = false
      }
    },
    openDocument(doc: Document) {
      this.selectedDocument = doc
    },
    downloadSelectedDocument() {
      if (!this.selectedDocument || !this.selectedDocumentPayload) return
      const payload = this.selectedDocumentPayload
      if (payload.encoding === 'text') {
        const blob = new Blob([payload.text ?? ''], { type: payload.mimeType })
        const url = URL.createObjectURL(blob)
        this.triggerBrowserDownload(url, payload.fileName)
        return
      }
      this.triggerBrowserDownload(payload.data ?? '', payload.fileName)
    },
    triggerBrowserDownload(url: string, fileName: string) {
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    },
  },
  mounted() {
    this.fetchAll()
  }
})
</script>

<style scoped>
.docs-page { padding: 32px; flex-grow: 1; min-width: 0; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 16px; flex-wrap: wrap; }
.header-left { display: flex; align-items: center; gap: 32px; }
.header-right { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.page-title { font-family: var(--font-body); font-size: 24px; font-weight: 600; color: var(--color-text-base); }
.hidden-file-input { display: none; }
.mr-2 { margin-right: 8px; }

/* Toggle de vista */
.view-toggle { display: flex; border: 1px solid var(--color-border); }
.view-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: var(--color-bg-surface-low); border: none; color: var(--color-text-muted); cursor: pointer; }
.view-btn + .view-btn { border-left: 1px solid var(--color-border); }
.view-btn--active { background: var(--color-primary); color: white; }
.view-btn .material-symbols-outlined { font-size: 18px; }

/* Toolbar estilo Explorador */
.explorer-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.nav-btns { display: flex; gap: 2px; }
.nav-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: none; border: none; border-radius: 4px; color: var(--color-text-base); cursor: pointer; }
.nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.06); }
.nav-btn:disabled { opacity: 0.3; cursor: default; }
.nav-btn .material-symbols-outlined { font-size: 20px; }
.nav-btn .spinning { animation: spin 0.8s linear infinite; }
.address-bar { flex: 1; display: flex; align-items: center; gap: 2px; min-width: 0; background: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 4px 8px; min-height: 34px; }
.address-icon { font-size: 18px; color: var(--color-text-muted); }
.address-seg { background: none; border: none; color: var(--color-text-base); font-size: 13px; padding: 4px 6px; border-radius: 3px; cursor: pointer; white-space: nowrap; }
.address-seg:hover { background: rgba(255,255,255,0.06); }
.address-seg--root { color: var(--color-text-muted); }
.address-chev { font-size: 16px; color: var(--color-text-disabled); }
.address-input { flex: 1; background: none; border: none; outline: none; color: var(--color-text-base); font-family: var(--font-mono); font-size: 12px; }
.search-box { position: relative; width: 260px; flex-shrink: 0; }
.search-box span { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--color-text-muted); }
.search-box input { width: 100%; background-color: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 8px 12px 8px 36px; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-base); outline: none; box-sizing: border-box; }

/* Shell */
.explorer-shell { display: grid; grid-template-columns: 250px 1fr; gap: 12px; min-height: 62vh; }
.explorer-sidebar { border: 1px solid var(--color-border); background: var(--color-bg-surface); padding: 12px 6px; overflow-y: auto; }
.sidebar-header { margin-bottom: 4px; padding: 0 10px; font-family: var(--font-mono); font-size: 11px; letter-spacing: var(--letter-spacing-caps); color: var(--color-text-muted); text-transform: uppercase; }
.sidebar-item { width: 100%; display: flex; align-items: center; gap: 8px; padding: 7px 10px; background: transparent; border: 0; color: var(--color-text-base); cursor: pointer; text-align: left; font-size: 13px; border-radius: 3px; }
.sidebar-item:hover { background: rgba(255,255,255,0.04); }
.sidebar-item.active { background: rgba(255,255,255,0.07); }
.sidebar-item .material-symbols-outlined { font-size: 18px; color: #FFC107; }
.sidebar-item__label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tree-caret { font-size: 18px !important; color: var(--color-text-muted) !important; cursor: pointer; }
.tree-caret--leaf { width: 18px; }

/* Vista detalles */
.explorer-main { position: relative; display: flex; flex-direction: column; min-width: 0; border: 1px solid var(--color-border); background: var(--color-bg-surface); }
.details-wrap { flex: 1; overflow-y: auto; min-height: 300px; }
.details-head, .details-row { display: grid; grid-template-columns: minmax(0, 1fr) 170px 170px 110px; align-items: center; gap: 8px; padding: 0 12px; }
.details-head { position: sticky; top: 0; background: var(--color-bg-surface); border-bottom: 1px solid var(--color-border); z-index: 2; }
.details-col { background: none; border: none; color: var(--color-text-muted); font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; padding: 10px 0; text-align: left; cursor: default; }
button.details-col { cursor: pointer; }
button.details-col:hover { color: var(--color-text-base); }
.details-col--num { text-align: right; }
.details-row { border-bottom: 1px solid var(--color-border-subtle); cursor: default; padding-top: 2px; padding-bottom: 2px; }
.details-row .details-col { font-family: var(--font-body); font-size: 13px; color: var(--color-text-base); text-transform: none; letter-spacing: normal; padding: 7px 0; }
.details-row:hover { background: rgba(255,255,255,0.03); }
.details-row--selected { background: rgba(37, 99, 235, 0.14) !important; }
.details-row--selected:hover { background: rgba(37, 99, 235, 0.2) !important; }
.row-icon { font-size: 20px; vertical-align: -5px; margin-right: 8px; }
.details-loading, .details-empty { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 64px 0; color: var(--color-text-muted); font-size: 13px; }
.spinning { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Vista iconos */
.icons-wrap { flex: 1; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 4px; padding: 12px; align-content: flex-start; min-height: 300px; }
.icon-tile { width: 104px; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 6px; background: none; border: 1px solid transparent; cursor: pointer; }
.icon-tile:hover { background: rgba(255,255,255,0.04); }
.icon-tile--selected { background: rgba(37, 99, 235, 0.14) !important; border-color: rgba(37, 99, 235, 0.5); }
.icon-tile__icon { font-size: 44px; }
.icon-tile__name { font-size: 12px; color: var(--color-text-base); text-align: center; word-break: break-word; max-height: 3.2em; overflow: hidden; }

/* Barra de estado */
.status-bar { display: flex; align-items: center; gap: 16px; border-top: 1px solid var(--color-border); padding: 6px 12px; font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); }
.status-bar__sel { color: var(--color-text-base); }
.status-bar__loading { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.status-bar__loading .material-symbols-outlined { font-size: 14px; }

/* Menú contextual */
.context-menu { position: absolute; z-index: 60; min-width: 190px; background: var(--color-bg-surface-high, #1a1a24); border: 1px solid var(--color-border); padding: 4px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
.context-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 12px; background: none; border: none; color: var(--color-text-base); font-size: 13px; cursor: pointer; text-align: left; }
.context-item:hover { background: rgba(255,255,255,0.06); }
.context-item .material-symbols-outlined { font-size: 18px; color: var(--color-text-muted); }
.context-item--danger { color: var(--color-error); }
.context-item--danger .material-symbols-outlined { color: var(--color-error); }

/* Overlay subiendo */
.upload-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 1200; }
.upload-box { background: var(--color-bg-surface); border: 1px solid var(--color-border); padding: 28px 32px; display: flex; flex-direction: column; align-items: center; gap: 12px; min-width: 320px; font-size: 13px; }
.upload-box .material-symbols-outlined { font-size: 32px; color: var(--color-primary); }
.upload-track { width: 100%; height: 8px; background: var(--color-bg-surface-high); }
.upload-fill { height: 100%; background: var(--color-primary); transition: width 0.2s; }

/* Overlay drag & drop */
.drop-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(37, 99, 235, 0.1);
  border: 2px dashed var(--color-primary);
  font-size: 15px;
  color: var(--color-text-base);
  pointer-events: auto;
}

.drop-overlay .material-symbols-outlined {
  font-size: 48px;
  color: var(--color-primary);
}

/* Modales y preview (reutilizados) */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-box { width: 100%; max-width: 480px; padding: 24px; background: var(--color-bg-surface); border: 1px solid var(--color-border); }
.modal-box--large { max-width: 860px; }
.modal-title { margin: 0 0 12px; font-family: var(--font-body); font-size: 18px; color: var(--color-text-base); }
.modal-form { display: flex; flex-direction: column; gap: 8px; }
.modal-form label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--color-text-muted); }
.modal-form input { background: var(--color-bg-surface-highest); border: 1px solid var(--color-border); padding: 10px 12px; color: var(--color-text-base); outline: none; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-primary, .btn-secondary { padding: 9px 16px; border: 1px solid var(--color-border); cursor: pointer; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; }
.btn-primary { background: var(--color-primary); border-color: var(--color-primary); color: white; }
.btn-secondary { background: transparent; color: var(--color-text-base); }
.doc-preview__header { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.doc-preview__meta { margin: 0; color: var(--color-text-muted); font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; }
.doc-preview__actions { display: flex; gap: 10px; align-items: flex-start; }
.doc-preview__body { min-height: 320px; border: 1px solid var(--color-border); background: var(--color-bg-surface-highest); padding: 16px; overflow: auto; }
.doc-text-preview { white-space: pre-wrap; margin: 0; color: var(--color-text-base); font-family: var(--font-mono); line-height: 1.5; }
.doc-binary-preview { min-height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--color-text-muted); }
.doc-binary-preview .material-symbols-outlined { font-size: 48px; color: var(--color-primary); }
.doc-preview__hint { margin: 0; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; }

@media (max-width: 1024px) {
  .explorer-shell { grid-template-columns: 1fr; }
  .explorer-sidebar { display: none; }
}
@media (max-width: 768px) {
  .docs-page { padding: 16px; }
  .page-header { flex-direction: column; align-items: stretch; }
  .header-right { flex-direction: column; align-items: stretch; width: 100%; }
  .explorer-toolbar { flex-wrap: wrap; }
  .search-box { width: 100%; }
  .details-head, .details-row { grid-template-columns: minmax(0, 1fr) 110px 90px; }
  .details-head .details-col:nth-child(2), .details-row .details-col:nth-child(2) { display: none; }
}
</style>
