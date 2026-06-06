import { TinyNextActionCard } from '@neurolife/design-system';

export default function CrisisPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Crisis Support</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Not emergency care. If you are in immediate danger, contact emergency services.
      </p>
      <TinyNextActionCard action="Pause. Put both feet on the floor." />
      <div
        className="rounded-xl border p-4 mt-6"
        style={{ borderColor: 'var(--border)' }}
      >
        <p className="font-medium">988 Suicide & Crisis Lifeline (US)</p>
      </div>
    </div>
  );
}
