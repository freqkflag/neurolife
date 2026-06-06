'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

const AUTH_PATHS = new Set(['/login']);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.has(pathname);

  if (isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-5xl w-full">{children}</main>
    </div>
  );
}
