export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  HOME: '/',
} as const;

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export const WORKSPACE_ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;

export const SUBSCRIPTION_PLANS = {
  FREE: 'FREE',
  STARTER: 'STARTER',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE',
} as const;
