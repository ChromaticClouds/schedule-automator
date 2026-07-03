import { Schema, model, type InferSchemaType } from 'mongoose';

const dailyReviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    completedTaskIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
      required: true,
      default: [],
    },
    missedTaskIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
      required: true,
      default: [],
    },
    notes: { type: String },
  },
  { timestamps: true },
);

dailyReviewSchema.index({ userId: 1, date: 1 }, { unique: true });

export type DailyReview = InferSchemaType<typeof dailyReviewSchema>;

export const DailyReviewModel = model(
  'DailyReview',
  dailyReviewSchema,
  'dailyReviews',
);
