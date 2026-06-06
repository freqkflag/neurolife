'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/budget', label: 'Budget' },
  { href: '/budget/safe-to-spend', label: 'Safe to Spend' },
  { href: '/bills', label: 'Bills' },
  { href: '/documents', label: 'Documents' },
  { href: '/scary-mail', label: 'Scary Mail' },
  { href: '/admin', label: 'Admin' },
  { href: '/food', label: 'Food' },
  { href: '/housing', label: 'Housing' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/routines', label: 'Routines' },
  { href: '/weekly-review', label: 'Weekly Review' },
  { href: '/crisis', label: 'Crisis' },
  { href: '/settings', label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 shrink-0 border-r p-4 hidden md:block"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <p className="text-sm font-semibold mb-6" style={{ color: 'var(--text)' }}>
        NeuroLife
      </p>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              color: pathname === item.href ? 'var(--bg)' : 'var(--text-muted)',
              background: pathname === item.href ? 'var(--accent)' : 'transparent',
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
