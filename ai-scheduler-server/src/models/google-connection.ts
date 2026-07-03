import { Schema, model, type InferSchemaType } from 'mongoose';

const googleConnectionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    googleSub: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    accessTokenEncrypted: { type: String, required: true },
    refreshTokenEncrypted: { type: String },
    tokenExpiryDate: { type: Date },
    scopes: { type: [String], required: true, default: [] },
    aiCalendarId: { type: String },
  },
  { timestamps: true },
);

googleConnectionSchema.index({ userId: 1 }, { unique: true });
googleConnectionSchema.index({ googleSub: 1 }, { unique: true });

export type GoogleConnection = InferSchemaType<typeof googleConnectionSchema>;

export const GoogleConnectionModel = model(
  'GoogleConnection',
  googleConnectionSchema,
  'googleConnections',
);
