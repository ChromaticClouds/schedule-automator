import { Schema, model, type InferSchemaType } from 'mongoose';

const aiRequestLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['task_breakdown', 'daily_schedule', 'weekly_replan'],
      required: true,
    },
    payloadHash: { type: String, required: true },
    responseStatus: {
      type: String,
      enum: ['success', 'schema_error', 'api_error'],
      required: true,
    },
    errorMessage: { type: String },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false },
);

aiRequestLogSchema.index({ userId: 1, createdAt: -1 });
aiRequestLogSchema.index({ type: 1, responseStatus: 1 });

export type AiRequestLog = InferSchemaType<typeof aiRequestLogSchema>;

export const AiRequestLogModel = model('AiRequestLog', aiRequestLogSchema);
