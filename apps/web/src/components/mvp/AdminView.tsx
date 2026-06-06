'use client';

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

interface AdminTask {
  id: string;
  title: string;
  description?: string | null;
  deadline?: string | null;
  category?: string | null;
  status: string;
}

interface DisabilityNote {
  id: string;
  title: string;
  content: string;
  date: string;
  providerName?: string | null;
}

function AdminContent({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [notes, setNotes] = useState<DisabilityNote[]>([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('paperwork');
  const [nextAction, setNextAction] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, n] = await Promise.all([
        apiFetch<AdminTask[]>('/admin/tasks', { token }),
        apiFetch<DisabilityNote[]>('/admin/disability', { token }),
      ]);
      setTasks(t);
      setNotes(n);
      setError(null);
    } catch {
      setError('Could not load admin data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const addTask = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await apiFetch('/admin/tasks', {
        method: 'POST',
        token,
        body: JSON.stringify({
          title: title.trim(),
          deadline: dueDate || undefined,
          category,
          description: nextAction.trim() || undefined,
        }),
      });
      setTitle('');
      setDueDate('');
      setNextAction('');
      await load();
    } catch {
      setError('Could not add admin task.');
    } finally {
      setSaving(false);
    }
  };

  const addNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    setSaving(true);
    try {
      await apiFetch('/admin/disability', {
        method: 'POST',
        token,
        body: JSON.stringify({
          title: noteTitle.trim(),
          content: noteContent.trim(),
          date: new Date().toISOString(),
        }),
      });
      setNoteTitle('');
      setNoteContent('');
      await load();
    } catch {
      setError('Could not save disability note.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CalmLoading message="Loading admin tasks…" />;

  const pending = tasks.filter((t) => t.status === 'PENDING');

  return (
    <PageShell
      title="Admin & Paperwork"
      purpose="Track forms, calls, and disability-related admin without losing the thread."
      status={`${pending.length} open task${pending.length === 1 ? '' : 's'} · ${notes.length} disability note${notes.length === 1 ? '' : 's'}`}
      tinyAction={pending[0]?.description ?? pending[0]?.title ?? 'List one admin task that matters today.'}
    >
      {error && (
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {error}
        </p>
      )}

      <form
        onSubmit={preventDefaultSubmit(addTask)}
        className={`${cardClass} mb-8 flex flex-col gap-3 max-w-lg`}
        style={cardStyle}
      >
        <p className="font-medium text-sm">Add admin task</p>
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} style={inputStyle} required />
        </Field>
        <Field label="Due date">
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} style={inputStyle} />
        </Field>
        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} style={inputStyle}>
            <option value="paperwork">Paperwork</option>
            <option value="phone-call">Phone call</option>
            <option value="benefits">Benefits</option>
            <option value="medical">Medical</option>
            <option value="housing">Housing</option>
          </select>
        </Field>
        <Field label="Tiny next action">
          <input value={nextAction} onChange={(e) => setNextAction(e.target.value)} className={inputClass} style={inputStyle} placeholder="e.g. Find the case number" />
        </Field>
        <SubmitButton loading={saving} label="Add task" />
      </form>

      <h2 className="text-lg font-medium mb-3">Admin tasks</h2>
      <ItemList
        items={tasks}
        empty="No admin tasks yet. Add one small paperwork step."
        render={(task: AdminTask) => (
          <div className="text-sm">
            <p className="font-medium">{task.title}</p>
            <p style={{ color: 'var(--text-muted)' }}>
              {task.category ?? 'general'} · {task.status}
              {task.deadline ? ` · due ${formatDate(task.deadline)}` : ''}
            </p>
            {task.description && <p className="mt-1">{task.description}</p>}
          </div>
        )}
      />

      <section className="mt-10">
        <h2 className="text-lg font-medium mb-3">Disability tracker</h2>
        <form
          onSubmit={preventDefaultSubmit(addNote)}
          className={`${cardClass} mb-6 flex flex-col gap-3 max-w-lg`}
          style={cardStyle}
        >
          <Field label="Note title">
            <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className={inputClass} style={inputStyle} />
          </Field>
          <Field label="What happened / what to remember">
            <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} rows={3} className={inputClass} style={inputStyle} />
          </Field>
          <SubmitButton loading={saving} label="Save note" />
        </form>
        <ItemList
          items={notes}
          empty="No disability notes yet."
          render={(note: DisabilityNote) => (
            <div className="text-sm">
              <p className="font-medium">{note.title}</p>
              <p style={{ color: 'var(--text-muted)' }}>{formatDate(note.date)}</p>
              <p className="mt-1">{note.content}</p>
            </div>
          )}
        />
      </section>
    </PageShell>
  );
}

export function AdminView() {
  return <AuthGate>{(token) => <AdminContent token={token} />}</AuthGate>;
}
