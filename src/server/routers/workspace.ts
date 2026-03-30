import { TRPCError } from '@trpc/server';
import { supabase } from '@/lib/db/client';
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
    const { data: memberWorkspaces } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', ctx.user!.id);

    const workspaceIds = (memberWorkspaces || []).map((m) => m.workspace_id);

    if (workspaceIds.length === 0) return [];

    const { data: workspaces } = await supabase
      .from('workspaces')
      .select('*')
      .in('id', workspaceIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    return workspaces || [];
  }),

  getById: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', input.workspaceId)
        .single();

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        });
      }

      // Verify user is member
      const { data: members } = await supabase
        .from('workspace_members')
        .select('*, users:user_id(id, name, email)')
        .eq('workspace_id', input.workspaceId);

      const isMember = (members || []).some(
        (m: { user_id: string }) => m.user_id === ctx.user!.id
      );

      if (!isMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this workspace',
        });
      }

      return { ...workspace, members: members || [] };
    }),

  create: protectedProcedure
    .input(createWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .insert({
          ...input,
          owner_id: ctx.user!.id,
          plan: 'FREE',
          usage_limit: 10,
          dialect_preference: 'EGYPTIAN',
        })
        .select()
        .single();

      if (error || !workspace) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create workspace',
        });
      }

      // Add creator as owner
      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: ctx.user!.id,
          role: 'OWNER',
          joined_at: new Date().toISOString(),
        });

      return workspace;
    }),

  update: protectedProcedure
    .input(z.object({ workspaceId: z.string(), data: updateWorkspaceSchema }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', input.workspaceId)
        .single();

      if (!workspace || workspace.owner_id !== ctx.user!.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only owner can update workspace',
        });
      }

      const { data: updated } = await supabase
        .from('workspaces')
        .update(input.data)
        .eq('id', input.workspaceId)
        .select()
        .single();

      return updated;
    }),

  inviteMember: protectedProcedure
    .input(z.object({ workspaceId: z.string(), memberData: inviteTeamMemberSchema }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin or owner
      const { data: member } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', input.workspaceId)
        .eq('user_id', ctx.user!.id)
        .single();

      if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to invite members',
        });
      }

      // Create invite
      const { data: invite, error } = await supabase
        .from('workspace_invites')
        .insert({
          workspace_id: input.workspaceId,
          email: input.memberData.email,
          role: input.memberData.role,
          token: nanoid(32),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create invite',
        });
      }

      return invite;
    }),

  removeMember: protectedProcedure
    .input(z.object({ workspaceId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin or owner
      const { data: member } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', input.workspaceId)
        .eq('user_id', ctx.user!.id)
        .single();

      if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to remove members',
        });
      }

      await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', input.workspaceId)
        .eq('user_id', input.userId);

      return { success: true };
    }),
});
