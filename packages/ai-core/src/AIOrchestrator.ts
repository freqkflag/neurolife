import { AdminPaperworkAgent } from './agents/AdminPaperworkAgent';
import { BudgetAgent } from './agents/BudgetAgent';
import { CrisisStabilizationAgent } from './agents/CrisisStabilizationAgent';
import { DisabilityBenefitsAgent } from './agents/DisabilityBenefitsAgent';
import { FoodBodyNeedsAgent } from './agents/FoodBodyNeedsAgent';
import { HousingStabilityAgent } from './agents/HousingStabilityAgent';
import { RSDCommunicationAgent } from './agents/RSDCommunicationAgent';
import { TaskRoutineAgent } from './agents/TaskRoutineAgent';
import type { ProviderConfig } from './providers/types';
import { classifyIntent } from './routing/IntentClassifier';
import { adjustForPlatform } from './routing/PlatformRouter';
import { selectProvider } from './routing/PrivacyRouter';
import type { TinyActionOutput } from './schemas/output';
import type { Agent, AgentRequest, OrchestratorContext, SpecialistType } from './types';

export class AIOrchestrator {
  private agents: Map<SpecialistType, Agent>;

  constructor(private providerConfig: ProviderConfig = {}) {
    const provider = selectProvider('HYBRID', providerConfig);
    this.agents = new Map<SpecialistType, Agent>([
      ['budget', new BudgetAgent(provider)],
      ['admin_paperwork', new AdminPaperworkAgent(provider)],
      ['disability_benefits', new DisabilityBenefitsAgent(provider)],
      ['food_body', new FoodBodyNeedsAgent(provider)],
      ['housing', new HousingStabilityAgent(provider)],
      ['task_routine', new TaskRoutineAgent(provider)],
      ['rsd_communication', new RSDCommunicationAgent(provider)],
      ['crisis_stabilization', new CrisisStabilizationAgent(provider)],
    ]);
  }

  async route(
    input: string,
    context: OrchestratorContext,
    options?: { specialist?: SpecialistType; consentGiven?: boolean },
  ): Promise<{ specialist: SpecialistType; output: TinyActionOutput }> {
    let specialist = options?.specialist ?? classifyIntent(input);
    specialist = adjustForPlatform(specialist, context);

    const provider = selectProvider(
      context.privacyMode,
      this.providerConfig,
      specialist !== 'crisis_stabilization',
      options?.consentGiven ?? false,
    );

    const agent = this.createAgent(specialist, provider);
    const request: AgentRequest = { input, context };
    const output = await agent.process(request);

    return { specialist, output };
  }

  private createAgent(type: SpecialistType, provider: ReturnType<typeof selectProvider>): Agent {
    switch (type) {
      case 'budget':
        return new BudgetAgent(provider);
      case 'admin_paperwork':
        return new AdminPaperworkAgent(provider);
      case 'disability_benefits':
        return new DisabilityBenefitsAgent(provider);
      case 'food_body':
        return new FoodBodyNeedsAgent(provider);
      case 'housing':
        return new HousingStabilityAgent(provider);
      case 'rsd_communication':
        return new RSDCommunicationAgent(provider);
      case 'crisis_stabilization':
        return new CrisisStabilizationAgent(provider);
      default:
        return new TaskRoutineAgent(provider);
    }
  }
}
