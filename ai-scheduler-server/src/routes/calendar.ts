import type { FastifyInstance } from 'fastify';
import { calendarRangeSchema } from '@/schemas/calendar.js';
import { ensureAiCalendar } from '@/services/ai-calendar.js';
import { listOccupiedEvents } from '@/services/calendar-events.js';
import {
  createGoogleCalendarClient,
  GoogleConnectionError,
} from '@/integrations/google/google-client.js';
import { HttpError, parseQuery, requireUserId } from '@/core/http/http.js';

const mapGoogleConnectionError = (error: unknown) => {
  if (error instanceof GoogleConnectionError) {
    throw new HttpError(error.message, error.statusCode);
  }
  throw error;
};

export const registerCalendarRoutes = async (app: FastifyInstance) => {
  app.get('/calendar/context', async (request) => {
    const userId = requireUserId(request);
    const range = parseQuery(calendarRangeSchema, request);

    try {
      const { api } = await createGoogleCalendarClient(userId);
      return {
        events: await listOccupiedEvents(api, range),
        range,
      };
    } catch (error) {
      return mapGoogleConnectionError(error);
    }
  });

  app.post('/calendar/ai-calendar', async (request, reply) => {
    const userId = requireUserId(request);

    try {
      const calendar = await ensureAiCalendar(userId);
      return reply.code(200).send(calendar);
    } catch (error) {
      return mapGoogleConnectionError(error);
    }
  });
};
