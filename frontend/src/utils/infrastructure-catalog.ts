import type { RemoteOption } from './remote-entity-options'

interface InfrastructureProvider {
  name: string
  category: string
  services: string[]
}

const PROVIDERS: InfrastructureProvider[] = [
  {
    name: 'Amazon Web Services',
    category: 'Cloud',
    services: ['EC2', 'ECS', 'EKS', 'Lambda', 'S3', 'RDS', 'DynamoDB', 'CloudFront', 'Route 53', 'CloudWatch', 'ElastiCache']
  },
  {
    name: 'Google Cloud',
    category: 'Cloud',
    services: ['Compute Engine', 'Cloud Run', 'GKE', 'Cloud Functions', 'Cloud Storage', 'Cloud SQL', 'BigQuery', 'Firestore', 'Vertex AI', 'Pub/Sub']
  },
  {
    name: 'Microsoft Azure',
    category: 'Cloud',
    services: ['Virtual Machines', 'AKS', 'App Service', 'Azure Functions', 'Blob Storage', 'Azure SQL', 'Cosmos DB', 'Azure OpenAI', 'Monitor', 'Front Door']
  },
  {
    name: 'Cloudflare',
    category: 'Edge',
    services: ['Workers', 'Pages', 'R2', 'D1', 'KV', 'Durable Objects', 'Queues', 'Images', 'Zero Trust']
  },
  {
    name: 'DigitalOcean',
    category: 'Cloud',
    services: ['Droplets', 'App Platform', 'Managed Databases', 'Spaces', 'Functions', 'Kubernetes', 'Load Balancers']
  },
  {
    name: 'Vercel',
    category: 'Frontend Cloud',
    services: ['Projects', 'Edge Functions', 'Serverless Functions', 'Blob', 'Postgres', 'KV', 'Edge Config', 'Cron Jobs']
  },
  {
    name: 'Netlify',
    category: 'Frontend Cloud',
    services: ['Sites', 'Functions', 'Edge Functions', 'Forms', 'Identity', 'Builds', 'Blobs']
  },
  {
    name: 'Railway',
    category: 'Platform',
    services: ['Services', 'Postgres', 'Redis', 'Volumes', 'Cron', 'Private Networking']
  },
  {
    name: 'Render',
    category: 'Platform',
    services: ['Web Service', 'Background Worker', 'Cron Job', 'Postgres', 'Redis', 'Static Site']
  },
  {
    name: 'Fly.io',
    category: 'Platform',
    services: ['Apps', 'Machines', 'Postgres', 'Redis', 'Volumes', 'Load Balancers']
  },
  {
    name: 'Supabase',
    category: 'Backend Platform',
    services: ['Postgres', 'Auth', 'Storage', 'Realtime', 'Edge Functions', 'Vector', 'Queues']
  },
  {
    name: 'Firebase',
    category: 'Backend Platform',
    services: ['Hosting', 'Firestore', 'Authentication', 'Functions', 'Storage', 'Remote Config', 'Analytics']
  },
  {
    name: 'MongoDB Atlas',
    category: 'Database',
    services: ['Dedicated Cluster', 'Serverless', 'Vector Search', 'Atlas Search', 'Backups', 'Data API']
  },
  {
    name: 'Neon',
    category: 'Database',
    services: ['Postgres', 'Branches', 'Serverless Driver', 'Storage', 'Autoscaling']
  },
  {
    name: 'PlanetScale',
    category: 'Database',
    services: ['MySQL', 'Branches', 'Insights', 'Backups', 'Connection Pooling']
  },
  {
    name: 'Redis',
    category: 'Database',
    services: ['Redis Cloud', 'Redis Stack', 'Cache', 'Vector Search', 'Pub/Sub']
  },
  {
    name: 'Pinecone',
    category: 'Vector DB',
    services: ['Serverless Index', 'Pod-based Index', 'Inference', 'Namespaces']
  },
  {
    name: 'Weaviate',
    category: 'Vector DB',
    services: ['Cloud Cluster', 'Vector Index', 'Hybrid Search', 'Modules']
  },
  {
    name: 'Qdrant',
    category: 'Vector DB',
    services: ['Cloud Cluster', 'Collections', 'Snapshots', 'Inference']
  },
  {
    name: 'OpenAI',
    category: 'AI',
    services: ['Responses API', 'Realtime API', 'Embeddings', 'Fine-tuning', 'Assistants Legacy', 'Batch']
  },
  {
    name: 'Anthropic',
    category: 'AI',
    services: ['Claude API', 'Batch', 'Prompt Caching', 'Files', 'Tool Use']
  },
  {
    name: 'Google AI',
    category: 'AI',
    services: ['Gemini API', 'Embeddings', 'Imagen', 'Live API']
  },
  {
    name: 'Mistral',
    category: 'AI',
    services: ['Chat API', 'Embeddings', 'OCR', 'Moderation', 'Fine-tuning']
  },
  {
    name: 'xAI',
    category: 'AI',
    services: ['Grok API', 'Chat Completion', 'Streaming']
  },
  {
    name: 'Cohere',
    category: 'AI',
    services: ['Command', 'Embed', 'Rerank', 'Tool Use']
  },
  {
    name: 'Meta',
    category: 'AI',
    services: ['Llama API', 'Safety Models', 'Embeddings']
  },
  {
    name: 'Hugging Face',
    category: 'AI Platform',
    services: ['Inference API', 'Spaces', 'Dedicated Endpoints', 'Datasets', 'Hub']
  },
  {
    name: 'Datadog',
    category: 'Observability',
    services: ['APM', 'Logs', 'RUM', 'Infrastructure Monitoring', 'Synthetics', 'Dashboards']
  },
  {
    name: 'Grafana',
    category: 'Observability',
    services: ['Grafana Cloud', 'Mimir', 'Loki', 'Tempo', 'Synthetic Monitoring', 'Alerting']
  },
  {
    name: 'Sentry',
    category: 'Observability',
    services: ['Errors', 'Tracing', 'Session Replay', 'Crons', 'Logs']
  },
  {
    name: 'Stripe',
    category: 'Payments',
    services: ['Payments', 'Billing', 'Checkout', 'Connect', 'Radar', 'Tax']
  },
]

function filterBySearch(values: string[], search: string) {
  const normalized = search.trim().toLowerCase()
  if (!normalized) return values
  return values.filter(value => value.toLowerCase().includes(normalized))
}

export async function loadInfrastructureProviderOptions(search = ''): Promise<RemoteOption[]> {
  return filterBySearch(PROVIDERS.map(provider => provider.name), search).map((providerName) => {
    const provider = PROVIDERS.find(item => item.name === providerName)!
    return {
      value: provider.name,
      label: provider.name,
      description: provider.category,
    }
  })
}

export async function loadInfrastructureProviderOptionByValue(value: string): Promise<RemoteOption | null> {
  const provider = PROVIDERS.find(item => item.name === value)
  if (!provider) return null
  return {
    value: provider.name,
    label: provider.name,
    description: provider.category,
  }
}

export async function loadInfrastructureTypeOptions(
  search = '',
  formData: Record<string, any> = {},
): Promise<RemoteOption[]> {
  const provider = PROVIDERS.find(item => item.name === formData.provider)
  if (!provider) return []
  return filterBySearch(provider.services, search).map((service) => ({
    value: service,
    label: service,
    description: provider.name,
  }))
}

export async function loadInfrastructureTypeOptionByValue(
  value: string,
  formData: Record<string, any> = {},
): Promise<RemoteOption | null> {
  const provider = PROVIDERS.find(item => item.name === formData.provider)
  const providerFromService = provider ?? PROVIDERS.find(item => item.services.includes(value))
  if (!providerFromService) return null
  return {
    value,
    label: value,
    description: providerFromService.name,
  }
}

export function getInfrastructureSuggestions() {
  return PROVIDERS
}

export function isKnownInfrastructureProvider(providerName?: string) {
  if (!providerName) return false
  return PROVIDERS.some((provider) => provider.name === providerName)
}

export function isKnownInfrastructureType(providerName?: string, serviceName?: string) {
  if (!providerName || !serviceName) return false
  const provider = PROVIDERS.find((item) => item.name === providerName)
  if (!provider) return false
  return provider.services.includes(serviceName)
}
