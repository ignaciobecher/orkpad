import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { LeadsRepository } from './leads.repository';
import { EmailFinderService } from './email-finder.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    private readonly leadsRepository: LeadsRepository,
    private readonly emailFinderService: EmailFinderService,
  ) {}

  findAll(workspaceId: string, query: QueryLeadDto) {
    const {
      page,
      limit,
      search,
      status,
      industry,
      city,
      searchId,
      source,
      hasEmail,
    } = query;
    const filters: Record<string, any> = {};

    if (status) filters.status = status;
    if (industry) filters.industry = { $regex: industry, $options: 'i' };
    if (city) filters.city = { $regex: city, $options: 'i' };
    if (searchId) filters.searchId = searchId;
    if (source) filters.source = source;
    if (hasEmail !== undefined) {
      filters.email = hasEmail
        ? { $exists: true, $nin: [null, ''] }
        : { $in: [null, '', undefined] };
    }
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    return this.leadsRepository.findAll(workspaceId, filters, {
      page,
      limit,
      sort: { score: -1, createdAt: -1 },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const lead = await this.leadsRepository.findOne(workspaceId, id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  create(workspaceId: string, dto: CreateLeadDto) {
    return this.leadsRepository.create(workspaceId, {
      ...dto,
      source: dto.source ?? 'manual',
    });
  }

  async update(workspaceId: string, id: string, dto: UpdateLeadDto) {
    const lead = await this.leadsRepository.update(workspaceId, id, dto);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  async remove(workspaceId: string, id: string) {
    const lead = await this.leadsRepository.softDelete(workspaceId, id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  async harvestEmail(workspaceId: string, id: string) {
    const lead = await this.leadsRepository.findOne(workspaceId, id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    if (!lead.website) {
      throw new BadRequestException(
        'Lead has no website to harvest an email from',
      );
    }

    const { email, source, confidence } =
      await this.emailFinderService.findEmail(lead.website);
    if (!email) return lead;

    const updated = await this.leadsRepository.update(workspaceId, id, {
      email,
      emailSource: source,
      emailConfidence: confidence,
    });
    return updated ?? lead;
  }
}
