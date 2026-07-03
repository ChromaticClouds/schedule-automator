import { Schema, model, type InferSchemaType } from 'mongoose';

const aiRequestLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['task_breakdown', 'daily_schedule', 'weekly_replan'],
      required: true,
    },
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal' },
    idempotencyKeyHash: { type: String },
    payloadHash: { type: String, required: true },
    responseStatus: {
      type: String,
      enum: [
        'in_progress',
        'success',
        'schema_error',
        'api_error',
        'persistence_error',
      ],
      required: true,
    },
    errorMessage: { type: String },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false },
);

aiRequestLogSchema.index({ userId: 1, createdAt: -1 });
aiRequestLogSchema.index({ type: 1, responseStatus: 1 });
aiRequestLogSchema.index(
  { userId: 1, type: 1, idempotencyKeyHash: 1 },
  {
    partialFilterExpression: { idempotencyKeyHash: { $type: 'string' } },
    unique: true,
  },
);

export type AiRequestLog = InferSchemaType<typeof aiRequestLogSchema>;

export const AiRequestLogModel = model(
  'AiRequestLog',
  aiRequestLogSchema,
  'aiRequestLogs',
);
