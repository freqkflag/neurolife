import { BaseAgent } from './BaseAgent';

export class BudgetAgent extends BaseAgent {
  type = 'budget' as const;
  defaultAction = 'Check your balance and note one bill due soon.';
  defaultSummary = 'Money can feel heavy. One small step is enough.';
}
