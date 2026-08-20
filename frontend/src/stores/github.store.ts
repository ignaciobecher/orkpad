import { defineStore } from 'pinia'
import { useToast } from '@/composables/useToast'
import { githubApi } from '../api/github/github.api'
import type { GithubRepo, GithubCommit, GithubPR, ConnectRepoDto, ConnectedRepo } from '../api/github/github.api'

// commits/PRs keyed by `projectId:owner/repo`
function repoKey(projectId: string, owner: string, repo: string) {
  return `${projectId}:${owner}/${repo}`
}

export const useGithubStore = defineStore('github', {
  state: () => ({
    repos: [] as GithubRepo[],
    commits: {} as Record<string, GithubCommit[]>,
    pullRequests: {} as Record<string, GithubPR[]>,
    loading: false,
    reposLoading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchRepos() {
      this.reposLoading = true
      this.error = null
      try {
        const { data } = await githubApi.getRepos()
        this.repos = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error('No se pudieron cargar los repositorios de GitHub')
      } finally {
        this.reposLoading = false
      }
    },

    async connectRepo(projectId: string, dto: ConnectRepoDto) {
      this.loading = true
      try {
        await githubApi.connectRepo(projectId, dto)
        useToast().success('Repositorio conectado correctamente')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al conectar repositorio')
        throw err
      } finally {
        this.loading = false
      }
    },

    async disconnectRepo(projectId: string, owner: string, repo: string) {
      this.loading = true
      try {
        await githubApi.disconnectRepo(projectId, owner, repo)
        useToast().success('Repositorio desconectado')
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
        useToast().error(this.error ?? 'Error al desconectar repositorio')
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchCommits(projectId: string, owner: string, repo: string) {
      this.error = null
      try {
        const { data } = await githubApi.getCommits(projectId, owner, repo)
        this.commits[repoKey(projectId, owner, repo)] = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      }
    },

    async fetchPullRequests(projectId: string, owner: string, repo: string) {
      this.error = null
      try {
        const { data } = await githubApi.getPullRequests(projectId, owner, repo)
        this.pullRequests[repoKey(projectId, owner, repo)] = data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message
      }
    },

    getCommitsForRepo(projectId: string, owner: string, repo: string): GithubCommit[] {
      return this.commits[repoKey(projectId, owner, repo)] ?? []
    },

    getPRsForRepo(projectId: string, owner: string, repo: string): GithubPR[] {
      return this.pullRequests[repoKey(projectId, owner, repo)] ?? []
    },

    async createBranch(taskId: string): Promise<{ branchName: string; url: string } | null> {
      try {
        const { data } = await githubApi.createBranch(taskId)
        useToast().success(`Branch creado: ${data.branchName}`)
        return data
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message
        useToast().error(msg ?? 'Error al crear branch')
        return null
      }
    },
  },
})

export type { ConnectedRepo }
