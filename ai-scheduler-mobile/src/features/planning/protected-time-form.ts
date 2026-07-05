const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const validProtectedTimeRange = (startTime: string, endTime: string) =>
  timePattern.test(startTime) &&
  timePattern.test(endTime) &&
  startTime < endTime;
