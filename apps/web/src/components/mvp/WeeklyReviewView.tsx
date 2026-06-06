'use client';

import { useEffect, useState } from 'react';
import { TinyNextActionCard } from '@neurolife/design-system';
import {
  PageShell,
  SubmitButton,
  cardClass,
  cardStyle,
  inputClass,
  inputStyle,
  preventDefaultSubmit,
} from './ui';

const STORAGE_KEY = 'neurolife_weekly_review';

interface ReviewData {
  worked: string;
  hard: string;
  money: string;
  foodBody: string;
  admin: string;
  priority: string;
  savedAt?: string;
}

const empty: ReviewData = {
  worked: '',
  hard: '',
  money: '',
  foodBody: '',
  admin: '',
  priority: '',
};

function FieldArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={inputClass}
        style={inputStyle}
        placeholder="Short notes only — no essay required."
      />
    </label>
  );
}

export function WeeklyReviewView() {
  const [data, setData] = useState<ReviewData>(empty);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw) as ReviewData);
    } catch {
      // ignore corrupt local data
    }
  }, []);

  const save = async () => {
    const payload = { ...data, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setData(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageShell
      title="Weekly Review"
      purpose="Calm reflection — what worked, what was hard, one priority for next week."
      status={data.savedAt ? `Last saved ${new Date(data.savedAt).toLocaleString()}` : 'Not saved yet this week'}
      tinyAction={data.priority || 'Pick one priority for next week.'}
    >
      <form
        onSubmit={preventDefaultSubmit(save)}
        className={`${cardClass} flex flex-col gap-4`}
        style={cardStyle}
      >
        <FieldArea label="What worked" value={data.worked} onChange={(v) => setData((d) => ({ ...d, worked: v }))} />
        <FieldArea label="What was hard" value={data.hard} onChange={(v) => setData((d) => ({ ...d, hard: v }))} />
        <FieldArea label="Money check" value={data.money} onChange={(v) => setData((d) => ({ ...d, money: v }))} />
        <FieldArea label="Food / body check" value={data.foodBody} onChange={(v) => setData((d) => ({ ...d, foodBody: v }))} />
        <FieldArea label="Admin check" value={data.admin} onChange={(v) => setData((d) => ({ ...d, admin: v }))} />
        <FieldArea
          label="One priority for next week"
          value={data.priority}
          onChange={(v) => setData((d) => ({ ...d, priority: v }))}
        />
        <SubmitButton label={saved ? 'Saved' : 'Save locally'} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {/* TODO: persist weekly review via API when endpoint exists */}
          Saved on this device only for now.
        </p>
      </form>

      {data.priority && (
        <div className="mt-6">
          <TinyNextActionCard action={data.priority} label="Your one priority" />
        </div>
      )}
    </PageShell>
  );
}
