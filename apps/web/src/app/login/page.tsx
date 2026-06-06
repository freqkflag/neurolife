'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { setAccessToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('dev@neurolife.local');
  const [password, setPassword] = useState('dev-neurolife');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(res.accessToken);
      router.push('/dashboard');
    } catch {
      setError('Could not sign in. Check your email and password, or run pnpm db:seed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-xl border p-6 md:p-8 w-full"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
        NeuroLife Command Center
      </p>
      <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Local dev default: <code>dev@neurolife.local</code> after <code>pnpm db:seed</code>
      </p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border px-3 py-2 w-full"
            style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-lg border px-3 py-2 w-full"
            style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </label>
        {error && (
          <p className="text-sm rounded-lg border px-3 py-2" style={{ color: 'var(--danger)', borderColor: 'var(--border)' }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg px-4 py-2.5 text-sm font-medium w-full disabled:opacity-50"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
        <Link href="/dashboard" className="underline" style={{ color: 'var(--accent)' }}>
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
