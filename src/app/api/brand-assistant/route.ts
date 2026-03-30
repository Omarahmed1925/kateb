import { NextRequest, NextResponse } from 'next/server';
import { brandChatSchema, brandImageAnalysisSchema } from '@/lib/validations';
import { streamBrandChat } from '@/lib/ai/brand-chat';
import { analyzeBrandImage } from '@/lib/ai/brand-vision';

/**
 * POST /api/brand-assistant
 *
 * Handles two modes:
 * 1. action=analyze — Analyze brand image (non-streaming)
 * 2. action=chat — Dialect-aware streaming chat
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // ── Image Analysis Mode ──────────────────────────────────
    if (action === 'analyze') {
      const parsed = brandImageAnalysisSchema.parse(body);
      const analysis = await analyzeBrandImage(parsed.imageBase64, parsed.mimeType);

      return NextResponse.json({ success: true, data: analysis });
    }

    // ── Streaming Chat Mode ──────────────────────────────────
    if (action === 'chat') {
      const parsed = brandChatSchema.parse(body);

      const stream = await streamBrandChat({
        messages: parsed.messages,
        dialect: parsed.dialect,
        contentType: body.contentType,
        brandContext: parsed.brandContext,
        imageBase64: parsed.imageBase64,
        imageMimeType: parsed.imageMimeType,
      });

      // Create a ReadableStream that sends SSE events
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              if (chunk) {
                const data = JSON.stringify({ text: chunk });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            const errMsg =
              error instanceof Error ? error.message : 'Stream error';
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: errMsg })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "analyze" or "chat".' },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('Brand assistant error:', error);

    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
