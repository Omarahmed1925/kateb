import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export async function generateWithoutStreaming(
  systemPrompt: string,
  userPrompt: string
): Promise<{
  content: string;
  inputTokens: number;
  outputTokens: number;
}> {
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

  const textContent = message.content.find((block) => block.type === 'text');
  const content = textContent && textContent.type === 'text' ? textContent.text : '';

  return {
    content,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  };
}

export function calculateCost(inputTokens: number, outputTokens: number): number {
  const INPUT_COST_PER_1K = 0.003;
  const OUTPUT_COST_PER_1K = 0.015;

  return (
    (inputTokens / 1000) * INPUT_COST_PER_1K + (outputTokens / 1000) * OUTPUT_COST_PER_1K
  );
}
