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

interface Task {
  id: string;
  title: string;
  description?: string | null;
  tinyStep?: string | null;
  capacityDemand: number;
  dueDate?: string | null;
  completedAt?: string | null;
}

function TasksContent({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('life-admin');
  const [energy, setEnergy] = useState('50');
  const [nextAction, setNextAction] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<Task[]>('/tasks', { token });
      setTasks(res);
      setError(null);
    } catch {
      setError('Could not load tasks.');
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
      await apiFetch('/tasks', {
        method: 'POST',
        token,
        body: JSON.stringify({
          title: title.trim(),
          description: category,
          tinyStep: nextAction.trim() || undefined,
          capacityDemand: Number(energy),
        }),
      });
      setTitle('');
      setNextAction('');
      await load();
    } catch {
      setError('Could not add task.');
    } finally {
      setSaving(false);
    }
  };

  const completeTask = async (id: string) => {
    try {
      await apiFetch(`/tasks/${id}/complete`, { method: 'PATCH', token });
      await load();
    } catch {
      setError('Could not complete task.');
    }
  };

  if (loading) return <CalmLoading message="Loading tasks…" />;

  const open = tasks.filter((t) => !t.completedAt);

  return (
    <PageShell
      title="Tasks"
      purpose="One task at a time. Energy-aware, no guilt."
      status={`${open.length} open task${open.length === 1 ? '' : 's'}`}
      tinyAction={open[0]?.tinyStep ?? open[0]?.title ?? 'Only one task matters right now.'}
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
        <p className="font-medium text-sm">Add task</p>
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} style={inputStyle} required />
        </Field>
        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} style={inputStyle}>
            <option value="life-admin">Life admin</option>
            <option value="health">Health</option>
            <option value="home">Home</option>
            <option value="money">Money</option>
            <option value="social">Social</option>
          </select>
        </Field>
        <Field label="Energy needed (0–100)">
          <input type="number" min={0} max={100} value={energy} onChange={(e) => setEnergy(e.target.value)} className={inputClass} style={inputStyle} />
        </Field>
        <Field label="Tiny next action">
          <input value={nextAction} onChange={(e) => setNextAction(e.target.value)} className={inputClass} style={inputStyle} placeholder="Smallest first step" />
        </Field>
        <SubmitButton loading={saving} label="Add task" />
      </form>

      <ItemList
        items={open}
        empty="No open tasks. Add one small thing or take a rest."
        render={(task: Task) => (
          <div className="flex justify-between gap-4 text-sm">
            <div>
              <p className="font-medium">{task.title}</p>
              <p style={{ color: 'var(--text-muted)' }}>
                {task.description ?? 'general'} · energy {task.capacityDemand}
                {task.dueDate ? ` · due ${formatDate(task.dueDate)}` : ''}
              </p>
              {task.tinyStep && <p className="mt-1">{task.tinyStep}</p>}
            </div>
            <button
              type="button"
              onClick={() => void completeTask(task.id)}
              className="text-xs shrink-0 underline"
              style={{ color: 'var(--accent)' }}
            >
              Done
            </button>
          </div>
        )}
      />
    </PageShell>
  );
}

export function TasksView() {
  return <AuthGate>{(token) => <TasksContent token={token} />}</AuthGate>;
}
