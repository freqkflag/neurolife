'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CalmLoading } from '@neurolife/design-system';
import { apiFetch } from '@/lib/api';
import {
  AuthGate,
  Field,
  ItemList,
  PageShell,
  SubmitButton,
  cardClass,
  cardStyle,
  formatDate,
  inputClass,
  inputStyle,
  preventDefaultSubmit,
} from './ui';

interface Document {
  id: string;
  title: string;
  fileName: string;
  isScaryMail: boolean;
  uploadedAt: string;
  extractions?: Array<{ summary: string; deadline?: string | null }>;
}

function DocumentsContent({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<Document[]>([]);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('letter');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
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

  const addDocument = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const slug = title.trim().toLowerCase().replace(/\s+/g, '-');
      await apiFetch('/documents', {
        method: 'POST',
        token,
        body: JSON.stringify({
          title: title.trim(),
          fileName: `${slug}.txt`,
          mimeType: 'text/plain',
          storageKey: `local://${slug}-${Date.now()}`,
          isScaryMail: docType === 'scary-mail',
          aiConsentGiven: true,
        }),
      });
      setTitle('');
      setDeadline('');
      setNotes('');
      await load();
    } catch {
      setError('Could not save document metadata.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CalmLoading message="Loading document vault…" />;

  return (
    <PageShell
      title="Document Vault"
      purpose="Store important paperwork metadata in one calm place."
      status={`${docs.length} document${docs.length === 1 ? '' : 's'} saved`}
      tinyAction={docs.length ? 'Open one document and note its deadline.' : 'Add your most urgent letter first.'}
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
        onSubmit={preventDefaultSubmit(addDocument)}
        className={`${cardClass} mb-8 flex flex-col gap-3 max-w-lg`}
        style={cardStyle}
      >
        <p className="font-medium text-sm">Add document metadata</p>
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} style={inputStyle} required />
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
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          File upload coming soon — metadata is saved now.
        </p>
        <SubmitButton loading={saving} label="Save document" />
      </form>

      <ItemList
        items={docs}
        empty="No documents yet. Add a title to start your vault."
        render={(doc: Document) => (
          <div className="text-sm">
            <p className="font-medium">{doc.title}</p>
            <p style={{ color: 'var(--text-muted)' }}>
              {doc.fileName} · added {formatDate(doc.uploadedAt)}
              {doc.isScaryMail ? ' · scary mail' : ''}
            </p>
            {doc.extractions?.[0] && (
              <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
                {doc.extractions[0].summary}
              </p>
            )}
          </div>
        )}
      />
    </PageShell>
  );
}

export function DocumentsView() {
  return <AuthGate>{(token) => <DocumentsContent token={token} />}</AuthGate>;
}
