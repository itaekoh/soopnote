'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Template({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
