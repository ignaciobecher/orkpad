import type { Document } from '@/api/docs/docs.types'

export interface ExplorerFolder {
  id: string
  name: string
  parentId: string
  itemCount: number
}

export interface StoredFilePayload {
  kind: 'file'
  mimeType: string
  extension: string
  fileName: string
  size: number
  encoding: 'text' | 'data-url'
  text?: string
  data?: string
}

export function normalizeFolderPath(path?: string) {
  if (!path) return ''
  return path
    .split('/')
    .map(segment => segment.trim())
    .filter(Boolean)
    .join('/')
}

export function joinFolderPath(parentPath: string, folderName: string) {
  return normalizeFolderPath([parentPath, folderName].filter(Boolean).join('/'))
}

export function getFolderName(path: string) {
  const normalized = normalizeFolderPath(path)
  const parts = normalized.split('/').filter(Boolean)
  return parts.at(-1) || 'Root'
}

export function isFolderDocument(doc: Document) {
  return doc.tags?.includes('system:folder') ?? false
}

export function isFileDocument(doc: Document) {
  return !isFolderDocument(doc)
}

export function getDirectChildrenFolders(docs: Document[], currentPath: string): ExplorerFolder[] {
  const normalizedCurrent = normalizeFolderPath(currentPath)
  const folderMap = new Map<string, ExplorerFolder>()

  docs.forEach((doc) => {
    const folderPath = isFolderDocument(doc)
      ? joinFolderPath(doc.folderId || '', doc.title)
      : normalizeFolderPath(doc.folderId)

    if (!folderPath) return

    const parts = folderPath.split('/')
    const currentParts = normalizedCurrent ? normalizedCurrent.split('/') : []
    if (parts.length <= currentParts.length) return

    const prefix = parts.slice(0, currentParts.length).join('/')
    if (prefix !== normalizedCurrent) return

    const nextPath = parts.slice(0, currentParts.length + 1).join('/')
    if (!folderMap.has(nextPath)) {
      folderMap.set(nextPath, {
        id: nextPath,
        name: parts[currentParts.length],
        parentId: normalizedCurrent,
        itemCount: 0,
      })
    }
    folderMap.get(nextPath)!.itemCount += 1
  })

  return [...folderMap.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function getDocumentsInFolder(docs: Document[], currentPath: string) {
  const normalizedCurrent = normalizeFolderPath(currentPath)
  return docs
    .filter((doc) => normalizeFolderPath(doc.folderId) === normalizedCurrent)
    .sort((a, b) => {
      if (isFolderDocument(a) !== isFolderDocument(b)) {
        return isFolderDocument(a) ? -1 : 1
      }
      return a.title.localeCompare(b.title)
    })
}

export function buildBreadcrumbs(path: string) {
  const normalized = normalizeFolderPath(path)
  if (!normalized) return [{ id: '', label: 'Root' }]

  const parts = normalized.split('/')
  return [
    { id: '', label: 'Root' },
    ...parts.map((part, index) => ({
      id: parts.slice(0, index + 1).join('/'),
      label: part,
    })),
  ]
}

export function getFileExtension(fileName: string) {
  return fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase() : ''
}

export async function fileToDocumentPayload(file: File): Promise<StoredFilePayload> {
  const extension = getFileExtension(file.name)
  const mimeType = file.type || 'application/octet-stream'

  if (extension === 'md') {
    const text = await file.text()
    return {
      kind: 'file',
      mimeType: 'text/markdown',
      extension,
      fileName: file.name,
      size: file.size,
      encoding: 'text',
      text,
    }
  }

  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

  return {
    kind: 'file',
    mimeType,
    extension,
    fileName: file.name,
    size: file.size,
    encoding: 'data-url',
    data,
  }
}

export function parseStoredFile(doc: Document): StoredFilePayload | null {
  if (!doc.content) return null
  try {
    const parsed = JSON.parse(doc.content) as StoredFilePayload
    if (parsed?.kind === 'file') return parsed
    return null
  } catch {
    return null
  }
}

export function getDocumentIcon(doc: Document) {
  if (isFolderDocument(doc)) return 'folder'
  const payload = parseStoredFile(doc)
  const extension = payload?.extension || getFileExtension(doc.title)
  if (extension === 'md') return 'description'
  if (extension === 'pdf') return 'picture_as_pdf'
  if (['doc', 'docx'].includes(extension)) return 'article'
  if (['xls', 'xlsx', 'csv'].includes(extension)) return 'table_chart'
  return 'draft'
}
