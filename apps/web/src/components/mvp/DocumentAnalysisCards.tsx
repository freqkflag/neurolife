'use client';

import { TinyNextActionCard } from '@neurolife/design-system';
import { cardClass, cardStyle, formatDate } from './ui';

export interface AnalysisCard {
  title: string;
  body: string;
  type?: string;
}

export interface DocumentAnalysisResult {
  summary?: string;
  tinyNextAction?: string;
  requiredAction?: string;
  deadlineText?: string | null;
  deadline?: string | null;
  status?: string;
  cards?: AnalysisCard[];
  missingInfo?: string[];
}

interface DocumentAnalysisCardsProps {
  result: DocumentAnalysisResult;
}

export function DocumentAnalysisCards({ result }: DocumentAnalysisCardsProps) {
  const cards = result.cards ?? [];
  const summaryCard = cards.find((c) => c.type === 'summary' || /summary/i.test(c.title));
  const deadlineCard = cards.find((c) => c.type === 'deadline' || /deadline/i.test(c.title));
  const actionCard = cards.find((c) => c.type === 'action' || /action|required/i.test(c.title));
  const missingCard = cards.find((c) => c.type === 'missing' || /missing/i.test(c.title));

  const isPending =
    result.status === 'ocr_unavailable' ||
    result.status === 'failed' ||
    result.status === 'empty';

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className={cardClass} style={cardStyle}>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
            Status
          </p>
          <p className="text-sm">{result.summary ?? missingCard?.body ?? 'Extraction could not complete.'}</p>
        </div>
        <div className={cardClass} style={cardStyle}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {result.requiredAction ??
              'Paste the first paragraph into Scary Mail, or try a TXT/MD file for full analysis.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className={cardClass} style={cardStyle}>
        <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
          Summary
        </p>
        <p className="text-sm">{summaryCard?.body ?? result.summary}</p>
      </div>
      <div className={cardClass} style={cardStyle}>
        <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
          Deadlines
        </p>
        <p className="text-sm">
          {result.deadlineText ??
            deadlineCard?.body ??
            (result.deadline ? formatDate(result.deadline) : 'No clear deadline found — check the original.')}
        </p>
      </div>
      <div className={cardClass} style={cardStyle}>
        <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
          Required action
        </p>
        <p className="text-sm">{result.requiredAction ?? actionCard?.body ?? 'Review the summary and note any dates.'}</p>
      </div>
      {(missingCard || (result.missingInfo && result.missingInfo.length > 0)) && (
        <div className={cardClass} style={cardStyle}>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
            Missing info
          </p>
          <p className="text-sm">{missingCard?.body ?? result.missingInfo?.join(' ')}</p>
        </div>
      )}
      {result.tinyNextAction && <TinyNextActionCard action={result.tinyNextAction} />}
    </div>
  );
}
