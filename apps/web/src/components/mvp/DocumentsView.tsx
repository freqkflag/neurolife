'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CalmLoading } from '@neurolife/design-system';
import { apiFetch, apiUpload } from '@/lib/api';
import { DocumentAnalysisCards, type DocumentAnalysisResult } from './DocumentAnalysisCards';
import {
  AuthGate,
  Field,
  ItemList,
  PageShell,
  SubmitButton,
  btnClass,
  btnStyle,
  cardClass,
  cardStyle,
  formatDate,
  inputClass,
  inputStyle,
  preventDefaultSubmit,
} from './ui';

interface DocumentExtraction {
  summary: string;
  status?: string;
  deadline?: string | null;
  requiredActions?: string[];
  missingInfo?: string[];
  cards?: DocumentAnalysisResult['cards'];
  extractedAt?: string;
}

interface Document {
  id: string;
  title: string;
  fileName: string;
  docType: string;
  deadline?: string | null;
  notes?: string | null;
  isScaryMail: boolean;
  uploadedAt: string;
  extractions?: DocumentExtraction[];
}

function extractionStatusLabel(status?: string): string {
  switch (status) {
    case 'extracted':
      return 'Text extracted';
    case 'analyzed':
      return 'Analyzed';
    case 'ocr_unavailable':
      return 'OCR unavailable';
    case 'failed':
      return 'Extraction failed';
    case 'empty':
      return 'No text found';
    default:
      return 'Not analyzed yet';
  }
}

function DocumentsContent({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<Document[]>([]);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('letter');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [workingAction, setWorkingAction] = useState<'extract' | 'analyze' | null>(null);
  const [analysis, setAnalysis] = useState<Record<string, DocumentAnalysisResult>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<Document[]>('/documents', { token });
      setDocs(res);
      setError(null);
    } catch {
      setError('Could not load documents.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const uploadDocument = async () => {
    if (!file) {
      setError('Choose a file to upload.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      if (title.trim()) form.append('title', title.trim());
      form.append('docType', docType);
      if (deadline) form.append('deadline', deadline);
      if (notes.trim()) form.append('notes', notes.trim());
      form.append('isScaryMail', String(docType === 'scary-mail'));

      await apiUpload('/documents/upload', form, token);
      setTitle('');
      setDeadline('');
      setNotes('');
      setFile(null);
      await load();
    } catch {
      setError('Could not upload document. Check file type (PDF, PNG, JPG, TXT, MD) and size (max 10MB).');
    } finally {
      setUploading(false);
    }
  };

  const extractDocument = async (docId: string) => {
    setWorkingId(docId);
    setWorkingAction('extract');
    setError(null);
    try {
      const res = await apiFetch<DocumentAnalysisResult>(`/documents/${docId}/extract`, {
        method: 'POST',
        token,
        body: JSON.stringify({}),
      });
      setAnalysis((prev) => ({ ...prev, [docId]: res }));
      await load();
    } catch {
      setError('Could not extract text from this document.');
    } finally {
      setWorkingId(null);
      setWorkingAction(null);
    }
  };

  const analyzeDocument = async (docId: string) => {
    setWorkingId(docId);
    setWorkingAction('analyze');
    setError(null);
    try {
      const res = await apiFetch<DocumentAnalysisResult>(`/documents/${docId}/analyze`, {
        method: 'POST',
        token,
        body: JSON.stringify({}),
      });
      setAnalysis((prev) => ({ ...prev, [docId]: res }));
      await load();
    } catch {
      setError('Could not analyze this document.');
    } finally {
      setWorkingId(null);
      setWorkingAction(null);
    }
  };

  if (loading) return <CalmLoading message="Loading document vault…" />;

  return (
    <PageShell
      title="Document Vault"
      purpose="Upload important paperwork and get calm summaries when you're ready."
      status={`${docs.length} document${docs.length === 1 ? '' : 's'} saved`}
      tinyAction={docs.length ? 'Analyze your most urgent document.' : 'Upload your most urgent letter first.'}
    >
      {error && (
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {error}
        </p>
      )}

      <div className={`${cardClass} mb-6`} style={cardStyle}>
        <p className="text-sm">
          Scary mail?{' '}
          <Link href="/scary-mail" style={{ color: 'var(--accent)' }}>
            Summarize safely →
          </Link>
        </p>
      </div>

      <form
        onSubmit={preventDefaultSubmit(uploadDocument)}
        className={`${cardClass} mb-8 flex flex-col gap-3 max-w-lg`}
        style={cardStyle}
      >
        <p className="font-medium text-sm">Upload a document</p>
        <Field label="File (PDF, PNG, JPG, TXT, MD — max 10MB)">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt,.md,text/plain,text/markdown,application/pdf,image/png,image/jpeg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className={inputClass}
            style={inputStyle}
            required
          />
        </Field>
        {file && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
        <Field label="Title (optional)">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} style={inputStyle} placeholder="Defaults to filename" />
        </Field>
        <Field label="Type">
          <select value={docType} onChange={(e) => setDocType(e.target.value)} className={inputClass} style={inputStyle}>
            <option value="letter">Letter</option>
            <option value="bill">Bill / notice</option>
            <option value="medical">Medical</option>
            <option value="benefits">Benefits</option>
            <option value="scary-mail">Scary mail</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Deadline (optional)">
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} style={inputStyle} />
        </Field>
        <Field label="Notes (optional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={inputClass}
            style={inputStyle}
            placeholder="What is this about?"
          />
        </Field>
        <SubmitButton loading={uploading} label="Upload document" />
      </form>

      <ItemList
        items={docs}
        empty="Upload your most urgent letter first."
        render={(doc: Document) => {
          const latest = doc.extractions?.[0];
          const result = analysis[doc.id] ?? (latest ? {
            summary: latest.summary,
            status: latest.status,
            deadline: latest.deadline,
            cards: latest.cards,
            missingInfo: latest.missingInfo,
            requiredAction: latest.requiredActions?.[0],
          } : null);

          return (
            <div className="text-sm space-y-3">
              <div className="flex flex-wrap justify-between gap-2 items-start">
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p style={{ color: 'var(--text-muted)' }}>
                    {doc.fileName} · {doc.docType} · uploaded {formatDate(doc.uploadedAt)}
                  </p>
                  {doc.deadline && (
                    <p style={{ color: 'var(--text-muted)' }}>Deadline: {formatDate(doc.deadline)}</p>
                  )}
                  {latest?.status && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Extraction: {extractionStatusLabel(latest.status)}
                      {latest.extractedAt ? ` · ${formatDate(latest.extractedAt)}` : ''}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={workingId === doc.id}
                    onClick={() => void extractDocument(doc.id)}
                    className={btnClass}
                    style={btnStyle}
                  >
                    {workingId === doc.id && workingAction === 'extract' ? 'Extracting…' : 'Extract text'}
                  </button>
                  <button
                    type="button"
                    disabled={workingId === doc.id}
                    onClick={() => void analyzeDocument(doc.id)}
                    className={btnClass}
                    style={btnStyle}
                  >
                    {workingId === doc.id && workingAction === 'analyze' ? 'Analyzing…' : 'Analyze'}
                  </button>
                </div>
              </div>

              {result && <DocumentAnalysisCards result={result} />}
            </div>
          );
        }}
      />
    </PageShell>
  );
}

export function DocumentsView() {
  return <AuthGate>{(token) => <DocumentsContent token={token} />}</AuthGate>;
}
