export const planningSectionEmptyMessages = {
  Goals: 'Add a goal to start generating focused task plans.',
  'Protected time': 'Add fixed blocks like sleep, meals, workouts, or commutes.',
  Tasks: 'No tasks yet. Add one here or break down a goal with AI.',
} as const;

export const planningSectionErrorMessages = {
  Goals: 'Goals could not be loaded. Check your connection and try again.',
  'Protected time': 'Protected time could not be loaded. Try again shortly.',
  Tasks: 'Tasks could not be loaded. Try again before planning your day.',
} as const;

export type PlanningSectionTitle = keyof typeof planningSectionEmptyMessages;
