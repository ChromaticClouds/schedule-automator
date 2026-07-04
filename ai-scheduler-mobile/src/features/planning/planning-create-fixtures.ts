import type { ComponentProps } from 'react';

import type { PlanningCreateRow } from './planning-create-row';

type Fixture = ComponentProps<typeof PlanningCreateRow>;

const noop = () => undefined;
const base = {
  emptyMessage: 'Enter a task title before adding it.',
  isPending: false,
  onChange: noop,
  onSubmit: noop,
  placeholder: 'Add a task',
  value: '',
} satisfies Fixture;

export const planningCreateFixtures = {
  emptyGuidance: { ...base, showEmptyMessage: true } satisfies Fixture,
  error: {
    ...base,
    errorMessage: 'Task could not be saved. Try again.',
    value: 'Draft task',
  } satisfies Fixture,
  idle: base,
  pending: { ...base, isPending: true, value: 'Draft task' } satisfies Fixture,
};
