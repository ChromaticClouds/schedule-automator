import type { calendar_v3 } from 'googleapis';
import { ENV } from '@/config/env.js';
import { GoogleConnectionModel } from '@/models/index.js';
import { createGoogleCalendarClient } from './google-client.js';

const maxPages = 20;

const responseStatus = (error: unknown) => {
  if (typeof error !== 'object' || !error) return undefined;
  const candidate = error as {
    code?: number;
    response?: { status?: number };
  };
  return candidate.response?.status ?? candidate.code;
};

const storedCalendarExists = async (
  api: calendar_v3.Calendar,
  calendarId: string,
) => {
  try {
    await api.calendarList.get({ calendarId });
    return true;
  } catch (error) {
    if (responseStatus(error) === 404) return false;
    throw error;
  }
};

export const resolveCalendarId = async (
  api: calendar_v3.Calendar,
  storedCalendarId: string | undefined,
  name: string,
) => {
  if (storedCalendarId && (await storedCalendarExists(api, storedCalendarId))) {
    return storedCalendarId;
  }

  let pageToken: string | undefined;
  for (let page = 0; page < maxPages; page += 1) {
    const { data } = await api.calendarList.list({ maxResults: 250, pageToken });
    const match = data.items?.find(
      (entry) =>
        entry.id &&
        entry.summary === name &&
        ['owner', 'writer'].includes(entry.accessRole ?? ''),
    );
    if (match?.id) return match.id;

    pageToken = data.nextPageToken ?? undefined;
    if (!pageToken) break;
    if (page === maxPages - 1) {
      throw new Error('Google Calendar list exceeded the pagination limit');
    }
  }

  const { data } = await api.calendars.insert({
    requestBody: { summary: name, timeZone: ENV.APP_TIMEZONE },
  });
  if (!data.id) throw new Error('Google did not return a calendar id');
  return data.id;
};

export const ensureAiCalendar = async (
  userId: Parameters<typeof createGoogleCalendarClient>[0],
) => {
  const { api, connection } = await createGoogleCalendarClient(userId);
  const calendarId = await resolveCalendarId(
    api,
    connection.aiCalendarId ?? undefined,
    ENV.GOOGLE_CALENDAR_AI_NAME,
  );

  if (calendarId !== connection.aiCalendarId) {
    await GoogleConnectionModel.updateOne(
      { _id: connection._id },
      { $set: { aiCalendarId: calendarId } },
    );
  }

  return {
    calendarId,
    name: ENV.GOOGLE_CALENDAR_AI_NAME,
  };
};
