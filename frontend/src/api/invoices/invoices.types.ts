export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface Invoice {
  _id: string
  type: 'income' | 'expense'
  number?: string
  clientId?: string
  projectId?: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issueDate: string
  dueDate?: string
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  currency: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateInvoiceDto {
  type?: 'income' | 'expense'
  number?: string
  clientId?: string
  projectId?: string
  status?: string
  issueDate: string
  dueDate?: string
  items?: InvoiceItem[]
  taxRate?: number
  total?: number
  currency?: string
  notes?: string
}

export interface UpdateInvoiceDto extends Partial<CreateInvoiceDto> {}

export interface InvoiceQueryDto {
  page?: number
  limit?: number
  search?: string
  status?: string
  type?: string
  clientId?: string
  projectId?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
