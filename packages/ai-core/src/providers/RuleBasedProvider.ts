import type { AIProvider } from './types';

export class RuleBasedProvider implements AIProvider {
  async complete(_systemPrompt: string, userPrompt: string): Promise<string> {
    return JSON.stringify({
      summary: 'Processed locally without cloud AI.',
      tinyNextAction: 'Take one small step on what feels most urgent.',
      uncertainty: 'MEDIUM',
    });
  }
}
