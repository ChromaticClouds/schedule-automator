import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    displayName: { type: String, trim: true },
    timezone: { type: String, required: true, default: 'Asia/Seoul' },
    wakeTime: { type: String, required: true, default: '07:00' },
    wakeOffsetMinutes: { type: Number, required: true, default: 10, min: 0 },
    maxDailyWorkMinutes: { type: Number, required: true, default: 480, min: 1 },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = model('User', userSchema);
