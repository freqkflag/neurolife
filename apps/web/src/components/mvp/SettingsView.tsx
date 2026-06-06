'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { CalmLoading } from '@neurolife/design-system';
import { apiFetch, getApiBaseUrl } from '@/lib/api';
import { clearAccessToken } from '@/lib/auth';
import { useAuth } from '@/lib/useAuth';
import { AuthGate, PageShell, cardClass, cardStyle } from './ui';

type PrivacyMode = 'FULLY_LOCAL' | 'SELF_HOSTED' | 'HYBRID' | 'CLOUD_ASSISTED';

interface Profile {
  displayName?: string | null;
  privacyMode: PrivacyMode;
  theme?: string | null;
}

const PRIVACY_OPTIONS: { value: PrivacyMode; label: string; hint: string }[] = [
  { value: 'FULLY_LOCAL', label: 'Fully local', hint: 'No cloud — device only.' },
  { value: 'SELF_HOSTED', label: 'Self-hosted', hint: 'Your homelab runs the AI and data.' },
  { value: 'HYBRID', label: 'Hybrid', hint: 'Local rescue + optional cloud on web.' },
  { value: 'CLOUD_ASSISTED', label: 'Cloud-assisted', hint: 'Cloud AI when you opt in.' },
];

function SettingsContent({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await apiFetch<Profile>('/profile', { token });
      setProfile(p);
      setError(null);
    } catch {
      setError('Could not load profile.');
    }
    try {
      await apiFetch<{ status: string }>('/health');
      setApiOk(true);
    } catch {
      setApiOk(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const savePrivacy = async (mode: PrivacyMode) => {
    setSaving(true);
    try {
      const updated = await apiFetch<Profile>('/profile', {
        method: 'PATCH',
        token,
        body: JSON.stringify({ privacyMode: mode }),
      });
      setProfile(updated);
    } catch {
      setError('Could not update privacy mode.');
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    clearAccessToken();
    router.push('/login');
  };

  if (loading) return <CalmLoading message="Loading settings…" />;

  return (
    <PageShell
      title="Settings"
      purpose="Privacy, theme, and connection status — you stay in control."
      status={profile ? `Privacy: ${profile.privacyMode}` : undefined}
      tinyAction="Pick the privacy mode that feels safest today."
    >
      {error && (
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {error}
        </p>
      )}

      <section className={`${cardClass} mb-6`} style={cardStyle}>
        <p className="font-medium text-sm mb-3">Privacy mode</p>
        <div className="flex flex-col gap-2">
          {PRIVACY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={saving}
              onClick={() => void savePrivacy(opt.value)}
              className="text-left rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: profile?.privacyMode === opt.value ? 'var(--accent)' : 'var(--border)',
                background: profile?.privacyMode === opt.value ? 'var(--bg)' : 'transparent',
              }}
            >
              <span className="font-medium">{opt.label}</span>
              <span className="block text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {opt.hint}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className={`${cardClass} mb-6`} style={cardStyle}>
        <p className="font-medium text-sm mb-2">Theme</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {/* TODO: wire theme selector to profile.theme and layout data-theme */}
          Theme selector coming soon. Current: muted dark.
        </p>
      </section>

      <section className={`${cardClass} mb-6`} style={cardStyle}>
        <p className="font-medium text-sm mb-2">Dev API status</p>
        <p className="text-sm">
          API: {getApiBaseUrl()} —{' '}
          {apiOk === true ? 'reachable' : apiOk === false ? 'not reachable' : 'checking…'}
        </p>
      </section>

      <button
        type="button"
        onClick={logout}
        className="rounded-lg px-4 py-2 text-sm font-medium border"
        style={{ borderColor: 'var(--border)' }}
      >
        Log out
      </button>
    </PageShell>
  );
}

export function SettingsView() {
  const { ready } = useAuth();
  if (!ready) return <CalmLoading message="Loading…" />;
  return <AuthGate>{(token) => <SettingsContent token={token} />}</AuthGate>;
}
