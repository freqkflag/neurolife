import { BaseAgent } from './BaseAgent';

export class DisabilityBenefitsAgent extends BaseAgent {
  type = 'disability_benefits' as const;
  defaultAction = 'Write down one symptom or limit you want to mention.';
  defaultSummary = 'Preparing facts helps — you do not need to decide anything today.';
}
