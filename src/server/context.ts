import { auth } from '@/lib/auth/auth';
import type { SessionUser } from '@/types';

export interface Context {
  user: SessionUser | null;
}

export async function createContext(): Promise<Context> {
  const session = await auth();

  if (!session?.user?.email) {
    return { user: null };
  }

  return {
    user: {
      id: (session.user as any).id || '',
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      role: (session.user as any).role || 'USER',
    },
  };
}

