'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { Navbar } from '@/components/Navbar';

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </AuthProvider>
  );
}
