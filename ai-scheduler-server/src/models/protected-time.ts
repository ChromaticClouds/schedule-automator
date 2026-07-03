import { Schema, model, type InferSchemaType } from 'mongoose';
import { protectedCategories } from './constants.js';

const protectedTimeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: protectedCategories,
      required: true,
      default: 'custom',
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    daysOfWeek: { type: [Number], required: true, default: [] },
    protectionLevel: {
      type: String,
      enum: ['hard', 'soft'],
      required: true,
      default: 'hard',
    },
  },
  { timestamps: true },
);

protectedTimeSchema.index({ userId: 1, daysOfWeek: 1 });
protectedTimeSchema.index({ userId: 1, category: 1 });

export type ProtectedTime = InferSchemaType<typeof protectedTimeSchema>;

export const ProtectedTimeModel = model(
  'ProtectedTime',
  protectedTimeSchema,
  'protectedTimes',
);
