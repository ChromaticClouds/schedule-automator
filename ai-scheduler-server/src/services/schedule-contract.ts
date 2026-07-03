export type ScheduleContext = {
  busy: { end: string; source: string; start: string; title: string }[];
  date: string;
  maxDailyWorkMinutes: number;
  protected: { end: string; start: string; title: string }[];
  tasks: {
    estimatedMinutes: number;
    id: string;
    importance: number;
    title: string;
  }[];
};

export type ScheduleDraftGenerator = {
  generate(context: ScheduleContext): Promise<unknown>;
};

export const createDeterministicScheduleGenerator = (
  output: unknown,
): ScheduleDraftGenerator => ({
  async generate() {
    return structuredClone(output);
  },
});
