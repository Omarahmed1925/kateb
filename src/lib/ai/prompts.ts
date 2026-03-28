import type { ContentType, Dialect, Tone } from '@/types';

const DIALECT_DESCRIPTIONS: Record<Dialect, string> = {
  EGYPTIAN: 'Egyptian Arabic (عربي مصري) - colloquial Egyptian dialect commonly used in Cairo and throughout Egypt',
  GULF: 'Gulf Arabic (عربي خليجي) - spoken in Saudi Arabia, UAE, Kuwait, and other Gulf states',
  LEVANTINE: 'Levantine Arabic (عربي شامي) - spoken in Syria, Lebanon, Palestine, and Jordan',
  MSA: 'Modern Standard Arabic (الفصحى) - formal, literary Arabic used in media and official communications',
};

const TONE_DESCRIPTIONS: Record<Tone, string> = {
  PROFESSIONAL: 'Professional and formal tone',
  FUNNY: 'Humorous and entertaining tone',
  URGENT: 'Urgent and time-sensitive tone',
  EMOTIONAL: 'Emotional and persuasive tone',
};

export function buildSystemPrompt(
  contentType: ContentType,
  dialect: Dialect,
  tone: Tone
): string {
  return `You are an expert Arabic copywriter specializing in marketing and advertising content. You have deep knowledge of ${DIALECT_DESCRIPTIONS[dialect]}.

Your task is to generate high-quality marketing content that matches the following specifications:

**Content Type**: ${contentType}
- CAPTION: Social media captions (Instagram, Facebook)
- AD_COPY: Advertisement copy for Meta Ads or Google Ads
- WHATSAPP: Personal, conversational messages for WhatsApp
- PRODUCT_DESC: Product descriptions for e-commerce

**Dialect**: ${dialect}
${DIALECT_DESCRIPTIONS[dialect]}

**Tone**: ${tone}
${TONE_DESCRIPTIONS[tone]}

## Instructions:

1. Generate EXACTLY 3 distinct variants of the content
2. Each variant must be different in phrasing, structure, and approach
3. Never repeat similar sentences or expressions
4. Ensure all text is in ${dialect} Arabic - do NOT mix dialects
5. Apply the ${tone} tone consistently throughout
6. Comply with character limits: CAPTION ≤2200 chars, AD_COPY ≤1000 chars, WHATSAPP ≤500 chars, PRODUCT_DESC ≤1500 chars
7. Make content engaging, compelling, and action-oriented
8. Include appropriate emojis where suitable (but not excessive)
9. Use the target dialect's natural expressions and vocabulary
10. Output ONLY valid JSON array with no markdown formatting or preamble

Return your response as a valid JSON array with this exact structure:
[
  {
    "variant": 1,
    "content": "first variant text",
    "charCount": <number of characters>
  },
  {
    "variant": 2,
    "content": "second variant text",
    "charCount": <number of characters>
  },
  {
    "variant": 3,
    "content": "third variant text",
    "charCount": <number of characters>
  }
]`;
}

export function buildUserPrompt(
  contentType: ContentType,
  briefText: string,
  platform?: string,
  productName?: string,
  keyPoints?: string[]
): string {
  let prompt = `Generate ${contentType} in ${contentType === 'CAPTION' ? 'Arabic' : 'Arabic'} based on the following brief:\n\n${briefText}`;

  if (contentType === 'CAPTION' && platform) {
    prompt += `\n\nTarget Platform: ${platform}`;
  }

  if (contentType === 'AD_COPY' && platform) {
    prompt += `\n\nAd Platform: ${platform}`;
  }

  if (contentType === 'PRODUCT_DESC' && productName) {
    prompt += `\n\nProduct Name: ${productName}`;
  }

  if (keyPoints && keyPoints.length > 0) {
    prompt += `\n\nKey Points to Include:\n${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}`;
  }

  return prompt;
}

