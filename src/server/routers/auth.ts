import { TRPCError } from '@trpc/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db/client';
import { registerSchema } from '@/lib/validations';
import { protectedProcedure, publicProcedure, router } from '@/server/trpc';

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      const { email, password, name } = input;

      // Check if user exists
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User already exists',
        });
      }

      // Hash password
      const hashedPassword = await hash(password, 12);

      // Create user
      const user = await db.user.create({
        data: {
          email,
          name,
          hashedPassword,
        },
      });

      // Create default workspace
      const workspace = await db.workspace.create({
        data: {
          name: `${name}'s Workspace`,
          slug: `workspace-${user.id.substring(0, 8)}`,
          ownerId: user.id,
          plan: 'FREE',
          usageLimit: 10,
          dialectPreference: 'EGYPTIAN',
        },
      });

      // Add user as workspace owner
      await db.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'OWNER',
          joinedAt: new Date(),
        },
      });

      return {
        success: true,
        userId: user.id,
        workspaceId: workspace.id,
      };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.user.findUnique({
      where: { id: ctx.user!.id },
      include: {
        workspaces: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      registerSchema
        .pick({ name: true })
        .partial()
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.user.update({
        where: { id: ctx.user!.id },
        data: input,
      });

      return user;
    }),
});


