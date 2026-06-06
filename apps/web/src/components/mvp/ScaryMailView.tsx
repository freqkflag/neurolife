'use client';

import { useState } from 'react';
import { TinyNextActionCard } from '@neurolife/design-system';
import { apiFetch } from '@/lib/api';
import { AuthGate, Field, PageShell, SubmitButton, cardClass, cardStyle, inputClass, inputStyle, preventDefaultSubmit } from './ui';

interface AiCard {
  title: string;
  body: string;
  type?: string;
}

interface AiResult {
  specialist: string;
  output: {
    summary: string;
    tinyNextAction: string;
    cards?: AiCard[];
  };
}

function ScaryMailContent({ token }: { token: string }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AiResult['output'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<AiResult>('/ai/chat', {
        method: 'POST',
        token,
        body: JSON.stringify({
          input: `Summarize this scary mail safely. Extract deadlines and one tiny next action.\n\n${text}`,
          specialist: 'admin_paperwork',
          consentGiven: true,
        }),
      });
      setResult(res.output);
    } catch {
      setError('Could not summarize. Check API connection or try again.');
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
      status={result ? 'Summary ready — read one card at a time.' : 'Paste text from a letter or email.'}
      tinyAction={result?.tinyNextAction ?? 'Paste the first paragraph only, if that feels easier.'}
    >
      <form
        onSubmit={preventDefaultSubmit(summarize)}
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
        <SubmitButton loading={loading} label="Summarize safely" />
      </form>

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
            <p className="text-sm">{deadlineCard?.body ?? 'No clear deadline found — check dates in the original.'}</p>
          </div>
          <div className={cardClass} style={cardStyle}>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              Required action
            </p>
            <p className="text-sm">{actionCard?.body ?? result.cards?.[0]?.body ?? 'Review the summary and note any dates.'}</p>
          </div>
          <TinyNextActionCard action={result.tinyNextAction} />
        </div>
      )}
    </PageShell>
  );
}

export function ScaryMailView() {
  return <AuthGate>{(token) => <ScaryMailContent token={token} />}</AuthGate>;
}
