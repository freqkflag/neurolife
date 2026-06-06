import { TinyNextActionCard } from '@neurolife/design-system';

export default function ScaryMailPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Scary Mail</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Turn scary documents into simple actions. Upload a letter and we'll extract deadlines.
      </p>
      <div
        className="rounded-xl border border-dashed p-8 text-center mb-6"
        style={{ borderColor: 'var(--border)' }}
      >
        <p style={{ color: 'var(--text-muted)' }}>Drop a document here or upload</p>
      </div>
      <TinyNextActionCard action="Open the document and read just the first paragraph." />
    </div>
  );
}
