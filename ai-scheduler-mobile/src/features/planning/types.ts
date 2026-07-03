export type Goal = {
  _id: string;
  title: string;
  importance: 1 | 2 | 3 | 4 | 5;
  status: 'active' | 'paused' | 'completed' | 'archived';
};

export type Task = {
  _id: string;
  title: string;
  estimatedMinutes: number;
  status: 'todo' | 'scheduled' | 'done' | 'missed' | 'overflow' | 'archived';
  postponedCount: number;
};

export type ProtectedTime = {
  _id: string;
  title: string;
  category: 'sleep' | 'meal' | 'shower' | 'leisure' | 'exercise' | 'custom';
  startTime: string;
  endTime: string;
  protectionLevel: 'hard' | 'soft';
};

export type CreateGoalInput = {
  title: string;
  importance: 1 | 2 | 3 | 4 | 5;
};

export type CreateTaskInput = {
  title: string;
  estimatedMinutes: number;
  importance: 1 | 2 | 3 | 4 | 5;
  goalImpact: 1 | 2 | 3 | 4 | 5;
  energyLevel: 'low' | 'medium' | 'high';
};

export type CreateProtectedTimeInput = {
  title: string;
  category: 'sleep' | 'meal' | 'shower' | 'leisure' | 'exercise' | 'custom';
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  protectionLevel: 'hard' | 'soft';
};
