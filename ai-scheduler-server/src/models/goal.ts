import { Schema, model, type InferSchemaType } from 'mongoose';
import { goalStatuses, importanceValues } from './constants.js';

const goalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    horizon: {
      type: String,
      enum: ['weekly', 'monthly', 'long_term'],
      required: true,
      default: 'weekly',
    },
    importance: { type: Number, enum: importanceValues, required: true },
    status: { type: String, enum: goalStatuses, required: true, default: 'active' },
    weekStartDate: { type: String },
    weekEndDate: { type: String },
  },
  { timestamps: true },
);

goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, weekStartDate: 1, weekEndDate: 1 });

export type Goal = InferSchemaType<typeof goalSchema>;

export const GoalModel = model('Goal', goalSchema, 'goals');
