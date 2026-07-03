import { strict as assert } from 'node:assert';
import { resolveCalendarId } from '../dist/services/ai-calendar.js';
import {
  listOccupiedEvents,
  normalizeCalendarEvent,
} from '../dist/services/calendar-events.js';
import { calendarRangeSchema } from '../dist/schemas/calendar.js';

const range = {
  timeMin: '2026-07-01T00:00:00+09:00',
  timeMax: '2026-07-08T00:00:00+09:00',
};
assert.deepEqual(calendarRangeSchema.parse(range), range);
assert.equal(
  calendarRangeSchema.safeParse({
    ...range,
    timeMax: '2026-09-01T00:00:00+09:00',
  }).success,
  false,
);

assert.deepEqual(
  normalizeCalendarEvent('primary', {
    end: { dateTime: '2026-07-01T10:00:00+09:00' },
    id: 'event-1',
    start: { dateTime: '2026-07-01T09:00:00+09:00' },
  }),
  {
    allDay: false,
    calendarId: 'primary',
    end: '2026-07-01T10:00:00+09:00',
    eventId: 'event-1',
    start: '2026-07-01T09:00:00+09:00',
  },
);
assert.equal(
  normalizeCalendarEvent('primary', {
    end: { date: '2026-07-02' },
    id: 'transparent',
    start: { date: '2026-07-01' },
    transparency: 'transparent',
  }),
  null,
);

let eventPage = 0;
const eventApi = {
  calendarList: {
    list: async () => ({ data: { items: [{ id: 'primary' }] } }),
  },
  events: {
    list: async ({ pageToken }) => {
      eventPage += 1;
      return {
        data: {
          items: [
            {
              end: { date: `2026-07-0${eventPage + 1}` },
              id: `event-${eventPage}`,
              start: { date: `2026-07-0${eventPage}` },
            },
          ],
          nextPageToken: pageToken ? undefined : 'next',
        },
      };
    },
  },
};
const occupied = await listOccupiedEvents(eventApi, range);
assert.equal(occupied.length, 2);
assert.equal(eventPage, 2);

let inserted = 0;
const calendarApi = {
  calendarList: {
    get: async () => {
      throw { response: { status: 404 } };
    },
    list: async () => ({
      data: { items: [{ accessRole: 'owner', id: 'existing', summary: 'AI Schedule' }] },
    }),
  },
  calendars: {
    insert: async () => {
      inserted += 1;
      return { data: { id: 'created' } };
    },
  },
};
assert.equal(
  await resolveCalendarId(calendarApi, 'missing', 'AI Schedule'),
  'existing',
);
assert.equal(inserted, 0);

console.log('calendar validation passed');
