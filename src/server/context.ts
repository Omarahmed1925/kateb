import type { SessionUser } from '@/types';

export interface Context {
  user: SessionUser | null;
}

/**
 * Create a tRPC context. Authentication is handled by Firebase Auth on the client.
 * Server-side context is populated from the Firebase session token when available.
 */
export async function createContext(): Promise<Context> {
  // Firebase Auth is client-side; server context starts unauthenticated.
  // Protected routes should validate the Firebase ID token via middleware.
  return { user: null };
}
