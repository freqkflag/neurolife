import type { AIProvider, ProviderConfig } from './types';

export class SelfHostedProvider implements AIProvider {
  constructor(private config: ProviderConfig) {}

  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    const url = this.config.selfHostedUrl;
    if (!url) {
      throw new Error('Self-hosted AI not configured');
    }

    const response = await fetch(`${url}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`Self-hosted AI request failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0]?.message?.content ?? '';
  }
}
