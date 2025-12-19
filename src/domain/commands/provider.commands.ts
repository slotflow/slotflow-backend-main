export type CreateLocalProviderProps = {
  username: string;
  email: string;
  password: string;
  verificationToken: string;
};

export type CreateGoogleProviderProps = {
  username: string;
  email: string;
  googleId: string;
  profileImage: string;
  isEmailVerified: boolean;
};

export type ChangeProfileInfo = {
  username?: string;
  phone?: string;
};

export type ChangePassword = {
  password: string;
  verificationToken?: string;
};

export type SubmitIdentityProof = {
  identityProof: string | null;
};

export type SubmitServiceProof = {
  serviceProof: string | null;
};

export type LinkGoogleAccount = {
  googleId: string;
  googleConnected: boolean;
};

export type ChangeProfileImage = {
  profileImage: string | null;
};

export type RejectVerification = {
  verificationRejectionReason: string;
  isAddressVerified: boolean;
  isServiceDetailsVerified: boolean;
  isAvailabilityVerified: boolean;
  isProofsVerified: boolean;
};
