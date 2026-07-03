import { Schema, model, type InferSchemaType } from 'mongoose';
import { energyLevels, importanceValues, taskStatuses } from './constants.js';

const checklistItemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, required: true, default: false },
  },
  { _id: false },
);

const taskSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal' },
    parentTaskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    priorityReason: { type: String, trim: true },
    checklist: { type: [checklistItemSchema], required: true, default: [] },
    estimatedMinutes: { type: Number, required: true, min: 1 },
    deadline: { type: Date },
    importance: { type: Number, enum: importanceValues, required: true },
    goalImpact: { type: Number, enum: importanceValues, required: true },
    postponedCount: { type: Number, required: true, default: 0, min: 0 },
    energyLevel: { type: String, enum: energyLevels, required: true },
    status: { type: String, enum: taskStatuses, required: true, default: 'todo' },
    generationKeyHash: { type: String, select: false },
    generationIndex: { type: Number, min: 0, select: false },
  },
  { timestamps: true },
);

taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, deadline: 1 });
taskSchema.index({ goalId: 1 });
taskSchema.index(
  { userId: 1, generationKeyHash: 1, generationIndex: 1 },
  {
    partialFilterExpression: { generationKeyHash: { $type: 'string' } },
    unique: true,
  },
);

export type Task = InferSchemaType<typeof taskSchema>;

export const TaskModel = model('Task', taskSchema, 'tasks');
