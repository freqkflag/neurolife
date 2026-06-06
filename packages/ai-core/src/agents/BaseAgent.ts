import { avoidShameLanguage } from '@neurolife/shared';
import { fallbackTinyAction } from '../prompts/fallbacks';
import { SPECIALIST_PROMPTS } from '../prompts/system';
import type { AIProvider } from '../providers/types';
import { parseStructuredOutput } from '../providers/types';
import type { TinyActionOutput } from '../schemas/output';
import type { Agent, AgentRequest, SpecialistType } from '../types';

export abstract class BaseAgent implements Agent {
  abstract type: SpecialistType;
  abstract defaultAction: string;
  abstract defaultSummary: string;

  constructor(protected provider: AIProvider) {}

  async process(request: AgentRequest): Promise<TinyActionOutput> {
    const systemPrompt = SPECIALIST_PROMPTS[this.type] ?? SPECIALIST_PROMPTS.task_routine;
    const userPrompt = this.buildUserPrompt(request);

    try {
      const raw = await this.provider.complete(systemPrompt, userPrompt);
      const parsed = parseStructuredOutput(raw);
      if (parsed?.tinyNextAction) {
        return this.sanitize(parsed);
      }
    } catch {
      // fall through to rule-based fallback
    }

    return fallbackTinyAction(this.defaultAction, this.defaultSummary);
  }

  protected buildUserPrompt(request: AgentRequest): string {
    const { input, context } = request;
    return JSON.stringify({
      input,
      capacity: context.capacity.score,
      sensoryLoad: context.sensory.load,
      moneyStress: context.moneyStressLevel,
      platform: context.platform,
      instructions: 'Respond with JSON: { summary, tinyNextAction, uncertainty?, cards? }',
    });
  }

  protected sanitize(output: TinyActionOutput): TinyActionOutput {
    return {
      ...output,
      summary: avoidShameLanguage(output.summary),
      tinyNextAction: avoidShameLanguage(output.tinyNextAction),
    };
  }
}
