const offsetFor = (date: string, time: string, timeZone: string) => {
  const utcTime = time.includes('.') ? time : `${time}.000`;
  const instant = new Date(`${date}T${utcTime}Z`);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  }).formatToParts(instant);
  const value = parts.find(({ type }) => type === 'timeZoneName')?.value;
  if (!value || value === 'GMT') return '+00:00';

  const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(value);
  if (!match) return '+00:00';
  const [, sign, hours, minutes = '00'] = match;
  return `${sign}${hours.padStart(2, '0')}:${minutes}`;
};

export const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

export const zonedDateTime = (
  date: string,
  time: string,
  timeZone: string,
) => `${date}T${time}${offsetFor(date, time, timeZone)}`;

export const zonedDayRange = (date: string, timeZone: string) => ({
  timeMax: zonedDateTime(date, '23:59:59.999', timeZone),
  timeMin: zonedDateTime(date, '00:00:00.000', timeZone),
});
