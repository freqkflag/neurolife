'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { AIOrchestrator } from '@neurolife/ai-core';
import type { SpecialistType } from '@neurolife/ai-core';
import { TinyNextActionCard } from '@neurolife/design-system';

const SPECIALISTS: { id: SpecialistType; label: string }[] = [
  { id: 'budget', label: 'Budget' },
  { id: 'admin_paperwork', label: 'Admin & Paperwork' },
  { id: 'disability_benefits', label: 'Disability / Benefits' },
  { id: 'food_body', label: 'Food & Body' },
  { id: 'housing', label: 'Housing' },
  { id: 'task_routine', label: 'Tasks & Routines' },
  { id: 'rsd_communication', label: 'RSD & Communication' },
  { id: 'crisis_stabilization', label: 'Crisis Stabilization' },
];

const localOrchestrator = new AIOrchestrator();

export function SpecialistAIWorkspace() {
  const [active, setActive] = useState<SpecialistType>('budget');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<{ summary: string; tinyNextAction: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const token = getAccessToken();
      const result = await apiFetch<{ specialist: SpecialistType; output: { summary: string; tinyNextAction: string } }>(
        '/ai/chat',
        {
          method: 'POST',
          token: token ?? undefined,
          body: JSON.stringify({
            input,
            specialist: active,
            consentGiven: true,
          }),
        },
      );
      setOutput(result.output);
    } catch (e) {
      console.warn('Backend AI failed, falling back to client-side rule-based orchestration:', e);
      try {
        const result = await localOrchestrator.route(input, {
          capacity: { score: 50 },
          sensory: { load: 30 },
          platform: 'web',
          privacyMode: 'HYBRID',
        }, { specialist: active });
        setOutput(result.output);
      } catch (err) {
        console.error('Local fallback failed:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-xl border p-6"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <h2 className="text-lg font-semibold mb-4">Specialist AI Workspace</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {SPECIALISTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s.id)}
            className="px-3 py-1.5 rounded-lg text-sm border"
            style={{
              background: active === s.id ? 'var(--accent)' : 'transparent',
              color: active === s.id ? 'var(--bg)' : 'var(--text-muted)',
              borderColor: 'var(--border)',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <textarea
        className="w-full rounded-lg border p-3 text-sm mb-3 min-h-24"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
        placeholder="What do you need help with?"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="px-4 py-2 rounded-lg text-sm"
        style={{ background: 'var(--accent)', color: 'var(--bg)' }}
      >
        {loading ? 'Thinking…' : 'Ask specialist'}
      </button>
      {output && (
        <div className="mt-6">
          <p className="text-sm mb-3" style={{ color: 'var(--text)' }}>
            {output.summary}
          </p>
          <TinyNextActionCard action={output.tinyNextAction} />
        </div>
      )}
    </div>
  );
}
