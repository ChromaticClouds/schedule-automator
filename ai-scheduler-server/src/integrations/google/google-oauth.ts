import { google } from 'googleapis';
import { requireVerifiedGoogleIdentity } from '@/core/auth/google-identity.js';
import { encryptSecret } from '@/core/auth/security.js';
import { ENV } from '@/config/env.js';
import {
  GoogleConnectionModel,
  UserModel,
} from '@/models/index.js';

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

export const connectGoogleAccount = async (code: string) => {
  const client = createClient();
  const { tokens } = await client.getToken(code);

  if (!tokens.access_token) {
    throw new Error('Google did not return an access token');
  }

  client.setCredentials(tokens);
  const { data: profile } = await google
    .oauth2({ auth: client, version: 'v2' })
    .userinfo.get();

  const identity = requireVerifiedGoogleIdentity(profile);
  const existingConnection = await GoogleConnectionModel.findOne({
    googleSub: identity.googleSub,
  });
  const user = existingConnection
    ? await UserModel.findByIdAndUpdate(
        existingConnection.userId,
        {
          $set: {
            displayName: identity.displayName,
            email: identity.email,
          },
        },
        { returnDocument: 'after', runValidators: true },
      )
    : await UserModel.findOneAndUpdate(
        { email: identity.email },
        {
          $set: {
            displayName: identity.displayName,
            email: identity.email,
          },
        },
        {
          returnDocument: 'after',
          runValidators: true,
          setDefaultsOnInsert: true,
          upsert: true,
        },
      );

  if (!user) {
    throw new Error('Google account user could not be resolved');
  }

  const connectionFields: Record<string, unknown> = {
    accessTokenEncrypted: encryptSecret(
      tokens.access_token,
      ENV.ENCRYPTION_KEY,
    ),
    email: identity.email,
    googleSub: identity.googleSub,
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

  await GoogleConnectionModel.findOneAndUpdate(
    { userId: user._id },
    {
      $set: connectionFields,
      $setOnInsert: { userId: user._id },
    },
    {
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    },
  );

  return user._id.toString();
};
