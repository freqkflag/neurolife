import { BaseAgent } from './BaseAgent';

export class FoodBodyNeedsAgent extends BaseAgent {
  type = 'food_body' as const;
  defaultAction = 'Grab something easy — crackers, fruit, or a drink.';
  defaultSummary = 'Your body needs fuel. Something small counts.';
}
