import { BaseAgent } from './BaseAgent';
import { pickFallback, CRISIS_FALLBACKS } from '../prompts/fallbacks';
import type { AgentRequest } from '../types';
import type { TinyActionOutput } from '../schemas/output';

const DANGER_PATTERNS = [/suicide|kill myself|self.?harm|end it all|want to die/i];

export class CrisisStabilizationAgent extends BaseAgent {
  type = 'crisis_stabilization' as const;
  defaultAction = pickFallback(CRISIS_FALLBACKS);
  defaultSummary = 'Pause. No big decisions right now.';

  async process(request: AgentRequest): Promise<TinyActionOutput> {
    const isDanger = DANGER_PATTERNS.some((p) => p.test(request.input));

    if (isDanger) {
      return {
        summary: 'If you are in immediate danger, please contact emergency services or a crisis line.',
        tinyNextAction: 'Call or text 988 (US) or your local crisis line.',
        uncertainty: 'LOW',
        cards: [
          {
            title: 'Emergency resources',
            body: '988 Suicide & Crisis Lifeline (US). You are not alone.',
            type: 'emergency',
          },
        ],
      };
    }

    return {
      summary: 'Pause. No big decisions right now.',
      tinyNextAction: pickFallback(CRISIS_FALLBACKS),
      uncertainty: 'LOW',
      cards: [
        {
          title: 'Basic needs check',
          body: 'Food, water, meds, sleep, safe space — any missing?',
          type: 'needs',
        },
      ],
    };
  }
}
