export type WeeklyRescheduleTask = {
  estimatedMinutes: number;
  goalImpact: number;
  id: string;
  importance: number;
  postponedCount: number;
  title: string;
};

export type WeeklyRescheduleDay = {
  acceptsDraftChanges: boolean;
  blocked: { end: string; start: string }[];
  date: string;
  maxDailyWorkMinutes: number;
  scheduledTaskMinutes: number;
};

export type WeeklyRescheduleContext = {
  days: WeeklyRescheduleDay[];
  reviewDate: string;
  tasks: WeeklyRescheduleTask[];
};

export type WeeklyRescheduleGenerator = {
  generate(context: WeeklyRescheduleContext): Promise<unknown>;
};

export const remainingWeekDates = (reviewDate: string) => {
  const day = new Date(`${reviewDate}T00:00:00.000Z`).getUTCDay();
  const remainingDays = day === 0 ? 0 : 7 - day;
  return Array.from({ length: remainingDays }, (_, index) =>
    addDays(reviewDate, index + 1));
};

export const createDeterministicWeeklyRescheduleGenerator = (
  output: unknown,
): WeeklyRescheduleGenerator => ({
  async generate() {
    return structuredClone(output);
  },
});
import { addDays } from './schedule-time.js';
