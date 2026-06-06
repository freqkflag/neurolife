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
      className="w-56 shrink-0 border-r p-4 hidden md:flex md:flex-col"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <p className="text-sm font-semibold mb-6 px-2" style={{ color: 'var(--text)' }}>
        NeuroLife
      </p>
      <nav className="flex flex-col gap-1.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-sm leading-snug transition-colors"
              style={{
                color: active ? 'var(--bg)' : 'var(--text-muted)',
                background: active ? 'var(--accent)' : 'transparent',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
