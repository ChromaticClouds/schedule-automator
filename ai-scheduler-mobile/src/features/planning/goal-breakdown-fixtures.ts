export const goalBreakdownFixtures = {
  authError: {
    status: 401,
  },
  conflict: {
    details: { details: { code: 'IDEMPOTENCY_CONFLICT' } },
    status: 409,
  },
  inProgress: {
    details: { details: { code: 'REQUEST_IN_PROGRESS' } },
    status: 409,
  },
  networkError: {
    status: 0,
  },
  persistenceError: {
    details: { details: { code: 'TASK_PERSISTENCE_ERROR' } },
    status: 500,
  },
  providerError: {
    status: 502,
  },
  replay: {
    replayed: true,
    tasks: [{ _id: 'task-1' }],
  },
  schemaError: {
    status: 422,
  },
  success: {
    replayed: false,
    tasks: [{ _id: 'task-1' }, { _id: 'task-2' }],
  },
} as const;
