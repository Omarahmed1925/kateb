import { getGeminiClient, GEMINI_MODEL } from './gemini-client';
import type { BrandAnalysis } from '@/types';

/**
 * Analyze a brand/product image using Gemini's vision capabilities.
 * Returns structured brand analysis data with suggested follow-up questions.
 */
export async function analyzeBrandImage(
  imageBase64: string,
  mimeType: string
): Promise<BrandAnalysis> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          {
            text: `Analyze this product/brand image and return a JSON object with the following fields:
{
  "brandName": "the brand name if identifiable, or 'Unknown Brand' if not",
  "productCategory": "the product category (e.g., 'Beverage', 'Electronics', 'Fashion', 'Food', 'Cosmetics', etc.)",
  "visualDescription": "a detailed visual description of what you see (colors, design elements, packaging, etc.)",
  "targetAudience": "the likely target audience for this product",
  "marketingAngles": ["array of 3-5 suggested marketing angles or content ideas"],
  "brandPersonality": "the brand's perceived personality (e.g., 'Premium & Elegant', 'Youthful & Fun', 'Traditional & Authentic')",
  "keyColors": ["array of dominant colors in the image"],
  "suggestedQuestions": [
    "array of 5-6 SHORT follow-up prompts the user could ask to generate captions",
    "These should be in Arabic (Egyptian dialect) and be actionable caption requests",
    "Examples: 'اكتبلي كابشن بوست انستقرام', 'اديني ١٠ كابشنات بفايبات مختلفة', 'كابشن ستوري قصير وجذاب'",
    "Make them specific to the brand/product in the image",
    "Include one that asks for multiple captions with different vibes"
  ]
}

Return ONLY valid JSON, no markdown formatting or preamble.`,
          },
        ],
      },
    ],
    config: {
      systemInstruction:
        'You are an expert brand analyst and visual marketing specialist. Analyze images precisely and return structured JSON data. Be specific about brand identification — if you can clearly see a logo or brand name, identify it accurately. The suggestedQuestions should be practical, short Arabic prompts that a social media manager would ask to get captions for this specific product.',
    },
  });

  const text = response.text ?? '';

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as BrandAnalysis;
    // Ensure suggestedQuestions exists
    if (!parsed.suggestedQuestions || !Array.isArray(parsed.suggestedQuestions)) {
      parsed.suggestedQuestions = getDefaultQuestions(parsed.brandName, parsed.productCategory);
    }
    return parsed;
  } catch {
    return {
      brandName: 'Unknown Brand',
      productCategory: 'Unknown',
      visualDescription: text,
      targetAudience: 'General audience',
      marketingAngles: ['Product showcase', 'Brand awareness', 'Social media promotion'],
      brandPersonality: 'Modern',
      keyColors: [],
      suggestedQuestions: getDefaultQuestions('المنتج', 'عام'),
    };
  }
}

function getDefaultQuestions(brand: string, _category: string): string[] {
  return [
    `اكتبلي كابشن بوست انستقرام عن ${brand}`,
    `اديني ١٠ كابشنات بفايبات مختلفة`,
    `كابشن ستوري قصير وجذاب`,
    `كابشن بوست فيسبوك رسمي`,
    `اكتبلي ٥ كابشنات مختلفة للمنتج`,
    `كابشن عرض أو خصم على ${brand}`,
  ];
}
