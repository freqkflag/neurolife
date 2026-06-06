import type { TinyActionOutput } from '../schemas/output';

export interface AIProvider {
  complete(systemPrompt: string, userPrompt: string): Promise<string>;
}

export interface ProviderConfig {
  openaiApiKey?: string;
  selfHostedUrl?: string;
}

export function parseStructuredOutput(raw: string): TinyActionOutput | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.tinyNextAction) return parsed as TinyActionOutput;
    return null;
  } catch {
    return null;
  }
}
