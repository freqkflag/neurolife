import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { OrchestratorContext, SpecialistType } from '@neurolife/ai-core';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/user.decorator';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private ai: AiService) {}

  @Post('chat')
  chat(
    @CurrentUser() user: { sub: string },
    @Body()
    body: {
      input: string;
      context?: Partial<OrchestratorContext>;
      specialist?: SpecialistType;
      consentGiven?: boolean;
    },
  ) {
    return this.ai.process(user.sub, body.input, body.context ?? {}, {
      specialist: body.specialist,
      consentGiven: body.consentGiven,
    });
  }
}
