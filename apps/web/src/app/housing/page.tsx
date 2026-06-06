import { TinyNextActionCard } from '@neurolife/design-system';

export default function HousingPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Housing</h1>
      <div
        className="rounded-xl border p-4 mb-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Rent countdown
        </p>
        <p className="text-lg mt-1">Not set</p>
      </div>
      <TinyNextActionCard action="Set your rent due date." />
    </div>
  );
}
