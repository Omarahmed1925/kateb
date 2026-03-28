import { TRPCError } from '@trpc/server';
import { db } from '@/lib/db/client';
import { generationSchema } from '@/lib/validations';
import { protectedProcedure, router } from '@/server/trpc';
import { generateContent } from '@/lib/ai/generate';
import { z } from 'zod';

export const generationRouter = router({
  generate: protectedProcedure
    .input(z.object({ workspaceId: z.string().cuid(), input: generationSchema }))
    .mutation(async ({ ctx, input }) => {
      // Check workspace membership
      const member = await db.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: input.workspaceId,
            userId: ctx.user!.id,
          },
        },
      });

      if (!member) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this workspace',
        });
      }

      try {
        const result = await generateContent(
          input.workspaceId,
          ctx.user!.id,
          input.input
        );

        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to generate content',
        });
      }
    }),

  list: protectedProcedure
    .input(z.object({ workspaceId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      // Verify membership
      const member = await db.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: input.workspaceId,
            userId: ctx.user!.id,
          },
        },
      });

      if (!member) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this workspace',
        });
      }

      const generations = await db.generation.findMany({
        where: {
          workspaceId: input.workspaceId,
          deletedAt: null,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { approvalLinks: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return generations;
    }),

  getById: protectedProcedure
    .input(z.object({ workspaceId: z.string().cuid(), generationId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      // Verify membership
      const member = await db.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: input.workspaceId,
            userId: ctx.user!.id,
          },
        },
      });

      if (!member) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this workspace',
        });
      }

      const generation = await db.generation.findUnique({
        where: { id: input.generationId },
        include: {
          approvalLinks: true,
          versions: { orderBy: { versionNumber: 'asc' } },
        },
      });

      if (!generation || generation.workspaceId !== input.workspaceId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Generation not found',
        });
      }

      return generation;
    }),

  delete: protectedProcedure
    .input(z.object({ workspaceId: z.string().cuid(), generationId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify membership and admin role
      const member = await db.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: input.workspaceId,
            userId: ctx.user!.id,
          },
        },
      });

      if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete content',
        });
      }

      await db.generation.update({
        where: { id: input.generationId },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),
});

