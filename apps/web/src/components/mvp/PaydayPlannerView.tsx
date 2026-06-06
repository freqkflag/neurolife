'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalmLoading, TinyNextActionCard } from '@neurolife/design-system';
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

interface PaydayPlan {
  currentBalance: number;
  paydayDate: string | null;
  expectedPaydayAmount: number;
  rentDueDate: string | null;
  rentAmount: number;
  spendingBuffer: number;
  daysUntilPayday: number | null;
  daysUntilRent: number | null;
  protectedMoney: number;
  safeToSpend: number;
  shortageOrSurplus: number;
  budgetRiskLevel: string;
  tinyNextAction: string;
  upcomingBills: Array<{ id: string; name: string; amount: number; dueDate: string; category: string }>;
}

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function PaydayPlannerContent({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PaydayPlan | null>(null);
  const [currentBalance, setCurrentBalance] = useState('');
  const [paydayDate, setPaydayDate] = useState('');
  const [expectedPaydayAmount, setExpectedPaydayAmount] = useState('');
  const [rentDueDate, setRentDueDate] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [spendingBuffer, setSpendingBuffer] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billCategory, setBillCategory] = useState('utilities');
  const [billSaving, setBillSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<PaydayPlan>('/budget/payday-plan', { token });
      setPlan(res);
      setCurrentBalance(String(res.currentBalance));
      setPaydayDate(toDateInput(res.paydayDate));
      setExpectedPaydayAmount(String(res.expectedPaydayAmount));
      setRentDueDate(toDateInput(res.rentDueDate));
      setRentAmount(String(res.rentAmount));
      setSpendingBuffer(String(res.spendingBuffer));
      setError(null);
    } catch {
      setError('Could not load payday plan.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const savePlan = async () => {
    setSaving(true);
    try {
      const res = await apiFetch<PaydayPlan>('/budget/payday-plan', {
        method: 'POST',
        token,
        body: JSON.stringify({
          currentBalance: Number(currentBalance) || 0,
          paydayDate: paydayDate || null,
          expectedPaydayAmount: Number(expectedPaydayAmount) || 0,
          rentDueDate: rentDueDate || null,
          rentAmount: Number(rentAmount) || 0,
          spendingBuffer: Number(spendingBuffer) || 0,
        }),
      });
      setPlan(res);
      setError(null);
    } catch {
      setError('Could not save payday plan.');
    } finally {
      setSaving(false);
    }
  };

  const addBill = async () => {
    if (!billName.trim() || !billAmount || !billDueDate) return;
    setBillSaving(true);
    try {
      await apiFetch('/budget/bills', {
        method: 'POST',
        token,
        body: JSON.stringify({
          name: billName.trim(),
          amount: Number(billAmount),
          dueDate: billDueDate,
          category: billCategory,
          isProtected: ['rent', 'utilities', 'phone', 'food', 'medication', 'pets', 'transport'].includes(
            billCategory,
          ),
        }),
      });
      setBillName('');
      setBillAmount('');
      setBillDueDate('');
      await load();
    } catch {
      setError('Could not add bill.');
    } finally {
      setBillSaving(false);
    }
  };

  if (loading) return <CalmLoading message="Loading payday planner…" />;

  const surplusLabel =
    plan && plan.shortageOrSurplus >= 0
      ? `Surplus: ${formatMoney(plan.shortageOrSurplus)}`
      : plan
        ? `Shortage: ${formatMoney(Math.abs(plan.shortageOrSurplus))}`
        : '';

  return (
    <PageShell
      title="Payday Planner"
      purpose="See what's protected, what's safe to spend, and what happens before payday."
      status={
        plan?.paydayDate
          ? `${plan.daysUntilPayday ?? '?'} days until payday · ${surplusLabel}`
          : 'Set your payday to unlock the full plan.'
      }
      tinyAction={plan?.tinyNextAction ?? 'Add your balance and next payday date.'}
    >
      {error && (
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <div className={cardClass} style={cardStyle}>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
            Until payday
          </p>
          <p className="text-2xl font-semibold">
            {plan?.daysUntilPayday != null ? `${plan.daysUntilPayday} days` : 'Not set'}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Expected: {formatMoney(plan?.expectedPaydayAmount ?? 0)}
          </p>
        </div>
        <div className={cardClass} style={cardStyle}>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
            Until rent
          </p>
          <p className="text-2xl font-semibold">
            {plan?.daysUntilRent != null ? `${plan.daysUntilRent} days` : 'Not set'}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Rent: {formatMoney(plan?.rentAmount ?? 0)}
          </p>
        </div>
        <div className={cardClass} style={cardStyle}>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
            Protected money
          </p>
          <p className="text-2xl font-semibold">{formatMoney(plan?.protectedMoney ?? 0)}</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Rent, buffer, and protected bills
          </p>
        </div>
        <div className={cardClass} style={cardStyle}>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
            Safe to spend
          </p>
          <p className="text-2xl font-semibold">{formatMoney(plan?.safeToSpend ?? 0)}</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Balance: {formatMoney(plan?.currentBalance ?? 0)}
          </p>
        </div>
      </div>

      {plan && (
        <div className={`${cardClass} mb-8`} style={cardStyle}>
          <p className="font-medium text-sm mb-2">
            {plan.shortageOrSurplus >= 0 ? 'Projected surplus before payday' : 'Projected shortage before payday'}
          </p>
          <p className="text-xl">{formatMoney(Math.abs(plan.shortageOrSurplus))}</p>
          <div className="mt-4">
            <TinyNextActionCard action={plan.tinyNextAction} />
          </div>
        </div>
      )}

      <form
        onSubmit={preventDefaultSubmit(savePlan)}
        className={`${cardClass} mb-8 flex flex-col gap-3 max-w-lg`}
        style={cardStyle}
      >
        <p className="font-medium text-sm">Your payday plan</p>
        <Field label="Current balance ($)">
          <input
            type="number"
            step="0.01"
            value={currentBalance}
            onChange={(e) => setCurrentBalance(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Next payday">
          <input
            type="date"
            value={paydayDate}
            onChange={(e) => setPaydayDate(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Expected payday amount ($)">
          <input
            type="number"
            step="0.01"
            value={expectedPaydayAmount}
            onChange={(e) => setExpectedPaydayAmount(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Rent due date">
          <input
            type="date"
            value={rentDueDate}
            onChange={(e) => setRentDueDate(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Rent amount ($)">
          <input
            type="number"
            step="0.01"
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Food / pet / transport buffer ($)">
          <input
            type="number"
            step="0.01"
            value={spendingBuffer}
            onChange={(e) => setSpendingBuffer(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <SubmitButton loading={saving} label="Save plan" />
      </form>

      <form
        onSubmit={preventDefaultSubmit(addBill)}
        className={`${cardClass} mb-8 flex flex-col gap-3 max-w-lg`}
        style={cardStyle}
      >
        <p className="font-medium text-sm">Add a bill</p>
        <Field label="Name">
          <input value={billName} onChange={(e) => setBillName(e.target.value)} className={inputClass} style={inputStyle} />
        </Field>
        <Field label="Amount ($)">
          <input
            type="number"
            step="0.01"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Due date">
          <input
            type="date"
            value={billDueDate}
            onChange={(e) => setBillDueDate(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field label="Category">
          <select value={billCategory} onChange={(e) => setBillCategory(e.target.value)} className={inputClass} style={inputStyle}>
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
        <SubmitButton loading={billSaving} label="Add bill" />
      </form>

      <ItemList
        items={plan?.upcomingBills ?? []}
        empty="No upcoming bills before payday. Add rent or utilities if needed."
        render={(bill: PaydayPlan['upcomingBills'][number]) => (
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
    </PageShell>
  );
}

export function PaydayPlannerView() {
  return <AuthGate>{(token) => <PaydayPlannerContent token={token} />}</AuthGate>;
}
