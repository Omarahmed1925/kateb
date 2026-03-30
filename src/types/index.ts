export type UserRole = 'ADMIN' | 'USER';
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING' | 'INCOMPLETE';
export type ContentType = 'CAPTION' | 'AD_COPY' | 'WHATSAPP' | 'PRODUCT_DESC';
export type Dialect = 'EGYPTIAN' | 'GULF' | 'LEVANTINE' | 'MSA';
export type Tone = 'PROFESSIONAL' | 'FUNNY' | 'URGENT' | 'EMOTIONAL';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
export type PaymentProvider = 'STRIPE' | 'PAYMOB';

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
  image: string | null;
  email_verified: string | null;
  role: UserRole;
  login_attempts: number;
  locked_until: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_current_period_end: string | null;
  paymob_subscription_ref: string | null;
  paymob_next_renewal: string | null;
  usage_count: number;
  usage_limit: number;
  usage_period_start: string;
  default_dialect: Dialect;
  default_tone: Tone;
  billing_country: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  invited_by: string | null;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  workspace_id: string;
  created_by: string;
  type: ContentType;
  dialect: Dialect;
  tone: Tone;
  brief: string;
  extra_context: Record<string, any>;
  result: GeneratedVariant[] | null;
  is_favorite: boolean;
  model: string;
  prompt_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  cost_usd: number | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandVoice {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  tone_notes: string | null;
  example_copy: string | null;
  dialect: Dialect;
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalLink {
  id: string;
  workspace_id: string;
  generation_id: string;
  created_by: string;
  token: string;
  client_email: string | null;
  client_name: string | null;
  status: ApprovalStatus;
  client_comment: string | null;
  expires_at: string;
  viewed_at: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  workspace_id: string | null;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

// Brand Assistant Types
export type BrandDialect = 'EGYPTIAN' | 'EMIRATI' | 'SAUDI' | 'KUWAITI';

export interface BrandAnalysis {
  brandName: string;
  productCategory: string;
  visualDescription: string;
  targetAudience: string;
  marketingAngles: string[];
  brandPersonality: string;
  keyColors: string[];
  suggestedQuestions: string[];
}

export interface BrandChatMessage {
  role: 'user' | 'model';
  content: string;
  imageBase64?: string;
  imageMimeType?: string;
}
