import { supabase } from '@/lib/db/client';
import { DB_TABLES, DEFAULT_WORKSPACE_CONFIG } from '@/lib/constants/database';
import { USER_ROLES, WORKSPACE_ROLES } from '@/lib/constants/auth';
import type { User, Workspace, WorkspaceMember } from '@/types';

export interface CreateUserData {
  uid: string;
  email: string;
  name: string | null;
}

export interface CreateUserResult {
  user: User;
  workspace: Workspace;
}

/**
 * User service for managing user-related database operations
 */
export class UserService {
  /**
   * Check if a user exists in the database
   */
  static async findById(uid: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(DB_TABLES.USERS)
      .select('*')
      .eq('id', uid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new user with default workspace
   */
  static async create(data: CreateUserData): Promise<CreateUserResult> {
    const { uid, email, name } = data;

    // Check if user already exists
    const existingUser = await this.findById(uid);
    if (existingUser) {
      const workspace = await this.getUserWorkspace(uid);
      if (!workspace) {
        throw new Error('User exists but workspace not found');
      }
      return { user: existingUser, workspace };
    }

    // Create user
    const user = await this.createUser({ uid, email, name });

    // Create default workspace
    const workspace = await this.createDefaultWorkspace(user);

    // Add user as workspace owner
    await this.addWorkspaceMember({
      workspaceId: workspace.id,
      userId: user.id,
      role: WORKSPACE_ROLES.OWNER,
    });

    return { user, workspace };
  }

  /**
   * Create a user record in the database
   */
  private static async createUser(data: CreateUserData): Promise<User> {
    const { uid, email, name } = data;

    const { data: user, error } = await supabase
      .from(DB_TABLES.USERS)
      .insert({
        id: uid,
        email,
        name: name || null,
        email_verified: new Date().toISOString(),
        role: USER_ROLES.USER,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return user;
  }

  /**
   * Create a default workspace for a new user
   */
  private static async createDefaultWorkspace(user: User): Promise<Workspace> {
    const workspaceName = `${user.name || 'My'}'s Workspace`;
    const workspaceSlug = `workspace-${user.id.substring(0, 8)}`;

    const { data: workspace, error } = await supabase
      .from(DB_TABLES.WORKSPACES)
      .insert({
        name: workspaceName,
        slug: workspaceSlug,
        owner_id: user.id,
        plan: DEFAULT_WORKSPACE_CONFIG.PLAN,
        usage_limit: DEFAULT_WORKSPACE_CONFIG.USAGE_LIMIT,
        dialect_preference: DEFAULT_WORKSPACE_CONFIG.DIALECT,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create workspace: ${error.message}`);
    }

    return workspace;
  }

  /**
   * Add a user as a member of a workspace
   */
  private static async addWorkspaceMember(params: {
    workspaceId: string;
    userId: string;
    role: string;
  }): Promise<WorkspaceMember> {
    const { workspaceId, userId, role } = params;

    const { data: member, error } = await supabase
      .from(DB_TABLES.WORKSPACE_MEMBERS)
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        role,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add workspace member: ${error.message}`);
    }

    return member;
  }

  /**
   * Get user's workspace
   */
  private static async getUserWorkspace(userId: string): Promise<Workspace | null> {
    const { data, error } = await supabase
      .from(DB_TABLES.WORKSPACES)
      .select('*')
      .eq('owner_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get workspace: ${error.message}`);
    }

    return data;
  }
}
