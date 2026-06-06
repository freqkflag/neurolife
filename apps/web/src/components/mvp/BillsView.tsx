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
  isPaid: boolean;
}

interface BudgetState {
  bills: Bill[];
}

function BillsContent({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('rent');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<BudgetState>('/budget', { token });
      setBills(res.bills ?? []);
      setError(null);
    } catch {
      setError('Could not load bills.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const addBill = async () => {
    if (!name.trim() || !amount || !dueDate) return;
    setSaving(true);
    try {
      await apiFetch('/budget/bills', {
        method: 'POST',
        token,
        body: JSON.stringify({
          name: name.trim(),
          amount: Number(amount),
          dueDate,
          category,
          isProtected: ['rent', 'utilities', 'phone', 'food', 'medication', 'pets', 'transport'].includes(
            category,
          ),
        }),
      });
      setName('');
      setAmount('');
      setDueDate('');
      await load();
    } catch {
      setError('Could not add bill.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CalmLoading message="Loading bills…" />;

  const unpaid = bills.filter((b) => !b.isPaid);

  return (
    <PageShell
      title="Bills"
      purpose="Track what's due so safe-to-spend stays honest."
      status={`${unpaid.length} unpaid bill${unpaid.length === 1 ? '' : 's'}`}
      tinyAction={unpaid.length ? `Next due: ${unpaid[0]?.name}` : 'Add rent or phone first.'}
    >
      {error && (
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {error}
        </p>
      )}

      <form
        onSubmit={preventDefaultSubmit(addBill)}
        className={`${cardClass} mb-8 flex flex-col gap-3 max-w-lg`}
        style={cardStyle}
      >
        <p className="font-medium text-sm">Add a bill</p>
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={inputStyle} required />
        </Field>
        <Field label="Amount ($)">
          <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} style={inputStyle} required />
        </Field>
        <Field label="Due date">
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} style={inputStyle} required />
        </Field>
        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} style={inputStyle}>
            <option value="rent">Rent</option>
            <option value="utilities">Utilities</option>
            <option value="phone">Phone</option>
            <option value="food">Food</option>
            <option value="medication">Medication</option>
            <option value="pets">Pets</option>
            <option value="transport">Transport</option>
            <option value="general">General</option>
          </select>
        </Field>
        <SubmitButton loading={saving} label="Add bill" />
      </form>

      <ItemList
        items={bills}
        empty="No bills yet. Add rent or phone first."
        render={(bill: Bill) => (
          <div className="flex justify-between gap-4 text-sm">
            <div>
              <p className="font-medium">{bill.name}</p>
              <p style={{ color: 'var(--text-muted)' }}>
                {bill.category} · due {formatDate(bill.dueDate)}
                {bill.isPaid ? ' · paid' : ''}
              </p>
            </div>
            <p>{formatMoney(bill.amount)}</p>
          </div>
        )}
      />
    </PageShell>
  );
}

export function BillsView() {
  return <AuthGate>{(token) => <BillsContent token={token} />}</AuthGate>;
}
