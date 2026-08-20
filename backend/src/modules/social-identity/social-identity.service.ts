import { Injectable, NotFoundException } from '@nestjs/common';
import { SocialIdentityRepository } from './social-identity.repository';
import { CreateSocialAccountDto } from './dto/create-social-account.dto';
import { UpdateSocialAccountDto } from './dto/update-social-account.dto';
import { QuerySocialAccountDto } from './dto/query-social-account.dto';
import { AddWeeklyMetricDto } from './dto/add-weekly-metric.dto';
import { AddContentPillarDto } from './dto/add-content-pillar.dto';
import { AddMessageTemplateDto } from './dto/add-message-template.dto';

@Injectable()
export class SocialIdentityService {
  constructor(
    private readonly socialIdentityRepository: SocialIdentityRepository,
  ) {}

  async findAll(workspaceId: string, query: QuerySocialAccountDto) {
    return this.socialIdentityRepository.findAll(workspaceId, query);
  }

  async findOne(workspaceId: string, id: string) {
    const account = await this.socialIdentityRepository.findOne(
      workspaceId,
      id,
    );
    if (!account) throw new NotFoundException(`Social account ${id} not found`);
    return account;
  }

  async create(workspaceId: string, dto: CreateSocialAccountDto) {
    return this.socialIdentityRepository.create(workspaceId, dto);
  }

  async update(workspaceId: string, id: string, dto: UpdateSocialAccountDto) {
    const account = await this.socialIdentityRepository.update(
      workspaceId,
      id,
      dto,
    );
    if (!account) throw new NotFoundException(`Social account ${id} not found`);
    return account;
  }

  async archive(workspaceId: string, id: string) {
    const account = await this.socialIdentityRepository.update(
      workspaceId,
      id,
      {
        status: 'archived',
      },
    );
    if (!account) throw new NotFoundException(`Social account ${id} not found`);
    return account;
  }

  async addWeeklyMetric(
    workspaceId: string,
    id: string,
    dto: AddWeeklyMetricDto,
  ) {
    const account = await this.socialIdentityRepository.addWeeklyMetric(
      workspaceId,
      id,
      dto,
    );
    if (!account) throw new NotFoundException(`Social account ${id} not found`);
    return account;
  }

  async addContentPillar(
    workspaceId: string,
    id: string,
    dto: AddContentPillarDto,
  ) {
    const account = await this.socialIdentityRepository.addContentPillar(
      workspaceId,
      id,
      dto,
    );
    if (!account) throw new NotFoundException(`Social account ${id} not found`);
    return account;
  }

  async removeContentPillar(workspaceId: string, id: string, pillarId: string) {
    const account = await this.socialIdentityRepository.removeContentPillar(
      workspaceId,
      id,
      pillarId,
    );
    if (!account) throw new NotFoundException(`Social account ${id} not found`);
    return account;
  }

  async addMessageTemplate(
    workspaceId: string,
    id: string,
    dto: AddMessageTemplateDto,
  ) {
    const account = await this.socialIdentityRepository.addMessageTemplate(
      workspaceId,
      id,
      dto,
    );
    if (!account) throw new NotFoundException(`Social account ${id} not found`);
    return account;
  }

  async removeMessageTemplate(
    workspaceId: string,
    id: string,
    templateId: string,
  ) {
    const account = await this.socialIdentityRepository.removeMessageTemplate(
      workspaceId,
      id,
      templateId,
    );
    if (!account) throw new NotFoundException(`Social account ${id} not found`);
    return account;
  }

  async duplicate(
    workspaceId: string,
    id: string,
    newPlatform: string,
    newName: string,
  ) {
    const source = await this.findOne(workspaceId, id);
    const {
      _id,
      createdAt,
      updatedAt,
      weeklyMetrics,
      workspaceId: _workspaceId,
      isDeleted,
      deletedAt,
      ...rest
    } = source.toObject();

    return this.socialIdentityRepository.create(workspaceId, {
      ...rest,
      accountName: newName,
      platform: newPlatform,
    });
  }

  async getSummary(workspaceId: string) {
    const { data: accounts } = await this.socialIdentityRepository.findAll(
      workspaceId,
      {
        limit: 100,
      },
    );

    return accounts.map((account: any) => ({
      id: account._id,
      accountName: account.accountName,
      platform: account.platform,
      handle: account.handle,
      purpose: account.purpose,
      status: account.status,
      followersCount: account.followersCount,
      color: account.color,
      emoji: account.emoji,
      lastWeekMetrics: account.weeklyMetrics?.slice(-1)[0] || null,
      pillarsCount: account.contentPillars?.length || 0,
      templatesCount: account.messageTemplates?.length || 0,
    }));
  }
}
