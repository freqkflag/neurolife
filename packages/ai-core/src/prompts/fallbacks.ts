import type { TinyActionOutput } from '../schemas/output';

export function fallbackTinyAction(action: string, summary?: string): TinyActionOutput {
  return {
    summary: summary ?? 'Here is one small step you can take.',
    tinyNextAction: action,
    uncertainty: 'LOW',
  };
}

export const STUCK_FALLBACKS = [
  'Take one slow breath.',
  'Drink a sip of water.',
  'Stand up and stretch for 10 seconds.',
  'Put one thing within arm\'s reach.',
  'Open the window or adjust the light.',
];

export const CRISIS_FALLBACKS = [
  'Pause. Put both feet on the floor.',
  'Name 3 things you can see.',
  'Drink water if you can reach it.',
  'No big decisions right now — just breathe.',
];

export function pickFallback(actions: string[]): string {
  return actions[Math.floor(Math.random() * actions.length)];
}
