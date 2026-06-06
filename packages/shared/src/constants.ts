export const TINY_ACTION_MAX_WORDS = 15;

export const CAPACITY_LOW_THRESHOLD = 30;
export const CAPACITY_MEDIUM_THRESHOLD = 60;
export const SENSORY_HIGH_THRESHOLD = 80;

export const PROTECTED_BILL_CATEGORIES = [
  'rent',
  'food',
  'utilities',
  'phone',
  'pets',
  'transport',
  'medication',
] as const;

export const SHAME_PATTERNS = [
  /you should have/i,
  /why didn't you/i,
  /you failed/i,
  /lazy/i,
  /irresponsible/i,
  /shame/i,
  /pathetic/i,
];
