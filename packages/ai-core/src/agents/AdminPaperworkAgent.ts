import { RuleBasedProvider } from '../providers/RuleBasedProvider';
import {
  analyzeDocumentTextLocally,
  extractDocumentBodyFromPrompt,
} from '../utils/documentTextAnalysis';
import type { TinyActionOutput } from '../schemas/output';
import type { AgentRequest } from '../types';
import { BaseAgent } from './BaseAgent';

export class AdminPaperworkAgent extends BaseAgent {
  type = 'admin_paperwork' as const;
  defaultAction = 'Open the document and read just the first paragraph.';
  defaultSummary = 'Scary mail is manageable one line at a time.';

  async process(request: AgentRequest): Promise<TinyActionOutput> {
    if (this.provider instanceof RuleBasedProvider) {
      const body = extractDocumentBodyFromPrompt(request.input);
      if (body.length > 40) {
        return this.sanitize(analyzeDocumentTextLocally(body));
      }
    }
    return super.process(request);
  }
}
