import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { LeadCampaignsRepository } from './lead-campaigns.repository';
import { LeadsRepository } from '../leads/leads.repository';
import { GoogleIntegrationService } from '../google-integration/google-integration.service';
import { GoogleGmailService } from '../google-integration/google-gmail.service';
import { CreateLeadCampaignDto } from './dto/create-lead-campaign.dto';
import { UpdateLeadCampaignDto } from './dto/update-lead-campaign.dto';

@Injectable()
export class LeadCampaignsService {
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(
    private readonly leadCampaignsRepository: LeadCampaignsRepository,
    private readonly leadsRepository: LeadsRepository,
    private readonly googleIntegrationService: GoogleIntegrationService,
    private readonly googleGmailService: GoogleGmailService,
    private readonly configService: ConfigService,
  ) {
    this.resend = new Resend(configService.get<string>('RESEND_API_KEY'));
    this.fromEmail =
      configService.get<string>('FROM_EMAIL') ?? 'no-reply@orkpad.com';
  }

  findAll(workspaceId: string) {
    return this.leadCampaignsRepository.findAll(
      workspaceId,
      {},
      { sort: { createdAt: -1 } },
    );
  }

  async findOne(workspaceId: string, id: string) {
    const campaign = await this.leadCampaignsRepository.findOne(
      workspaceId,
      id,
    );
    if (!campaign) throw new NotFoundException(`Campaign ${id} not found`);
    return campaign;
  }

  create(workspaceId: string, dto: CreateLeadCampaignDto) {
    return this.leadCampaignsRepository.create(workspaceId, {
      ...dto,
      type: dto.type ?? 'email',
      status: 'draft',
    });
  }

  async update(workspaceId: string, id: string, dto: UpdateLeadCampaignDto) {
    const campaign = await this.leadCampaignsRepository.update(
      workspaceId,
      id,
      dto,
    );
    if (!campaign) throw new NotFoundException(`Campaign ${id} not found`);
    return campaign;
  }

  async remove(workspaceId: string, id: string) {
    const campaign = await this.leadCampaignsRepository.softDelete(
      workspaceId,
      id,
    );
    if (!campaign) throw new NotFoundException(`Campaign ${id} not found`);
    return campaign;
  }

  async sendCampaign(workspaceId: string, campaignId: string, userId: string) {
    const campaign = await this.findOne(workspaceId, campaignId);

    if (campaign.type !== 'email') {
      throw new BadRequestException(
        'Solo campañas de tipo email pueden enviarse automáticamente.',
      );
    }

    const leads = await this.leadsRepository.findAll(workspaceId, {
      status: 'new',
    });
    const eligibleLeads = leads.data.filter((l) => l.email);

    if (eligibleLeads.length === 0) {
      return {
        sent: 0,
        skipped: 0,
        channel: 'none',
        message: 'No hay leads con email disponibles.',
      };
    }

    const googleConnected =
      await this.googleIntegrationService.isConnected(userId);
    let sent = 0;
    let skipped = 0;

    for (const lead of eligibleLeads) {
      const body = (campaign.template.body ?? '').replace(
        /\{\{name\}\}/g,
        lead.name,
      );
      const subject = campaign.template.subject ?? `Mensaje de Orkpad`;

      try {
        if (googleConnected) {
          await this.googleGmailService.sendEmail(
            userId,
            lead.email!,
            subject,
            body,
          );
        } else {
          await this.resend.emails.send({
            from: `Orkpad <${this.fromEmail}>`,
            to: lead.email!,
            subject,
            html: body,
          });
        }

        await this.leadsRepository.update(
          workspaceId,
          (lead._id as any).toString(),
          {
            lastContactedAt: new Date(),
            status: 'contacted',
          },
        );
        sent++;
      } catch {
        skipped++;
      }
    }

    await this.leadCampaignsRepository.update(workspaceId, campaignId, {
      totalSent: (campaign.totalSent ?? 0) + sent,
      status: sent > 0 ? 'active' : campaign.status,
    });

    return {
      sent,
      skipped,
      channel: googleConnected ? 'gmail' : 'resend',
      total: eligibleLeads.length,
    };
  }
}
