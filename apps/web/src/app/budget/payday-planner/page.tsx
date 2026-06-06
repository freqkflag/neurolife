import { TinyNextActionCard } from '@neurolife/design-system';

export default function PaydayPlannerPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Payday Planner</h1>
      <div
        className="rounded-xl border p-6 mb-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <p style={{ color: 'var(--text-muted)' }}>Next payday</p>
        <p className="text-xl mt-1">Not set</p>
      </div>
      <TinyNextActionCard action="Set your payday date in settings." />
    </div>
  );
}
