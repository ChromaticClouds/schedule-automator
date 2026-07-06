import { strict as assert } from 'node:assert';

Object.assign(process.env, {
  APP_ORIGIN: 'aischedulermobile://',
  CORS_ORIGIN: 'http://localhost:8081',
  ENCRYPTION_KEY: 'calendar-validation-encryption-key',
  GEMINI_API_KEY: 'calendar-validation-gemini-key',
  GOOGLE_CALENDAR_SCOPES: 'https://www.googleapis.com/auth/calendar',
  GOOGLE_CLIENT_ID: 'calendar-validation-client',
  GOOGLE_CLIENT_SECRET: 'calendar-validation-secret',
  GOOGLE_REDIRECT_URI: 'http://localhost:3000/auth/google/callback',
  JWT_SECRET: 'calendar-validation-jwt-secret-32-chars',
  MONGO_URL: 'mongodb://localhost:27017/schedule_automator_validation',
  QUEUE_NAME: 'calendar-validation',
  REDIS_URL: 'redis://localhost:6379',
  REFRESH_TOKEN_PEPPER: 'calendar-validation-refresh-pepper',
  SERVER_BASE_URL: 'http://localhost:3000',
  SESSION_SECRET: 'calendar-validation-session-secret',
});

const {
  resolveCalendarId,
  withAiCalendarProvisionLock,
} = await import(
  '../dist/services/ai-calendar.js'
);
const {
  listOccupiedEvents,
  normalizeCalendarEvent,
} = await import('../dist/services/calendar-events.js');
const {
  refreshGoogleAccessToken,
  requireRefreshToken,
} = await import(
  '../dist/integrations/google/google-client.js'
);
const { calendarRangeSchema } = await import(
  '../dist/schemas/calendar.js'
);

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
assert.equal(
  normalizeCalendarEvent('primary', {
    attendees: [{ responseStatus: 'declined', self: true }],
    end: { dateTime: '2026-07-01T10:00:00+09:00' },
    id: 'declined',
    start: { dateTime: '2026-07-01T09:00:00+09:00' },
  }),
  null,
);
assert.throws(
  () => requireRefreshToken(true, undefined),
  (error) =>
    error.statusCode === 401 &&
    error.code === 'GOOGLE_RECONNECT_REQUIRED',
);
await assert.rejects(
  () =>
    refreshGoogleAccessToken({
      getAccessToken: async () => {
        throw new Error('revoked');
      },
    }),
  (error) =>
    error.statusCode === 401 &&
    error.code === 'GOOGLE_RECONNECT_REQUIRED',
);

let eventPage = 0;
const eventApi = {
  calendarList: {
    list: async ({ showHidden }) => {
      assert.equal(showHidden, true);
      return {
        data: {
          items: [
            { accessRole: 'owner', id: 'primary' },
            { accessRole: 'none', id: 'inaccessible' },
          ],
        },
      };
    },
  },
  events: {
    list: async ({ calendarId, pageToken }) => {
      assert.equal(calendarId, 'primary');
      eventPage += 1;
      return {
        data: {
          items: [
            {
              end: {
                dateTime:
                  eventPage === 1
                    ? '2026-07-01T10:00:00-07:00'
                    : '2026-07-01T11:00:00+09:00',
              },
              id: `event-${eventPage}`,
              start: {
                dateTime:
                  eventPage === 1
                    ? '2026-07-01T09:00:00-07:00'
                    : '2026-07-01T10:00:00+09:00',
              },
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
assert.equal(occupied[0].eventId, 'event-2');

const lockOrder = [];
await Promise.all([
  withAiCalendarProvisionLock('user-1', async () => {
    lockOrder.push('first-start');
    await Promise.resolve();
    lockOrder.push('first-end');
  }),
  withAiCalendarProvisionLock('user-1', async () => {
    lockOrder.push('second-start');
  }),
]);
assert.deepEqual(lockOrder, ['first-start', 'first-end', 'second-start']);

let inserted = 0;
const calendarApi = {
  calendarList: {
    get: async () => {
      throw { response: { status: 404 } };
    },
    list: async () => ({
      data: {
        items: [
          { accessRole: 'writer', id: 'shared', summary: 'AI Schedule' },
          { accessRole: 'owner', id: 'existing', summary: 'AI Schedule' },
        ],
      },
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
