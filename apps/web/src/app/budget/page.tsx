import Link from 'next/link';

export default function BudgetPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Budget</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Money without shame. Facts only.
      </p>
      <div className="flex gap-4">
        <Link
          href="/budget/safe-to-spend"
          className="px-4 py-3 rounded-lg border"
          style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
        >
          Safe to Spend →
        </Link>
        <Link
          href="/budget/payday-planner"
          className="px-4 py-3 rounded-lg border"
          style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
        >
          Payday Planner →
        </Link>
      </div>
    </div>
  );
}
