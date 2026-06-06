import { pickFallback, STUCK_FALLBACKS, CRISIS_FALLBACKS, fallbackTinyAction } from '@neurolife/ai-core';
import type { TinyActionOutput } from '@neurolife/shared';

export interface LocalAIContext {
  capacityScore: number;
  sensoryLoad: number;
  currentState?: string;
  targetState?: string;
  destination?: string;
  purpose?: string;
}

type LlamaContext = {
  completion: (params: { prompt: string; n_predict: number }) => Promise<{ text: string }>;
  release: () => Promise<void>;
};

let llamaContext: LlamaContext | null = null;
let modelReady = false;

export async function initializeModel(modelPath?: string): Promise<boolean> {
  try {
    const { initLlama } = await import('llama.rn');
    if (!modelPath) return false;
    llamaContext = await initLlama({ model: modelPath, n_ctx: 2048, n_gpu_layers: 99 });
    modelReady = true;
    return true;
  } catch {
    modelReady = false;
    return false;
  }
}

export function isModelReady(): boolean {
  return modelReady;
}

async function infer(prompt: string): Promise<string | null> {
  if (!llamaContext || !modelReady) return null;
  try {
    const result = await llamaContext.completion({ prompt, n_predict: 200 });
    return result.text;
  } catch {
    return null;
  }
}

function parseOutput(raw: string | null, fallback: TinyActionOutput): TinyActionOutput {
  if (!raw) return fallback;
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    const parsed = JSON.parse(match[0]);
    if (parsed.tinyNextAction) return parsed as TinyActionOutput;
  } catch {
    // use fallback
  }
  return fallback;
}

const PROMPT_PREFIX = `Respond with JSON only: { "summary": "...", "tinyNextAction": "..." }. Be calm, no shame, one tiny action max 15 words.`;

export async function generateTinyNextAction(
  input: string,
  context: LocalAIContext,
): Promise<TinyActionOutput> {
  const fallback = fallbackTinyAction(
    context.capacityScore < 30 ? pickFallback(STUCK_FALLBACKS) : 'Do the smallest visible step.',
    'One thing is enough right now.',
  );
  const raw = await infer(
    `${PROMPT_PREFIX}\nUser stuck: "${input}". Capacity: ${context.capacityScore}. Sensory: ${context.sensoryLoad}.`,
  );
  return parseOutput(raw, fallback);
}

export async function processBrainDump(rawText: string): Promise<TinyActionOutput> {
  const fallback = fallbackTinyAction(
    'Pick one item from your brain dump to act on.',
    'Your thoughts are captured. One item at a time.',
  );
  const raw = await infer(`${PROMPT_PREFIX}\nBrain dump: "${rawText.slice(0, 500)}"`);
  return parseOutput(raw, fallback);
}

export async function translateRSDMessage(rawMessage: string): Promise<TinyActionOutput> {
  const fallback = fallbackTinyAction(
    'Wait before replying.',
    'Their words may feel harsher than intended.',
  );
  const raw = await infer(`${PROMPT_PREFIX}\nRSD message to process: "${rawMessage.slice(0, 300)}"`);
  return parseOutput(raw, fallback);
}

export async function createTransitionBridge(
  currentState: string,
  targetState: string,
): Promise<TinyActionOutput> {
  return fallbackTinyAction(
    `Shift from ${currentState} to ${targetState}: take one breath first.`,
    'Transitions are hard. Go slowly.',
  );
}

export async function generateInteroceptivePing(
  context: LocalAIContext,
): Promise<TinyActionOutput> {
  const pings = ['Have you had water?', 'When did you last eat?', 'How does your body feel?'];
  return fallbackTinyAction(pings[Math.floor(Math.random() * pings.length)], 'Body check-in.');
}

export async function summarizeDayLowOverwhelm(
  events: string[],
): Promise<TinyActionOutput> {
  return fallbackTinyAction(
    'Rest now. Tomorrow can wait.',
    `Today had ${events.length} moments. That is enough data.`,
  );
}

export async function rankTasksByCapacity(
  tasks: Array<{ title: string; capacityDemand: number }>,
  capacityScore: number,
): Promise<TinyActionOutput> {
  const suitable = tasks.filter((t) => t.capacityDemand <= capacityScore + 20);
  const pick = suitable[0] ?? tasks[0];
  return fallbackTinyAction(
    pick ? `Start: ${pick.title}` : 'Rest — no tasks fit your capacity.',
    'Matched to your energy level.',
  );
}

export async function createLeavingChecklist(
  destination: string,
  purpose: string,
): Promise<TinyActionOutput> {
  return {
    summary: `Leaving for ${destination}: ${purpose}`,
    tinyNextAction: 'Keys, phone, wallet — grab those three.',
    cards: [
      { title: 'Checklist', body: 'Keys · Phone · Wallet · Water', type: 'checklist' },
    ],
  };
}

export async function startStabilizeFirstFlow(
  context: LocalAIContext,
): Promise<TinyActionOutput> {
  return fallbackTinyAction(
    pickFallback(CRISIS_FALLBACKS),
    'Pause. No big decisions right now.',
  );
}

export async function releaseModel(): Promise<void> {
  if (llamaContext) {
    await llamaContext.release();
    llamaContext = null;
    modelReady = false;
  }
}
