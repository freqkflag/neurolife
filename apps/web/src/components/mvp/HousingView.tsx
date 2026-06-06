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

interface HousingItem {
  id: string;
  title: string;
  type: string;
  amount?: number | null;
  dueDate?: string | null;
  status: string;
  notes?: string | null;
}

interface RentCountdown {
  daysUntil: number | null;
  rentDueDate?: string;
  tinyNextAction: string;
}

function HousingContent({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<HousingItem[]>([]);
  const [rent, setRent] = useState<RentCountdown | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('RENT');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, countdown] = await Promise.all([
        apiFetch<HousingItem[]>('/housing', { token }),
        apiFetch<RentCountdown>('/housing/rent-countdown', { token }),
      ]);
      setItems(list);
      setRent(countdown);
      setError(null);
    } catch {
      setError('Could not load housing data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const addItem = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await apiFetch('/housing', {
        method: 'POST',
        token,
        body: JSON.stringify({
          title: title.trim(),
          type,
          dueDate: dueDate || undefined,
          status,
        }),
      });
      setTitle('');
      setDueDate('');
      await load();
    } catch {
      setError('Could not add housing item.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CalmLoading message="Loading housing…" />;

  return (
    <PageShell
      title="Housing"
      purpose="Rent, utilities, and housing admin in one low-stress view."
      status={
        rent?.daysUntil != null
          ? `Rent in ${rent.daysUntil} day${rent.daysUntil === 1 ? '' : 's'}`
          : 'Rent due date not set'
      }
      tinyAction={rent?.tinyNextAction ?? 'Set your rent due date in Settings.'}
    >
      {error && (
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {error}
        </p>
      )}

      <div className={`${cardClass} mb-8`} style={cardStyle}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Rent countdown
        </p>
        <p className="text-2xl font-semibold mt-1">
          {rent?.daysUntil != null ? `${rent.daysUntil} days` : 'Not set'}
        </p>
        {rent?.rentDueDate && (
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Due {formatDate(rent.rentDueDate)}
          </p>
        )}
      </div>

      <form
        onSubmit={preventDefaultSubmit(addItem)}
        className={`${cardClass} mb-8 flex flex-col gap-3 max-w-lg`}
        style={cardStyle}
      >
        <p className="font-medium text-sm">Add housing item</p>
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} style={inputStyle} required />
        </Field>
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass} style={inputStyle}>
            <option value="RENT">Rent</option>
            <option value="UTILITY">Utility</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="APPLICATION">Application</option>
            <option value="MOVE">Move</option>
          </select>
        </Field>
        <Field label="Deadline">
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} style={inputStyle} />
        </Field>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass} style={inputStyle}>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </Field>
        <SubmitButton loading={saving} label="Add item" />
      </form>

      <ItemList
        items={items}
        empty="No housing items yet. Add rent or a utility bill."
        render={(item: HousingItem) => (
          <div className="text-sm">
            <p className="font-medium">{item.title}</p>
            <p style={{ color: 'var(--text-muted)' }}>
              {item.type} · {item.status}
              {item.dueDate ? ` · due ${formatDate(item.dueDate)}` : ''}
              {item.amount != null ? ` · ${formatMoney(item.amount)}` : ''}
            </p>
          </div>
        )}
      />
    </PageShell>
  );
}

export function HousingView() {
  return <AuthGate>{(token) => <HousingContent token={token} />}</AuthGate>;
}
