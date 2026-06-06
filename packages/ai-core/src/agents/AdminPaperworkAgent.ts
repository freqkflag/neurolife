import { BaseAgent } from './BaseAgent';

export class AdminPaperworkAgent extends BaseAgent {
  type = 'admin_paperwork' as const;
  defaultAction = 'Open the document and read just the first paragraph.';
  defaultSummary = 'Scary mail is manageable one line at a time.';
}
