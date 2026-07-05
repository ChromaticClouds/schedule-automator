import { GoogleGenAI } from '@google/genai';
import { ENV } from '@/config/env.js';
import type { WeeklyRescheduleGenerator } from './weekly-reschedule-contract.js';

const responseJsonSchema = {
  additionalProperties: false,
  properties: {
    overflowTaskIds: {
      items: { pattern: '^[a-fA-F0-9]{24}$', type: 'string' },
      maxItems: 40,
      type: 'array',
    },
    placements: {
      items: {
        additionalProperties: false,
        properties: {
          date: { format: 'date', type: 'string' },
          end: { type: 'string' },
          reason: { maxLength: 500, minLength: 1, type: 'string' },
          start: { type: 'string' },
          taskId: { pattern: '^[a-fA-F0-9]{24}$', type: 'string' },
          title: { maxLength: 160, minLength: 1, type: 'string' },
        },
        required: ['date', 'end', 'reason', 'start', 'taskId', 'title'],
        type: 'object',
      },
      maxItems: 40,
      type: 'array',
    },
    summary: { maxLength: 1000, minLength: 1, type: 'string' },
    warnings: { items: { type: 'string' }, maxItems: 12, type: 'array' },
  },
  required: ['summary', 'placements', 'overflowTaskIds', 'warnings'],
  type: 'object',
};

const ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });

export const geminiWeeklyRescheduleGenerator: WeeklyRescheduleGenerator = {
  async generate(context) {
    const response = await ai.models.generateContent({
      config: {
        maxOutputTokens: ENV.GEMINI_MAX_OUTPUT_TOKENS,
        responseMimeType: 'application/json',
        responseJsonSchema,
        temperature: ENV.GEMINI_TEMPERATURE,
      },
      contents: JSON.stringify({
        instruction:
          'Reschedule every task exactly once. Use only mutable days and listed task ids. Keep exact task duration. Put tasks that cannot fit in overflowTaskIds.',
        context,
      }),
      model: ENV.GEMINI_MODEL,
    });
    if (!response.text) return null;
    try {
      return JSON.parse(response.text);
    } catch {
      return response.text;
    }
  },
};
