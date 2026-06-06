'use client';

import Link from 'next/link';
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

interface GroceryItem {
  id: string;
  name: string;
}

interface PantryItem {
  id: string;
  name: string;
}

interface LowSpoonResponse {
  suggestion: string;
  tinyNextAction: string;
}

function CheckCard({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`${cardClass} text-left w-full`}
      style={{
        ...cardStyle,
        outline: checked ? '2px solid var(--accent)' : undefined,
      }}
    >
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        {checked ? 'Checked' : 'Tap when done'}
      </p>
    </button>
  );
}

function FoodContent({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [lowSpoon, setLowSpoon] = useState<LowSpoonResponse | null>(null);
  const [groceryName, setGroceryName] = useState('');
  const [checks, setChecks] = useState({ eaten: false, water: false, petFood: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [g, p, l] = await Promise.all([
        apiFetch<GroceryItem[]>('/food/groceries', { token }),
        apiFetch<PantryItem[]>('/food/pantry', { token }),
        apiFetch<LowSpoonResponse>('/food/low-spoon', { token }),
      ]);
      setGroceries(g);
      setPantry(p);
      setLowSpoon(l);
      setError(null);
    } catch {
      setError('Could not load food data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const addGrocery = async () => {
    if (!groceryName.trim()) return;
    setSaving(true);
    try {
      await apiFetch('/food/groceries', {
        method: 'POST',
        token,
        body: JSON.stringify({ name: groceryName.trim() }),
      });
      setGroceryName('');
      await load();
    } catch {
      setError('Could not add grocery item.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CalmLoading message="Loading food & body…" />;

  const toggle = (key: keyof typeof checks) => setChecks((c) => ({ ...c, [key]: !c[key] }));

  return (
    <PageShell
      title="Food & Body"
      purpose="Gentle body-needs check-ins — no diet shame, just facts."
      status={`${groceries.length} grocery items · ${pantry.length} pantry items`}
      tinyAction={lowSpoon?.tinyNextAction ?? 'Put one easy food within reach.'}
    >
      {error && (
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {error}
        </p>
      )}

      <div className="flex gap-4 mb-6 text-sm">
        <Link href="/pantry" style={{ color: 'var(--accent)' }}>
          Pantry →
        </Link>
        <Link href="/groceries" style={{ color: 'var(--accent)' }}>
          Groceries →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 mb-8">
        <CheckCard label="Have you eaten?" checked={checks.eaten} onChange={() => toggle('eaten')} />
        <CheckCard label="Had water?" checked={checks.water} onChange={() => toggle('water')} />
        <CheckCard label="Pet fed?" checked={checks.petFood} onChange={() => toggle('petFood')} />
      </div>

      {lowSpoon && (
        <div className={`${cardClass} mb-8`} style={cardStyle}>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
            Low-spoon meal idea
          </p>
          <p className="text-sm">{lowSpoon.suggestion}</p>
        </div>
      )}

      <form
        onSubmit={preventDefaultSubmit(addGrocery)}
        className={`${cardClass} mb-8 flex flex-col gap-3 max-w-md`}
        style={cardStyle}
      >
        <p className="font-medium text-sm">Add grocery item</p>
        <Field label="Item name">
          <input value={groceryName} onChange={(e) => setGroceryName(e.target.value)} className={inputClass} style={inputStyle} required />
        </Field>
        <SubmitButton loading={saving} label="Add to list" />
      </form>

      <h2 className="text-lg font-medium mb-3">Grocery list</h2>
      <ItemList
        items={groceries}
        empty="Grocery list is empty. Add one item you actually need."
        render={(item: GroceryItem) => <p className="text-sm">{item.name}</p>}
      />
    </PageShell>
  );
}

export function FoodView() {
  return <AuthGate>{(token) => <FoodContent token={token} />}</AuthGate>;
}
