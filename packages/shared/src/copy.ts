import { TINY_ACTION_MAX_WORDS } from './constants';

export function formatTinyAction(action: string): string {
  const words = action.trim().split(/\s+/);
  if (words.length <= TINY_ACTION_MAX_WORDS) return action.trim();
  return words.slice(0, TINY_ACTION_MAX_WORDS).join(' ') + '…';
}

export function avoidShameLanguage(text: string): string {
  return text
    .replace(/you should have/gi, 'next time you could')
    .replace(/why didn't you/gi, 'if helpful, consider')
    .replace(/you failed/gi, 'this was hard')
    .replace(/lazy/gi, 'low capacity')
    .replace(/irresponsible/gi, 'overwhelmed');
}

export function capacityLabel(score: number): string {
  if (score < 30) return 'Low capacity — gentle mode';
  if (score < 60) return 'Medium capacity';
  return 'Good capacity today';
}

export function sensoryLabel(load: number): string {
  if (load >= 80) return 'High sensory load — consider a break';
  if (load >= 50) return 'Moderate sensory load';
  return 'Sensory load okay';
}
