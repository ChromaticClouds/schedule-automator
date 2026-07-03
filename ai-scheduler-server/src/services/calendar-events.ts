import type { calendar_v3 } from 'googleapis';
import type { CalendarRange } from '@/schemas/calendar.js';

const maxPages = 20;

export type OccupiedCalendarEvent = {
  allDay: boolean;
  calendarId: string;
  end: string;
  eventId: string;
  start: string;
};

export const normalizeCalendarEvent = (
  calendarId: string,
  event: calendar_v3.Schema$Event,
): OccupiedCalendarEvent | null => {
  const start = event.start?.dateTime ?? event.start?.date;
  const end = event.end?.dateTime ?? event.end?.date;
  const declined = event.attendees?.some(
    (attendee) =>
      attendee.self === true && attendee.responseStatus === 'declined',
  );

  if (
    !event.id ||
    !start ||
    !end ||
    declined ||
    event.status === 'cancelled' ||
    event.transparency === 'transparent'
  ) {
    return null;
  }

  return {
    allDay: Boolean(event.start?.date),
    calendarId,
    end,
    eventId: event.id,
    start,
  };
};

const listCalendarIds = async (api: calendar_v3.Calendar) => {
  const ids: string[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < maxPages; page += 1) {
    const { data } = await api.calendarList.list({
      maxResults: 250,
      pageToken,
      showDeleted: false,
      showHidden: true,
    });
    ids.push(
      ...(data.items ?? []).flatMap((entry) =>
        entry.id && !entry.deleted && entry.accessRole !== 'none'
          ? [entry.id]
          : [],
      ),
    );
    pageToken = data.nextPageToken ?? undefined;
    if (!pageToken) return ids;
  }

  throw new Error('Google Calendar list exceeded the pagination limit');
};

export const listOccupiedEvents = async (
  api: calendar_v3.Calendar,
  range: CalendarRange,
) => {
  const events: OccupiedCalendarEvent[] = [];

  for (const calendarId of await listCalendarIds(api)) {
    let pageToken: string | undefined;

    for (let page = 0; page < maxPages; page += 1) {
      const { data } = await api.events.list({
        calendarId,
        maxResults: 2500,
        orderBy: 'startTime',
        pageToken,
        showDeleted: false,
        singleEvents: true,
        timeMax: range.timeMax,
        timeMin: range.timeMin,
      });
      events.push(
        ...(data.items ?? []).flatMap((event) => {
          const normalized = normalizeCalendarEvent(calendarId, event);
          return normalized ? [normalized] : [];
        }),
      );
      pageToken = data.nextPageToken ?? undefined;
      if (!pageToken) break;
      if (page === maxPages - 1) {
        throw new Error('Google Calendar events exceeded the pagination limit');
      }
    }
  }

  return events.sort(
    (left, right) => Date.parse(left.start) - Date.parse(right.start),
  );
};
