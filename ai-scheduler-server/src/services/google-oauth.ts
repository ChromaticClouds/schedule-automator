import { google } from 'googleapis';
import { Types } from 'mongoose';
import { encryptSecret } from '../auth/security.js';
import { ENV } from '../config/env.js';
import {
  GoogleConnectionModel,
  UserModel,
} from '../models/index.js';

const configuredScopes = ENV.GOOGLE_CALENDAR_SCOPES.split(/[\s,]+/).filter(
  Boolean,
);
const requestedScopes = [...new Set(['openid', 'email', ...configuredScopes])];

const createClient = () =>
  new google.auth.OAuth2(
    ENV.GOOGLE_CLIENT_ID,
    ENV.GOOGLE_CLIENT_SECRET,
    ENV.GOOGLE_REDIRECT_URI,
  );

export const createGoogleAuthorizationUrl = (state: string) =>
  createClient().generateAuthUrl({
    access_type: 'offline',
    include_granted_scopes: true,
    prompt: 'consent',
    scope: requestedScopes,
    state,
  });

export const connectGoogleAccount = async (
  userId: Types.ObjectId,
  code: string,
) => {
  const client = createClient();
  const { tokens } = await client.getToken(code);

  if (!tokens.access_token) {
    throw new Error('Google did not return an access token');
  }

  client.setCredentials(tokens);
  const { data: profile } = await google
    .oauth2({ auth: client, version: 'v2' })
    .userinfo.get();

  if (!profile.id || !profile.email) {
    throw new Error('Google account identity is incomplete');
  }

  const email = profile.email.trim().toLowerCase();
  await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        displayName: profile.name ?? undefined,
        email,
      },
    },
    {
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    },
  );

  const connectionFields: Record<string, unknown> = {
    accessTokenEncrypted: encryptSecret(
      tokens.access_token,
      ENV.ENCRYPTION_KEY,
    ),
    email,
    googleSub: profile.id,
    scopes: tokens.scope?.split(/\s+/).filter(Boolean) ?? requestedScopes,
    tokenExpiryDate: tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : undefined,
  };

  if (tokens.refresh_token) {
    connectionFields.refreshTokenEncrypted = encryptSecret(
      tokens.refresh_token,
      ENV.ENCRYPTION_KEY,
    );
  }

  return GoogleConnectionModel.findOneAndUpdate(
    { userId },
    {
      $set: connectionFields,
      $setOnInsert: { userId },
    },
    {
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    },
  );
};
