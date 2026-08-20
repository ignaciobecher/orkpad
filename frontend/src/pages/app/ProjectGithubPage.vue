<template>
  <div class="github-page">
    <header class="page-header">
      <button class="back-btn" @click="$router.push({ name: 'project-detail', params: { id: projectId } })">
        <span class="material-symbols-outlined">arrow_back</span>
        <span>Volver al proyecto</span>
      </button>
      <div v-if="activeRepo" class="header-info">
        <span class="material-symbols-outlined" style="font-size:18px;color:var(--color-text-muted)">commit</span>
        <a :href="activeRepo.htmlUrl" target="_blank" class="repo-link">{{ activeRepo.owner }}/{{ activeRepo.repo }}</a>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <span class="material-symbols-outlined loading-icon">progress_activity</span>
    </div>

    <div v-else-if="!connectedRepos.length" class="empty-state">
      <span class="material-symbols-outlined" style="font-size:48px;color:var(--color-text-muted)">link_off</span>
      <p>Este proyecto no tiene repositorios de GitHub conectados.</p>
      <w-button variant="ghost" @click="$router.push({ name: 'project-detail', params: { id: projectId } })">
        Conectar desde el detalle del proyecto
      </w-button>
    </div>

    <template v-else>
      <!-- Repo tabs when multiple -->
      <div v-if="connectedRepos.length > 1" class="repo-tabs">
        <button
          v-for="r in connectedRepos"
          :key="`${r.owner}/${r.repo}`"
          class="repo-tab"
          :class="{ active: activeRepo?.owner === r.owner && activeRepo?.repo === r.repo }"
          @click="selectRepo(r)"
        >
          <span class="material-symbols-outlined" style="font-size:14px">commit</span>
          {{ r.owner }}/{{ r.repo }}
        </button>
      </div>

      <div class="github-content">
        <!-- Commits -->
        <section class="feed-section">
          <div class="feed-header">
            <h2 class="feed-title">Commits recientes</h2>
            <span class="feed-count">{{ commits.length }}</span>
          </div>
          <w-card class="no-padding">
            <div v-if="commitsLoading" class="feed-loading">Cargando commits...</div>
            <div v-else-if="!commits.length" class="feed-empty">Sin commits</div>
            <div v-for="commit in commits" :key="commit.sha" class="commit-row">
              <span class="commit-sha">{{ commit.sha.slice(0, 7) }}</span>
              <div class="commit-info">
                <span class="commit-msg">{{ commit.message.split('\n')[0] }}</span>
                <span class="commit-meta">{{ commit.author }} · {{ formatDate(commit.date) }}</span>
              </div>
              <a :href="commit.url" target="_blank" class="row-link" title="Ver en GitHub">
                <span class="material-symbols-outlined">open_in_new</span>
              </a>
            </div>
          </w-card>
        </section>

        <!-- Pull Requests -->
        <section class="feed-section">
          <div class="feed-header">
            <h2 class="feed-title">Pull Requests abiertos</h2>
            <span class="feed-count">{{ pullRequests.length }}</span>
          </div>
          <w-card class="no-padding">
            <div v-if="prsLoading" class="feed-loading">Cargando PRs...</div>
            <div v-else-if="!pullRequests.length" class="feed-empty">Sin PRs abiertos</div>
            <div v-for="pr in pullRequests" :key="pr.number" class="pr-row">
              <span class="pr-number">#{{ pr.number }}</span>
              <div class="commit-info">
                <span class="commit-msg">{{ pr.title }}</span>
                <span class="commit-meta">{{ pr.user }} · {{ formatDate(pr.createdAt) }}</span>
              </div>
              <a :href="pr.url" target="_blank" class="row-link" title="Ver en GitHub">
                <span class="material-symbols-outlined">open_in_new</span>
              </a>
            </div>
          </w-card>
        </section>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useProjectsStore } from '@/stores/projects.store'
import { useGithubStore } from '@/stores/github.store'
import { mapActions } from 'pinia'
import WButton from '@/components/ui/WButton.vue'
import WCard from '@/components/ui/WCard.vue'

interface ConnectedRepo {
  owner: string
  repo: string
  defaultBranch: string
  htmlUrl: string
}

export default defineComponent({
  name: 'ProjectGithubPage',
  components: { WButton, WCard },
  data() {
    return {
      loading: false,
      commitsLoading: false,
      prsLoading: false,
      activeRepo: null as ConnectedRepo | null,
      githubStore: useGithubStore(),
      projectsStore: useProjectsStore(),
    }
  },
  computed: {
    projectId(): string {
      return this.$route.params.id as string
    },
    connectedRepos(): ConnectedRepo[] {
      return (this.projectsStore.selected as any)?.githubRepos ?? []
    },
    commits() {
      if (!this.activeRepo) return []
      return this.githubStore.getCommitsForRepo(this.projectId, this.activeRepo.owner, this.activeRepo.repo)
    },
    pullRequests() {
      if (!this.activeRepo) return []
      return this.githubStore.getPRsForRepo(this.projectId, this.activeRepo.owner, this.activeRepo.repo)
    },
  },
  methods: {
    ...mapActions(useProjectsStore, ['fetchById']),
    formatDate(iso?: string) {
      if (!iso) return ''
      const d = new Date(iso)
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    async selectRepo(repo: ConnectedRepo) {
      this.activeRepo = repo
      this.$router.replace({ query: { owner: repo.owner, repo: repo.repo } })
      await this.loadRepoData(repo)
    },
    async loadRepoData(repo: ConnectedRepo) {
      this.commitsLoading = true
      this.prsLoading = true
      await Promise.all([
        this.githubStore.fetchCommits(this.projectId, repo.owner, repo.repo)
          .finally(() => { this.commitsLoading = false }),
        this.githubStore.fetchPullRequests(this.projectId, repo.owner, repo.repo)
          .finally(() => { this.prsLoading = false }),
      ])
    },
    async loadData() {
      this.loading = true
      await this.fetchById(this.projectId)
      this.loading = false
      if (!this.connectedRepos.length) return

      // Pick repo from query params or default to first
      const qOwner = this.$route.query.owner as string | undefined
      const qRepo = this.$route.query.repo as string | undefined
      const fromQuery = qOwner && qRepo
        ? this.connectedRepos.find(r => r.owner === qOwner && r.repo === qRepo)
        : null
      this.activeRepo = fromQuery ?? this.connectedRepos[0]
      await this.loadRepoData(this.activeRepo)
    },
  },
  mounted() {
    this.loadData()
  },
})
</script>

<style scoped>
.github-page {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex-grow: 1;
  min-width: 0;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
  letter-spacing: 0.05em;
}
.back-btn:hover { color: var(--color-text-base); }
.back-btn .material-symbols-outlined { font-size: 16px; }

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.repo-link {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-primary);
  text-decoration: none;
}
.repo-link:hover { text-decoration: underline; }

.loading-state {
  display: flex;
  justify-content: center;
  padding: 64px;
}
.loading-icon {
  animation: spin 1s linear infinite;
  font-size: 32px;
  color: var(--color-text-muted);
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.repo-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.repo-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 8px 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  cursor: pointer;
  margin-bottom: -1px;
}
.repo-tab:hover { color: var(--color-text-base); }
.repo-tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.github-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feed-section { display: flex; flex-direction: column; gap: 12px; }

.feed-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.feed-title {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}
.feed-count {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  padding: 1px 6px;
}

.no-padding :deep(.w-card__body) { padding: 0 !important; }

.feed-loading, .feed-empty {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 20px 16px;
}

.commit-row, .pr-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  min-width: 0;
}
.commit-row:last-child, .pr-row:last-child { border-bottom: none; }

.commit-sha, .pr-number {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  flex-shrink: 0;
  min-width: 52px;
}

.commit-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.commit-msg {
  font-size: 13px;
  color: var(--color-text-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.commit-meta {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
}

.row-link {
  color: var(--color-text-muted);
  display: flex;
  flex-shrink: 0;
}
.row-link:hover { color: var(--color-primary); }
.row-link .material-symbols-outlined { font-size: 16px; }
</style>
