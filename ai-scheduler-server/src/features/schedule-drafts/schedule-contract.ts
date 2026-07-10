export type ScheduleContext = {
  busy: { end: string; source: string; start: string; title: string }[];
  date: string;
  instruction?: string;
  maxDailyWorkMinutes: number;
  protected: { end: string; start: string; title: string }[];
  tasks: {
    estimatedMinutes: number;
    id: string;
    importance: number;
    title: string;
  }[];
  timezone: string;
};

export type ScheduleDraftGenerator = {
  generate(context: ScheduleContext): Promise<unknown>;
};

export type ScheduleContextBuilder = (
  userId: import('mongoose').Types.ObjectId,
  date: string,
) => Promise<ScheduleContext>;

export type ScheduleDraftDependencies = {
  contextBuilder?: ScheduleContextBuilder;
  generator?: ScheduleDraftGenerator;
};

export const createDeterministicScheduleGenerator = (
  output: unknown,
): ScheduleDraftGenerator => ({
  async generate() {
    return structuredClone(output);
  },
});
