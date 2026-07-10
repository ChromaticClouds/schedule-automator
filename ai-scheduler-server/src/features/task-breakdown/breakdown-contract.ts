export type TaskBreakdownContext = {
  existingTasks: { id: string; title: string }[];
  goal: {
    description?: string;
    horizon: string;
    importance: number;
    title: string;
    weekEndDate?: string;
    weekStartDate?: string;
  };
};

export type TaskBreakdownGenerator = {
  generate(context: TaskBreakdownContext): Promise<unknown>;
};

export const createDeterministicTaskBreakdownGenerator = (
  output: unknown,
): TaskBreakdownGenerator => ({
  async generate() {
    return structuredClone(output);
  },
});
