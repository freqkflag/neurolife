import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIOrchestrator } from '@neurolife/ai-core';
import type { OrchestratorContext, SpecialistType } from '@neurolife/ai-core';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit.service';

@Injectable()
export class AiService {
  private orchestrator: AIOrchestrator;

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    config: ConfigService,
  ) {
    this.orchestrator = new AIOrchestrator({
      openaiApiKey: config.get('OPENAI_API_KEY'),
      selfHostedUrl: config.get('SELF_HOSTED_AI_URL'),
    });
  }

  async process(
    userId: string,
    input: string,
    context: Partial<OrchestratorContext>,
    options?: { specialist?: SpecialistType; consentGiven?: boolean },
  ) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    const latest = await this.getLatestState(userId);

    const fullContext: OrchestratorContext = {
      capacity: latest.capacity,
      sensory: latest.sensory,
      moneyStressLevel: profile?.moneyStressLevel,
      platform: context.platform ?? 'web',
      privacyMode: (profile?.privacyMode as OrchestratorContext['privacyMode']) ?? 'HYBRID',
      crisisState: context.crisisState,
      ...context,
    };

    const result = await this.orchestrator.route(input, fullContext, options);

    await this.prisma.aIInteraction.create({
      data: {
        userId,
        agentType: result.specialist,
        input,
        output: JSON.stringify(result.output),
        privacyMode: fullContext.privacyMode,
        consentGiven: options?.consentGiven ?? false,
      },
    });

    await this.audit.log(userId, 'AI_QUERY', 'ai_interaction', undefined, {
      specialist: result.specialist,
    });

    return result;
  }

  private async getLatestState(userId: string) {
    const [capacityEntry, sensoryEntry] = await Promise.all([
      this.prisma.capacityEntry.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sensoryEntry.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      capacity: {
        score: capacityEntry?.score ?? 50,
        sleepHours: capacityEntry?.sleepHours ?? undefined,
        sleepQuality: capacityEntry?.sleepQuality ?? undefined,
      },
      sensory: {
        load: sensoryEntry?.load ?? 30,
        ambientNoise: sensoryEntry?.ambientNoise ?? undefined,
        lightLevel: sensoryEntry?.lightLevel ?? undefined,
      },
    };
  }
}
