import { Schema, model, type InferSchemaType } from 'mongoose';
import { draftStatuses } from './constants.js';

const scheduleBlockSchema = new Schema(
  {
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    title: { type: String, required: true, trim: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    type: {
      type: String,
      enum: ['task', 'routine', 'break', 'protected', 'calendar_event'],
      required: true,
    },
    source: {
      type: String,
      enum: ['ai', 'user', 'calendar', 'system'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'approved', 'synced', 'done', 'missed'],
      required: true,
      default: 'draft',
    },
    calendarEventId: { type: String },
    reason: { type: String },
  },
  { _id: true },
);

const scheduleDraftSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    status: { type: String, enum: draftStatuses, required: true, default: 'draft' },
    generatedAt: { type: Date, required: true, default: Date.now },
    approvedAt: { type: Date },
    syncedAt: { type: Date },
    summary: { type: String },
    assumptions: { type: [String], required: true, default: [] },
    warnings: { type: [String], required: true, default: [] },
    blocks: { type: [scheduleBlockSchema], required: true, default: [] },
  },
  { timestamps: true },
);

scheduleDraftSchema.index({ userId: 1, date: 1, status: 1 });
scheduleDraftSchema.index(
  { userId: 1, date: 1 },
  {
    partialFilterExpression: {
      status: { $in: ['draft', 'approved', 'synced'] },
    },
    unique: true,
  },
);
scheduleDraftSchema.index({ 'blocks.calendarEventId': 1 }, { sparse: true });

export type ScheduleDraft = InferSchemaType<typeof scheduleDraftSchema>;

export const ScheduleDraftModel = model(
  'ScheduleDraft',
  scheduleDraftSchema,
  'scheduleDrafts',
);
