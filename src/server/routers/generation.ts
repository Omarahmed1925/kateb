import { TRPCError } from '@trpc/server';
import { supabase } from '@/lib/db/client';
import { generationSchema } from '@/lib/validations';
import { protectedProcedure, router } from '@/server/trpc';
import { generateContent } from '@/lib/ai/generate';
import { z } from 'zod';

export const generationRouter = router({
  generate: protectedProcedure
    .input(z.object({ workspaceId: z.string(), input: generationSchema }))
    .mutation(async ({ ctx, input }) => {
      // Check workspace membership
      const { data: member } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', input.workspaceId)
        .eq('user_id', ctx.user!.id)
        .single();

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
      } catch (error: unknown) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate content',
        });
      }
    }),

  list: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify membership
      const { data: member } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', input.workspaceId)
        .eq('user_id', ctx.user!.id)
        .single();

      if (!member) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this workspace',
        });
      }

      const { data: generations } = await supabase
        .from('generations')
        .select('*, users:created_by(id, name, email)')
        .eq('workspace_id', input.workspaceId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      return generations;
    }),

  getById: protectedProcedure
    .input(z.object({ workspaceId: z.string(), generationId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify membership
      const { data: member } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', input.workspaceId)
        .eq('user_id', ctx.user!.id)
        .single();

      if (!member) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this workspace',
        });
      }

      const { data: generation } = await supabase
        .from('generations')
        .select('*')
        .eq('id', input.generationId)
        .single();

      if (!generation || generation.workspace_id !== input.workspaceId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Generation not found',
        });
      }

      return generation;
    }),

  delete: protectedProcedure
    .input(z.object({ workspaceId: z.string(), generationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify membership and admin role
      const { data: member } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', input.workspaceId)
        .eq('user_id', ctx.user!.id)
        .single();

      if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete content',
        });
      }

      await supabase
        .from('generations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.generationId);

      return { success: true };
    }),
});
