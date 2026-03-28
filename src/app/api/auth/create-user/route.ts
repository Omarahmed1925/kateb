import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user.service';
import { createUserSchema } from '@/lib/validations';
import { handleApiError, ValidationError } from '@/lib/utils/errors';

/**
 * POST /api/auth/create-user
 * Creates a new user in the database with a default workspace
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createUserSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      throw new ValidationError(firstError.message);
    }

    const { uid, email, name } = validationResult.data;

    // Create user with default workspace
    const result = await UserService.create({ uid, email, name });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
