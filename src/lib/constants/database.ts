export const DB_TABLES = {
  USERS: 'users',
  ACCOUNTS: 'accounts',
  SESSIONS: 'sessions',
  VERIFICATION_TOKENS: 'verification_tokens',
  WORKSPACES: 'workspaces',
  WORKSPACE_MEMBERS: 'workspace_members',
  WORKSPACE_INVITES: 'workspace_invites',
  GENERATIONS: 'generations',
  GENERATION_VERSIONS: 'generation_versions',
  APPROVAL_LINKS: 'approval_links',
  BRAND_VOICES: 'brand_voices',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'audit_logs',
  USAGE_SNAPSHOTS: 'usage_snapshots',
  STRIPE_EVENTS: 'stripe_events',
  PAYMOB_EVENTS: 'paymob_events',
  PAYMOB_SUBSCRIPTIONS: 'paymob_subscriptions',
} as const;

export const DEFAULT_WORKSPACE_CONFIG = {
  PLAN: 'FREE' as const,
  USAGE_LIMIT: 10,
  DIALECT: 'EGYPTIAN' as const,
  TONE: 'PROFESSIONAL' as const,
  BILLING_COUNTRY: 'EG',
  SUBSCRIPTION_STATUS: 'ACTIVE' as const,
} as const;

export const PLAN_LIMITS = {
  FREE: {
    generation_limit: 10,
    seat_limit: 1,
    api_access: false,
    brand_voices: 0,
    client_approvals: false,
  },
  STARTER: {
    generation_limit: 100,
    seat_limit: 3,
    api_access: false,
    brand_voices: 1,
    client_approvals: true,
  },
  PRO: {
    generation_limit: 500,
    seat_limit: 10,
    api_access: false,
    brand_voices: 5,
    client_approvals: true,
  },
  ENTERPRISE: {
    generation_limit: -1, // unlimited
    seat_limit: -1, // unlimited
    api_access: true,
    brand_voices: -1, // unlimited
    client_approvals: true,
  },
} as const;
