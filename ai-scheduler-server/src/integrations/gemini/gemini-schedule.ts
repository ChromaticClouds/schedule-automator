import { GoogleGenAI } from '@google/genai';
import { ENV } from '@/core/config/env.js';
import type { ScheduleDraftGenerator } from '@/features/schedule-drafts/schedule-contract.js';
import {
  hydrateScheduleExtraction,
  scheduleExtractionJsonSchema,
} from './schedule-extraction.js';

const ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });

export const geminiScheduleGenerator: ScheduleDraftGenerator = {
  async generate(context) {
    const response = await ai.models.generateContent({
      config: {
        maxOutputTokens: ENV.GEMINI_MAX_OUTPUT_TOKENS,
        responseMimeType: 'application/json',
        responseJsonSchema: scheduleExtractionJsonSchema,
        temperature: ENV.GEMINI_TEMPERATURE,
      },
      contents: JSON.stringify({
        instruction:
          'Create a daily schedule extraction. Return only blocks. Each block must schedule one listed task id with ISO-8601 start and end timestamps including an offset. Use only listed task ids. Avoid all busy and protected times. Do not return titles, breaks, reasons, summaries, warnings, assumptions, or extra fields.',
        context,
      }),
      model: ENV.GEMINI_MODEL,
    });

    if (!response.text) return null;
    try {
      return hydrateScheduleExtraction(JSON.parse(response.text), context);
    } catch {
      return null;
    }
  },
};
