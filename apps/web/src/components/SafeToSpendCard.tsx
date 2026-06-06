'use client';

import { TinyNextActionCard } from '@neurolife/design-system';

interface Props {
  safeToSpend: number;
  currentBalance: number;
  budgetRiskLevel: string;
  tinyNextAction: string;
  summary: string;
}

export function SafeToSpendCard({
  safeToSpend,
  currentBalance,
  budgetRiskLevel,
  tinyNextAction,
  summary,
}: Props) {
  return (
    <div
      className="rounded-xl border p-6"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
        Safe to spend
      </p>
      <p className="text-3xl font-semibold mb-1" style={{ color: 'var(--accent)' }}>
        ${safeToSpend.toFixed(2)}
      </p>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        Balance: ${currentBalance.toFixed(2)} · Risk: {budgetRiskLevel}
      </p>
      <p className="text-sm mb-4" style={{ color: 'var(--text)' }}>
        {summary}
      </p>
      <TinyNextActionCard action={tinyNextAction} />
    </div>
  );
}
