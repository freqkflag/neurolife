import { BaseAgent } from './BaseAgent';

export class RSDCommunicationAgent extends BaseAgent {
  type = 'rsd_communication' as const;
  defaultAction = 'Wait 10 minutes before replying to that message.';
  defaultSummary = 'One grounded read: their tone may not mean what it feels like.';
}
