import { z } from 'zod';
import { getAnthropicClient, calculateCost } from './client';
import { buildSystemPrompt, buildUserPrompt } from './prompts';
import { generationSchema } from '@/lib/validations';
import { db } from '@/lib/db/client';
import { getCounter, incrementCounter, setCache, getCache } from '@/lib/utils/redis';
import { PLAN_LIMITS } from '@/lib/auth/constants';
import type { ContentType, Dialect, GeneratedVariant, Tone } from '@/types';

export async function generateContent(
  workspaceId: string,
  userId: string,
  input: z.infer<typeof generationSchema>
): Promise<{
  generationId: string;
  variants: GeneratedVariant[];
  tokensUsed: number;
  cost: number;
}> {
  // Validate input
  const validated = generationSchema.parse(input);

  // Check workspace limits
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  // Check usage limit
  const monthKey = `usage:${workspaceId}:${new Date().toISOString().slice(0, 7)}`;
  const currentUsage = await getCounter(monthKey);
  const plan = workspace.plan;
  const limit = PLAN_LIMITS[plan]?.generationsPerMonth || 0;

  if (currentUsage >= limit && plan !== 'ENTERPRISE') {
    throw new Error(`You have reached your generation limit of ${limit} for this month`);
  }

  try {
    // Build prompts
    const systemPrompt = buildSystemPrompt(
      validated.type as ContentType,
      validated.dialect as Dialect,
      validated.tone as Tone
    );

    const userPrompt = buildUserPrompt(
      validated.type as ContentType,
      validated.prompt,
      validated.platform,
      validated.productName,
      validated.keyPoints
    );

    // Call Claude API
    const client = getAnthropicClient();

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract text content
    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    // Parse JSON response
    let variants: GeneratedVariant[] = [];
    try {
      variants = JSON.parse(textContent.text);
      if (!Array.isArray(variants)) {
        throw new Error('Response is not an array');
      }
    } catch (e) {
      console.error('Failed to parse Claude response:', textContent.text);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // Calculate cost
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;
    const cost = calculateCost(message.usage.input_tokens, message.usage.output_tokens);

    // Save to database
    const generation = await db.generation.create({
      data: {
        workspaceId,
        userId,
        type: validated.type as ContentType,
        dialect: validated.dialect as Dialect,
        tone: validated.tone as Tone,
        prompt: validated.prompt,
        result: variants as any, // Prisma Json type
        tokensUsed,
        model: 'claude-sonnet-4-20250514',
      },
    });

    // Increment usage counter
    await incrementCounter(monthKey, 30 * 24 * 60 * 60); // 30 days

    // Clear cache
    await setCache(`generations:${workspaceId}`, null);

    return {
      generationId: generation.id,
      variants,
      tokensUsed,
      cost,
    };
  } catch (error) {
    console.error('Generation error:', error);
    throw error;
  }
}

export async function getCachedGenerations(workspaceId: string) {
  const cacheKey = `generations:${workspaceId}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const generations = await db.generation.findMany({
    where: { workspaceId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  await setCache(cacheKey, generations, 3600); // 1 hour cache
  return generations;
}



