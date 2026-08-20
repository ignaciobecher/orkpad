import { Controller, Get, Post, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { OnboardingService } from './onboarding.service';

@ApiTags('Onboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('welcome')
  @ApiOperation({
    summary: 'Get the value-pillars content shown on first login',
  })
  getWelcome() {
    return this.onboardingService.getWelcomeContent();
  }

  @Post('demo-data')
  @ApiOperation({
    summary:
      'Seed a demo client/project/tasks so the workspace is not empty (idempotent)',
  })
  seedDemoData(@WorkspaceId() workspaceId: string) {
    return this.onboardingService.seedDemoData(workspaceId);
  }

  @Delete('demo-data')
  @ApiOperation({ summary: 'Remove all demo data from the workspace' })
  clearDemoData(@WorkspaceId() workspaceId: string) {
    return this.onboardingService.clearDemoData(workspaceId);
  }
}
