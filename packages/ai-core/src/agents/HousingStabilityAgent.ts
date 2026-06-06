import { BaseAgent } from './BaseAgent';

export class HousingStabilityAgent extends BaseAgent {
  type = 'housing' as const;
  defaultAction = 'Check when rent or your next housing deadline is due.';
  defaultSummary = 'Housing stability starts with knowing the next date.';
}
