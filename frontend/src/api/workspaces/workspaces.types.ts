export interface Workspace {
  _id: string
  name: string
  slug: string
  ownerId: string
  status: 'active' | 'suspended'
  displayName?: string | null
  logoFileId?: string | null
  primaryColor?: string | null
  defaultTheme?: 'dark' | 'light' | null
  agencyEmail?: string | null
  agencyPhone?: string | null
  agencyAddress?: string | null
  agencyWebsite?: string | null
  taxId?: string | null
  maxUploadMb?: number | null
  createdAt: string
  updatedAt: string
}

export interface UpdateWorkspaceDto {
  name?: string
  slug?: string
  displayName?: string | null
  logoFileId?: string | null
  primaryColor?: string | null
  defaultTheme?: 'dark' | 'light' | null
  agencyEmail?: string | null
  agencyPhone?: string | null
  agencyAddress?: string | null
  agencyWebsite?: string | null
  taxId?: string | null
  maxUploadMb?: number | null
}
