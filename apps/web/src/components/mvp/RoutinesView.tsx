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
  inputClass,
  inputStyle,
  preventDefaultSubmit,
} from './ui';

interface RoutineStep {
  id: string;
  title: string;
  order: number;
}

interface Routine {
  id: string;
  name: string;
  description?: string | null;
  steps: RoutineStep[];
}

function RoutinesContent({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [title, setTitle] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [firstStep, setFirstStep] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<Routine[]>('/tasks/routines', { token });
      setRoutines(res);
      setError(null);
    } catch {
      setError('Could not load routines.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const addRoutine = async () => {
    if (!title.trim() || !firstStep.trim()) return;
    setSaving(true);
    try {
      await apiFetch('/tasks/routines', {
        method: 'POST',
        token,
        body: JSON.stringify({
          name: title.trim(),
          description: `Time: ${timeOfDay}`,
          steps: [{ title: firstStep.trim(), order: 0 }],
        }),
      });
      setTitle('');
      setFirstStep('');
      await load();
    } catch {
      setError('Could not add routine.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CalmLoading message="Loading routines…" />;

  return (
    <PageShell
      title="Routines"
      purpose="Step-by-step flows for hard transitions — start with just the first step."
      status={`${routines.length} active routine${routines.length === 1 ? '' : 's'}`}
      tinyAction={routines[0]?.steps[0]?.title ?? 'Build one small morning or bedtime routine.'}
    >
      {error && (
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {error}
        </p>
      )}

      <form
        onSubmit={preventDefaultSubmit(addRoutine)}
        className={`${cardClass} mb-8 flex flex-col gap-3 max-w-lg`}
        style={cardStyle}
      >
        <p className="font-medium text-sm">Add routine</p>
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} style={inputStyle} required />
        </Field>
        <Field label="Time of day">
          <select value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} className={inputClass} style={inputStyle}>
            <option value="morning">Morning</option>
            <option value="midday">Midday</option>
            <option value="evening">Evening</option>
            <option value="bedtime">Bedtime</option>
            <option value="anytime">Anytime</option>
          </select>
        </Field>
        <Field label="First step only">
          <input value={firstStep} onChange={(e) => setFirstStep(e.target.value)} className={inputClass} style={inputStyle} required placeholder="e.g. Sit up" />
        </Field>
        <SubmitButton loading={saving} label="Add routine" />
      </form>

      <ItemList
        items={routines}
        empty="No routines yet. Start with one tiny first step."
        render={(routine: Routine) => (
          <div className="text-sm">
            <p className="font-medium">{routine.name}</p>
            {routine.description && (
              <p style={{ color: 'var(--text-muted)' }}>{routine.description}</p>
            )}
            <ol className="mt-2 list-decimal list-inside space-y-1">
              {routine.steps.map((step) => (
                <li key={step.id}>{step.title}</li>
              ))}
            </ol>
          </div>
        )}
      />
    </PageShell>
  );
}

export function RoutinesView() {
  return <AuthGate>{(token) => <RoutinesContent token={token} />}</AuthGate>;
}
