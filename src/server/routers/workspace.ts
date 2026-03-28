import { TRPCError } from '@trpc/server';
import { db } from '@/lib/db/client';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteTeamMemberSchema,
} from '@/lib/validations';
import { protectedProcedure, router } from '@/server/trpc';
import { z } from 'zod';
import { nanoid } from 'nanoid';

export const workspaceRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const workspaces = await db.workspace.findMany({
      where: {
        members: {
          some: {
            userId: ctx.user!.id,
          },
        },
        deletedAt: null,
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return workspaces;
  }),

  getById: protectedProcedure
    .input(z.object({ workspaceId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const workspace = await db.workspace.findUnique({
        where: { id: input.workspaceId },
        include: {
          members: {
            include: { user: true },
          },
          _count: {
            select: { generations: true },
          },
        },
      });

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        });
      }

      // Verify user is member
      const isMember = workspace.members.some((m) => m.userId === ctx.user!.id);
      if (!isMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this workspace',
        });
      }

      return workspace;
    }),

  create: protectedProcedure
    .input(createWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const workspace = await db.workspace.create({
        data: {
          ...input,
          ownerId: ctx.user!.id,
          plan: 'FREE',
          usageLimit: 10,
          dialectPreference: 'EGYPTIAN',
        },
      });

      // Add creator as owner
      await db.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: ctx.user!.id,
          role: 'OWNER',
          joinedAt: new Date(),
        },
      });

      return workspace;
    }),

  update: protectedProcedure
    .input(z.object({ workspaceId: z.string().cuid(), data: updateWorkspaceSchema }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const workspace = await db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.user!.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only owner can update workspace',
        });
      }

      const updated = await db.workspace.update({
        where: { id: input.workspaceId },
        data: input.data,
      });

      return updated;
    }),

  inviteMember: protectedProcedure
    .input(z.object({ workspaceId: z.string().cuid(), memberData: inviteTeamMemberSchema }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin or owner
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
          message: 'You do not have permission to invite members',
        });
      }

      // Check if already member
      const existing = await db.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: input.workspaceId,
            userId: (
              await db.user.findUnique({ where: { email: input.memberData.email } })
            )?.id || '',
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is already a member',
        });
      }

      // Create invite
      const invite = await db.workspaceInvite.create({
        data: {
          workspaceId: input.workspaceId,
          email: input.memberData.email,
          role: input.memberData.role,
          token: nanoid(32),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      return invite;
    }),

  removeMember: protectedProcedure
    .input(z.object({ workspaceId: z.string().cuid(), userId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin or owner
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
          message: 'You do not have permission to remove members',
        });
      }

      await db.workspaceMember.delete({
        where: {
          workspaceId_userId: {
            workspaceId: input.workspaceId,
            userId: input.userId,
          },
        },
      });

      return { success: true };
    }),
});


