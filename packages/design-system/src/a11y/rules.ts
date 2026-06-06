import { SHAME_PATTERNS } from '@neurolife/shared';

export const MAX_PRIMARY_ACTIONS_STRESS_SCREEN = 1;
export const MAX_DASHBOARD_ELEMENTS_MOBILE = 10;

export function containsShameLanguage(text: string): boolean {
  return SHAME_PATTERNS.some((pattern) => pattern.test(text));
}

export function validateCalmCopy(text: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (containsShameLanguage(text)) {
    issues.push('Contains shame-inducing language');
  }
  if (text.length > 500) {
    issues.push('Text is too long — may overwhelm');
  }
  if (/!!!|URGENT|CRITICAL|FAIL/i.test(text) && !/emergency services/i.test(text)) {
    issues.push('Contains panic-inducing language');
  }
  return { valid: issues.length === 0, issues };
}

export const escapeHatchLabels = {
  pause: 'Pause',
  notNow: 'Not now',
  delay5m: 'Delay by 5m',
  saveMySpot: 'Save my spot',
} as const;
