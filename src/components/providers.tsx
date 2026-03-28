'use client';

import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/firebase/auth-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
