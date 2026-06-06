'use client';

import { TinyNextActionCard } from '@neurolife/design-system';

export function WeeklyReviewPanel() {
  const sections = [
    { title: 'One win', body: 'Something that went okay this week.' },
    { title: 'One hard thing', body: 'No judgment — just data.' },
    { title: 'One priority for next week', body: 'Only one.' },
  ];

  return (
    <div
      className="rounded-xl border p-6"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <h2 className="text-lg font-semibold mb-2">Weekly Review</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Calm and structured. No productivity pressure.
      </p>
      {sections.map((s) => (
        <div key={s.title} className="mb-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="font-medium text-sm">{s.title}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {s.body}
          </p>
        </div>
      ))}
      <TinyNextActionCard action="Pick one priority for next week." />
    </div>
  );
}
