import { GoogleGenAI } from '@google/genai';
import { ENV } from '@/config/env.js';

const client = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });

export const generateStructuredContent = async (prompt: string) => {
  const response = await client.models.generateContent({
    contents: prompt,
    model: ENV.GEMINI_MODEL,
    config: {
      maxOutputTokens: ENV.GEMINI_MAX_OUTPUT_TOKENS,
      responseMimeType: 'application/json',
      temperature: ENV.GEMINI_TEMPERATURE,
    },
  });

  if (!response.text) {
    throw new Error('Gemini returned an empty response');
  }

  return response.text;
};
