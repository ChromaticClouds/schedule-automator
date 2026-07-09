import { z } from 'zod';

const scheduleExtractionBlockSchema = z.object({
  end: z.string().datetime({ offset: true }),
  start: z.string().datetime({ offset: true }),
  taskId: z.string().min(1),
});

export const scheduleExtractionSchema = z.object({
  blocks: z.array(scheduleExtractionBlockSchema).min(1).max(40),
});

export const scheduleExtractionJsonSchema = {
  properties: {
    blocks: {
      items: {
        properties: {
          end: { type: 'string' },
          start: { type: 'string' },
          taskId: { type: 'string' },
        },
        required: ['taskId', 'start', 'end'],
        type: 'object',
      },
      type: 'array',
    },
  },
  required: ['blocks'],
  type: 'object',
};

type ScheduleContextTasks = {
  tasks: { id: string; title: string }[];
};

export const hydrateScheduleExtraction = (
  value: unknown,
  context: ScheduleContextTasks,
) => {
  const parsed = scheduleExtractionSchema.safeParse(value);
  if (!parsed.success) return null;

  const tasks = new Map(context.tasks.map((task) => [task.id, task]));
  const blocks = [];

  for (const block of parsed.data.blocks) {
    const task = tasks.get(block.taskId);
    if (!task) return null;
    blocks.push({
      end: block.end,
      start: block.start,
      taskId: block.taskId,
      title: task.title,
      type: 'task' as const,
    });
  }

  return {
    assumptions: [],
    blocks,
    summary: `${blocks.length}개의 작업 블록을 제안했습니다.`,
    warnings: [],
  };
};
