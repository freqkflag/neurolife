import { TinyNextActionCard } from '@neurolife/design-system';

export default function DisabilityPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Disability & Benefits</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Organize facts and prep — not legal or medical advice.
      </p>
      <TinyNextActionCard action="Write down one symptom to track." />
    </div>
  );
}
