import type { calendar_v3 } from 'googleapis';

export type CalendarDraftBlock = {
  end: Date;
  start: Date;
  title: string;
};

export type CalendarEventWriter = {
  createEvent(
    calendarId: string,
    block: CalendarDraftBlock,
  ): Promise<{ eventId: string }>;
};

export const createGoogleCalendarEventWriter = (
  api: calendar_v3.Calendar,
): CalendarEventWriter => ({
  async createEvent(calendarId, block) {
    const prefix = process.env.GOOGLE_CALENDAR_EVENT_PREFIX ?? '[AI]';
    const { data } = await api.events.insert({
      calendarId,
      requestBody: {
        end: { dateTime: block.end.toISOString() },
        start: { dateTime: block.start.toISOString() },
        summary: `${prefix} ${block.title}`,
      },
    });
    if (!data.id) throw new Error('Google did not return an event id');
    return { eventId: data.id };
  },
});

export const createDeterministicCalendarEventWriter = () => {
  const writes: { calendarId: string; title: string }[] = [];
  const writer: CalendarEventWriter = {
    async createEvent(calendarId, block) {
      writes.push({ calendarId, title: block.title });
      return { eventId: `event-${writes.length}` };
    },
  };
  return { writer, writes };
};
