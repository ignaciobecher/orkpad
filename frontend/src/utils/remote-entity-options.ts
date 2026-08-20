import { clientsApi } from '@/api/clients/clients.api'
import { productsApi } from '@/api/products/products.api'
import { projectsApi } from '@/api/projects/projects.api'
import { tasksApi } from '@/api/tasks/tasks.api'
import { usersApi } from '@/api/users/users.api'
import { marketingIdeasApi } from '@/api/marketing/marketing-ideas.api'

export interface RemoteOption {
  value: string
  label: string
  description?: string
}

const DEFAULT_LIMIT = 5

const safeDescription = (...values: Array<string | number | undefined | null>) =>
  values.filter(Boolean).join(' · ')

export async function loadClientOptions(search = '', formData: Record<string, any> = {}, page = 1): Promise<RemoteOption[]> {
  const { data } = await clientsApi.getAll({ search, limit: DEFAULT_LIMIT, page })
  return data.data.map((client) => ({
    value: client._id,
    label: client.name,
    description: safeDescription(client.email, client.phone),
  }))
}

export async function loadClientOptionById(id: string): Promise<RemoteOption | null> {
  if (!id) return null
  const { data } = await clientsApi.getById(id)
  return {
    value: data._id,
    label: data.name,
    description: safeDescription(data.email, data.phone),
  }
}

export async function loadProjectOptions(
  search = '',
  formData: Record<string, any> = {},
  page = 1,
): Promise<RemoteOption[]> {
  const { data } = await projectsApi.getAll({
    search,
    clientId: formData.clientId || undefined,
    limit: DEFAULT_LIMIT,
    page,
  })

  return data.data.map((project) => ({
    value: project._id,
    label: project.name,
  }))
}

export async function loadProjectOptionById(id: string): Promise<RemoteOption | null> {
  if (!id) return null
  const { data } = await projectsApi.getById(id)
  return {
    value: data._id,
    label: data.name,
  }
}

export async function loadTaskOptions(
  search = '',
  formData: Record<string, any> = {},
  page = 1,
): Promise<RemoteOption[]> {
  if (!formData.projectId) return []

  const { data } = await tasksApi.getAll({
    search,
    projectId: formData.projectId,
    limit: DEFAULT_LIMIT,
    page,
  })

  return data.data.map((task) => ({
    value: task._id,
    label: task.title,
    description: safeDescription(task.priority, task.description),
  }))
}

export async function loadTaskOptionById(id: string): Promise<RemoteOption | null> {
  if (!id) return null
  const { data } = await tasksApi.getById(id)
  return {
    value: data._id,
    label: data.title,
    description: safeDescription(data.priority, data.description),
  }
}

export async function loadProductOptions(search = '', formData: Record<string, any> = {}, page = 1): Promise<RemoteOption[]> {
  const { data } = await productsApi.getAll({ search, limit: DEFAULT_LIMIT, page })
  return data.data.map((product) => ({
    value: product._id,
    label: product.name,
    description: safeDescription(product.type, product.currency),
  }))
}

export async function loadProductOptionById(id: string): Promise<RemoteOption | null> {
  if (!id) return null
  const { data } = await productsApi.getById(id)
  return {
    value: data._id,
    label: data.name,
    description: safeDescription(data.type, data.currency),
  }
}

export async function loadUserOptions(search = '', formData: Record<string, any> = {}, page = 1): Promise<RemoteOption[]> {
  const { data } = await usersApi.getAll({ search, limit: DEFAULT_LIMIT, page })
  return data.data.map((user) => ({
    value: user._id,
    label: user.name,
    description: user.email,
  }))
}

export async function loadUserOptionById(id: string): Promise<RemoteOption | null> {
  if (!id) return null
  const { data } = await usersApi.getById(id)
  return {
    value: data._id,
    label: data.name,
    description: data.email,
  }
}

export async function loadMarketingIdeaOptions(search = '', formData: Record<string, any> = {}, page = 1): Promise<RemoteOption[]> {
  const { data } = await marketingIdeasApi.getAll({ search, limit: DEFAULT_LIMIT, page })
  return data.data.map((idea) => ({
    value: idea._id,
    label: idea.title,
    description: safeDescription(...idea.networks),
  }))
}

export async function loadMarketingIdeaOptionById(id: string): Promise<RemoteOption | null> {
  if (!id) return null
  const { data } = await marketingIdeasApi.getById(id)
  return {
    value: data._id,
    label: data.title,
    description: safeDescription(...data.networks),
  }
}
