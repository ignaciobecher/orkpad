export interface Project {
  _id: string
  name: string
  clientId: string
  description: string
  status: 'active' | 'on-hold' | 'completed' | 'archived'
  startDate?: string
  endDate?: string
  budget?: number
  currency?: string
  publicToken?: string | null
  linkVisibility?: 'public' | 'private'
  linkExpiresAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface LinkStatus {
  linkVisibility: 'public' | 'private'
  publicToken: string | null
  linkExpiresAt: string | null
  hasCredential: boolean
  username: string | null
  permissions: string[] | null
}

export interface SetLinkCredentialDto {
  username: string
  password: string
  permissions?: ('view' | 'create-task')[]
}

export interface CreateProjectDto {
  name: string
  clientId?: string
  description?: string
  status?: string
  startDate?: string
  endDate?: string
  budget?: number
  currency?: string
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
}

export interface ProjectQueryDto {
  page?: number
  limit?: number
  search?: string
  status?: string
  clientId?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface TaskSummary {
  _id?: string
  title: string
  status: string
  priority: string
  dueDate?: string
}

export interface TaskStats {
  total: number
  done: number
  inProgress: number
  todo: number
  cancelled: number
  overdue: number
}

export interface InvoiceStats {
  total: number
  paid: number
  pending: number
  overdue: number
}

export interface QuoteStats {
  total: number
  quoted: number
  accepted: number
}

export interface SubscriptionStats {
  total: number
  active: number
  monthlyRecurring: number
}

export interface TimeStats {
  totalMinutes: number
  billableMinutes: number
  billableAmount: number
}

export interface InvoiceSummary {
  _id: string
  number?: string
  status: string
  total: number
  currency: string
  dueDate?: string
  issueDate?: string
  createdAt?: string
}

export interface DocumentSummary {
  _id: string
  title: string
  tags: string[]
  createdAt?: string
  updatedAt?: string
}

export interface QuoteSummary {
  _id: string
  title: string
  number?: string
  status: string
  total: number
  currency: string
  createdAt?: string
}

export interface SubscriptionSummary {
  _id: string
  planName: string
  price: number
  currency: string
  billingCycle: string
  status: string
  nextBillingDate?: string
}

export interface ProjectOverview {
  project: Project
  taskStats: TaskStats
  invoiceStats: InvoiceStats
  quoteStats: QuoteStats
  subscriptionStats: SubscriptionStats
  timeStats: TimeStats
  recentTasks: TaskSummary[]
  pendingTasks: TaskSummary[]
  invoices: InvoiceSummary[]
  quotes: QuoteSummary[]
  subscriptions: SubscriptionSummary[]
  documents: DocumentSummary[]
}

export interface PublicInvoiceStats {
  paid: number
  pending: number
  currency: string
}

export interface PublicTaskStats {
  total: number
  done: number
  inProgress: number
  todo: number
  overdue: number
}

export interface PublicProjectView {
  name: string
  description?: string
  status: string
  startDate?: string
  endDate?: string
  budget?: number
  currency?: string
  taskStats: PublicTaskStats
  invoiceStats: PublicInvoiceStats
  tasks: TaskSummary[]
  invoices: InvoiceSummary[]
  documents: DocumentSummary[]
}
