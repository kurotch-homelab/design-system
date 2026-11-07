'use client';
import { FormaProvider } from '@kurotch-homelab/forma-react';
import type { ReactNode } from 'react';

// Import the package CSS once from the application's entry/root layout.
export function FormaBoundary({ children }: { children: ReactNode }) {
  return (
    <FormaProvider locale="ja" theme="system" density="comfortable" motion="system">
      {children}
    </FormaProvider>
  );
}
