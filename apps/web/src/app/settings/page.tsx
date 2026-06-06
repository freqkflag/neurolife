export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <div className="space-y-4">
        <div
          className="rounded-xl border p-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="font-medium">Privacy mode</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Hybrid — local rescue on mobile, cloud optional on web
          </p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="font-medium">Data</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Export or delete your data from profile settings.
          </p>
        </div>
      </div>
    </div>
  );
}
