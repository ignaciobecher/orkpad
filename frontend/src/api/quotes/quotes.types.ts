export interface QuoteLineItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
  unit?: string
}

export interface QuoteSection {
  title: string
  description?: string
  items: QuoteLineItem[]
}

export interface Quote {
  _id: string
  title: string
  number?: string
  clientId?: string
  projectId?: string
  taskIds?: string[]
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  issueDate: string
  expiresAt?: string
  clientName?: string
  clientEmail?: string
  clientAddress?: string
  freelancerName?: string
  freelancerEmail?: string
  freelancerPhone?: string
  freelancerAddress?: string
  freelancerWebsite?: string
  sections: QuoteSection[]
  items: QuoteLineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discountPercent: number
  discountAmount: number
  total: number
  currency: string
  notes?: string
  paymentTerms?: string
  validityNote?: string
  scope?: string
  deliverables?: string
  pdfUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateQuoteDto {
  title: string
  number?: string
  clientId?: string
  projectId?: string
  taskIds?: string[]
  status?: Quote['status']
  issueDate?: string
  expiresAt?: string
  clientName?: string
  clientEmail?: string
  clientAddress?: string
  freelancerName?: string
  freelancerEmail?: string
  freelancerPhone?: string
  freelancerAddress?: string
  freelancerWebsite?: string
  sections?: QuoteSection[]
  items?: QuoteLineItem[]
  taxRate?: number
  discountPercent?: number
  currency?: string
  notes?: string
  paymentTerms?: string
  validityNote?: string
  scope?: string
  deliverables?: string
}

export interface UpdateQuoteDto extends Partial<CreateQuoteDto> {}

export interface QuoteQueryDto {
  page?: number
  limit?: number
  search?: string
  status?: string
  clientId?: string
  projectId?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
