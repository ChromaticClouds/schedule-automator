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
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    checklist: { type: [checklistItemSchema], required: true, default: [] },
    estimatedMinutes: { type: Number, required: true, min: 1 },
    deadline: { type: Date },
    importance: { type: Number, enum: importanceValues, required: true },
    goalImpact: { type: Number, enum: importanceValues, required: true },
    postponedCount: { type: Number, required: true, default: 0, min: 0 },
    energyLevel: { type: String, enum: energyLevels, required: true },
    status: { type: String, enum: taskStatuses, required: true, default: 'todo' },
  },
  { timestamps: true },
);

taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, deadline: 1 });
taskSchema.index({ goalId: 1 });

export type Task = InferSchemaType<typeof taskSchema>;

export const TaskModel = model('Task', taskSchema);
