'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CapacityBattery, CalmLoading, TinyNextActionCard } from '@neurolife/design-system';
import { SafeToSpendCard } from '@/components/SafeToSpendCard';
import { SpecialistAIWorkspace } from '@/components/SpecialistAIWorkspace';
import { apiFetch } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

interface CapacityResponse {
  capacity: { score: number };
}

interface SafeToSpendResponse {
  safeToSpend: number;
  currentBalance: number;
  budgetRiskLevel: string;
  tinyNextAction: string;
  summary: string;
}

interface Task {
  id: string;
  title: string;
  tinyStep?: string | null;
  completedAt?: string | null;
}

export function DashboardView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [capacityScore, setCapacityScore] = useState(50);
  const [safeToSpend, setSafeToSpend] = useState<SafeToSpendResponse | null>(null);
  const [tinyAction, setTinyAction] = useState('Check one bill or appointment today.');

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [capacity, budget, tasks] = await Promise.all([
          apiFetch<CapacityResponse>('/capacity', { token }),
          apiFetch<SafeToSpendResponse>('/budget/safe-to-spend', { token }),
          apiFetch<Task[]>('/tasks', { token }),
        ]);

        setCapacityScore(capacity.capacity?.score ?? 50);
        setSafeToSpend(budget);

        const openTask = tasks.find((t) => !t.completedAt);
        if (openTask?.tinyStep) setTinyAction(openTask.tinyStep);
        else if (openTask?.title) setTinyAction(openTask.title);
        else if (budget.tinyNextAction) setTinyAction(budget.tinyNextAction);

        setError(null);
      } catch {
        setError('Could not load dashboard data. Is the API running on port 3001?');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const token = typeof window !== 'undefined' ? getAccessToken() : null;

  if (!token) {
    return (
      <div
        className="rounded-xl border p-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <p className="mb-4" style={{ color: 'var(--text)' }}>
          Sign in to load your capacity, safe-to-spend, and tasks from the API.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (loading) {
    return <CalmLoading message="Loading your command center…" />;
  }

  return (
    <div>
      {error && (
        <p
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          {error}
        </p>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <CapacityBattery score={capacityScore} />
        <SafeToSpendCard
          safeToSpend={safeToSpend?.safeToSpend ?? 0}
          currentBalance={safeToSpend?.currentBalance ?? 0}
          budgetRiskLevel={safeToSpend?.budgetRiskLevel ?? 'LOW'}
          tinyNextAction={safeToSpend?.tinyNextAction ?? 'Set your current balance in Budget.'}
          summary={safeToSpend?.summary ?? 'Connect your account to see safe-to-spend.'}
        />
        <TinyNextActionCard action={tinyAction} />
        <div
          className="rounded-xl border p-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Body need
          </p>
          <p className="mt-1">Have you had water today?</p>
        </div>
      </div>
      <div className="mt-8">
        <SpecialistAIWorkspace />
      </div>
    </div>
  );
}
