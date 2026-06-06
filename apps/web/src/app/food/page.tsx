import Link from 'next/link';
import { TinyNextActionCard } from '@neurolife/design-system';

export default function FoodPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Food & Body</h1>
      <div className="flex gap-4 mb-6">
        <Link href="/pantry" className="text-sm" style={{ color: 'var(--accent)' }}>
          Pantry →
        </Link>
        <Link href="/groceries" className="text-sm" style={{ color: 'var(--accent)' }}>
          Groceries →
        </Link>
      </div>
      <TinyNextActionCard action="Grab something easy within reach." />
    </div>
  );
}
