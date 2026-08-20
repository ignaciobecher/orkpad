import apiClient from '../axios.config'

export interface GithubRepo {
  owner: string
  name: string
  fullName: string
  defaultBranch: string
  htmlUrl: string
  private: boolean
}

export interface GithubCommit {
  sha: string
  message: string
  author: string
  date: string
  url: string
}

export interface GithubPR {
  number: number
  title: string
  state: string
  url: string
  createdAt: string
  user: string
}

export interface ConnectedRepo {
  owner: string
  repo: string
  defaultBranch: string
  htmlUrl: string
}

export interface ConnectRepoDto extends ConnectedRepo {}

export interface CreateBranchResponse {
  branchName: string
  url: string
}

export const githubApi = {
  getRepos: () =>
    apiClient.get<GithubRepo[]>('/github/repos'),

  connectRepo: (projectId: string, dto: ConnectRepoDto) =>
    apiClient.post(`/github/projects/${projectId}/connect`, dto),

  disconnectRepo: (projectId: string, owner: string, repo: string) =>
    apiClient.delete(`/github/projects/${projectId}/connect`, { params: { owner, repo } }),

  getProjectRepos: (projectId: string) =>
    apiClient.get<ConnectedRepo[]>(`/github/projects/${projectId}/repos`),

  getCommits: (projectId: string, owner: string, repo: string) =>
    apiClient.get<GithubCommit[]>(`/github/projects/${projectId}/commits`, { params: { owner, repo } }),

  getPullRequests: (projectId: string, owner: string, repo: string) =>
    apiClient.get<GithubPR[]>(`/github/projects/${projectId}/pull-requests`, { params: { owner, repo } }),

  createBranch: (taskId: string) =>
    apiClient.post<CreateBranchResponse>(`/tasks/${taskId}/create-branch`, {}),
}
