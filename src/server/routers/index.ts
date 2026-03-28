import { router } from '@/server/trpc';
import { authRouter } from './auth';
import { workspaceRouter } from './workspace';
import { generationRouter } from './generation';

export const appRouter = router({
  auth: authRouter,
  workspace: workspaceRouter,
  generation: generationRouter,
});

export type AppRouter = typeof appRouter;

