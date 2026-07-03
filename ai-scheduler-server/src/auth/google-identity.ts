type GoogleProfile = {
  email?: null | string;
  id?: null | string;
  name?: null | string;
  verified_email?: null | boolean;
};

export const requireVerifiedGoogleIdentity = (profile: GoogleProfile) => {
  const email = profile.email?.trim().toLowerCase();

  if (!profile.id || !email || profile.verified_email !== true) {
    throw new Error('Verified Google account identity is required');
  }

  return {
    displayName: profile.name?.trim() || undefined,
    email,
    googleSub: profile.id,
  };
};
