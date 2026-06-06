'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalmLoading } from '@neurolife/design-system';
import { PROTECTED_BILL_CATEGORIES } from '@neurolife/shared';
import { SafeToSpendCard } from '@/components/SafeToSpendCard';
import { apiFetch } from '@/lib/api';
import { AuthGate, PageShell, cardClass, cardStyle, formatMoney } from './ui';

interface SafeToSpendResponse {
  currentBalance: number;
  protectedAmount: number;
  safeToSpend: number;
  budgetRiskLevel: string;
  tinyNextAction: string;
  summary: string;
}

function SafeToSpendContent({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SafeToSpendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<SafeToSpendResponse>('/budget/safe-to-spend', { token });
      setData(res);
      setError(null);
    } catch {
      setError('Could not load safe-to-spend.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <CalmLoading message="Calculating safe-to-spend…" />;

  return (
    <PageShell
      title="Safe to Spend"
      purpose="Money left after protecting essentials — rent, food, utilities, and more."
      status={
        data
          ? `${formatMoney(data.safeToSpend)} safe after protecting ${formatMoney(data.protectedAmount)}`
          : undefined
      }
      tinyAction={data?.tinyNextAction ?? 'Set your balance and add bills.'}
    >
      {error && (
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {error}
        </p>
      )}

      {data && (
        <SafeToSpendCard
          safeToSpend={data.safeToSpend}
          currentBalance={data.currentBalance}
          budgetRiskLevel={data.budgetRiskLevel}
          tinyNextAction={data.tinyNextAction}
          summary={data.summary}
        />
      )}

      <div className={`${cardClass} mt-6`} style={cardStyle}>
        <p className="font-medium text-sm mb-2">Protected categories</p>
        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
          Bills in these categories are set aside before safe-to-spend is calculated.
        </p>
        <ul className="flex flex-wrap gap-2">
          {PROTECTED_BILL_CATEGORIES.map((cat) => (
            <li
              key={cat}
              className="text-xs px-2 py-1 rounded-md border capitalize"
              style={{ borderColor: 'var(--border)' }}
            >
              {cat}
            </li>
          ))}
        </ul>
      </div>

      <div className={`${cardClass} mt-4`} style={cardStyle}>
        <p className="font-medium text-sm mb-2">What changed?</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {data
            ? `We subtract ${formatMoney(data.protectedAmount)} for upcoming protected bills from your ${formatMoney(data.currentBalance)} balance. That leaves ${formatMoney(data.safeToSpend)} for flexible spending.`
            : 'Add bills with protected categories to see the breakdown.'}
        </p>
      </div>
    </PageShell>
  );
}

export function SafeToSpendView() {
  return <AuthGate>{(token) => <SafeToSpendContent token={token} />}</AuthGate>;
}
