export interface DashboardStats {
  totalClients: number
  totalProjects: number
  totalTasks: number
  totalRevenue: number
  recentTasks: RecentTask[]
}

export interface RecentTask {
  _id: string
  title: string
  projectId?: string
  projectName?: string
  status: 'todo' | 'in-progress' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
}

export interface ConstellationTask {
  taskId: string
  title: string
  dueDate: string | null
  daysUntilDue: number | null
  status: 'todo' | 'in-progress'
}

export interface ConstellationNode {
  projectId: string
  projectName: string
  clientId: string | null
  clientName: string | null
  status: 'active' | 'on-hold' | 'completed' | 'archived'
  dueDate: string | null
  daysUntilDue: number | null
  lastActivityAt: string
  daysSinceActivity: number
  activitySource: 'time-entry' | 'task-update' | 'project-update'
  tasks: ConstellationTask[]
}

export interface WorkloadConstellationResponse {
  generatedAt: string
  nodes: ConstellationNode[]
}
