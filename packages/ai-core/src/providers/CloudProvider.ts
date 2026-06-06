import type { AIProvider, ProviderConfig } from './types';

export class CloudProvider implements AIProvider {
  constructor(private config: ProviderConfig) {}

  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = this.config.openaiApiKey;
    if (!apiKey) {
      throw new Error('Cloud AI not configured — OPENAI_API_KEY missing');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cloud AI request failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0]?.message?.content ?? '';
  }
}
