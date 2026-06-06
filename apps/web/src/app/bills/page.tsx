import { TinyNextActionCard } from '@neurolife/design-system';

export default function BillsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Bills</h1>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        No bills added yet.
      </p>
      <TinyNextActionCard action="Add your most urgent bill." />
    </div>
  );
}
