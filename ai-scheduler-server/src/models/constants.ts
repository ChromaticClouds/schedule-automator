export const importanceValues = [1, 2, 3, 4, 5] as const;

export const energyLevels = ['low', 'medium', 'high'] as const;

export const goalStatuses = [
  'active',
  'paused',
  'completed',
  'archived',
] as const;

export const taskStatuses = [
  'todo',
  'scheduled',
  'done',
  'missed',
  'overflow',
  'archived',
] as const;

export const protectedCategories = [
  'sleep',
  'meal',
  'shower',
  'leisure',
  'exercise',
  'custom',
] as const;

export const draftStatuses = [
  'draft',
  'approved',
  'synced',
  'rejected',
  'expired',
] as const;
