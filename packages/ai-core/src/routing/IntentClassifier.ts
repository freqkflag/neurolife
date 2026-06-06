import type { SpecialistType } from '../types';

const INTENT_MAP: Array<{ patterns: RegExp[]; specialist: SpecialistType }> = [
  {
    patterns: [/afford|money|budget|spend|payday|bill|rent|debt|subscription/i],
    specialist: 'budget',
  },
  {
    patterns: [/letter|mail|document|form|deadline|paperwork|scary/i],
    specialist: 'admin_paperwork',
  },
  {
    patterns: [/disability|benefits|insurance|ltd|accommodation|symptom|provider/i],
    specialist: 'disability_benefits',
  },
  {
    patterns: [/eat|food|meal|grocery|pantry|hungry|water|medication/i],
    specialist: 'food_body',
  },
  {
    patterns: [/housing|rent|utility|move|maintenance|apartment|lease/i],
    specialist: 'housing',
  },
  {
    patterns: [/stuck|task|routine|brain dump|overwhelm|chaos|priority/i],
    specialist: 'task_routine',
  },
  {
    patterns: [/rsd|reject|hate me|message|reply|boundary|communication/i],
    specialist: 'rsd_communication',
  },
  {
    patterns: [/panic|meltdown|shutdown|crisis|stabilize|can't cope|emergency/i],
    specialist: 'crisis_stabilization',
  },
];

export function classifyIntent(input: string): SpecialistType {
  for (const { patterns, specialist } of INTENT_MAP) {
    if (patterns.some((p) => p.test(input))) {
      return specialist;
    }
  }
  return 'task_routine';
}
