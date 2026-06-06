'use client';

import { useCallback, useEffect, useState } from 'react';
import { TinyNextActionCard } from '@neurolife/design-system';
import { apiFetch } from '@/lib/api';
import {
  AuthGate,
  Field,
  PageShell,
  SubmitButton,
  cardClass,
  cardStyle,
  inputClass,
  inputStyle,
  preventDefaultSubmit,
} from './ui';

interface Document {
  id: string;
  title: string;
  fileName: string;
}

interface AiCard {
  title: string;
  body: string;
  type?: string;
}

interface AiChatResult {
  specialist: string;
  output: {
    summary: string;
    tinyNextAction: string;
    cards?: AiCard[];
  };
}

interface AnalyzeResult {
  summary: string;
  tinyNextAction: string;
  requiredAction?: string;
  deadlineText?: string | null;
  status?: string;
  cards?: AiCard[];
}

function ScaryMailContent({ token }: { token: string }) {
  const [text, setText] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocs = useCallback(async () => {
    try {
      const res = await apiFetch<Document[]>('/documents', { token });
      setDocuments(res);
    } catch {
      setDocuments([]);
    }
  }, [token]);

  useEffect(() => {
    void loadDocs();
  }, [loadDocs]);

  const summarizePasted = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<AiChatResult>('/ai/chat', {
        method: 'POST',
        token,
        body: JSON.stringify({
          input: `Summarize this scary mail safely. Extract deadlines and one tiny next action.\n\n${text}`,
          specialist: 'admin_paperwork',
          consentGiven: true,
        }),
      });
      setResult({
        summary: res.output.summary,
        tinyNextAction: res.output.tinyNextAction,
        requiredAction: res.output.cards?.find((c) => /action|required/i.test(c.title))?.body,
        deadlineText: res.output.cards?.find((c) => c.type === 'deadline' || /deadline/i.test(c.title))?.body,
        cards: res.output.cards,
      });
    } catch {
      setError('Could not summarize. Check API connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeSelected = async () => {
    if (!selectedDocId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<AnalyzeResult>(`/documents/${selectedDocId}/analyze`, {
        method: 'POST',
        token,
        body: JSON.stringify({}),
      });
      setResult(res);
      if (res.status === 'pending_extraction') {
        setText('');
      }
    } catch {
      setError('Could not analyze document.');
    } finally {
      setLoading(false);
    }
  };

  const deadlineCard = result?.cards?.find((c) => c.type === 'deadline' || /deadline/i.test(c.title));
  const actionCard = result?.cards?.find((c) => /action|required/i.test(c.title));

  return (
    <PageShell
      title="Scary Mail"
      purpose="Turn overwhelming letters into plain facts and one small step."
      status={result ? 'Summary ready — read one card at a time.' : 'Paste text or pick an uploaded document.'}
      tinyAction={result?.tinyNextAction ?? 'Paste the first paragraph only, if that feels easier.'}
    >
      <form
        onSubmit={preventDefaultSubmit(summarizePasted)}
        className={`${cardClass} mb-6 flex flex-col gap-3`}
        style={cardStyle}
      >
        <Field label="Paste letter or email text">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className={inputClass}
            style={inputStyle}
            placeholder="Paste the scary part here. You do not have to read it all at once."
          />
        </Field>
        <SubmitButton loading={loading && !selectedDocId} label="Summarize pasted text" />
      </form>

      {documents.length > 0 && (
        <form
          onSubmit={preventDefaultSubmit(analyzeSelected)}
          className={`${cardClass} mb-6 flex flex-col gap-3`}
          style={cardStyle}
        >
          <Field label="Or analyze an uploaded document">
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">Choose a document…</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} ({doc.fileName})
                </option>
              ))}
            </select>
          </Field>
          <SubmitButton loading={loading && !!selectedDocId} label="Analyze selected document" />
        </form>
      )}

      {error && (
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {error}
        </p>
      )}

      {result && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className={cardClass} style={cardStyle}>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              What it says
            </p>
            <p className="text-sm">{result.summary}</p>
          </div>
          <div className={cardClass} style={cardStyle}>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              Deadlines
            </p>
            <p className="text-sm">
              {result.deadlineText ?? deadlineCard?.body ?? 'No clear deadline found — check dates in the original.'}
            </p>
          </div>
          <div className={cardClass} style={cardStyle}>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              Required action
            </p>
            <p className="text-sm">
              {result.requiredAction ?? actionCard?.body ?? result.cards?.[0]?.body ?? 'Review the summary and note any dates.'}
            </p>
          </div>
          {result.status === 'pending_extraction' ? (
            <div className={cardClass} style={cardStyle}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                File saved. Text extraction for this file type is next.
              </p>
            </div>
          ) : (
            <TinyNextActionCard action={result.tinyNextAction} />
          )}
        </div>
      )}
    </PageShell>
  );
}

export function ScaryMailView() {
  return <AuthGate>{(token) => <ScaryMailContent token={token} />}</AuthGate>;
}
