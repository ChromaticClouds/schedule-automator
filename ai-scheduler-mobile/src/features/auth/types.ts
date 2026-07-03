export type AuthSessionResponse = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  tokenType: 'Bearer';
};

export type AuthSession = AuthSessionResponse & {
  expiresAt: number;
};

export const toAuthSession = (
  response: AuthSessionResponse,
): AuthSession => ({
  ...response,
  expiresAt: Date.now() + response.expiresIn * 1000,
});
