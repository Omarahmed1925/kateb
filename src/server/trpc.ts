import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const procedure = t.procedure;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

