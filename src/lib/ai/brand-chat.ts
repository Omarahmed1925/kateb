import { getGeminiClient, GEMINI_MODEL } from './gemini-client';
import { buildBrandAssistantSystemPrompt } from './dialect-prompts';
import type { BrandDialect, BrandChatMessage } from '@/types';

interface StreamBrandChatOptions {
  messages: BrandChatMessage[];
  dialect: BrandDialect;
  contentType?: string;
  brandContext?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

/**
 * Stream a brand chat response from Gemini.
 * Handles conversation history, dialect system prompts, and optional image input.
 * Returns an async iterable of text chunks.
 */
export async function streamBrandChat(
  options: StreamBrandChatOptions
): Promise<AsyncIterable<string>> {
  const { messages, dialect, contentType, brandContext, imageBase64, imageMimeType } = options;
  const ai = getGeminiClient();

  const systemPrompt = buildBrandAssistantSystemPrompt(dialect, brandContext, contentType);

  // Build contents array from conversation history
  const contents = messages.map((msg) => {
    const parts: Array<
      | { text: string; inlineData?: undefined }
      | { inlineData: { mimeType: string; data: string }; text?: undefined }
    > = [];

    // Add image if present on this message
    if (msg.imageBase64 && msg.imageMimeType) {
      parts.push({
        inlineData: {
          mimeType: msg.imageMimeType,
          data: msg.imageBase64,
        },
      });
    }

    // Add text content
    if (msg.content) {
      parts.push({ text: msg.content });
    }

    return {
      role: msg.role as 'user' | 'model',
      parts,
    };
  });

  // If there's a new image being uploaded with this request (not in history)
  if (imageBase64 && imageMimeType && contents.length > 0) {
    const lastContent = contents[contents.length - 1];
    if (lastContent.role === 'user') {
      lastContent.parts.unshift({
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64,
        },
      });
    }
  }

  const response = await ai.models.generateContentStream({
    model: GEMINI_MODEL,
    contents,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
      thinkingConfig: {
        thinkingBudget: 1024,
      },
    },
  });

  // Return an async iterable that yields text chunks (filters out thinking)
  return {
    [Symbol.asyncIterator]() {
      const iterator = response[Symbol.asyncIterator]();
      return {
        async next(): Promise<IteratorResult<string>> {
          while (true) {
            const result = await iterator.next();
            if (result.done) {
              return { done: true as const, value: undefined as unknown as string };
            }
            // Only yield actual text output, skip thinking/empty chunks
            const chunk = result.value;
            const text = chunk?.text ?? '';
            if (text) {
              return { done: false as const, value: text };
            }
            // Skip empty chunks (thinking content)
          }
        },
      };
    },
  };
}
