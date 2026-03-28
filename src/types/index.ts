export type UserRole = 'ADMIN' | 'USER';
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID';
export type ContentType = 'CAPTION' | 'AD_COPY' | 'WHATSAPP' | 'PRODUCT_DESC';
export type Dialect = 'EGYPTIAN' | 'GULF' | 'LEVANTINE' | 'MSA';
export type Tone = 'PROFESSIONAL' | 'FUNNY' | 'URGENT' | 'EMOTIONAL';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface GeneratedVariant {
  variant: number;
  content: string;
  charCount: number;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  workspaceId?: string;
  workspaceRole?: WorkspaceRole;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pages: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

// Database Models
export interface User {
  id: string;
  email: string;
  name: string | null;
  email_verified: string | null;
  role: UserRole;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  plan: SubscriptionPlan;
  usage_count: number;
  usage_limit: number;
  dialect_preference: Dialect;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
  created_at: string;
  updated_at: string;
}
