import { strict as assert } from 'node:assert';
import { hydrateScheduleExtraction } from '../dist/integrations/gemini/schedule-extraction.js';

const taskId = '507f1f77bcf86cd799439011';
const context = {
  tasks: [{ id: taskId, title: 'Implement schedule draft' }],
};

assert.deepEqual(hydrateScheduleExtraction({
  blocks: [{
    end: '2026-07-03T09:45:00.000Z',
    reason: 'Ignored model copy',
    start: '2026-07-03T09:00:00.000Z',
    taskId,
    title: 'Untrusted model title',
    type: 'break',
  }],
  summary: 'Ignored model summary',
}, context), {
  assumptions: [],
  blocks: [{
    end: '2026-07-03T09:45:00.000Z',
    start: '2026-07-03T09:00:00.000Z',
    taskId,
    title: 'Implement schedule draft',
    type: 'task',
  }],
  summary: '1개의 작업 블록을 제안했습니다.',
  warnings: [],
});
assert.equal(hydrateScheduleExtraction({
  blocks: [{
    end: '2026-07-03T09:45:00.000Z',
    start: '2026-07-03T09:00:00.000Z',
    taskId: '507f1f77bcf86cd799439012',
  }],
}, context), null);
assert.equal(hydrateScheduleExtraction({ blocks: [{ taskId }] }, context), null);

console.log('schedule extraction validation passed');
