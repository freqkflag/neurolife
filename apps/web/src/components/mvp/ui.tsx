'use client';

import type { FormEvent, ReactNode } from 'react';
import Link from 'next/link';
import { CalmLoading, TinyNextActionCard } from '@neurolife/design-system';
import { useAuth } from '@/lib/useAuth';

export const cardClass = 'rounded-xl border p-4 md:p-6';
export const cardStyle = { background: 'var(--surface)', borderColor: 'var(--border)' };
export const inputClass = 'rounded-lg border px-3 py-2 w-full text-sm';
export const inputStyle = { borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text)' };
export const btnClass = 'rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50';
export const btnStyle = { background: 'var(--accent)', color: 'var(--bg)' };

export function PageShell({
  title,
  purpose,
  status,
  tinyAction,
  children,
}: {
  title: string;
  purpose: string;
  status?: string;
  tinyAction?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        {purpose}
      </p>
      {status && (
        <p
          className="text-sm mb-4 rounded-lg border px-3 py-2"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          {status}
        </p>
      )}
      {tinyAction && (
        <div className="mb-6">
          <TinyNextActionCard action={tinyAction} />
        </div>
      )}
      {children}
    </div>
  );
}

export function AuthGate({ children }: { children: (token: string) => ReactNode }) {
  const { token, ready } = useAuth();
  if (!ready) return <CalmLoading message="Loading…" />;
  if (!token) {
    return (
      <div className={cardClass} style={cardStyle}>
        <p className="mb-4">Sign in to use this area.</p>
        <Link href="/login" className={btnClass} style={btnStyle}>
          Sign in
        </Link>
      </div>
    );
  }
  return <>{children(token)}</>;
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm py-4" style={{ color: 'var(--text-muted)' }}>
      {message}
    </p>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      {children}
    </label>
  );
}

export function SubmitButton({
  loading,
  label,
}: {
  loading?: boolean;
  label: string;
}) {
  return (
    <button type="submit" disabled={loading} className={btnClass} style={btnStyle}>
      {loading ? 'Saving…' : label}
    </button>
  );
}

export function ItemList({
  items,
  render,
  empty,
}: {
  items: unknown[];
  render: (item: never, index: number) => ReactNode;
  empty: string;
}) {
  if (items.length === 0) return <EmptyState message={empty} />;
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className={cardClass} style={cardStyle}>
          {render(item as never, i)}
        </li>
      ))}
    </ul>
  );
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return 'No date';
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatMoney(amount?: number | null): string {
  return `$${(amount ?? 0).toFixed(2)}`;
}

export function preventDefaultSubmit(handler: () => Promise<void>) {
  return async (e: FormEvent) => {
    e.preventDefault();
    await handler();
  };
}
