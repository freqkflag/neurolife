'use client';

import Link from 'next/link';
import { useState } from 'react';
import { TinyNextActionCard } from '@neurolife/design-system';
import { PageShell, cardClass, cardStyle } from './ui';

function CrisisCheck({ label, done, onToggle }: { label: string; done: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`${cardClass} text-left`}
      style={{ ...cardStyle, opacity: done ? 0.7 : 1 }}
    >
      <span className="text-sm">{done ? '✓ ' : ''}{label}</span>
    </button>
  );
}

export function CrisisView() {
  const [checks, setChecks] = useState({
    food: false,
    water: false,
    meds: false,
    sleep: false,
    pet: false,
    grounded: false,
  });

  const toggle = (key: keyof typeof checks) =>
    setChecks((c) => ({ ...c, [key]: !c[key] }));

  const doneCount = Object.values(checks).filter(Boolean).length;

  return (
    <PageShell
      title="Crisis Support"
      purpose="Stabilize first. Short steps, no big decisions."
      status={`${doneCount} of 6 gentle checks done`}
      tinyAction="Pause. Put both feet on the floor."
    >
      <div className={`${cardClass} mb-6`} style={cardStyle}>
        <p className="font-medium text-sm">No big decisions right now</p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
          This is not emergency care. If you are in immediate danger, contact local emergency services.
        </p>
      </div>

      <p className="text-sm mb-3 font-medium">Body basics</p>
      <div className="grid gap-2 sm:grid-cols-2 mb-6">
        <CrisisCheck label="Food nearby?" done={checks.food} onToggle={() => toggle('food')} />
        <CrisisCheck label="Water?" done={checks.water} onToggle={() => toggle('water')} />
        <CrisisCheck label="Meds taken?" done={checks.meds} onToggle={() => toggle('meds')} />
        <CrisisCheck label="Can rest soon?" done={checks.sleep} onToggle={() => toggle('sleep')} />
        <CrisisCheck label="Pet okay?" done={checks.pet} onToggle={() => toggle('pet')} />
      </div>

      <div className={`${cardClass} mb-6`} style={cardStyle}>
        <p className="font-medium text-sm mb-2">Grounding step</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Name 3 things you can see. Then 2 you can touch. Then 1 sound.
        </p>
        <button
          type="button"
          onClick={() => toggle('grounded')}
          className="mt-3 text-sm underline"
          style={{ color: 'var(--accent)' }}
        >
          {checks.grounded ? 'Grounded ✓' : 'Mark grounding done'}
        </button>
      </div>

      <TinyNextActionCard action="Put both feet on the floor. Breathe out slowly once." />

      <div className={`${cardClass} mt-6`} style={cardStyle}>
        <p className="font-medium text-sm">Support contact</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {/* TODO: load from /profile or support contacts API */}
          Add a trusted contact in Settings when that flow is ready.
        </p>
        <p className="text-sm mt-3">988 Suicide & Crisis Lifeline (US)</p>
      </div>

      <Link
        href="/budget/safe-to-spend"
        className={`${cardClass} mt-4 inline-block text-sm`}
        style={{ ...cardStyle, color: 'var(--accent)' }}
      >
        Money panic mode → see safe-to-spend
      </Link>
    </PageShell>
  );
}
