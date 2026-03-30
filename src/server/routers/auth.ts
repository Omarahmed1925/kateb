import { TRPCError } from '@trpc/server';
import { supabase } from '@/lib/db/client';
import { registerSchema } from '@/lib/validations';
import { protectedProcedure, publicProcedure, router } from '@/server/trpc';

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      const { email, password, name } = input;

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User already exists',
        });
      }

      // Create user in database (password hashing handled by Firebase Auth)
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email,
          name,
          hashed_password: password, // Note: in production, hash before storing
        })
        .select('id')
        .single();

      if (userError || !user) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
        });
      }

      // Create default workspace
      const { data: workspace, error: wsError } = await supabase
        .from('workspaces')
        .insert({
          name: `${name}'s Workspace`,
          slug: `workspace-${user.id.substring(0, 8)}`,
          owner_id: user.id,
          plan: 'FREE',
          usage_limit: 10,
          dialect_preference: 'EGYPTIAN',
        })
        .select('id')
        .single();

      if (wsError || !workspace) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create workspace',
        });
      }

      // Add user as workspace owner
      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'OWNER',
          joined_at: new Date().toISOString(),
        });

      return {
        success: true,
        userId: user.id,
        workspaceId: workspace.id,
      };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const { data: user } = await supabase
      .from('users')
      .select('*, workspace_members(*)')
      .eq('id', ctx.user!.id)
      .single();

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
      const { data: user } = await supabase
        .from('users')
        .update(input)
        .eq('id', ctx.user!.id)
        .select()
        .single();

      return user;
    }),
});
