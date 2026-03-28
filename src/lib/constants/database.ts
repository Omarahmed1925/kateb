export const DB_TABLES = {
  USERS: 'users',
  WORKSPACES: 'workspaces',
  WORKSPACE_MEMBERS: 'workspace_members',
  GENERATIONS: 'generations',
} as const;

export const DEFAULT_WORKSPACE_CONFIG = {
  PLAN: 'FREE',
  USAGE_LIMIT: 10,
  DIALECT: 'EGYPTIAN',
} as const;
