'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CalmLoading } from '@neurolife/design-system';
import { SafeToSpendCard } from '@/components/SafeToSpendCard';
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
  formatMoney,
  inputClass,
  inputStyle,
  preventDefaultSubmit,
} from './ui';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
}

interface BudgetState {
  currentBalance: number;
  safeToSpend: number;
  budgetRiskLevel: string;
  bills: Bill[];
}

interface SafeToSpendResponse {
  safeToSpend: number;
  currentBalance: number;
  budgetRiskLevel: string;
  tinyNextAction: string;
  summary: string;
}

function BudgetContent({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<BudgetState | null>(null);
  const [safe, setSafe] = useState<SafeToSpendResponse | null>(null);
  const [balanceInput, setBalanceInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, s] = await Promise.all([
        apiFetch<BudgetState>('/budget', { token }),
        apiFetch<SafeToSpendResponse>('/budget/safe-to-spend', { token }),
      ]);
      setBudget(b);
      setSafe(s);
      setBalanceInput(String(b.currentBalance ?? 0));
      setError(null);
    } catch {
      setError('Could not load budget data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateBalance = async () => {
    setSaving(true);
    try {
      await apiFetch('/budget/balance', {
        method: 'POST',
        token,
        body: JSON.stringify({ balance: Number(balanceInput) }),
      });
      await load();
    } catch {
      setError('Could not update balance.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CalmLoading message="Loading budget…" />;

  const upcoming = (budget?.bills ?? [])
    .slice()
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <PageShell
      title="Budget"
      purpose="Money without shame. See balance, safe-to-spend, and what's due soon."
      status={`Balance ${formatMoney(budget?.currentBalance)} · Safe to spend ${formatMoney(safe?.safeToSpend)} · Risk ${safe?.budgetRiskLevel ?? budget?.budgetRiskLevel ?? 'LOW'}`}
      tinyAction={safe?.tinyNextAction ?? 'Add your bills to calculate safe-to-spend.'}
    >
      {error && (
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <SafeToSpendCard
          safeToSpend={safe?.safeToSpend ?? 0}
          currentBalance={safe?.currentBalance ?? budget?.currentBalance ?? 0}
          budgetRiskLevel={safe?.budgetRiskLevel ?? 'LOW'}
          tinyNextAction={safe?.tinyNextAction ?? 'Set your current balance below.'}
          summary={safe?.summary ?? 'Protect essentials first.'}
        />
        <div className={cardClass} style={cardStyle}>
          <p className="text-sm font-medium mb-3">Quick actions</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/bills" style={{ color: 'var(--accent)' }}>
              Add bill →
            </Link>
            <Link href="/budget/safe-to-spend" style={{ color: 'var(--accent)' }}>
              Review safe-to-spend →
            </Link>
            <Link href="/budget/payday-planner" style={{ color: 'var(--accent)' }}>
              Payday planner →
            </Link>
          </div>
        </div>
      </div>

      <form
        onSubmit={preventDefaultSubmit(updateBalance)}
        className={`${cardClass} mb-8 flex flex-col gap-3 max-w-md`}
        style={cardStyle}
      >
        <p className="font-medium text-sm">Update balance</p>
        <Field label="Current balance ($)">
          <input
            type="number"
            step="0.01"
            value={balanceInput}
            onChange={(e) => setBalanceInput(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <SubmitButton loading={saving} label="Save balance" />
      </form>

      <section>
        <h2 className="text-lg font-medium mb-3">Upcoming bills</h2>
        <ItemList
          items={upcoming}
          empty="No bills yet. Add rent or phone first."
          render={(bill: Bill) => (
            <div className="flex justify-between gap-4 text-sm">
              <div>
                <p className="font-medium">{bill.name}</p>
                <p style={{ color: 'var(--text-muted)' }}>
                  {bill.category} · due {formatDate(bill.dueDate)}
                </p>
              </div>
              <p>{formatMoney(bill.amount)}</p>
            </div>
          )}
        />
      </section>
    </PageShell>
  );
}

export function BudgetView() {
  return <AuthGate>{(token) => <BudgetContent token={token} />}</AuthGate>;
}
