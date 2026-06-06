import type { TinyActionOutput } from '../schemas/output';

const DATE_PATTERN =
  /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/gi;

const ACTION_PATTERN =
  /must|required|please respond|due by|submit|action required|within \d+ days|respond by|failure to|penalty|overdue/i;

export function extractDocumentBodyFromPrompt(input: string): string {
  const scaryMarker = 'Summarize this scary mail safely';
  const analyzeMarker = 'Analyze this document for deadlines';
  if (input.includes(scaryMarker)) {
    const idx = input.indexOf(scaryMarker);
    const after = input.slice(idx + scaryMarker.length);
    const body = after.replace(/^[\s.:—-]+/, '').trim();
    return body.length > 20 ? body : input;
  }
  if (input.includes(analyzeMarker)) {
    const parts = input.split(/\n\n/);
    const body = parts[parts.length - 1]?.trim() ?? input;
    return body.length > 20 ? body : input;
  }
  return input;
}

export function analyzeDocumentTextLocally(text: string, docTitle?: string): TinyActionOutput {
  const clipped = text.slice(0, 8000).trim();
  const dates = [...new Set(clipped.match(DATE_PATTERN) ?? [])];

  const sentences = clipped
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);
  const summary =
    (sentences.slice(0, 2).join('. ') + (sentences.length ? '.' : '')).slice(0, 200) ||
    (docTitle
      ? `"${docTitle}" is saved. Review dates and actions below.`
      : 'Document captured. Review key dates and actions below.');

  const actionLines = clipped
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 8 && ACTION_PATTERN.test(l))
    .slice(0, 3);

  const missingInfo: string[] = [];
  if (dates.length === 0) missingInfo.push('No clear deadline found in the text.');
  if (actionLines.length === 0) {
    missingInfo.push('No explicit required actions detected — read the summary carefully.');
  }

  const deadlineBody = dates[0]
    ? `Possible date: ${dates[0]}`
    : 'No clear deadline found — check dates in the original.';

  const actionBody =
    actionLines[0] ?? 'Review the document and note any dates or amounts mentioned.';

  const cards = [
    { title: 'Summary', body: summary, type: 'summary' },
    { title: 'Deadlines', body: deadlineBody, type: 'deadline' },
    { title: 'Required actions', body: actionBody, type: 'action' },
  ];
  if (missingInfo.length > 0) {
    cards.push({ title: 'Missing info', body: missingInfo.join(' '), type: 'missing' });
  }

  const tinyNextAction = dates[0]
    ? `Mark ${dates[0]} on your calendar — one date only.`
    : 'Read just the first paragraph, then stop.';

  return {
    summary,
    tinyNextAction,
    uncertainty: dates.length > 0 && actionLines.length > 0 ? 'LOW' : 'MEDIUM',
    cards,
  };
}
