import { z } from 'zod';

export const createUserSchema = z.object({
  uid: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email address'),
  name: z.string().nullable(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
