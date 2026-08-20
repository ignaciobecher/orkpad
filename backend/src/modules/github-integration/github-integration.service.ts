import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class GithubIntegrationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService,
  ) {}

  private async getToken(userId: string): Promise<string> {
    const token = await this.usersService.getGithubAccessToken(userId);
    if (!token)
      throw new UnauthorizedException(
        'No GitHub access token found. Please re-authenticate with GitHub.',
      );
    return token;
  }

  private octokit(token: string): Octokit {
    return new Octokit({ auth: token });
  }

  async getUserRepos(userId: string) {
    const token = await this.getToken(userId);
    const octokit = this.octokit(token);
    const data = await octokit.paginate(
      octokit.repos.listForAuthenticatedUser,
      { per_page: 100, sort: 'updated', type: 'all' as const },
    );
    return data.map((r) => ({
      owner: r.owner.login,
      name: r.name,
      fullName: r.full_name,
      defaultBranch: r.default_branch,
      htmlUrl: r.html_url,
      private: r.private,
    }));
  }

  async getRepoCommits(owner: string, repo: string, userId: string) {
    const token = await this.getToken(userId);
    const octokit = this.octokit(token);
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 20,
    });
    return data.map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author?.name ?? c.author?.login ?? 'unknown',
      date: c.commit.author?.date,
      url: c.html_url,
    }));
  }

  async getOpenPRs(owner: string, repo: string, userId: string) {
    const token = await this.getToken(userId);
    const octokit = this.octokit(token);
    const { data } = await octokit.pulls.list({ owner, repo, state: 'open' });
    return data.map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      url: pr.html_url,
      createdAt: pr.created_at,
      user: pr.user?.login,
    }));
  }

  async createBranch(
    owner: string,
    repo: string,
    defaultBranch: string,
    branchName: string,
    userId: string,
  ): Promise<{ branchName: string; url: string }> {
    const token = await this.getToken(userId);
    const octokit = this.octokit(token);

    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });
    const sha = refData.object.sha;

    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha,
    });

    return {
      branchName,
      url: `https://github.com/${owner}/${repo}/tree/${branchName}`,
    };
  }

  async connectRepo(
    workspaceId: string,
    projectId: string,
    dto: {
      owner: string;
      repo: string;
      defaultBranch: string;
      htmlUrl: string;
    },
  ) {
    const project = await this.projectsService.findOne(workspaceId, projectId);
    const repos: any[] = (project as any).githubRepos ?? [];
    const alreadyConnected = repos.some(
      (r: any) => r.owner === dto.owner && r.repo === dto.repo,
    );
    if (alreadyConnected)
      throw new BadRequestException(
        'This repository is already connected to the project.',
      );
    return this.projectsService.update(workspaceId, projectId, {
      githubRepos: [...repos, dto],
    } as any);
  }

  async disconnectRepo(
    workspaceId: string,
    projectId: string,
    owner: string,
    repo: string,
  ) {
    const project = await this.projectsService.findOne(workspaceId, projectId);
    const repos: any[] = (project as any).githubRepos ?? [];
    const updated = repos.filter(
      (r: any) => !(r.owner === owner && r.repo === repo),
    );
    return this.projectsService.update(workspaceId, projectId, {
      githubRepos: updated,
    } as any);
  }

  async getProjectRepos(workspaceId: string, projectId: string) {
    const project = await this.projectsService.findOne(workspaceId, projectId);
    return ((project as any).githubRepos ?? []) as {
      owner: string;
      repo: string;
      defaultBranch: string;
      htmlUrl: string;
    }[];
  }

  async getProjectRepo(
    workspaceId: string,
    projectId: string,
    owner: string,
    repo: string,
  ) {
    const repos = await this.getProjectRepos(workspaceId, projectId);
    const found = repos.find((r) => r.owner === owner && r.repo === repo);
    if (!found)
      throw new BadRequestException(
        `Repository ${owner}/${repo} is not connected to this project.`,
      );
    return found;
  }

  async getFirstProjectRepo(workspaceId: string, projectId: string) {
    const repos = await this.getProjectRepos(workspaceId, projectId);
    if (!repos.length)
      throw new BadRequestException(
        'This project has no GitHub repository connected.',
      );
    return repos[0];
  }
}
