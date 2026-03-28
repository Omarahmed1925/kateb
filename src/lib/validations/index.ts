import { z } from 'zod';

// Auth - User creation (for API)
export const createUserSchema = z.object({
  uid: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email address'),
  name: z.string().nullable(),
});

// Auth - Login/Register
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const newPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Workspace
export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
  dialectPreference: z.enum(['EGYPTIAN', 'GULF', 'LEVANTINE', 'MSA']).optional(),
});

// Team members
export const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
});

export const updateTeamMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

// Content generation
export const generationSchema = z.object({
  type: z.enum(['CAPTION', 'AD_COPY', 'WHATSAPP', 'PRODUCT_DESC']),
  dialect: z.enum(['EGYPTIAN', 'GULF', 'LEVANTINE', 'MSA']),
  tone: z.enum(['PROFESSIONAL', 'FUNNY', 'URGENT', 'EMOTIONAL']),
  prompt: z
    .string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(2000, 'Prompt must not exceed 2000 characters'),
  platform: z.string().optional(),
  productName: z.string().optional(),
  keyPoints: z.array(z.string()).optional(),
});

export const regenerateSchema = z.object({
  generationId: z.string().cuid('Invalid generation ID'),
});

// Approval links
export const createApprovalLinkSchema = z.object({
  generationId: z.string().cuid('Invalid generation ID'),
  clientEmail: z.string().email('Invalid email address'),
  expirationDays: z.number().int().min(1).max(30).default(7),
});

export const respondToApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  clientComment: z.string().max(1000).optional(),
}).refine((data) => {
  if (data.status === 'REJECTED' && !data.clientComment) {
    return false;
  }
  return true;
}, {
  message: 'Comment is required when rejecting',
  path: ['clientComment'],
});

// Pagination
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

// Billing
export const createCheckoutSessionSchema = z.object({
  priceId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

// Types inferred from schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>;
export type UpdateTeamMemberRoleInput = z.infer<typeof updateTeamMemberRoleSchema>;
export type GenerationInput = z.infer<typeof generationSchema>;
export type RegenerateInput = z.infer<typeof regenerateSchema>;
export type CreateApprovalLinkInput = z.infer<typeof createApprovalLinkSchema>;
export type RespondToApprovalInput = z.infer<typeof respondToApprovalSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;
export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;

