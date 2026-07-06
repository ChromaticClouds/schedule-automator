import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import {
  classifyGeminiError,
  classifyGoogleCalendarError,
} from '../dist/services/external-api-error.js';

const calendarError = {
  response: {
    data: {
      error: {
        code: 403,
        details: [{
          metadata: { service: 'calendar-json.googleapis.com' },
          reason: 'SERVICE_DISABLED',
        }],
        message: 'Google Calendar API is disabled',
      },
    },
    status: 403,
  },
};

assert.deepEqual(classifyGoogleCalendarError(calendarError), {
  code: 'GOOGLE_CALENDAR_API_DISABLED',
  message: 'Google Calendar API is disabled',
  provider: 'google_calendar',
  providerReason: 'SERVICE_DISABLED',
  providerStatus: 403,
});
assert.deepEqual(classifyGeminiError({
  code: 'INVALID_ARGUMENT',
  message: 'unsupported schema keyword',
  status: 400,
}), {
  code: 'GEMINI_API_ERROR',
  message: 'unsupported schema keyword',
  provider: 'gemini',
  providerCode: 'INVALID_ARGUMENT',
  providerStatus: 400,
});

const unsupportedJsonSchemaKeywords = /\b(minLength|maxLength|pattern)\b/;
for (const file of [
  'src/integrations/gemini/gemini-breakdown.ts',
  'src/integrations/gemini/gemini-schedule.ts',
  'src/integrations/gemini/gemini-weekly-reschedule.ts',
]) {
  const source = readFileSync(file, 'utf8');
  assert.equal(
    unsupportedJsonSchemaKeywords.test(source),
    false,
    `${file} contains Gemini responseJsonSchema unsupported keyword`,
  );
}

console.log('external api error validation passed');
