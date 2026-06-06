'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { DocumentAnalysisCards, type DocumentAnalysisResult } from './DocumentAnalysisCards';
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

function ScaryMailContent({ token }: { token: string }) {
  const [text, setText] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);
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
      const res = await apiFetch<DocumentAnalysisResult>('/documents/analyze-text', {
        method: 'POST',
        token,
        body: JSON.stringify({ content: text }),
      });
      setResult(res);
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
      const res = await apiFetch<DocumentAnalysisResult>(`/documents/${selectedDocId}/analyze`, {
        method: 'POST',
        token,
        body: JSON.stringify({}),
      });
      setResult(res);
    } catch {
      setError('Could not analyze document.');
    } finally {
      setLoading(false);
    }
  };

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

      {result && <DocumentAnalysisCards result={result} />}
    </PageShell>
  );
}

export function ScaryMailView() {
  return <AuthGate>{(token) => <ScaryMailContent token={token} />}</AuthGate>;
}
