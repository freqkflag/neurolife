import { BaseAgent } from './BaseAgent';
import { pickFallback, STUCK_FALLBACKS } from '../prompts/fallbacks';
import type { AgentRequest } from '../types';
import type { TinyActionOutput } from '../schemas/output';

export class TaskRoutineAgent extends BaseAgent {
  type = 'task_routine' as const;
  defaultAction = pickFallback(STUCK_FALLBACKS);
  defaultSummary = 'Only one thing matters right now.';

  async process(request: AgentRequest): Promise<TinyActionOutput> {
    const result = await super.process(request);
    if (request.context.capacity.score < 30) {
      return {
        ...result,
        tinyNextAction: pickFallback(STUCK_FALLBACKS),
        summary: 'Low capacity mode — keeping it very small.',
      };
    }
    return result;
  }
}
