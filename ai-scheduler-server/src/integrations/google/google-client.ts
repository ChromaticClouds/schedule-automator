import { google } from 'googleapis';
import { type Types } from 'mongoose';
import { decryptSecret, encryptSecret } from '@/core/auth/security.js';
import { ENV } from '@/core/config/env.js';
import { GoogleConnectionModel } from '@/models/index.js';

export class GoogleConnectionError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code = 'GOOGLE_RECONNECT_REQUIRED',
  ) {
    super(message);
    this.name = 'GoogleConnectionError';
  }
}

const createOAuthClient = () =>
  new google.auth.OAuth2(
    ENV.GOOGLE_CLIENT_ID,
    ENV.GOOGLE_CLIENT_SECRET,
    ENV.GOOGLE_REDIRECT_URI,
  );

export const requireRefreshToken = (
  needsRefresh: boolean,
  refreshToken: string | undefined,
) => {
  if (needsRefresh && !refreshToken) {
    throw new GoogleConnectionError(
      'Google account must be reconnected',
      401,
    );
  }

  return refreshToken;
};

export const refreshGoogleAccessToken = async (
  auth: ReturnType<typeof createOAuthClient>,
) => {
  try {
    await auth.getAccessToken();
  } catch {
    throw new GoogleConnectionError(
      'Google account must be reconnected',
      401,
    );
  }
};

export const createGoogleCalendarClient = async (userId: Types.ObjectId) => {
  const connection = await GoogleConnectionModel.findOne({ userId });

  if (!connection) {
    throw new GoogleConnectionError('Google account connection not found', 404);
  }

  const auth = createOAuthClient();
  const accessToken = decryptSecret(
    connection.accessTokenEncrypted,
    ENV.ENCRYPTION_KEY,
  );
  const refreshToken = connection.refreshTokenEncrypted
    ? decryptSecret(connection.refreshTokenEncrypted, ENV.ENCRYPTION_KEY)
    : undefined;

  auth.setCredentials({
    access_token: accessToken,
    expiry_date: connection.tokenExpiryDate?.getTime(),
    refresh_token: refreshToken,
  });

  const expiry = connection.tokenExpiryDate?.getTime();
  const needsRefresh = !expiry || expiry <= Date.now() + 60_000;
  requireRefreshToken(needsRefresh, refreshToken);

  if (needsRefresh && refreshToken) {
    await refreshGoogleAccessToken(auth);
    const credentials = auth.credentials;

    if (!credentials.access_token) {
      throw new GoogleConnectionError('Google access token refresh failed', 401);
    }

    const fields: Record<string, unknown> = {
      accessTokenEncrypted: encryptSecret(
        credentials.access_token,
        ENV.ENCRYPTION_KEY,
      ),
      tokenExpiryDate: credentials.expiry_date
        ? new Date(credentials.expiry_date)
        : undefined,
    };

    if (credentials.refresh_token) {
      fields.refreshTokenEncrypted = encryptSecret(
        credentials.refresh_token,
        ENV.ENCRYPTION_KEY,
      );
    }

    await GoogleConnectionModel.updateOne({ _id: connection._id }, { $set: fields });
  }

  if (!auth.credentials.access_token) {
    throw new GoogleConnectionError('Google authorization is unavailable', 401);
  }

  return {
    api: google.calendar({ auth, version: 'v3' }),
    connection,
  };
};
